import { Router } from "express";
import { lookupPincode } from "../controllers/locationController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/pincode/:pincode", asyncHandler(lookupPincode));

export default router;
