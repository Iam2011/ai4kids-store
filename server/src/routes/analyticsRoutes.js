import { Router } from "express";
import { captureVisitEvent } from "../controllers/analyticsController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post("/visit", asyncHandler(captureVisitEvent));

export default router;
