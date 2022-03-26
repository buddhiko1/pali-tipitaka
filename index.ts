import clear from "clear";
import figlet from "figlet";
import inquirer from "inquirer";

import { IndexParser } from "./common/xml";
import { IIndex } from "./common/interfaces";
import { INDEX_ROOT_FILE } from "./config";

async function run() {
  clear()
  console.log(figlet.textSync("Dhamma"));
  const parser = new IndexParser();
  const indexJson = await parser.parse(INDEX_ROOT_FILE);
  const series = typeof indexJson.src === "string" ? [] : indexJson.src
  let collections: IIndex[];
  let books: IIndex[];
  let volumes: IIndex[];
  //
  inquirer
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
      return inquirer.prompt([
        {
          type: "list",
          name: "volume",
          message: "Which volume?",
          choices: volumes.flatMap((item) => item.text),
        },
      ]);
    })
    .then((answer) => {
      const selectedVolume = volumes.find(
        (item) => item.text === answer.volume
      );
      console.log(selectedVolume)
    })
}

run();