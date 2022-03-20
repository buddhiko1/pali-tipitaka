import fs from "fs";
import { Parser as ParserLib } from "xml2js";

export class Parser {
  private _parser: ParserLib;
  
  constructor() {
    this._parser = new ParserLib()
  }
  parse(file: string) {
    const content = fs.readFileSync(file, "utf-8");
    // fs.readFile(file, (err, data) => {
    //   this._parser.parseString(data, (err: any, result: any) => {
    //     console.log('result:', result);
    //     console.log('error:', err);
    //   });
    // })

    this._parser.parseString(content, (err: any, result: any) => {
      console.dir(result);
      console.log("Done");
    });
  }
}
