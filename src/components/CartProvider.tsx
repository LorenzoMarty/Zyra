"use client";

import {
  CART_STORAGE_KEY,
  calculateSubtotal,
  cartReducer,
  getItemCount,
  initialCartState
} from "@/lib/cart";
import type { CartAction, CartItem, CartState } from "@/lib/types";
import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

type CartContextValue = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const items = JSON.parse(stored) as CartItem[];
        dispatch({ type: "HYDRATE", payload: { items } });
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const value = useMemo(() => {
    return {
      state,
      dispatch,
      subtotal: calculateSubtotal(state.items),
      itemCount: getItemCount(state.items)
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
