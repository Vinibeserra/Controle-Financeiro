import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/login", authController.login);
router.post("/register", authController.register);

router.get("/protected", authMiddleware, (req, res) => {
    return res.json({ message: "route protected", userId: req.userId });
});

router.post("/refresh", authController.refresh);

export default router;