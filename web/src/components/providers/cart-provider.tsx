"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { CartItem, ComboOffer, CouponState } from "@/types/cart";
import type { Product } from "@/types/product";
import { trackStoreEvent } from "@/lib/analytics/track";

type CartState = {
  items: CartItem[];
  coupon: CouponState | null;
};

type CartContextValue = {
  items: CartItem[];
  coupon: CouponState | null;
  subtotal: number;
  itemCount: number;
  addItem: (product: Product, quantity?: number) => void;
  addCombo: (combo: ComboOffer, quantity?: number) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  removeItem: (itemKey: string) => void;
  removeItems: (itemKeys: string[]) => void;
  clearCart: () => void;
  applyCoupon: (coupon: CouponState) => void;
  clearCoupon: () => void;
};

const CART_STORAGE_KEY = "ai4kids-cart";

const clampQuantity = (quantity: number, moq: number) =>
  Math.max(Number(quantity || moq || 1), Number(moq || 1));

const buildItemKey = (payload: Pick<CartItem, "itemType" | "comboKey" | "productId">) =>
  payload.itemType === "combo" ? `combo:${payload.comboKey}` : `product:${payload.productId}`;

const normalizeStoredState = (state: Partial<CartState> | null): CartState => {
  const items = Array.isArray(state?.items)
    ? state.items.map((item) => {
        const itemType = item.itemType || (item.comboKey ? "combo" : "product");
        return {
          ...item,
          itemType,
          comboKey: item.comboKey || "",
          productId: item.productId || "",
          bundleItems: Array.isArray(item.bundleItems) ? item.bundleItems : [],
          itemKey:
            item.itemKey ||
            buildItemKey({
              itemType,
              comboKey: item.comboKey || "",
              productId: item.productId || "",
            }),
        } as CartItem;
      })
    : [];

  return {
    items,
    coupon: state?.coupon || null,
  };
};

const getInitialState = (): CartState => {
  if (typeof window === "undefined") {
    return { items: [], coupon: null };
  }

  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);
    return storedValue
      ? normalizeStoredState(JSON.parse(storedValue) as CartState)
      : { items: [], coupon: null };
  } catch {
    return { items: [], coupon: null };
  }
};

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_QUANTITY"; payload: { itemKey: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { itemKey: string } }
  | { type: "REMOVE_ITEMS"; payload: { itemKeys: string[] } }
  | { type: "CLEAR_CART" }
  | { type: "APPLY_COUPON"; payload: CouponState }
  | { type: "CLEAR_COUPON" };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const itemKey = buildItemKey(action.payload);
      const existingItem = state.items.find((item) => item.itemKey === itemKey);

      if (existingItem) {
        return {
          ...state,
          coupon: null,
          items: state.items.map((item) =>
            item.itemKey === itemKey
              ? {
                  ...item,
                  quantity: clampQuantity(item.quantity + action.payload.quantity, item.moq),
                }
              : item
          ),
        };
      }

      return {
        ...state,
        coupon: null,
        items: [
          ...state.items,
          {
            ...action.payload,
            itemKey,
            quantity: clampQuantity(action.payload.quantity, action.payload.moq),
          },
        ],
      };
    }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        coupon: null,
        items: state.items.map((item) =>
          item.itemKey === action.payload.itemKey
            ? { ...item, quantity: clampQuantity(action.payload.quantity, item.moq) }
            : item
        ),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        coupon: null,
        items: state.items.filter((item) => item.itemKey !== action.payload.itemKey),
      };
    case "REMOVE_ITEMS": {
      const itemKeys = new Set(action.payload.itemKeys);
      return {
        ...state,
        coupon: null,
        items: state.items.filter((item) => !itemKeys.has(item.itemKey)),
      };
    }
    case "CLEAR_CART":
      return { items: [], coupon: null };
    case "APPLY_COUPON":
      return { ...state, coupon: action.payload };
    case "CLEAR_COUPON":
      return { ...state, coupon: null };
    default:
      return state;
  }
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, getInitialState);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const subtotal = useMemo(
    () => state.items.reduce((total, item) => total + item.price * item.quantity, 0),
    [state.items]
  );

  const itemCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items]
  );

  const addItem = (product: Product, quantity = product.moq || 1) => {
    void trackStoreEvent({
      eventType: "add_to_cart",
      product: {
        productId: product._id,
        productName: product.name,
        category: product.category,
      },
    }).catch(() => {});

    dispatch({
      type: "ADD_ITEM",
      payload: {
        itemType: "product",
        itemKey: "",
        productId: product._id,
        comboKey: "",
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        imageUrl: product.imageUrl,
        category: product.category,
        ageGroup: product.ageGroup,
        discountPercent: product.discountPercent,
        moq: product.moq,
        stockCount: product.stockCount,
        quantity,
      },
    });
  };

  const addCombo = (combo: ComboOffer, quantity = combo.moq || 1) => {
    void trackStoreEvent({
      eventType: "add_to_cart",
      product: {
        productId: combo.key,
        productName: combo.name,
        category: combo.category,
      },
    }).catch(() => {});

    dispatch({
      type: "ADD_ITEM",
      payload: {
        itemType: "combo",
        itemKey: "",
        productId: "",
        comboKey: combo.key,
        sku: combo.sku,
        slug: combo.slug,
        name: combo.name,
        price: combo.price,
        originalPrice: combo.originalPrice,
        imageUrl: combo.imageUrl,
        category: combo.category,
        ageGroup: combo.ageGroup,
        discountPercent: Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100),
        moq: combo.moq,
        stockCount: 999,
        quantity,
        bundleItems: combo.bundleItems,
      },
    });
  };

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      coupon: state.coupon,
      subtotal,
      itemCount,
      addItem,
      addCombo,
      updateQuantity: (itemKey, quantity) =>
        dispatch({ type: "UPDATE_QUANTITY", payload: { itemKey, quantity } }),
      removeItem: (itemKey) => dispatch({ type: "REMOVE_ITEM", payload: { itemKey } }),
      removeItems: (itemKeys) => dispatch({ type: "REMOVE_ITEMS", payload: { itemKeys } }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
      applyCoupon: (coupon) => dispatch({ type: "APPLY_COUPON", payload: coupon }),
      clearCoupon: () => dispatch({ type: "CLEAR_COUPON" }),
    }),
    [itemCount, state.coupon, state.items, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
