import { IndexParser } from "./common/xml";

// const file = `${__dirname}/tipitaka/cscd/abh01a.att2.xml`
async function run() {
  const file = `${__dirname}/tipitaka/toc0.xml`;
  const parser = new IndexParser();
  const rootTitle = "dhamma"
  let result = await parser.parse(file, rootTitle)
  console.log(JSON.stringify(result))
}

run()