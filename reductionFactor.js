import fs from 'fs';
import glob from 'glob';
import {
    extractFileUri
} from './linkinPark.js';

export default function reductionFactor () {
    const files = glob.sync( './temp_test/*.css' );

    const sizes = files.map( f => {
        const uri = extractFileUri( f );
        return [
            fs.statSync( f ).size,
            fs.statSync( `./temp_test/purged/${uri}.purged.css` ).size
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
        before,
        after,
        factor: 1 - reductionFactor
    };
}