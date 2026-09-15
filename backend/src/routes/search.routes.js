import { Router } from "express";
import { searchController } from "../controllers/search.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", searchController.globalSearch);

export default router;
