import type { CartAction, CartItem, CartState, Product } from "@/lib/types";

export const CART_STORAGE_KEY = "ml_cart";

export const initialCartState: CartState = {
  items: []
};

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE": {
      return { items: action.payload.items };
    }
    case "ADD_ITEM": {
      const quantity = normalizeQuantity(action.payload.quantity ?? 1);
      const existing = state.items.find(
        (item) => item.product.id === action.payload.product.id
      );

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === action.payload.product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      }

      return {
        items: [...state.items, { product: action.payload.product, quantity }]
      };
    }
    case "UPDATE_QTY": {
      return {
        items: state.items.map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: normalizeQuantity(action.payload.quantity) }
            : item
        )
      };
    }
    case "REMOVE_ITEM": {
      return {
        items: state.items.filter(
          (item) => item.product.id !== action.payload.id
        )
      };
    }
    case "CLEAR": {
      return { items: [] };
    }
    default:
      return state;
  }
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
}

export function getItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function createCartItem(product: Product, quantity = 1): CartItem {
  return { product, quantity: normalizeQuantity(quantity) };
}

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1;
  }
  return Math.floor(quantity);
}
