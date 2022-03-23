import fs from 'fs';
import path from 'path';
import Crawler from 'node-html-crawler';

const target = 'kctrialattorney.com';

const gatherHtml = ( target = null ) => {
    if ( target === null ) throw new Error( 'Target must be provided...' );

    const baseDirPath = path.resolve( path.dirname( './' ), `temp_${target}` );

    const linkinPark = new Crawler( {
        protocol: 'https:', // default 'http:'
        domain: target, // default 'example.com'
        limitForConnections: 15, // number of simultaneous connections, default 10
        limitForRedirects: 5, // possible number of redirects, default 5
        timeout: 500, // number of milliseconds between pending connection, default 300
        headers: {
            'User-Agent': 'Mozilla/5.0', // default header
        },
        urlFilter: ( url ) => true, // default filter
    } ); // These wounds, they will not heal.

    linkinPark.crawl(); // Crawling in my crawl.
    // See: https://www.youtube.com/watch?v=hfYDQIfoE1w

    linkinPark.on(
        'data',
        ( data ) => {
            if ( !data.url || !data.result.body ) return false;

            const urlString = data.url;
            const html = data.result.body;
            const urlObject = new URL( urlString );
            const pathArray = urlObject.pathname.split( '/' );
            let dirPath = baseDirPath;

            if ( !fs.existsSync( dirPath ) ) fs.mkdirSync( dirPath );

            for ( let i = 1; i < pathArray.length; i += 1 ) {
                if ( i !== pathArray.length - 1 ) {
                    dirPath = `${dirPath}/${pathArray[i]}`;
                    if ( !fs.existsSync( dirPath ) ) fs.mkdirSync( dirPath );
                } else {
                    dirPath = ( pathArray[i] )
                        ? `${dirPath}/${pathArray[i].replace( /\.html?$/, '' )}`
                        : `${dirPath}/index`;

                    dirPath = ( urlObject.query )
                        ? `${dirPath}-${urlObject.query}.html`
                        : `${dirPath}.html`;

                    fs.writeFileSync( dirPath, html );

                    process.stdout.write( `\r${linkinPark.countOfProcessedUrls} out of ${linkinPark.foundLinks.size}` );
                }
            }

            return true;
        }
    );

    linkinPark.on(
        'error',
        ( error ) => console.error( error )
    );

    linkinPark.on(
        'end',
        () => console.log( `All pages a saved in folder ${baseDirPath}!` )
    );

};

const gatherCss = ( target = null ) => {

};

const gatherRedirects = ( target = null ) => {
    if ( target === null ) throw new Error( 'Target must be provided...' );

    const siteTree = { pages: [], urls: {}, redirects: {} };
    const getFinalStatusCodeOfRedirects = ( url ) => {
        if ( /30\d/.test( siteTree.urls[url] ) ) return getFinalStatusCodeOfRedirects( siteTree.redirects[url] );

        return siteTree.urls[url];
    };

    const linkinPark = new Crawler( {
        protocol: 'https:', // default 'http:'
        domain: target, // default 'example.com'
        limitForConnections: 15, // number of simultaneous connections, default 10
        limitForRedirects: 5, // possible number of redirects, default 5
        timeout: 500, // number of milliseconds between pending connection, default 300
        headers: {
            'User-Agent': 'Mozilla/5.0', // default header
        },
        urlFilter: ( url ) => true, // default filter
    } ); // These wounds, they will not heal.

    linkinPark.crawl(); // Crawling in my crawl.
    // See: https://www.youtube.com/watch?v=hfYDQIfoE1w

    linkinPark.on(
        'data',
        ( data ) => {
            siteTree.urls[data.url] = data.result.statusCode;
            siteTree.pages.push( {
                url: data.url,
                links: data.result.links,
            } );

            process.stdout.write( `\r${linkinPark.countOfProcessedUrls} out of ${linkinPark.foundLinks.size}` );

            if ( /30\d/.test( data.result.statusCode ) && data.result.links[0].url ) {
                siteTree.redirects[data.url] = data.result.links[0].url;
            }
        }
    );

    linkinPark.on( 'error', ( error ) => console.error( error ) );

    linkinPark.on( 'end', () => {
        const resultFilePath = path.resolve( path.dirname( './' ), `${target}.csv` );

        fs.writeFileSync( resultFilePath, 'url,href,status\r\n' );

        siteTree.pages.forEach( ( page, pageIndex ) => {

            page.links.forEach( ( link, linkIndex ) => {
                if ( link.url ) {
                    const hrefOfLink = siteTree.pages[pageIndex].links[linkIndex].href;
                    const statusCodeOfLink = ( /30\d/.test( siteTree.urls[link.url] ) ) ? getFinalStatusCodeOfRedirects( link.url ) : siteTree.urls[link.url];

                    if ( statusCodeOfLink ) {
                        fs.appendFileSync(
                            resultFilePath,
                            `"${page.url}","${hrefOfLink}","${statusCodeOfLink}"\r\n`
                        );
                    }
                }
            } );
        } );

        console.log( `\r\nFinish! All ${linkinPark.foundLinks.size} links on pages on domain ${target} a checked!` );
    } );

};

gatherHtml( target );