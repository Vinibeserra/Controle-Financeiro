import { Request, Response } from 'express';
import { TransactionService } from './transactions.service';

const transactionService = new TransactionService();

export class TransactionController {
    async create(req: Request, res: Response) {
        try {
            const userId = req.userId;
            const { title, amount, type, categoryId } = req.body;

            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const transaction = await transactionService.create({
                userId,
                title,
                amount,
                type,
                categoryId
            });

            return res.status(201).json(transaction);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    }
}
