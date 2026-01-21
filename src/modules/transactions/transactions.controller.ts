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

    async list(req: Request, res: Response) {

        try {
            
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            
            const userId = req.userId;
            const { type, categoryId, startDate, endDate } = req.query;

            const transaction = await transactionService.list({
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

    async update(req: Request, res: Response) {
        try {
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { id } = req.params;

            const { userId, date, createdAt, ...updateData } = req.body;

            const transaction = await transactionService.update({
                userId: req.userId,
                transactionId: id,
                ...updateData 
            });

            return res.status(200).json(transaction);
        } catch (error) {
            return res.status(400).json({ message: (error as Error).message });
        }
    }


    async delete(req: Request, res: Response) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;

        if (Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid transaction id." });
        }

        await transactionService.delete(userId, id);

        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({ message: (error as Error).message });
    }
}

}
