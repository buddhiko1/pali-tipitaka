import fs from "fs"
import path from "path"

import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { EPub, EpubOptions } from "@lesjoursfr/html-to-epub";

import { IBookInfo } from "../xml/interfaces";
import { IPublishInfo } from "../common/interfaces";

import { Generator as CssGenerator } from "./cssGenerator";

export class Factory {
  private _defaultOptions = {
    author: "buddha",
    publisher: "https://jihulab.com/dhammena/pali-epub.git",
    version: 3,
    appendChapterTitles: false,
    verbose: true,
    fonts: [`${path.dirname(__dirname)}/assets/fonts/Pali.ttf`],
    customOpfTemplatePath: `${__dirname}/content.opf.ejs`,
  };

  private _cssGenerator: CssGenerator;

  constructor(private _outputDir: string, private _publishInfo: IPublishInfo) {
    this._cssGenerator = new CssGenerator()
  }

  async make(bookInfo: IBookInfo) {
    let bookDir = this._createBookDir(bookInfo);
    let options = {
      title: bookInfo.volume.title,
      css: this._cssGenerator.generate(bookInfo),
      cover: this._createCover(bookInfo),
      // tocTitle: bookInfo.volume.title,
      content: bookInfo.volume.chapters.map((item) => {
        return {
          title: item.title,
          data: item.body,
        };
      }),
    };
    options = { ...this._defaultOptions, ...options };
    const output = `${bookDir}/${bookInfo.volume.title}.epub`;
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

  private _createBookDir(bookInfo: IBookInfo): string {
    const bookDir = `${this._outputDir}/${bookInfo.series.text}/${bookInfo.collection.text}/${bookInfo.book.text}`;
    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }
    return bookDir;
  }

  private _createCover(booInfo:IBookInfo): string {
    const coverPath = `${path.dirname(__dirname)}/assets/images/cover.jpeg`;

    // width and height
    const width = 600;
    const height = 900;
    const canvas = createCanvas(width, height);
    
    // font
    GlobalFonts.registerFromPath(
      `${path.dirname(__dirname)}/assets/fonts/Pali.ttf`,
      "Pali"
    );

    const context = canvas.getContext("2d");
    
    // Background color
    context.fillStyle = "#AD0101";
    context.fillRect(0, 0, width, height);
    
    // title
    const title =
      booInfo.book.text === booInfo.volume.title
        ? booInfo.collection.text
        : booInfo.book.text;
    let fontSize =
      Math.round((20 / title.length) * 55) > 55
        ? 55
        : Math.round((20 / title.length) * 55);
    context.font = `${fontSize}px 'Pali'`;
    context.textAlign = 'center';
    context.fillStyle = "#FFFFFF";
    context.fillText(title, width / 2, height / 6);
    
    context.fillText("•", width / 2, height / 3.95);
    
    // sub title
    const subTitle = booInfo.volume.title;
    fontSize =
      Math.round((20 / subTitle.length) * 40) > 40
        ? 40
        : Math.round((20 / subTitle.length) * 40);
    context.font = `${fontSize}px 'Pali'`;
    context.fillText(subTitle, width / 2, height / 3 );
    context.font = "22px 'Pali'";
    context.fillText(this._publishInfo.institute, width / 2, height / 1.08);

    const buffer = canvas.toBuffer("image/jpeg");
    fs.writeFileSync(coverPath, buffer);
    return coverPath;
  }
}