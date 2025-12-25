export type MlItem = {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  thumbnail: string;
  permalink: string;
};

export type MlPaging = {
  total: number;
  offset: number;
  limit: number;
};

export type MlSearchResponse = {
  items: MlItem[];
  paging: MlPaging;
};

export type MlSearchOptions = {
  signal?: AbortSignal;
};
