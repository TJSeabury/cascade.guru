import fs from 'fs';
import path from 'path';
import Crawler from 'node-html-crawler';
import {
    JSDOM,
    VirtualConsole
} from 'jsdom';
import fetch from 'node-fetch';
import { exit } from 'process';
import { PurgeCSS } from "purgecss";
import purgecssWordpress from 'purgecss-with-wordpress';

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
                        ? `${dirPath}-${urlObject.query}.json`
                        : `${dirPath}.json`;

                    fs.writeFileSync( dirPath, JSON.stringify( data ) );

                    process.stdout.write( `\r${linkinPark.countOfProcessedUrls} out of ${linkinPark.foundLinks.size}` );
                }
            }
            process.stdout.write( '\n' );

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
            let dirPath = `${baseDirPath}_css`;

            // See: https://github.com/jsdom/jsdom/issues/2230
            const virtualConsole = new VirtualConsole();
            virtualConsole.on( "error", () => {
                // No-op to skip console errors.
            } );
            // Get them stylesheet links.
            const dom = new JSDOM( html, { virtualConsole } );
            if ( !dom ) return true;

            const links = Array.from( dom.window.document.querySelectorAll( 'link[rel="stylesheet"]' ) );
            if ( !links ) return true;

            if ( !fs.existsSync( dirPath ) ) fs.mkdirSync( dirPath );

            for ( let i = 1; i < pathArray.length; i += 1 ) {
                if ( i !== pathArray.length - 1 ) {
                    dirPath = `${dirPath}/${pathArray[i]}`;
                    if ( !fs.existsSync( dirPath ) ) fs.mkdirSync( dirPath );
                } else {
                    dirPath = ( pathArray[i] )
                        ? `${dirPath}/${pathArray[i].replace( /\.html?$/, '' )}`
                        : `${dirPath}/`;

                    links.map( async l => {
                        const response = await fetch( l.href );

                        if ( response.status === 200 ) {
                            const fileUri = extractFileUri( l.href );
                            if ( !fileUri ) return;

                            const data = await response.text();

                            const fqFilePath = ( urlObject.query )
                                ? `${dirPath}-${urlObject.query}.css`
                                : `${dirPath}${fileUri}.css`;

                            fs.writeFileSync(
                                fqFilePath,
                                data
                            );
                        }
                    } );

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
        () => {
            process.stdout.write( '\n' );
            console.log( `All pages crawled!` );
        }
    );

};

const getHtml = async ( target = null ) => {
    if ( target === null ) throw new Error( 'Target must be provided...' );
    console.log( target );
    const response = await fetch( target );
    if ( response.status === 200 ) {
        const html = await response.text();
        return html;
    }
    return null;
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

const extractFileUri = ( URL ) => {
    if ( !URL ) throw new Error( 'URL string must be provided!' );
    const reg = /[\w\:\/\.-]+\/([\w\.-]+?)\.css/gm;
    return reg.exec( URL )?.[1];
};

//gatherHtml( target );
//gatherCss( target );

const testHtml = await getHtml( `https://${target}/` );
if ( !fs.existsSync( './temp_test/' ) ) fs.mkdirSync( './temp_test/' );
fs.writeFileSync(
    path.resolve( './temp_test/temp_test.html' ),
    testHtml
);

const virtualConsole = new VirtualConsole();
virtualConsole.on( "error", () => {
    // No-op to skip console errors.
} );
// Get them stylesheet links.
const dom = new JSDOM( testHtml, { virtualConsole } );
if ( !dom ) exit( 1 );

const links = Array.from( dom.window.document.querySelectorAll( 'link[rel="stylesheet"]' ) );
if ( !links ) exit( 1 );

links.map( async l => {
    const response = await fetch( l.href );

    if ( response.status === 200 ) {
        const fileUri = extractFileUri( l.href );
        if ( !fileUri ) return;

        const data = await response.text();

        fs.writeFileSync(
            path.resolve( `./temp_test/temp_${fileUri}.css` ),
            data
        );
    }
} );

const purgeCss = new PurgeCSS( {
    content: ['./temp_test/**/*.html'],
    css: ['./temp_test/**/*.css'],
    safelist: purgecssWordpress.safelist
} );
const result = await purgeCss.purge();
fs.writeFileSync(
    path.resolve( `./temp_test/temp_purgebundle.css` ),
    result
);

