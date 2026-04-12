import { Router } from "express";
import {
  adminLogin,
  createAdminProduct,
  getAdminOrders,
  getAdminProducts,
  getAdminSummary,
  updateAdminProduct,
} from "../controllers/adminController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/login", asyncHandler(adminLogin));
router.get("/summary", requireAdmin, asyncHandler(getAdminSummary));
router.get("/orders", requireAdmin, asyncHandler(getAdminOrders));
router.get("/products", requireAdmin, asyncHandler(getAdminProducts));
router.post("/products", requireAdmin, asyncHandler(createAdminProduct));
router.put("/products/:id", requireAdmin, asyncHandler(updateAdminProduct));

export default router;
