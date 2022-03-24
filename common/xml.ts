import fs from "fs";
import path from "path"
import { IXmlStructOfIndex, IIndex } from "./interfaces"
import { Parser, ParserOptions } from "xml2js";

abstract class ParserBase {
  private _parser: Parser;
  private _options: ParserOptions = {
    explicitRoot: false,
  };

  constructor(options?: ParserOptions) {
    this._parser = new Parser({ ...this._options, ...options });
  }

  protected async _parseXml(file: string) {
    const fileContent = fs.readFileSync(file, "utf-8");
    return this._parser
      .parseStringPromise(fileContent)
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
    super()
  };

  private async _extract(xml: IXmlStructOfIndex, dir: string): Promise<IIndex> {
    let result: IIndex = {
      title: xml?.$?.text ?? 'index',
      src: []
    };
    if (xml.tree) {
      let nodes: IIndex[] = []
      for (let node of xml.tree) {
        nodes.push(await this._extract(node, dir));
      }
      result.src = nodes
    } else {
      result.title = xml.$.text
      if (xml.$.src.startsWith("toc")) {
        const srcPath = `${dir}/${xml.$.src}`;
        let nestedIndex = await this.parse(srcPath);
        result.src = [nestedIndex];
      } else {
        result.src = xml.$.src;
      }
    }
    return result
  }

  async parse(rootFile: string, rootTitle: string): Promise<IIndex> {
    const dir = path.dirname(rootFile);
    const xml = await this._parseXml(rootFile);
    return this._extract(xml, dir)
  }
}
