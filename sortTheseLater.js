import fs from 'fs';
import Crawler from 'node-html-crawler';
import { getAllLinks } from './linkinPark.js';
import { PurgeCSS } from "purgecss";
import purgecssWordpress from 'purgecss-with-wordpress';

/* const gatherRedirects = ( target = null ) => {
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

}; */


gatherHtml( target );
gatherCss( target );

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

await links.map( async l => {
    if ( !isUrl( l.href ) ) return;
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

const result = await new PurgeCSS().purge( {
    content: ['./temp_test/**/*.html'],
    css: ['./temp_test/**/*.css'],
    safelist: purgecssWordpress.safelist
} );
if ( !result ) exit( 1 );
for ( const stylesheet of result ) {
    fs.writeFileSync(
        path.resolve( `./temp_test/${extractFileUri( stylesheet.file )}.purged.css` ),
        stylesheet.css
    );
}

