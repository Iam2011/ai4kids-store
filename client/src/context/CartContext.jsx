import { createContext, useContext, useEffect, useReducer } from "react";
import { trackStoreEvent } from "../utils/visitTracking.js";

const CART_STORAGE_KEY = "ai4kids-cart";

const clampQuantity = (quantity, moq) => Math.max(Number(quantity || moq || 1), Number(moq || 1));
const buildItemKey = (payload) =>
  payload.itemType === "combo"
    ? `combo:${payload.comboKey}`
    : `product:${payload.productId}`;
const normalizeStoredState = (state) => {
  const items = Array.isArray(state?.items)
    ? state.items.map((item) => {
        const itemType = item.itemType || (item.comboKey ? "combo" : "product");
        const normalizedItem = {
          ...item,
          itemType,
          comboKey: item.comboKey || "",
          bundleItems: Array.isArray(item.bundleItems) ? item.bundleItems : [],
        };

        return {
          ...normalizedItem,
          itemKey: item.itemKey || buildItemKey(normalizedItem),
        };
      })
    : [];

  return {
    items,
    coupon: state?.coupon || null,
  };
};

const getInitialState = () => {
  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);
    return storedValue
      ? normalizeStoredState(JSON.parse(storedValue))
      : { items: [], coupon: null };
  } catch (error) {
    return { items: [], coupon: null };
  }
};

const cartReducer = (state, action) => {
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
    case "CLEAR_CART":
      return { items: [], coupon: null };
    case "APPLY_COUPON":
      return {
        ...state,
        coupon: action.payload,
      };
    case "CLEAR_COUPON":
      return {
        ...state,
        coupon: null,
      };
    default:
      return state;
  }
};

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, getInitialState);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  const addItem = (product, quantity = product.moq || 1) => {
    trackStoreEvent({
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

  const addCombo = (combo, quantity = combo.moq || 1) => {
    trackStoreEvent({
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
        discountPercent: Math.round(
          ((combo.originalPrice - combo.price) / combo.originalPrice) * 100
        ),
        moq: combo.moq,
        stockCount: 999,
        quantity,
        bundleItems: combo.bundleItems,
      },
    });
  };

  const updateQuantity = (itemKey, quantity) =>
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { itemKey, quantity },
    });

  const removeItem = (itemKey) =>
    dispatch({
      type: "REMOVE_ITEM",
      payload: { itemKey },
    });

  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  const applyCoupon = (coupon) => dispatch({ type: "APPLY_COUPON", payload: coupon });
  const clearCoupon = () => dispatch({ type: "CLEAR_COUPON" });

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        coupon: state.coupon,
        subtotal,
        itemCount,
        addItem,
        addCombo,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        clearCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};
