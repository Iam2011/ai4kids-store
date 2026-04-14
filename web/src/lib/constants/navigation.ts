export const bottomNavItems = [
  { href: "/", label: "Home", match: "/" },
  { href: "/products", label: "Categories", match: "/products" },
  { href: "/products?featured=true", label: "Offers", match: "/offers" },
  { href: "/cart", label: "Cart", match: "/cart" },
  { href: "/about", label: "About", match: "/about" },
] as const;
