import clear from "clear";
import inquirer from "inquirer";

import { IndexParser, BookParser } from "./xml";
import { Factory as EpubFactory } from "./epub";
import { IIndex, IBOOk } from "./xml/interfaces";
import { ROOT_INDEX_FILE, OUTPUT_DIR } from "./config";

async function run() {
  clear()
  const parser = new IndexParser();
  const indexJson = await parser.parse(ROOT_INDEX_FILE);
  const series = typeof indexJson.src === "string" ? [] : indexJson.src
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
      const selectedSeries = series.find(
        (item) => item.text === answer.series
      ) ?? <never>answer;
      collections =
        typeof selectedSeries.src === "string"
          ? []
          : selectedSeries.src;
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
      const selectedCollection =
        collections.find((item) => item.text === answer.collection) ??
        <never>answer;
      books =
        typeof selectedCollection.src === "string"
          ? []
          : selectedCollection.src;
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
      const selectedBook =
        books.find((item) => item.text === answer.book) ?? <never>answer;
      volumes =
        typeof selectedBook.src === "string"
          ? []
          : selectedBook.src;
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
        return selectedBook
      }
    })
    .then(async (answer) => {
      const selectedVolume = volumes.find(
        (item) => item.text === answer.volume
      );
      const bookIndex = selectedVolume ?? answer
      const bookParser = new BookParser();
      const book: IBOOk = await bookParser.parse(bookIndex)
      const epubFactory = new EpubFactory(OUTPUT_DIR)
      await epubFactory.make(book)
    })
}

run();