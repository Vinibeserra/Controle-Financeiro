import { prisma } from "../../shared/prisma";
import { TransactionType } from "@prisma/client";

interface CreateTransactionDTO {
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId?: string;
}

interface ListTransactionsParams {
    userId: string;
    startDate?: Date;
    endDate?: Date;
    type?: "INCOME" | "EXPENSE";
    categoryId?: string;
}

export class TransactionService {
    async create(data: CreateTransactionDTO) {

        const { userId, title, amount, type, categoryId } = data;

        if (amount <= 0) {
            throw new Error("Amount must be greater than zero.");
        }

        if (!["INCOME", "EXPENSE"].includes(type)) {
            throw new Error("Invalid transaction type.");
        }

        if (categoryId) {
            const category = await prisma.category.findFirst({
                where: {
                    id: categoryId,
                    userId: userId
                }
            });

            if (!category) {
                throw new Error("Category not found for this user.");
            }
        }

        const transaction = await prisma.transaction.create({
            data: {
                title,
                amount,
                type,
                userId,
                date: new Date(),
                categoryId: categoryId ?? null 
            }
        });
        return transaction;
    }
}

export class TransactionServiceUser {

    async list({
        userId,
        startDate,
        endDate,
        type,
        categoryId
    }: ListTransactionsParams) {
        return prisma.transaction.findMany({
            where: {
                userId,
                ...(type && { type }),
                ...(categoryId && { categoryId }),
                ...(startDate && endDate && {
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                })
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    }
}
