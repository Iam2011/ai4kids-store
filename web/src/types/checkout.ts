import type { CartItem } from "./cart";

export type CheckoutCustomer = {
  name: string;
  mobile: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
};

export type PaymentMode = "cod_deposit" | "full_payment";

export type PaymentOrderResponse = {
  orderId: string;
  orderNumber: string;
  paymentGateway: "razorpay" | "mock";
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  totalAmount: number;
  codConfirmationFee: number;
  depositAmount: number;
  balanceDue: number;
  customer: CheckoutCustomer;
};

export type CheckoutPayload = {
  customer: CheckoutCustomer;
  cartItems: Array<{
    productId: string;
    comboKey: string;
    quantity: number;
  }>;
  couponCode: string;
  paymentMode: PaymentMode;
  checkoutToken: string;
  analyticsSnapshot: Record<string, unknown>;
};

export type OrderRecord = {
  _id: string;
  orderNumber: string;
  customer: CheckoutCustomer;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  codConfirmationFee: number;
  paymentAmount: number;
  balanceDue: number;
  paymentMode: PaymentMode;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};
