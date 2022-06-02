import fs from 'fs';
import path from 'path';
import 'dotenv/config';
const {
    mode
} = process.env;
// Bring in the ability to create the 'require' method
import { createRequire } from "module";
import { URL } from 'url';
import _ from 'lodash';
import {
    authenticate
} from '../../../lib/authorization';
import {
    getHtml,
} from '../../../lib/crawling';
import {
    urlResolver,
    extractFileUri,
} from '../../../lib/url';
import { PurgeCSS } from "purgecss";
import purgecssWordpress from 'purgecss-with-wordpress'
import stylelint from 'stylelint'
import {
    JSDOM,
    VirtualConsole
} from 'jsdom'
import reductionFactor from '../../../lib/reductionFactor'
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

import { StyleSource } from '../../../lib/StyleSource'

const prisma = new PrismaClient()

// construct the require method
const require = createRequire(import.meta.url)

const CleanCSS = require('clean-css')
const cleanCSS = new CleanCSS({
    format: {
        breaks: { // controls where to insert breaks
            afterAtRule: false, // controls if a line break comes after an at-rule; e.g. `@charset`; defaults to `false`
            afterBlockBegins: false, // controls if a line break comes after a block begins; e.g. `@media`; defaults to `false`
            afterBlockEnds: false, // controls if a line break comes after a block ends, defaults to `false`
            afterComment: false, // controls if a line break comes after a comment; defaults to `false`
            afterProperty: false, // controls if a line break comes after a property; defaults to `false`
            afterRuleBegins: false, // controls if a line break comes after a rule begins; defaults to `false`
            afterRuleEnds: false, // controls if a line break comes after a rule ends; defaults to `false`
            beforeBlockEnds: false, // controls if a line break comes before a block ends; defaults to `false`
            betweenSelectors: false // controls if a line break comes between selectors; defaults to `false`
        },
        breakWith: '\n', // controls the new line character, can be `'\r\n'` or `'\n'` (aliased as `'windows'` and `'unix'` or `'crlf'` and `'lf'`); defaults to system one, so former on Windows and latter on Unix
        indentBy: 0, // controls number of characters to indent with; defaults to `0`
        indentWith: 'space', // controls a character to indent with, can be `'space'` or `'tab'`; defaults to `'space'`
        spaces: { // controls where to insert spaces
            aroundSelectorRelation: false, // controls if spaces come around selector relations; e.g. `div > a`; defaults to `false`
            beforeBlockBegins: false, // controls if a space comes before a block begins; e.g. `.block {`; defaults to `false`
            beforeValue: false // controls if a space comes before a value; e.g. `width: 1rem`; defaults to `false`
        },
        wrapAt: false, // controls maximum line length; defaults to `false`
        semicolonAfterLastProperty: false // controls removing trailing semicolons in rule; defaults to `false` - means remove
    }
});

if (mode === 'production') {
    // haha y'all don't work now.
    console.log = () => { }
    console.warn = () => { }
    console.error = () => { }
    console.dir = () => { }
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        await postHandler(req, res);
    } else {
        res.status(404).json('Endpoint not found.');
    }
}

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
    console.log(req.body);
    const { email, targetUrl, apiKey } = req.body;
    console.log(email, targetUrl, apiKey);

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (!user) return res.status(401).json(`Authentication failed. User with email <${email}> not found.`);

    const ok = await authenticate(user, apiKey, targetUrl);

    if (!ok) return res.status(401).json('Authentication failed.');

    const [target, urlResolverErr] = urlResolver(targetUrl);
    if (!target || urlResolverErr) {
        return res.status(422).json('Must provide a valid target URL.');
    }

    const startTime = Date.now();

    const targetHostname = new URL(target).hostname;

    console.log('Getting HTML');
    const tempDirName = _.uniqueId(`${Date.now()}_${targetHostname}`);

    const [html, error] = await getHtml(target);
    if (!html || error !== null) {
        res.status(422).json(`${target} responded with status ${error.status}`);
        return;
    }
    if (!fs.existsSync(path.resolve(`./${tempDirName}/`))) {
        fs.mkdirSync(path.resolve(`./${tempDirName}/`));
    }

    const virtualConsole = new VirtualConsole();
    virtualConsole.on("error", () => {
        // No-op to skip console errors.
    });
    const dom = new JSDOM(html, { virtualConsole });
    if (!dom) {
        res.status(500).json('Failed to create vDOM. :c');
    }

    console.log('Finding stylesheets');
    const links = <HTMLLinkElement[] | HTMLStyleElement[]>Array.from(dom.window.document.querySelectorAll('link[rel="stylesheet"], style'));
    if (!links) {
        res.status(500).json('No <link>s or <style>s found. :c');
    }

    console.log('Downloading CSS');
    const resolverInit = (hostname: string) => (url: string) => urlResolver(url, hostname);
    const resolver = resolverInit(targetHostname);
    const stylesheets = links.map((l: HTMLLinkElement | HTMLStyleElement) => new StyleSource(l, resolver));

    for (const sheet of stylesheets) {
        const name = sheet.name();
        const data = await sheet.data();
        if (sheet === null || data === null) {
            console.error(`Something went wrong! Stylesheet ${name} is null.`);
            continue;
        }
        fs.writeFileSync(
            path.resolve(`./${tempDirName}/${name}.css`),
            data
        );
    }

    // Now, lets clean up and save the HTML.
    for (let link of links) {
        link.parentNode?.removeChild(link);
    }
    fs.writeFileSync(
        path.resolve(`./${tempDirName}/temp.html`),
        dom.serialize()
    );

    // To prevent PurgeCSS from crashing...
    console.log('Linting CSS');
    const errors: {
        file: string;
        errors: stylelint.Warning[];
        data: string
    }[] = [];

    await stylelint
        .lint({
            config: {
                rules: [
                    "color-no-invalid-hex",
                    "property-no-unknown"]
            },
            files: `./${tempDirName}/*.css`
        })
        .then(function (data) {
            data.results.map(d => {
                if (d.errored === true) {
                    errors.push({
                        file: path.basename(d.source || ''),
                        errors: d.warnings,
                        data: fs.readFileSync(path.resolve(d.source || '')).toString()
                    });
                    // ... we must remove any offending file.
                    fs.rmSync(path.resolve(d.source || ''));
                    return;
                }
                fs.writeFileSync(
                    path.resolve(d.source || ''),
                    // @ts-ignore
                    d._postcssResult?.css
                );
            });
        })
        .catch(function (err) {
            // do things with err e.g.
            console.error(err.stack);
        });

    console.log('Purging CSS');
    const result = await new PurgeCSS().purge({
        content: [`./${tempDirName}/**/*.html`],
        css: [`./${tempDirName}/**/*.css`],
        safelist: purgecssWordpress.safelist
    });
    if (!result) {
        res.status(500).json('Failed to purge. :c');
    }

    console.log('Writing purged stylesheet');
    let css = '';
    if (!fs.existsSync(`./${tempDirName}/purged/`)) {
        fs.mkdirSync(`./${tempDirName}/purged/`);
    }
    for (const stylesheet of result) {
        css += stylesheet.css;
        fs.writeFileSync(
            path.resolve(`./${tempDirName}/purged/${extractFileUri(stylesheet.file || null)}.purged.css`),
            stylesheet.css
        );
    }

    console.log('Calculating reduction factor');

    const rf = reductionFactor(tempDirName);

    // cleanup!
    console.log('Cleaning up temp dir');
    fs.rmSync(
        `./${tempDirName}/`,
        {
            recursive: true,
            force: true
        }
    );

    const minified = cleanCSS.minify(css);
    const totalRF = 1 - (minified.stats.minifiedSize / rf.originalSize) || 0;

    const processingTime = Date.now() - startTime;

    console.log('Serving result');
    res.json({
        stats: {
            processingTime: processingTime,
            purge: rf,
            minify: {
                reductionFactor: minified.stats.efficiency,
                originalSize: minified.stats.originalSize,
                minifiedSize: minified.stats.minifiedSize,
            },
            total: {
                reductionFactor: totalRF,
                originalSize: rf.originalSize,
                finalSize: minified.stats.minifiedSize,
            }
        },
        errors: errors,
        css: '/* Optimized by https://cascade.guru/ */' + minified.styles,
    });
}
