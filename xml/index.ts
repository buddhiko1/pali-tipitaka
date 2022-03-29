import fs from "fs";
import { Parser, ParserOptions } from "xml2js";

import { IXmlStructOfIndex, IIndex, IXmlStructOfChapter, IXmlStructOfBook, IChapter, IBOOk } from "./interfaces"
import { INDEX_DIR } from "../config"

abstract class ParserBase {
  private _parser: Parser;
  private _options: ParserOptions = {
    explicitRoot: false,
  };

  constructor(options?: ParserOptions) {
    this._parser = new Parser({ ...this._options, ...options });
  }

  protected async _parseXml(file: string) {
    const content = fs.readFileSync(file, "utf-8");
    return this._parser
      .parseStringPromise(content)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error("parser error:", error);
      });
  }
}

export class IndexParser extends ParserBase {
  constructor() {
    super();
  }

  async parse(indexFile: string): Promise<IIndex> {
    const xml = await this._parseXml(indexFile);
    return this._extractIndex(xml);
  }

  private async _extractIndex(xml: IXmlStructOfIndex): Promise<IIndex> {
    let index: IIndex = {
      text: xml.$.text,
      src: [],
    };
    if (xml.tree) {
      let nodes: IIndex[] = [];
      for (let node of xml.tree) {
        nodes.push(await this._extractIndex(node));
      }
      index.src = nodes;
    } else {
      if (xml.$.src.startsWith("toc")) {
        const indexFile = `${INDEX_DIR}/${xml.$.src}`;
        return await this.parse(indexFile);
      } else {
        index.src = xml.$.src;
      }
    }
    return index;
  }
}

export class BookParser extends ParserBase {
  constructor() {
    super();
  }

  async parse(index: IIndex): Promise<IBOOk> {
    let book: IBOOk = {
      title: index.text,
      chapters: [],
    };
    const indexFile = `${INDEX_DIR}${index.src.slice(1)}`;
    const xml: IXmlStructOfBook = await this._parseXml(indexFile);
    for (let chapterXml of xml.tree) {
      const chapter = this._parseChapter(chapterXml)
      book.chapters.push(chapter)
    }
    return book
  }

  private _parseChapter(xml: IXmlStructOfChapter): IChapter {
    const xmlFile = `${INDEX_DIR}/${xml.$.action}`
    const fileContent = fs.readFileSync(xmlFile, "utf-8");
    const title = xml.$.text.replace(/^[\(\d\)\. ]*/g, "");
    const body = this._extractBody(fileContent);
    if (body) {
      return {
        title,
        body,
      };
    } else {
      throw Error(`invalid body from file: ${xmlFile}!`)
    }
  }

  private _extractBody(fileContent: string): string {
    const bodyRegexp = /<body>(?<body>[\w|\W]*)<\/body>/g;
    const matchedArray = [...fileContent.matchAll(bodyRegexp)];
    let body = matchedArray[0]?.groups?.body ?? ""
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
      body = body.replaceAll(subTitleRegexp, '<p class="subhead">')
    }
    return body
  }
}
