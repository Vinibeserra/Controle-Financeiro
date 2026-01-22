import { Router } from "express";
import { TransactionController } from "./transactions.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

const transactionRouter = Router();
const controller = new TransactionController();

transactionRouter.post("/", authMiddleware, controller.create);
transactionRouter.get("/", authMiddleware, controller.list);
transactionRouter.put("/:id", authMiddleware, controller.update);
transactionRouter.delete("/:id", authMiddleware, controller.delete);

export { transactionRouter };