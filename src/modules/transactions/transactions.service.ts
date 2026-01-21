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

interface UpdateTransactionParam {
    userId: string;
    transactionId: string;
    title?: string;
    amount?: number;
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

            if (category.type !== type) {
                throw new Error(`Category type (${category.type}) does not match transaction type.`);
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

    async update({
        userId,
        transactionId,
        title,
        amount,
        type,
        categoryId
    }: UpdateTransactionParam) {
        const transaction = await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                userId: userId
            }
        });

        if (!transaction) {
            throw new Error("Transaction not found or not authorized.");
        }

        const finalType = type ?? transaction.type;
        const finalCategoryId = categoryId ?? transaction.categoryId;

        if (finalCategoryId) {
            const category = await prisma.category.findFirst({
                where: {
                    id: finalCategoryId,
                    userId: userId
                }
            });

            if (!category) {
                throw new Error("Category not found for this user.");
            }

            if (category.type !== finalType) {
                throw new Error(`Category type (${category.type}) does not match transaction type.`);
            }
        }

        return prisma.transaction.updateMany({
            where: { id: transactionId },
            data: {
                ...(title && { title }),
                ...(amount && { amount }),
                ...(type && { type }),
                ...(categoryId && { categoryId })
            }
        });
    }

    async delete(userId: string, transactionId: string) {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) {
            throw new Error("Transaction not found.");
        }

        if (transaction.userId !== userId) {
            throw new Error("Unauthorized to delete this transaction.");
        }

        await prisma.transaction.delete({
            where: { id: transactionId }
        });
    }
}

