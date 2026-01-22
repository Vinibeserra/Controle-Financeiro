import { Request, Response } from "express";
import { CategoriesService } from "./categories.service";

const categoriesService = new CategoriesService();

export class CategoriesController {
    async create(req: Request, res: Response) {

        try {
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { name, type } = req.body;

            const category = await categoriesService.create({
                userId: req.userId,
                name,
                type
            });

            return res.status(201).json(category);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }

    }

    async list(req: Request, res: Response) {
        try {
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const categories = await categoriesService.list(req.userId);
            return res.status(200).json(categories);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    }
}
