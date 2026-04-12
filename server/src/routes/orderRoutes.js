import { Router } from "express";
import { getOrderByNumber } from "../controllers/orderController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/:orderNumber", asyncHandler(getOrderByNumber));

export default router;
