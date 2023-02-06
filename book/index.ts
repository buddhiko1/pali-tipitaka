import clear from "clear";
import inquirer from "inquirer";

import { Factory as EpubFactory } from "../epub";
import { IndexParser, VolumeParser } from "../xml";

import { IIndex, IBookInfo } from "../xml/interfaces";
import {
  ROOT_INDEX_FILE,
  INDEX_DIR,
  OUTPUT_DIR,
  PUBLISH_INFO,
} from "../config";

export class Factory {
  private _epubFactory: EpubFactory;
  private _volumeParser: VolumeParser;

  constructor() {
    this._epubFactory = new EpubFactory(OUTPUT_DIR, PUBLISH_INFO);
    this._volumeParser = new VolumeParser(INDEX_DIR);
  }

  async _selectBook(): Promise<IBookInfo> {
    clear();
    const indexParser = new IndexParser(INDEX_DIR);
    const indexJson = await indexParser.parse(ROOT_INDEX_FILE);
    const bookInfo: IBookInfo = {
      series: { text: "", src: "" },
      collection: { text: "", src: "" },
      book: { text: "", src: "" },
      volume: { title: "", chapters: [] },
    };
    const series = typeof indexJson.src === "string" ? [] : indexJson.src;
    let collections: IIndex[];
    let books: IIndex[];
    let volumes: IIndex[];

    //
    await inquirer
      .prompt([
        {
          type: "list",
          name: "series",
          message: "Which series?",
          choices: series.flatMap((item) => item.text),
        },
      ])
      .then((answer) => {
        bookInfo.series =
          series.find((item) => item.text === answer.series) ?? <never>answer;
        collections =
          typeof bookInfo.series.src === "string" ? [] : bookInfo.series.src;
        return inquirer.prompt([
          {
            type: "list",
            name: "collection",
            loop: false,
            message: "Which collection?",
            choices: collections.flatMap((item) => item.text),
          },
        ]);
      })
      .then((answer) => {
        bookInfo.collection =
          collections.find((item) => item.text === answer.collection) ??
          <never>answer;
        books =
          typeof bookInfo.collection.src === "string"
            ? []
            : bookInfo.collection.src;
        return inquirer.prompt([
          {
            type: "list",
            name: "book",
            loop: false,
            message: "Which book?",
            choices: books.flatMap((item) => item.text),
          },
        ]);
      })
      .then((answer) => {
        bookInfo.book =
          books.find((item) => item.text === answer.book) ?? <never>answer;
        volumes =
          typeof bookInfo.book.src === "string" ? [] : bookInfo.book.src;
        if (volumes.length) {
          return inquirer.prompt([
            {
              type: "list",
              loop: false,
              name: "volume",
              message: "Which volume?",
              choices: volumes.flatMap((item) => item.text),
            },
          ]);
        } else {
          return bookInfo.book;
        }
      })
      .then(async (answer) => {
        const volumeItem = volumes.length
          ? volumes.find((item) => item.text === answer.volume)
          : answer;
        bookInfo.volume = await this._volumeParser.parse(volumeItem);
      });
    return bookInfo;
  }

  async _makeOneBook(bookInfo: IBookInfo) {
    await this._epubFactory.make(bookInfo);
  }

  async makeSelectedBook() {
    const bookInfo = await this._selectBook();
    await this._makeOneBook(bookInfo);
  }

  async makeAllBook() {
    const indexParser = new IndexParser(INDEX_DIR);
    const indexJson = await indexParser.parse(ROOT_INDEX_FILE);
    const series = typeof indexJson.src === "string" ? [] : indexJson.src;
    for (const seriesItem of series) {
      const collections =
        typeof seriesItem.src === "string" ? [] : seriesItem.src;
      for (const collection of collections) {
        const books = typeof collection.src === "string" ? [] : collection.src;
        for (const book of books) {
          const volumes = typeof book.src === "string" ? [book] : book.src;
          for (const volumeItem of volumes) {
            const volume = await this._volumeParser.parse(volumeItem);
            const bookInfo: IBookInfo = {
              series: seriesItem,
              collection: collection,
              book: book,
              volume: volume,
            };
            await this._makeOneBook(bookInfo);
          }
        }
      }
    }
  }
}
