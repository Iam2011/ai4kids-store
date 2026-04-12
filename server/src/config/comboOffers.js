const comboOffers = [
  {
    key: "viral-toys-combo",
    sku: "AI4K-COMBO-001",
    name: "3 Viral Toys Combo",
    slug: "3-viral-toys-combo",
    category: "Combo Offer",
    ageGroup: "3-8",
    moq: 1,
    price: 3999,
    originalPrice: 6000,
    imageUrl: "/assets/hero/scooter.png",
    bundleItems: [
      {
        name: "Light & Music Scooter",
        imageUrl: "/assets/hero/scooter.png",
      },
      {
        name: "RC Rock Climber",
        imageUrl: "/assets/hero/rc-car.png",
      },
      {
        name: "Super Dart Gun",
        imageUrl: "/assets/hero/dart-gun.png",
      },
    ],
  },
];

export const getComboOfferByKey = (comboKey) =>
  comboOffers.find((offer) => offer.key === String(comboKey || "").trim());

export const getAllComboOffers = () => comboOffers.map((offer) => ({ ...offer }));
