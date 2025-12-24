import { describe, expect, it } from "vitest";
import { cartReducer, initialCartState } from "@/lib/cart";
import type { Product } from "@/lib/types";

const product: Product = {
  id: "test-1",
  title: "Produto Teste",
  price: 10,
  thumbnail: "",
  pictures: [],
  permalink: "https://www.mercadolivre.com.br/produto",
  affiliate_link: "https://www.mercadolivre.com.br/produto?aff_id=1",
  category_id: "eletronicos",
  category_name: "Eletronicos",
  rating: 4.5,
  reviews_count: 10,
  shipping_free: true,
  condition: "novo",
  seller_name: "Teste",
  tags: []
};

describe("cartReducer", () => {
  it("adds item to cart", () => {
    const state = cartReducer(initialCartState, {
      type: "ADD_ITEM",
      payload: { product }
    });

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
  });

  it("increments quantity when adding same item", () => {
    const state = cartReducer(initialCartState, {
      type: "ADD_ITEM",
      payload: { product, quantity: 2 }
    });

    const next = cartReducer(state, {
      type: "ADD_ITEM",
      payload: { product, quantity: 1 }
    });

    expect(next.items[0].quantity).toBe(3);
  });

  it("updates quantity", () => {
    const state = cartReducer(initialCartState, {
      type: "ADD_ITEM",
      payload: { product }
    });

    const next = cartReducer(state, {
      type: "UPDATE_QTY",
      payload: { id: product.id, quantity: 5 }
    });

    expect(next.items[0].quantity).toBe(5);
  });

  it("removes item", () => {
    const state = cartReducer(initialCartState, {
      type: "ADD_ITEM",
      payload: { product }
    });

    const next = cartReducer(state, {
      type: "REMOVE_ITEM",
      payload: { id: product.id }
    });

    expect(next.items).toHaveLength(0);
  });
});
