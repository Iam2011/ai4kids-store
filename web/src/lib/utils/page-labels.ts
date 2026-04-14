export const buildPageLabel = (path = "") => {
  const pathname = String(path || "").split("?")[0] || "/";

  if (pathname === "/") return "Homepage";
  if (pathname === "/products") return "Products";
  if (pathname.startsWith("/products/")) return "Product Page";
  if (pathname === "/cart") return "Cart";
  if (pathname === "/checkout") return "Checkout";
  if (pathname.startsWith("/order-success/")) return "Order Success";
  if (pathname.startsWith("/cod-success/")) return "COD Success";
  if (pathname === "/payment-failure") return "Payment Failed";
  if (pathname === "/about") return "About";

  return "Other";
};
