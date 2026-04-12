import { Router } from "express";
import {
  createPaymentOrder,
  markPaymentFailure,
  verifyPayment,
} from "../controllers/paymentController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post("/create-order", asyncHandler(createPaymentOrder));
router.post("/verify", asyncHandler(verifyPayment));
router.post("/failure", asyncHandler(markPaymentFailure));

export default router;
