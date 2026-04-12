import "../config/env.js";
import { connectDatabase } from "../config/db.js";
import { seedCatalog } from "../services/catalogSeedService.js";

const seed = async () => {
  await connectDatabase();
  const result = await seedCatalog();
  console.log(
    `Seeded ${result.productCount} products and ${result.couponCount} coupons. Skipped ${result.malformedRows} malformed rows.`
  );
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
