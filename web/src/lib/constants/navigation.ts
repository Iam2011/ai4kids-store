export const bottomNavItems = [
  { href: "/", label: "Home", match: "/" },
  { href: "/products", label: "Categories", match: "/products" },
  { href: "/products?featured=true", label: "Deals", match: "/products" },
  { href: "/cart", label: "Cart", match: "/cart" },
] as const;
