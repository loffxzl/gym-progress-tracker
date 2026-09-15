import { prisma } from '../config/db.js';

class ExerciseRepository {
  async findAll({ search, category, userId, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const where = {
      isDeleted: false,
      OR: [
        { userId: null }, // System global exercises
        { userId },       // Custom user-created exercises
      ],
      ...(category && category !== 'All' && category !== 'ALL' ? { category: category.toUpperCase() } : {}),
      ...(search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const [items, totalCount] = await Promise.all([
      prisma.exerciseLibrary.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.exerciseLibrary.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      items,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  async findById(id) {
    return await prisma.exerciseLibrary.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  }

  async create(data) {
    return await prisma.exerciseLibrary.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.exerciseLibrary.update({
      where: { id },
      data,
    });
  }

  async softDelete(id) {
    return await prisma.exerciseLibrary.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}

export const exerciseRepository = new ExerciseRepository();
