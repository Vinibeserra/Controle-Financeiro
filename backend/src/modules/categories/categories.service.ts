import { prisma } from "../../shared/prisma";
import { CategoryType } from "@prisma/client";

interface CreateCategoryDTO {
    userId: string;
    name: string;
    type: CategoryType;
}


export class CategoriesService {
    async create({ userId, name, type }: CreateCategoryDTO) {
        if (!name){
            throw new Error("Category name is required");
        }

        const existingCategory = await prisma.category.findFirst({
            where: {
                name,
                userId
            }
        });

        if (existingCategory) {
            throw new Error("Category already exists");
        }

        return prisma.category.create({
            data: {
                name,
                type,
                userId
            }
        });
    }

    async list(userId: string) {
        return prisma.category.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}

