import { Router } from "express";
import { getProductBySlug, getProducts } from "../controllers/productController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getProducts));
router.get("/:slug", asyncHandler(getProductBySlug));

export default router;
