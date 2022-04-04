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

export interface IXmlStructOfChapter {
  $: {
    text: string;
    action: string;
    target: string
  };
}

export interface IXmlStructOfBook {
  tree: IXmlStructOfChapter[];
}

export interface IChapter {
  title: string;
  body: string
}

export interface IVolume {
  title: string;
  chapters: IChapter[]
}

export interface IBookInfo {
  series: IIndex;
  collection: IIndex;
  book: IIndex;
  volume: IVolume
}
