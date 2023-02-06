import fs from "fs";
import { Parser, ParserOptions } from "xml2js";

import {
  IXmlStructOfIndex,
  IIndex,
  IXmlStructOfChapter,
  IXmlStructOfVolume,
  IChapter,
  IVolume,
} from "./interfaces";
import { BaseBodyParser, DefaultBodyParser } from "./bodyParser";

abstract class ParserBase {
  private _parser: Parser;
  private _options: ParserOptions = {
    explicitRoot: false,
  };
  protected _indexDir: string;

  constructor(indexDir: string, options?: ParserOptions) {
    this._indexDir = indexDir;
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
  constructor(indexDir: string) {
    super(indexDir);
  }

  async parse(indexFile: string): Promise<IIndex> {
    const xml = await this._parseXml(indexFile);
    return this._extractIndex(xml);
  }

  private async _extractIndex(xml: IXmlStructOfIndex): Promise<IIndex> {
    const index: IIndex = {
      text: xml.$.text,
      src: [],
    };
    if (xml.tree) {
      const nodes: IIndex[] = [];
      for (const node of xml.tree) {
        nodes.push(await this._extractIndex(node));
      }
      index.src = nodes;
    } else {
      if (xml.$.src.startsWith("toc")) {
        const indexFile = `${this._indexDir}/${xml.$.src}`;
        return await this.parse(indexFile);
      } else {
        index.src = xml.$.src;
      }
    }
    return index;
  }
}

export class VolumeParser extends ParserBase {
  private _bodyParser: BaseBodyParser;
  constructor(indexDir: string, bodyParser?: BaseBodyParser) {
    super(indexDir);
    this._bodyParser = bodyParser ? bodyParser : new DefaultBodyParser();
  }

  async parse(item: IIndex): Promise<IVolume> {
    const volume: IVolume = {
      title: item.text,
      chapters: [],
    };
    const indexFile = `${this._indexDir}${item.src.slice(1)}`;
    const xml: IXmlStructOfVolume = await this._parseXml(indexFile);
    for (const chapterXml of xml.tree) {
      const chapter = this._parseChapter(chapterXml);
      volume.chapters.push(chapter);
    }
    return volume;
  }

  private _parseChapter(xml: IXmlStructOfChapter): IChapter {
    const xmlFile = `${this._indexDir}/${xml.$.action}`;
    const content = fs.readFileSync(xmlFile, "utf-8");
    // eslint-disable-next-line no-useless-escape
    const title = xml.$.text.replace(/^[\(\d\)\. ]*/g, "");
    const body = this._bodyParser.parse(content);
    if (body) {
      return {
        title,
        body,
      };
    } else {
      throw Error(`invalid body from file: ${xmlFile}!`);
    }
  }
}
