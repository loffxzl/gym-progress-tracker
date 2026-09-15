import { Router } from "express";
import { bodyWeightController } from "../controllers/bodyWeight.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createBodyWeightSchema,
  updateGoalWeightSchema,
  getBodyWeightQuerySchema,
} from "../validations/bodyWeight.validation.js";

const router = Router();

router.use(authenticate);

router
  .route("/")
  .get(validate(getBodyWeightQuerySchema), bodyWeightController.getWeightTrackerData)
  .post(validate(createBodyWeightSchema), bodyWeightController.addWeightLog);

router.put(
  "/goal",
  validate(updateGoalWeightSchema),
  bodyWeightController.setGoalWeight
);

router.delete("/:id", bodyWeightController.deleteWeightLog);

export default router;
