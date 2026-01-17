import { Request, Response } from 'express';
import { TransactionService, TransactionServiceUser } from './transactions.service';

const transactionService = new TransactionService();
const transactionServiceUser = new TransactionServiceUser();

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

    async list(req: Request, res: Response) {

        try {
            
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            
            const userId = req.userId;
            const { type, categoryId, startDate, endDate } = req.query;

            const transaction = await transactionServiceUser.list({
                userId,
                type: type as "INCOME" | "EXPENSE",
                categoryId: categoryId as string,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
            });

            return res.status(200).json(transaction);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    }


}
