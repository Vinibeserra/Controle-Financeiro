import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import { transactionRouter } from "./modules/transactions/transactions.routes";
import { categoriesRouter } from "./modules/categories/categories.routes";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend (Vite)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ⚠️ rotas SEMPRE depois do cors
app.use("/auth", authRoutes);
app.use("/transactions", transactionRouter);
app.use("/categories", categoriesRouter);

export { app };
