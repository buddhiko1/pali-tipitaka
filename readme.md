# Generate beautiful epub of Tipiṭaka.

### Preview

![image](https://github.com/buddhiko1/pali-epub/blob/master/assets/images/preview.jpg)

### Generate

1. [install nodejs](https://nodejs.org).
2. Install pnpm `sudo npm install -g pnpm`.
3. Run `pnpm setup`.
4. Reopen terminal.
5. Install ts-node `pnpm install -g ts-node`.
6. Switch to project directory.
7. Run `pnpm install`.
8. Run `ts-node index.ts -a` to generate all books.
9. Run `ts-node index.ts` to generate book with command line interaction.
10. Download generated epub from "output" directory.

### Ajust style

1. To fine-tune the book style, regenerate the book after editing the CSS properties in assets/css/base.css, such as line height and font color.

### Recommendation of epub software

- Linux: `sioyek` or `foliate`.
- Mac/Windows/Android/web: `Neat Reader`.
