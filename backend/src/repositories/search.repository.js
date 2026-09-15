import prisma from "../config/db.js";

export const searchRepository = {
  async globalSearch(userId, queryTerm) {
    if (!queryTerm || typeof queryTerm !== "string") {
      return { exercises: [], workouts: [], setNotes: [], weightNotes: [] };
    }

    const term = queryTerm.trim();
    if (!term) {
      return { exercises: [], workouts: [], setNotes: [], weightNotes: [] };
    }

    const VALID_CATEGORIES = ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO', 'FULL_BODY'];
    const matchedCategories = VALID_CATEGORIES.filter((cat) => cat.includes(term.toUpperCase()));

    const exerciseOrConditions = [
      { name: { contains: term, mode: "insensitive" } },
      { notes: { contains: term, mode: "insensitive" } },
    ];
    if (matchedCategories.length > 0) {
      exerciseOrConditions.push({ category: { in: matchedCategories } });
    }

    const [exercises, workouts, setNotes, weightNotes] = await Promise.all([
      // 1. Search Exercises Catalog (System + Custom user exercises)
      prisma.exerciseLibrary.findMany({
        where: {
          isDeleted: false,
          OR: exerciseOrConditions,
        },
        take: 8,
        orderBy: { name: "asc" },
      }),

      // 2. Search Workouts (Title & Workout-level Notes)
      prisma.workout.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { notes: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 8,
        orderBy: { date: "desc" },
        include: {
          exercises: {
            take: 3,
          },
        },
      }),

      // 3. Search Set-level Notes
      prisma.exerciseSet.findMany({
        where: {
          exercise: {
            workout: {
              userId,
            },
          },
          notes: { contains: term, mode: "insensitive" },
          NOT: { notes: null },
        },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          exercise: {
            select: {
              id: true,
              name: true,
              workoutId: true,
              workout: {
                select: {
                  id: true,
                  title: true,
                  date: true,
                },
              },
            },
          },
        },
      }),

      // 4. Search Body Weight Notes
      prisma.bodyWeight.findMany({
        where: {
          userId,
          notes: { contains: term, mode: "insensitive" },
          NOT: { notes: null },
        },
        take: 5,
        orderBy: { date: "desc" },
      }),
    ]);

    return {
      exercises,
      workouts,
      setNotes: setNotes.map((set) => ({
        id: set.id,
        setNumber: set.setNumber,
        weight: set.weight,
        reps: set.reps,
        notes: set.notes,
        exerciseName: set.exercise.name,
        workoutId: set.exercise.workout.id,
        workoutTitle: set.exercise.workout.title,
        date: set.exercise.workout.date,
      })),
      weightNotes: weightNotes.map((bw) => ({
        id: bw.id,
        weight: bw.weight,
        date: bw.date,
        notes: bw.notes,
      })),
    };
  },
};
