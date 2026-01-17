import { Router } from "express";
import { TransactionController } from "./transactions.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

const transactionRouter = Router();
const controller = new TransactionController();

transactionRouter.post("/", authMiddleware, controller.create);
transactionRouter.get("/", authMiddleware, controller.list);

export { transactionRouter };