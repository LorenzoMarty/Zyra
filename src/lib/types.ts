export type Condition = "novo" | "usado";

export type Product = {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  pictures: string[];
  permalink: string;
  affiliate_link: string;
  category_id: string;
  category_name: string;
  rating: number;
  reviews_count: number;
  shipping_free: boolean;
  condition: Condition;
  seller_name?: string;
  tags: string[];
  sold?: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type SearchParams = {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  condition?: Condition;
  freeShipping?: boolean;
  fastDelivery?: boolean;
  rating?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "sold_desc";
  page?: number;
  pageSize?: number;
};

export type SearchResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};

export type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "UPDATE_QTY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; payload: { items: CartItem[] } };
