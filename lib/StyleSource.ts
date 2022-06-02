import _ from "lodash";
import { extractFileUri, isUrl, linkIsRelative } from "./url";

export class StyleSource {

  source: HTMLLinkElement | HTMLStyleElement;
  private _uid: string;
  private _name: string;
  private _data: Promise<string>;
  resolver: (url: string) => [string, any];

  constructor(
    source: HTMLLinkElement | HTMLStyleElement,
    resolver: (url: string) => [string, any]
  ) {
    this._uid = _.uniqueId();
    this.source = source;
    this.resolver = resolver;
    if (
      this.source.tagName === 'LINK' &&
      this.hasHref(this.source)
    ) {
      this._name = this.createSourceName(this.source.href);
      this._data = this.maybeWrapInMediaQuery(
        this.source,
        this.downloadData(this.source.href)
      );
    } else if (this.source.tagName === 'STYLE') {
      this._name = this.createSourceName('inline');
      if (this.source.innerHTML === null) {
        console.error(`Something went wrong! Inline stylesheet is null: ${this.source.innerHTML}`);
      }
      this._data = this.maybeWrapInMediaQuery(
        this.source,
        Promise.resolve(this.source.innerHTML)
      );
    } else {
      throw new Error('Invalid Element type: input must be HTMLLinkElement | HTMLStyleElement !');
    }
  }

  name() {
    return this._name;
  }

  async data() {
    const data = await this._data;
    return data;
  }

  hasHref(el: HTMLElement): el is HTMLLinkElement {
    return 'href' in el;
  };
  hasMedia(el: HTMLElement): el is HTMLElement {
    return 'media' in el;
  }

  extractMediaRule(el: HTMLElement): [string, Error | null] {
    const rule = el.getAttribute('media');
    if (!rule) return ['', new Error('No media rule found!')];
    return [rule, null];
  }

  async maybeWrapInMediaQuery(el: HTMLElement, data: Promise<string>): Promise<string> {
    if (this.hasMedia(el)) {
      const [rule, err] = this.extractMediaRule(el);
      if (err === null) {
        return `@media ${rule} {${await data}}`;
      }
    }
    return data;
  }

  createSourceName(url: string): string {
    const [fileUri, err] = extractFileUri(url);
    if (err) {
      return `ZZZ_${this._uid}_inline`;
    }
    return `_${this._uid}_${fileUri}`
  }

  async downloadData(url: string): Promise<string> {
    if (linkIsRelative(url)) {
      console.log('Attempting to resolve relative url...', url);
      let [temp, err] = this.resolver(url);
      if (isUrl(temp) && err === null) {
        url = temp;
      } else {
        console.error('Error: not a url!', url, temp);
        return '';
      }
    }
    const res = await fetch(url);
    if (res.status === 200) {
      const data = await res.text();
      return data;
    }
    return '';

  }
}