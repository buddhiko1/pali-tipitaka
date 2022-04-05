export abstract class BaseBodyParser {
  
  constructor() { }
  
  protected _baseParse(content: string): string {
    const bodyRegexp = /<body>(?<body>[\w|\W]*)<\/body>/g;
    const matchedArray = [...content.matchAll(bodyRegexp)];
    let body = matchedArray[0]?.groups?.body ?? "";
    if (body) {
      // remove redundant html
      let homageRegex =
        /(?<=^[\r\n]*)<p rend="centre"> Namo tassa bhagavato arahato sammāsambuddhassa<\/p>/g;
      body = body.replace(homageRegex, "");
      const nikayaRegexp = /<p rend="nikaya">[\w|\W]*?<\/p>/g;
      body = body.replace(nikayaRegexp, "");
      const titleRegex =
        /(?<=<p rend="book">[\w|\W]*?<\/p>[\r\n]*)<p rend="title">[\w|\W]*?<\/p>/g;
      body = body.replace(titleRegex, "");
      const bookRegexp = /<p rend="book">[\w|\W]*?<\/p>/g;
      body = body.replace(bookRegexp, "");
      const returnRegexp = /^[\r\n]*/g;
      body = body.replace(returnRegexp, "");

      //
      const subTitleRegexp = /<p rend="subhead">/g;
      body = body.replaceAll(subTitleRegexp, '<p class="subhead">');
    }
    return body;
  }
  abstract parse(content: string): string;
}

export class DefaultBodyParser extends BaseBodyParser {
  constructor() {
    super();
  }
  private _replaceNumberTag(body: string): string {
    // replace block number tag
    let regexp = /<p[^>]*><hi rend="paranum">(\d+)<\/hi><hi rend="dot">\.<\/hi><\/p>/g
    body = body.replaceAll(regexp, '<p class="blockNumber">$1.</p>')
    return body
  }
  parse(content: string): string {
    let body = this._baseParse(content)
    body = this._replaceNumberTag(body)
    return body
  }
}