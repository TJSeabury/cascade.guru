import {
  JSDOM,
  VirtualConsole
} from 'jsdom';
import fetch from 'node-fetch';
import * as puppeteer from 'puppeteer';

export const getHead = async (target: string | null = null) => {
  if (target === null) throw new Error('Target must be provided...');
  const response = await fetch(
    target,
    {
      method: 'HEAD'
    }
  );
  if (response.status === 200) {
    return response;
  }
  return null;
};

export const linkExists = async (target: string | null = null) => {
  if (await getHead(target) === null) return false;
  return true;
};

// old version
/* export const getHtml = async (target: string | null = null): Promise<[string | null, any | null]> => {
  if (target === null) throw new Error('Target must be provided...');
  const response = await fetch(target);
  if (response.status === 200) {
    const html = await response.text();
    return [html, null];
  }
  return [null, response];
}; */


export const getHtml = async (target: string | null = null): Promise<[string | null, any | null]> => {
  try {
    if (target === null) throw new Error('Target must be provided...');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(target, { waitUntil: 'networkidle0' });
    const html = await page.content();
    await browser.close();
    return [html, null];
  } catch (error) {
    return [null, error];
  }
};

export const parseDom = (html: string | null): [JSDOM | null, Error | null] => {
  if (!html) return [null, new Error('HTML must be provided...')];

  // See: https://github.com/jsdom/jsdom/issues/2230
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => {/* No-op to skip console errors. */ });

  const dom = new JSDOM(html, { virtualConsole });
  if (!dom) return [null, new Error('Could not parse html string.')];

  return [dom, null];
};

export const getAnchors = (dom: JSDOM | null): [HTMLAnchorElement[] | null, Error | null] => {
  if (!dom) return [null, new Error('Valid JSDOM object required.')];
  const anchors = Array.from(dom.window.document.querySelectorAll('a[href]'));
  if (!anchors) return [null, new Error('No anchor elements found.')];
  return [<HTMLAnchorElement[]>anchors, null];
};

export const getLinks = async (target: string): Promise<[string[] | null, Error | null]> => {
  if (!target) return [null, new Error('Target must be provided...')];
  if (await linkExists(target) === false) return [null, new Error('No links found.')];
  const [html, err1] = await getHtml(target);
  const [dom, err2] = parseDom(html);
  const [anchors, err3] = getAnchors(dom);
  if (!anchors) return [null, new Error('No anchors found.')];
  return [anchors.map((a: HTMLAnchorElement) => a.href), null];
};

/* export const getAllLinks = async (target = null, crawledLinks = [], domain) => {
    if (target === null) throw new Error('Target must be provided...');

    let links = [...new Set(await getLinks(target))];
    for (let link of links) {
        if (linkIsExternal(link, domain)) continue;
        if (crawledLinks.includes(link)) continue;
        if (linkIsRelative(link)) {
            link = makeLinkAbsolute(link);
        }
        if (isNotUrl(link)) continue;
        const res = await getHead(link);
        if (res?.status === 200) {
            links = [
                ...links,
                ... await getAllLinks(
                    link,
                    [
                        ...crawledLinks,
                        ...links
                    ],
                    domain
                )
            ];
            console.log(link, links.length);
        }
    }

    return [...new Set(links)];
}; */


/* export const gatherHtml = (target = null) => {
    if (target === null) throw new Error('Target must be provided...');

    const baseDirPath = path.resolve(path.dirname('./'), `temp_${target}`);

    const linkinPark = new Crawler({
        protocol: 'https:', // default 'http:'
        domain: target, // default 'example.com'
        limitForConnections: 15, // number of simultaneous connections, default 10
        limitForRedirects: 5, // possible number of redirects, default 5
        timeout: 500, // number of milliseconds between pending connection, default 300
        headers: {
            'User-Agent': 'Mozilla/5.0 Long cat is long', // default header
        },
        urlFilter: (url) => true, // default filter
    }); // These wounds, they will not heal.

    linkinPark.crawl(); // Crawling in my crawl.
    // See: https://www.youtube.com/watch?v=hfYDQIfoE1w

    linkinPark.on(
        'data',
        (data) => {
            if (!data.url || !data.result.body) return false;

            const urlString = data.url;
            const html = data.result.body;
            const urlObject = new URL(urlString);
            const pathArray = urlObject.pathname.split('/');
            let dirPath = baseDirPath;


            if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

            for (let i = 1; i < pathArray.length; i += 1) {
                if (i !== pathArray.length - 1) {
                    dirPath = `${dirPath}/${pathArray[i]}`;
                    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
                } else {
                    dirPath = (pathArray[i])
                        ? `${dirPath}/${pathArray[i].replace(/\.html?$/, '')}`
                        : `${dirPath}/index`;

                    dirPath = (urlObject.query)
                        ? `${dirPath}-${urlObject.query}.json`
                        : `${dirPath}.json`;

                    fs.writeFileSync(dirPath, JSON.stringify(data));

                    process.stdout.write(`\r${linkinPark.countOfProcessedUrls} out of ${linkinPark.foundLinks.size}`);
                }
            }
            process.stdout.write('\n');

            return true;
        }
    );

    linkinPark.on(
        'error',
        (error) => console.error(error)
    );

    linkinPark.on(
        'end',
        () => console.log(`All pages a saved in folder ${baseDirPath}!`)
    );

}; */

/* export const gatherCss = (target = null) => {
    if (target === null) throw new Error('Target must be provided...');

    const baseDirPath = path.resolve(path.dirname('./'), `temp_${target}`);

    const linkinPark = new Crawler({
        protocol: 'https:', // default 'http:'
        domain: target, // default 'example.com'
        limitForConnections: 25, // number of simultaneous connections, default 10
        limitForRedirects: 5, // possible number of redirects, default 5
        timeout: 500, // number of milliseconds between pending connection, default 300
        headers: {
            'User-Agent': 'Mozilla/5.0', // default header
        },
        urlFilter: (url) => true, // default filter
    }); // These wounds, they will not heal.

    linkinPark.crawl(); // Crawling in my crawl.
    // See: https://www.youtube.com/watch?v=hfYDQIfoE1w

    linkinPark.on(
        'data',
        (data) => {
            if (!data.url || !data.result.body) return false;

            const urlString = data.url;
            const html = data.result.body;
            const urlObject = new URL(urlString);
            const pathArray = urlObject.pathname.split('/');
            let dirPath = `${baseDirPath}_css`;

            // See: https://github.com/jsdom/jsdom/issues/2230
            const virtualConsole = new VirtualConsole();
            virtualConsole.on("error", () => {
                // No-op to skip console errors.
            });
            // Get them stylesheet links.
            const dom = new JSDOM(html, { virtualConsole });
            if (!dom) return true;

            const links = Array.from(dom.window.document.querySelectorAll('link[rel="stylesheet"]'));
            if (!links) return true;

            if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

            for (let i = 1; i < pathArray.length; i += 1) {
                if (i !== pathArray.length - 1) {
                    dirPath = `${dirPath}/${pathArray[i]}`;
                    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
                } else {
                    dirPath = (pathArray[i])
                        ? `${dirPath}/${pathArray[i].replace(/\.html?$/, '')}`
                        : `${dirPath}/`;

                    links.map(async l => {
                        if (!isUrl(l.href)) return;
                        const response = await fetch(l.href);

                        if (response.status === 200) {
                            const fileUri = extractFileUri(l.href);
                            if (!fileUri) return;

                            const data = await response.text();

                            const fqFilePath = (urlObject.query)
                                ? `${dirPath}-${urlObject.query}.css`
                                : `${dirPath}${fileUri}.css`;

                            fs.writeFileSync(
                                fqFilePath,
                                data
                            );
                        }
                    });

                    process.stdout.write(`\r${linkinPark.countOfProcessedUrls} out of ${linkinPark.foundLinks.size}`);
                }
            }

            return true;
        }
    );

    linkinPark.on(
        'error',
        (error) => console.error(error)
    );

    linkinPark.on(
        'end',
        () => {
            process.stdout.write('\n');
            console.log(`All pages crawled!`);
        }
    );

}; */