import { prisma } from '../config/db.js';

class WorkoutRepository {
  async findActiveByUserId(userId) {
    return await prisma.workout.findFirst({
      where: {
        userId,
        status: 'IN_PROGRESS',
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
          include: {
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });
  }

  async startWorkout(userId, { title = 'Workout Session', notes = '' }) {
    return await prisma.workout.create({
      data: {
        title,
        notes,
        status: 'IN_PROGRESS',
        startTime: new Date(),
        userId,
      },
      include: {
        exercises: {
          include: { sets: true },
        },
      },
    });
  }

  async endWorkout(id, { title, notes, date, exercises, duration }) {
    // Delete existing exercises/sets if updating in-progress session
    await prisma.exercise.deleteMany({
      where: { workoutId: id },
    });

    return await prisma.workout.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(notes !== undefined && { notes }),
        date: date ? new Date(date) : new Date(),
        status: 'COMPLETED',
        endTime: new Date(),
        duration,
        exercises: exercises?.length
          ? {
              create: exercises.map((ex, exIndex) => ({
                name: ex.name,
                order: ex.order ?? exIndex,
                sets: ex.sets?.length
                  ? {
                      create: ex.sets.map((s, setIdx) => ({
                        setNumber: s.setNumber ?? setIdx + 1,
                        weight: s.weight,
                        reps: s.reps,
                        notes: s.notes || null,
                        isCompleted: s.isCompleted ?? false,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
          include: {
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });
  }

  async create(userId, workoutData) {
    const { title, notes, date, exercises } = workoutData;

    return await prisma.workout.create({
      data: {
        title,
        notes,
        date: date ? new Date(date) : undefined,
        status: 'COMPLETED',
        userId,
        exercises: exercises?.length
          ? {
              create: exercises.map((ex, exIndex) => ({
                name: ex.name,
                order: ex.order ?? exIndex,
                sets: ex.sets?.length
                  ? {
                      create: ex.sets.map((s, setIdx) => ({
                        setNumber: s.setNumber ?? setIdx + 1,
                        weight: s.weight,
                        reps: s.reps,
                        notes: s.notes || null,
                        isCompleted: s.isCompleted ?? false,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
          include: {
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });
  }

  async findAllByUserId(userId, options = {}) {
    const {
      search,
      status,
      page = 1,
      limit = 10,
      sortOrder = 'desc',
    } = options;

    const where = {
      userId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          {
            exercises: {
              some: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    const [totalCount, items] = await Promise.all([
      prisma.workout.count({ where }),
      prisma.workout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: sortOrder },
        include: {
          exercises: {
            orderBy: { order: 'asc' },
            include: {
              sets: {
                orderBy: { setNumber: 'asc' },
              },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

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
    return await prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
          include: {
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });
  }

  async update(id, updateData) {
    return await prisma.workout.update({
      where: { id },
      data: {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
          include: {
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });
  }

  async delete(id) {
    return await prisma.workout.delete({
      where: { id },
    });
  }

  async getAnalytics(userId) {
    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    let highestWeightSet = null;
    let bestVolumeSet = null;
    let highestVolumeWorkout = null;

    let totalVolume = 0;
    let totalSets = 0;
    let totalDurationSecs = 0;
    let durationCount = 0;

    let maxWeightVal = 0;
    let maxSetVolumeVal = 0;
    let maxWorkoutVolumeVal = 0;

    workouts.forEach((workout) => {
      let workoutVolume = 0;
      if (workout.duration) {
        totalDurationSecs += workout.duration;
        durationCount += 1;
      }

      workout.exercises?.forEach((exercise) => {
        exercise.sets?.forEach((set) => {
          totalSets += 1;
          const setVolume = (set.weight || 0) * (set.reps || 0);
          totalVolume += setVolume;

          // Check highest weight PR
          if (set.weight > maxWeightVal) {
            maxWeightVal = set.weight;
            highestWeightSet = {
              weight: set.weight,
              reps: set.reps,
              exerciseName: exercise.name,
              workoutTitle: workout.title,
              date: workout.date,
            };
          }

          // Check best volume set PR
          if (setVolume > maxSetVolumeVal) {
            maxSetVolumeVal = setVolume;
            bestVolumeSet = {
              weight: set.weight,
              reps: set.reps,
              volume: setVolume,
              exerciseName: exercise.name,
              workoutTitle: workout.title,
              date: workout.date,
            };
          }

          workoutVolume += setVolume;
        });
      });

      // Check highest volume workout session PR
      if (workoutVolume > maxWorkoutVolumeVal) {
        maxWorkoutVolumeVal = workoutVolume;
        highestVolumeWorkout = {
          id: workout.id,
          title: workout.title,
          totalVolume: workoutVolume,
          date: workout.date,
          duration: workout.duration,
          exerciseCount: workout.exercises?.length || 0,
        };
      }
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyWorkouts = workouts.filter((w) => new Date(w.date) >= sevenDaysAgo).length;
    const monthlyWorkouts = workouts.filter((w) => new Date(w.date) >= thirtyDaysAgo).length;

    const averageDurationSecs = durationCount > 0 ? Math.round(totalDurationSecs / durationCount) : 0;

    return {
      totalWorkouts: workouts.length,
      weeklyWorkouts,
      monthlyWorkouts,
      totalSets,
      totalVolume,
      averageDurationSecs,
      highestWeightSet,
      bestVolumeSet,
      highestVolumeWorkout,
    };
  }

  async getChartAnalytics(userId) {
    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // 1. Session Volume Time-Series
    const workoutVolume = [];
    // 2. Exercise Progress Map: { exerciseName: [{ date, formattedDate, maxWeight, totalVolume, reps }] }
    const exerciseProgressMap = {};
    // 3. Weekly Aggregates Map: { weekKey: { label, volume, count } }
    const weeklyMap = {};
    // 4. Monthly Aggregates Map: { monthKey: { label, volume, count } }
    const monthlyMap = {};

    workouts.forEach((workout) => {
      const dateObj = new Date(workout.date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      let sessionVolume = 0;
      let setCount = 0;

      workout.exercises?.forEach((exercise) => {
        let exMaxWeight = 0;
        let exVolume = 0;

        exercise.sets?.forEach((set) => {
          setCount += 1;
          const setVolume = (set.weight || 0) * (set.reps || 0);
          sessionVolume += setVolume;
          exVolume += setVolume;

          if ((set.weight || 0) > exMaxWeight) {
            exMaxWeight = set.weight || 0;
          }
        });

        // Record exercise progress
        if (!exerciseProgressMap[exercise.name]) {
          exerciseProgressMap[exercise.name] = [];
        }

        exerciseProgressMap[exercise.name].push({
          workoutId: workout.id,
          workoutTitle: workout.title,
          date: workout.date,
          formattedDate,
          maxWeight: exMaxWeight,
          volume: exVolume,
          setCount: exercise.sets?.length || 0,
        });
      });

      // Session volume entry
      workoutVolume.push({
        id: workout.id,
        title: workout.title,
        date: workout.date,
        formattedDate,
        volume: sessionVolume,
        exerciseCount: workout.exercises?.length || 0,
        setCount,
        duration: workout.duration || 0,
      });

      // Weekly Aggregation (ISO week key: YYYY-WW)
      const year = dateObj.getFullYear();
      const firstDayOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (dateObj - firstDayOfYear) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      const weekKey = `${year}-W${weekNum < 10 ? "0" + weekNum : weekNum}`;
      const weekLabel = `W${weekNum} (${formattedDate})`;

      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = { weekKey, weekLabel, volume: 0, count: 0 };
      }
      weeklyMap[weekKey].volume += sessionVolume;
      weeklyMap[weekKey].count += 1;

      // Monthly Aggregation (YYYY-MM)
      const monthKey = `${year}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = dateObj.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { monthKey, monthLabel, volume: 0, count: 0 };
      }
      monthlyMap[monthKey].volume += sessionVolume;
      monthlyMap[monthKey].count += 1;
    });

    const weeklyVolume = Object.values(weeklyMap).slice(-8); // Past 8 weeks
    const monthlyVolume = Object.values(monthlyMap).slice(-6); // Past 6 months

    return {
      workoutVolume,
      weeklyVolume,
      monthlyVolume,
      exerciseNames: Object.keys(exerciseProgressMap).sort(),
      exerciseProgress: exerciseProgressMap,
    };
  }
}

export const workoutRepository = new WorkoutRepository();

