#!/usr/bin/env node

import fs from 'fs';
import glob from 'glob';
import { exit } from 'process';

const round = ( num, n ) => Math.round( ( num + Number.EPSILON ) * ( 10 ** n ) ) / ( 10 ** n );


const extractFileUri = ( URL ) => {
    if ( !URL ) throw new Error( 'URL string must be provided!' );
    const reg = /[\w\:\/\.-]+\/([\w\.-]+?)\.css/gm;
    return reg.exec( URL )?.[1];
};

const files = glob.sync( './temp_test/*.min.css' );

const sizes = files.map( f => {
    const uri = extractFileUri( f );
    return [
        fs.statSync( f ).size,
        fs.statSync( `./temp_test/${uri}.purged.css` ).size
    ];
} );

const before = sizes.reduce( ( ac, n ) => {
    return ac + n[0];
}, 0 );

const after = sizes.reduce( ( ac, n ) => {
    return ac + n[1];
}, 0 );

const reductionFactor = after / before;
console.log( 'Filesize reduced by:', round( ( 1 - reductionFactor ) * 100, 2 ) + '%' );

exit( 0 );