import fs from "fs"
import path from "path"
import { EPub, EpubOptions } from "@lesjoursfr/html-to-epub";
import { IBOOk } from "../xml/interfaces";

export class Factory {
  private _defaultOptions = {
    author: "buddha",
    publisher: "https://jihulab.com/dhammena/dhamma-epub.git",
    version: 3,
    appendChapterTitles: false,
    verbose: true,
    fonts: [`${path.dirname(__dirname)}/assets/fonts/Pali.ttf`],
    css: `@font-face {
        font-family: "Pali";
        font-style: normal;
        font-weight: normal;
        src : url("./fonts/Pali.ttf");
    }`,
  };

  constructor(private _outputDir: string) {
    if (!fs.existsSync(_outputDir)) {
      fs.mkdirSync(_outputDir, { recursive: true });
    }
  }

  async make(book: IBOOk) {
    let options = {
      title: book.title,
      // cover: "",
      content: book.chapters.map((item) => {
        return {
          title: item.title,
          data: item.body,
        };
      }),
    };
    options = { ...this._defaultOptions, ...options };
    const output = `${this._outputDir}/${book.title}.epub`;
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
}