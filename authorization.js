export function credentialsFromBasicAuth ( req ) {
    const bAuth = req?.headers?.authorization;
    if ( !bAuth ) return null;
    const b64Auth = Buffer.from( bAuth.replace( 'Basic ', '' ), 'base64' ).toString( 'utf8' );
    if ( !b64Auth ) return null;
    return b64Auth.split( ':' );
}

export function authenticate ( user, pass ) {
    if ( user === "coolUsername" && pass === "securePassword" ) {
        return true;
    }
    return false;
}