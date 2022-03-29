import fs from "fs"
import path from "path"
import TextToSVG from "text-to-svg";
import sharp from "sharp";
import { EPub, EpubOptions } from "@lesjoursfr/html-to-epub";
import { IBOOk, IIndex } from "../xml/interfaces";

export class Factory {
  private _defaultOptions = {
    author: "buddha",
    publisher: "https://jihulab.com/dhammena/dhamma-epub.git",
    version: 3,
    appendChapterTitles: false,
    verbose: true,
    fonts: [`${path.dirname(__dirname)}/assets/fonts/Pali.ttf`]
  };

  constructor(private _outputDir: string) {
    if (!fs.existsSync(_outputDir)) {
      fs.mkdirSync(_outputDir, { recursive: true });
    }
  }

  async make(series: IIndex, collection:IIndex, book:IIndex, bookInfo: IBOOk) {
    let options = {
      title: bookInfo.title,
      css: this._cssBy(series, collection, book),
      // cover: this._createCover(bookInfo.title),
      tocTitle: bookInfo.title,
      content: bookInfo.chapters.map((item) => {
        return {
          title: item.title,
          data: item.body,
        };
      }),
    };
    options = { ...this._defaultOptions, ...options };
    const output = `${this._outputDir}/${bookInfo.title}.epub`;
    const epub = new EPub(<EpubOptions>options, output);
    await epub
      .render()
      .then(() => {
        console.log("Ebook Generated Successfully!");
      })
      .catch((err) => {
        console.error("Failed to generate Ebook because of ", err);
      });
  }

  private _cssBy(series: IIndex, collection: IIndex, book: IIndex): string {
    const cssFile = `${path.dirname(__dirname)}/assets/css/default.css`;
    const css = fs.readFileSync(cssFile, "utf-8");
    return css
  }

  private _createCover(title: string): string {
    // const coverPath = `${path.dirname(__dirname)}/assets/images/${title}.jpg`;
    // generate svg
    // const textToSVG = TextToSVG.loadSync(`${path.dirname(__dirname)}/assets/fonts/Pali.ttf`);
    // const svgAttributes = { fill: "#008080" };
    // const svgOptions = {
    //   x: 0,
    //   y: 0,
    //   fontSize: 72,
    //   anchor: "top",
    //   attributes: svgAttributes,
    // };
    // const svg = textToSVG.getSVG(title, <TextToSVG.GenerationOptions>svgOptions);
    
    // combine background image and text svg
    // let svgBuffer = Buffer.from(svg);
    // let bgPath = `${path.dirname(__dirname)}/assets/images/bg.jpg`;
    // sharp(bgPath)
    //   .composite([
    //     {
    //       input: svgBuffer,
    //       gravity: "center",
    //     },
    //   ])
    //   .toFile(coverPath);
    // return coverPath
    return `${path.dirname(__dirname)}/assets/images/bg.jpg`;
  }
}