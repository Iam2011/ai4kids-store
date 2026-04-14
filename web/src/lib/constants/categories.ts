export const storefrontCategories = [
  "Remote Control Toys",
  "Gun & Blasters",
  "Educational & Learning Toys",
  "Games & Indoor Toys",
  "Dolls & Soft Toys",
  "Role Play & Kitchen Toys",
  "Outdoor & Sports Toys",
  "Baby & Small Toys",
  "Water & Pool Toys",
  "Creative & Hobby Toys",
  "Party & Fun Toys",
  "Vehicles & Cars",
] as const;

export const homepageCategories = [
  {
    label: "Cars / RC",
    routeLabel: "Remote Control Toys",
    href: "/products?category=Remote%20Control%20Toys",
    icon: "/assets/categories/cars.png",
  },
  {
    label: "Gun & Blasters",
    routeLabel: "Gun & Blasters",
    href: "/products?category=Gun%20%26%20Blasters",
    icon: "/assets/categories/guns.png",
  },
  {
    label: "Educational",
    routeLabel: "Educational & Learning Toys",
    href: "/products?category=Educational%20%26%20Learning%20Toys",
    icon: "/assets/categories/learning.png",
  },
  {
    label: "Games",
    routeLabel: "Games & Indoor Toys",
    href: "/products?category=Games%20%26%20Indoor%20Toys",
    icon: "/assets/categories/games.png",
  },
  {
    label: "Dolls",
    routeLabel: "Dolls & Soft Toys",
    href: "/products?category=Dolls%20%26%20Soft%20Toys",
    icon: "/assets/categories/dolls.png",
  },
  {
    label: "Kitchen",
    routeLabel: "Role Play & Kitchen Toys",
    href: "/products?category=Role%20Play%20%26%20Kitchen%20Toys",
    icon: "/assets/categories/kitchen.png",
  },
  {
    label: "Outdoor",
    routeLabel: "Outdoor & Sports Toys",
    href: "/products?category=Outdoor%20%26%20Sports%20Toys",
    icon: "/assets/categories/sports.png",
  },
  {
    label: "More",
    routeLabel: "All Categories",
    href: "/products",
    icon: "/assets/categories/more.png",
  },
] as const;
