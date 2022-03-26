export interface IXmlStructOfIndex {
  $: {
    text: string;
    src: string;
  };
  tree?: Array<IXmlStructOfIndex>;
}

export interface IIndex {
  text: string;
  src: Array<IIndex> | string;
}