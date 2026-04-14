import express, { Router } from "express";
import {
  adminLogin,
  createAdminProduct,
  exportAdminOrdersCsv,
  exportAdminOrdersExcel,
  getAdminVisitAnalytics,
  getAdminOrders,
  getAdminProducts,
  getAdminSummary,
  importAdminProducts,
  updateAdminProduct,
} from "../controllers/adminController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/login", asyncHandler(adminLogin));
router.get("/summary", requireAdmin, asyncHandler(getAdminSummary));
router.get("/analytics/visits", requireAdmin, asyncHandler(getAdminVisitAnalytics));
router.get("/orders", requireAdmin, asyncHandler(getAdminOrders));
router.get("/orders/export.csv", requireAdmin, asyncHandler(exportAdminOrdersCsv));
router.get("/orders/export.xlsx", requireAdmin, asyncHandler(exportAdminOrdersExcel));
router.get("/products", requireAdmin, asyncHandler(getAdminProducts));
router.post("/products", requireAdmin, asyncHandler(createAdminProduct));
router.post(
  "/products/import",
  requireAdmin,
  express.raw({
    type: () => true,
    limit: "25mb",
  }),
  asyncHandler(importAdminProducts)
);
router.put("/products/:id", requireAdmin, asyncHandler(updateAdminProduct));

export default router;
