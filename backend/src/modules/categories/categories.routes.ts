import { Router } from "express";
import { CategoriesController } from "./categories.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

const router = Router();
const categoriesController = new CategoriesController();

router.post("/", authMiddleware, categoriesController.create);
router.get("/", authMiddleware, categoriesController.list);

export { router as categoriesRouter };