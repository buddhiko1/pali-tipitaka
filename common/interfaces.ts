export interface IXmlStructOfIndex {
  $: {
    text: string;
    src: string;
  };
  tree?: Array<IXmlStructOfIndex>;
}

export interface IIndex {
  title: string;
  src: Array<IIndex> | string;
}