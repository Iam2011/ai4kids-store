import { Router } from "express";
import { validateCoupon } from "../controllers/couponController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post("/validate", asyncHandler(validateCoupon));

export default router;
