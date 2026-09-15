import prisma from "../config/db.js";

export const bodyWeightRepository = {
  async create(userId, data) {
    return prisma.bodyWeight.create({
      data: {
        userId,
        weight: data.weight,
        date: data.date || new Date(),
        notes: data.notes,
      },
    });
  },

  async findAll(userId, { startDate, endDate, limit = 100 } = {}) {
    const where = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return prisma.bodyWeight.findMany({
      where,
      orderBy: { date: "asc" },
      take: limit,
    });
  },

  async findById(id) {
    return prisma.bodyWeight.findUnique({
      where: { id },
    });
  },

  async delete(id) {
    return prisma.bodyWeight.delete({
      where: { id },
    });
  },

  async updateUserGoalWeight(userId, goalWeight) {
    return prisma.user.update({
      where: { id: userId },
      data: { goalWeight },
      select: { id: true, goalWeight: true },
    });
  },

  async getUserGoalWeight(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { goalWeight: true },
    });
    return user ? user.goalWeight : null;
  },
};
