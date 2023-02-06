### Generate beautiful Epub of Pali tipitaka with custom style and font.
1. [install nodejs](https://nodejs.org).
2. Install pnpm `sudo npm install -g pnpm`.
3. Run `pnpm setup`.
4. reopen terminal .
5. Install ts-node `pnpm install -g ts-node`.
6. Switch to project directory.
7. Run `pnpm install`.
8. Run `ts-node index.ts -a` to generate all books.
8. Run `ts-node index.ts` to generate book with command line interaction.
10. Download generated epub from "output" directory.

### Config
1. To fine tune the book style, you can regenerate book after edit css property such as line height, font color in the assets/css/base.css.
