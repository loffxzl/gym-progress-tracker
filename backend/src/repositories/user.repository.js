import { prisma } from '../config/db.js';

class UserRepository {
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        goalWeight: true,
        height: true,
        experience: true,
        units: true,
        timezone: true,
        avatarUrl: true,
        theme: true,
        restTimerSound: true,
        autoStartRestTimer: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(userData) {
    return await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        goalWeight: true,
        height: true,
        experience: true,
        units: true,
        timezone: true,
        avatarUrl: true,
        theme: true,
        restTimerSound: true,
        autoStartRestTimer: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfile(id, profileData) {
    return await prisma.user.update({
      where: { id },
      data: profileData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        goalWeight: true,
        height: true,
        experience: true,
        units: true,
        timezone: true,
        avatarUrl: true,
        theme: true,
        restTimerSound: true,
        autoStartRestTimer: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

export const userRepository = new UserRepository();
