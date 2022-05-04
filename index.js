import fs from 'fs';
import path from 'path';
import 'dotenv/config';
const {
    mode
} = process.env;
// Bring in the ability to create the 'require' method
import { createRequire } from "module";
import { fileURLToPath } from 'url';
import { URL } from 'url';

import express from 'express';
import connectLivereload from 'connect-livereload';
import _ from 'lodash';

import {
    credentialsFromBasicAuth,
    authenticate
} from './authorization.js';
import {
    isUrl,
    getHtml,
    extractFileUri,
    linkIsRelative,
    urlResolver,
} from './linkinPark.js';
import { PurgeCSS } from "purgecss";
import purgecssWordpress from 'purgecss-with-wordpress';

import {
    JSDOM,
    VirtualConsole
} from 'jsdom';
import fetch from 'node-fetch';

import reductionFactor from './reductionFactor.js';

// construct the require method
const require = createRequire( import.meta.url );

// Solves: "__dirname is not defined in ES module scope"
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

const bodyParser = require( 'body-parser' );
const livereload = require( 'livereload' );

const CleanCSS = require( 'clean-css' );

if ( mode === 'production' ) {
    // haha y'all don't work now.
    console.log = () => { };
    console.warn = () => { };
    console.error = () => { };
    console.dir = () => { };
}

const app = express();
const port = 6969;

// open livereload high port and start to watch public directory for changes
const liveReloadServer = livereload.createServer();
liveReloadServer.watch( path.resolve( __dirname, 'public' ) );

// ping browser on Express boot, once browser has reconnected and handshaken
liveReloadServer.server.once( "connection", () => {
    setTimeout( () => {
        liveReloadServer.refresh( "/" );
    }, 100 );
} );

// monkey patch every served HTML so they know of changes
app.use( connectLivereload() );

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );

app.listen( port );

app.get( '/', ( req, res ) => {
    res.send( 'Well, yes, but actually no.' );
} );

app.post( '/', async ( req, res ) => {
    const [
        username,
        password
    ] = credentialsFromBasicAuth( req );

    const ok = authenticate( username, password );

    if ( !ok ) {
        res.status( 401 ).send( 'Authentication failed.' );
    }

    const target = urlResolver( req?.body?.target );
    if ( !target ) {
        res.status( 422 ).send( 'Must provide a valid target URL.' );
    }

    const startTime = Date.now();

    const targetHostname = new URL( target ).hostname;

    console.log( 'Getting HTML' );
    const tempDirName = _.uniqueId( `${Date.now()}_${targetHostname}` );

    const [html, error] = await getHtml( target );
    if ( error !== null ) {
        res.status( 422 ).send( `${target} responded with status ${error.status}` );
        return;
    }
    if ( !fs.existsSync( path.resolve( `./${tempDirName}/` ) ) ) {
        fs.mkdirSync( path.resolve( `./${tempDirName}/` ) );
    }
    fs.writeFileSync(
        path.resolve( `./${tempDirName}/temp.html` ),
        html
    );

    const virtualConsole = new VirtualConsole();
    virtualConsole.on( "error", () => {
        // No-op to skip console errors.
    } );
    // Get them stylesheet links.
    const dom = new JSDOM( html, { virtualConsole } );
    if ( !dom ) {
        res.status( 500 ).send( 'Failed to create vDOM. :c' );
    }

    console.log( 'Finding stylesheets' );

    const links = Array.from( dom.window.document.querySelectorAll( 'link[rel="stylesheet"]' ) );
    if ( !links ) {
        res.status( 500 ).send( 'No <link>s found. :c' );
    }

    console.log( 'Downloading CSS' );

    for ( const l of links ) {
        if ( linkIsRelative( l.href ) ) {
            console.log( 'Attempting to resolve relative url...', l.href );
            let temp = urlResolver( l.href, targetHostname );
            if ( isUrl( temp ) ) {
                l.href = temp;
            } else {
                console.error( 'Error: not a url!', l.href, temp );
                return;
            }
        }
        const response = await fetch( l.href );
        if ( response.status === 200 ) {
            let fileUri = extractFileUri( l.href );
            if ( !fileUri ) {
                fileUri = _.uniqueId( Date.now() );
            }
            const data = await response.text();
            fs.writeFileSync(
                path.resolve( `./${tempDirName}/temp_${fileUri}.css` ),
                data
            );
        }
    }

    console.log( 'Purging CSS' );

    const result = await ( new PurgeCSS() ).purge( {
        content: [`./${tempDirName}/**/*.html`],
        css: [`./${tempDirName}/**/*.css`],
        safelist: purgecssWordpress.safelist
    } );
    if ( !result ) {
        res.status( 500 ).send( 'Failed to purge. :c' );
    }

    console.log( 'Writing purged stylesheet' );

    let css = '';
    if ( !fs.existsSync( `./${tempDirName}/purged/` ) ) {
        fs.mkdirSync( `./${tempDirName}/purged/` );
    }
    for ( const stylesheet of result ) {
        css += stylesheet.css;
        fs.writeFileSync(
            path.resolve( `./${tempDirName}/purged/${extractFileUri( stylesheet.file )}.purged.css` ),
            stylesheet.css
        );
    }

    console.log( 'Calculating reduction factor' );

    const rf = reductionFactor( tempDirName );

    // cleanup!
    console.log( 'Cleaning up temp dir' );
    fs.rmSync(
        `./${tempDirName}/`,
        {
            recursive: true,
            force: true
        }
    );

    const cleanCSS = new CleanCSS( {
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
    } );

    const minified = cleanCSS.minify( css );
    const totalRF = 1 - ( minified.stats.minifiedSize / rf.originalSize ) || 0;

    const processingTime = Date.now() - startTime;

    console.log( 'Serving result' );
    res.json( {
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
        css: minified.styles
    } );
} );