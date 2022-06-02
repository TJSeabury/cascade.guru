export const hasProtocol = (uri: string): boolean => /^https?:\/\//gm.test(uri);

export const linkIsAbsolute = (uri: string): boolean => /^https?:\/\/(?:\w+?\.){1,9}\w+\/?|^(?:\w+?\.){1,9}\w+\/?|^https?:\/\/localhost\/?/gm.test(uri);

export const linkIsRelative = (uri: string): boolean => !linkIsAbsolute(uri);

/**
 * @todo this will break if protocol is included. fix for that.
 * @param {string} uri
 * @param {string} domain 
 * @returns boolean
 */
export const linkIsLocal = (uri: string, domain: string): boolean => {
  if (linkIsRelative(uri)) return true;
  return new RegExp(`^${domain}`).test(uri);
};

export const linkIsExternal = (uri: string, domain: string): boolean => !linkIsLocal(uri, domain);

/**
 * What even is this logic here...
 * @todo fix this...
 * @param {string} u 
 * @returns boolean
 */
export const isUrl = (u: string): boolean => {
  try {
    if (linkIsAbsolute(u)) {
      new URL(u);
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
};

export const isNotUrl = (u: string): boolean => !isUrl(u);

export const makeLinkAbsolute = (link: string, domain: string): string => {
  if (linkIsAbsolute(link)) return link;
  if (! /^\//.test(link)) link = '/' + link;
  return domain + link;
};

export const trimSlashes = (url: string): string => url.replace(/^\/{2,}|\/+$/g, '');

/**
 * 
 * @param {string} uri 
 * @returns {object} URL
 */
export const urlResolver = (uri: string, hostname: string | null = null): [string, any] => {
  try {
    uri = trimSlashes(uri);
    if (!hasProtocol(uri)) {
      if (linkIsAbsolute(uri)) {
        return [new URL(`https://${uri}`).href, null];
      } else {
        if (!hostname) throw new Error(`${uri} requires a hostname to resolve.`);
        return [new URL(`https://${hostname}/${uri}`).href, null];
      }
    } else {
      return [new URL(uri).href, null];
    }
  } catch (err) {
    return [uri, err];
  }
};

export const extractFileUri = (url: string | null): [string, Error | null] => {
  if (!url) return [
    '',
    new Error('URL string must be provided!')
  ];
  const reg = /[\w\:\/\.-]+\/([\w\.-]+?)\.css/gm;
  const fileUri = reg.exec(url)?.[1];
  if (!fileUri) return [
    '',
    new Error('Failed to extract URI.')
  ];
  return [fileUri, null];
};