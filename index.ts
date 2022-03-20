import { Parser } from "./common/xml";


// const file = `${__dirname}/dhamma/tipitaka_toc.xml`
const file = `${__dirname}/dhamma/toc1.xml`
let parser = new Parser()
parser.parse(file)