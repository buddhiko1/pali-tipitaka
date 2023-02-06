export abstract class BaseBodyParser {
  
  protected _baseParse(content: string): string {
    const bodyRegexp = /<body>(?<body>[\w|\W]*)<\/body>/g;
    const matchedArray = [...content.matchAll(bodyRegexp)];
    let body = matchedArray[0]?.groups?.body ?? "";
    if (body) {
      // remove redundant html
      const homageRegex = /(?<=^[\r\n]*)<p rend="centre"> Namo tassa bhagavato arahato sammāsambuddhassa<\/p>/g;
      body = body.replace(homageRegex, "");
      const nikayaRegexp = /<p rend="nikaya">[\w|\W]*?<\/p>/g;
      body = body.replace(nikayaRegexp, "");
      const bookTitleRegex =
        /(?<=<p rend="book">[\w|\W]*?<\/p>[\r\n]*)<p rend="title">[\w|\W]*?<\/p>/g;
      body = body.replace(bookTitleRegex, "");
      body = body.replace(/<p rend="book">[\w|\W]*?<\/p>/g, "");
      body = body.replace(/^[\r\n]*/g, "");
      // replace rend with class
      body = body.replaceAll(/<p rend="chapter">/g, '<p class="chapter">')
      body = body.replaceAll(/<p rend="title">/g, '<p class="title">');
      body = body.replaceAll(/<p rend="subhead">/g, '<p class="subhead">');
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
    
    // replace inline number tag
    regexp = /<p([^>]*)><hi rend="paranum">(\d+)<\/hi><hi rend="dot">\.<\/hi>(?!<\/p>)/g;
    body = body.replaceAll(regexp, '<p$1><span class="inlineNumber">$2.</span>');
    
    // add class in text that start with number
    regexp = /<p rend="bodytext">(\s*\d+[^<]*<\/p>)/g;
    body = body.replaceAll(regexp, '<p class="textWithNumber">$1')
    return body
  }

  parse(content: string): string {
    let body = this._baseParse(content)
    body = this._replaceNumberTag(body)
    return body
  }
}
