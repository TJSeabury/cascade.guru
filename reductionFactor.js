import fs from 'fs';
import glob from 'glob';
import {
    extractFileUri
} from './linkinPark.js';

export default function reductionFactor ( dirName ) {
    const files = glob.sync( `./${dirName}/*.css` );

    const sizes = files.map( f => {
        const uri = extractFileUri( f );
        return [
            fs.statSync( f ).size,
            fs.statSync( `./${dirName}/purged/${uri}.purged.css` ).size
        ];
    } );

    const before = sizes.reduce( ( ac, n ) => {
        return ac + n[0];
    }, 0 );

    const after = sizes.reduce( ( ac, n ) => {
        return ac + n[1];
    }, 0 );

    const reductionFactor = after / before;

    return {
        originalSize: before,
        purgedSize: after,
        reductionFactor: 1 - reductionFactor || 0
    };
}