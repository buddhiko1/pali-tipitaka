import fs from "fs";
import path from "path";

import { IBookInfo } from "../xml/interfaces";
import { ICssOptions } from "./interfaces";

export class Generator {
  private _defaultOptions: ICssOptions = {
    hideInlineNumber: true,
    hideBlockNumber: false,
    showBlockNumber: true,
    styleTextWithNumber: false,
  };

  generate(booInfo: IBookInfo) {
    const options = this._optionsBy(booInfo);
    const baseCssFile = `${path.dirname(__dirname)}/assets/css/base.css`;
    let css = fs.readFileSync(baseCssFile, "utf-8");
    if (options.hideInlineNumber) {
      css = this._hideInlineNumber(css);
    }
    if (options.hideBlockNumber) {
      css = this._hideBlockNumber(css);
    }
    if (options.styleTextWithNumber) {
      css = this._styleTextWithNumber(css);
    }
    return css;
  }

  private _optionsBy(booInfo: IBookInfo): ICssOptions {
    const options: ICssOptions = this._defaultOptions;
    if (booInfo.book.text === "Aṅguttaranikāya") {
      options.hideInlineNumber = false;
    }
    if (booInfo.volume.title === "Theragāthāpāḷi") {
      options.hideBlockNumber = true;
    }
    return options;
  }

  private _hideInlineNumber(css: string): string {
    css += `
    .inlineNumber {
      display: none;
    }
    `;
    return css;
  }

  private _hideBlockNumber(css: string): string {
    css += `
    .blockNumber {
      display: none;
    }
    `;
    return css;
  }

  private _styleTextWithNumber(css: string): string {
    css += `
    .textWithNumber {
      margin-bottom: -0.5rem;
      margin-top: 2rem;
      font-weight: light;
      color: #AD0101;
    }
    `;
    return css;
  }
}
