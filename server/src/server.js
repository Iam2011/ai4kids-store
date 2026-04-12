import "./config/env.js";
import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { seedCatalog } from "./services/catalogSeedService.js";
import { ensureDefaultAdmin } from "./services/defaultAdminService.js";

const port = Number(process.env.PORT || 5000);

const startServer = async () => {
  await connectDatabase();
  await ensureDefaultAdmin();
  const seedResult = await seedCatalog({ onlyIfEmpty: true });

  if (!seedResult.skipped) {
    console.log(
      `Catalog initialized with ${seedResult.productCount} products and ${seedResult.couponCount} coupons.`
    );
  }

  app.listen(port, () => {
    console.log(`AI4Kids API is running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
