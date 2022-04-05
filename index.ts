import clear from "clear";
import inquirer from "inquirer";

import { IndexParser, VolumeParser } from "./xml";
import { Factory as EpubFactory } from "./epub";
import { IIndex, IBookInfo } from "./xml/interfaces";
import { ROOT_INDEX_FILE, OUTPUT_DIR, INDEX_DIR, PUBLISH_INFO } from "./config";

(async () => {
  clear()
  const parser = new IndexParser(INDEX_DIR);
  const indexJson = await parser.parse(ROOT_INDEX_FILE);
  let bookInfo: IBookInfo = {
    series: { text: "", src: "" },
    collection: { text: "", src: "" },
    book: { text: "", src: "" },
    volume: { title: "", chapters: []}
  };
  let series = typeof indexJson.src === "string" ? [] : indexJson.src
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
      bookInfo.series = series.find(
        (item) => item.text === answer.series
      ) ?? <never>answer;
      collections =
        typeof bookInfo.series.src === "string"
          ? []
          : bookInfo.series.src;
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
        typeof bookInfo.book.src === "string"
          ? []
          : bookInfo.book.src;
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
      const volumeIndex = volumes.length ? volumes.find((item) => item.text === answer.volume) : answer;
      const volumeParser = new VolumeParser(INDEX_DIR);
      bookInfo.volume = await volumeParser.parse(volumeIndex)
      const epubFactory = new EpubFactory(OUTPUT_DIR, PUBLISH_INFO)
      await epubFactory.make(bookInfo);
    })
})();