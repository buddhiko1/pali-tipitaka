import { Command } from "commander";

import { Factory as BookFactory } from "./book";

let program = new Command();

program
  .version("1.0.0")
  .name("ts-node")
  .usage("index.ts [options]")
  .option("-a, --all", "generates all books")
  .action((options) => {
    const bookFactory = new BookFactory();
    if (options.all) {
      bookFactory.makeAllBook();
    } else {
      bookFactory.makeSelectedBook();
    }
  });

program.parse(process.argv);
