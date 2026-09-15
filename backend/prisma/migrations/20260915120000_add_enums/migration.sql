-- 1. Create WorkoutStatus Enum if not exists
DO $$ BEGIN
    CREATE TYPE "WorkoutStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create New Native Enum Types if not exist
DO $$ BEGIN
    CREATE TYPE "ExerciseCategory" AS ENUM ('CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO', 'FULL_BODY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "EquipmentType" AS ENUM ('BARBELL', 'DUMBBELL', 'CABLE', 'MACHINE', 'BODYWEIGHT', 'BAND', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "UnitSystem" AS ENUM ('KG', 'LBS');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "Theme" AS ENUM ('DARK', 'LIGHT', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Ensure User columns exist (reproducibility from init migration)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "goalWeight" DOUBLE PRECISION;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "height" DOUBLE PRECISION;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "experience" TEXT DEFAULT 'INTERMEDIATE';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "units" TEXT DEFAULT 'KG';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'UTC';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "theme" TEXT DEFAULT 'DARK';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "restTimerSound" BOOLEAN DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "autoStartRestTimer" BOOLEAN DEFAULT false;

-- 4. Ensure body_weights table exists
CREATE TABLE IF NOT EXISTS "body_weights" (
    "id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "body_weights_pkey" PRIMARY KEY ("id")
);

-- 5. Ensure exercise_library table exists
CREATE TABLE IF NOT EXISTS "exercise_library" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "equipment" TEXT,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "exercise_library_pkey" PRIMARY KEY ("id")
);

-- 6. Ensure Workout columns exist
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "status" "WorkoutStatus" NOT NULL DEFAULT 'COMPLETED';
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMP(3);
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMP(3);
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "duration" INTEGER;

-- 7. Ensure ExerciseSet columns exist
ALTER TABLE "exercise_sets" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- 8. Safely transform User columns to Enums
ALTER TABLE "users" 
  ALTER COLUMN "experience" DROP DEFAULT,
  ALTER COLUMN "experience" TYPE "ExperienceLevel" USING UPPER("experience")::"ExperienceLevel",
  ALTER COLUMN "experience" SET DEFAULT 'INTERMEDIATE';

ALTER TABLE "users" 
  ALTER COLUMN "units" DROP DEFAULT,
  ALTER COLUMN "units" TYPE "UnitSystem" USING UPPER("units")::"UnitSystem",
  ALTER COLUMN "units" SET DEFAULT 'KG';

ALTER TABLE "users" 
  ALTER COLUMN "theme" DROP DEFAULT,
  ALTER COLUMN "theme" TYPE "Theme" USING UPPER("theme")::"Theme",
  ALTER COLUMN "theme" SET DEFAULT 'DARK';

-- 9. Safely transform ExerciseLibrary columns to Enums
ALTER TABLE "exercise_library" 
  ALTER COLUMN "category" TYPE "ExerciseCategory" USING UPPER("category")::"ExerciseCategory";

ALTER TABLE "exercise_library" 
  ALTER COLUMN "equipment" TYPE "EquipmentType" USING 
    CASE 
      WHEN "equipment" IS NULL THEN NULL 
      ELSE UPPER("equipment")::"EquipmentType" 
    END;

-- 10. Indexes and Foreign Keys
CREATE INDEX IF NOT EXISTS "body_weights_userId_date_idx" ON "body_weights"("userId", "date");
CREATE INDEX IF NOT EXISTS "exercise_library_name_idx" ON "exercise_library"("name");
CREATE INDEX IF NOT EXISTS "exercise_library_category_idx" ON "exercise_library"("category");
CREATE INDEX IF NOT EXISTS "exercise_library_isDeleted_idx" ON "exercise_library"("isDeleted");
CREATE INDEX IF NOT EXISTS "workouts_userId_idx" ON "workouts"("userId");
CREATE INDEX IF NOT EXISTS "workouts_status_idx" ON "workouts"("status");
CREATE INDEX IF NOT EXISTS "workouts_title_idx" ON "workouts"("title");
CREATE INDEX IF NOT EXISTS "workouts_userId_status_date_idx" ON "workouts"("userId", "status", "date");
CREATE INDEX IF NOT EXISTS "workouts_userId_date_idx" ON "workouts"("userId", "date");
CREATE INDEX IF NOT EXISTS "exercises_workoutId_idx" ON "exercises"("workoutId");
CREATE INDEX IF NOT EXISTS "exercises_name_idx" ON "exercises"("name");
CREATE INDEX IF NOT EXISTS "exercise_sets_exerciseId_idx" ON "exercise_sets"("exerciseId");
CREATE INDEX IF NOT EXISTS "exercise_sets_notes_idx" ON "exercise_sets"("notes");

DO $$ BEGIN
  ALTER TABLE "body_weights" ADD CONSTRAINT "body_weights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "exercise_library" ADD CONSTRAINT "exercise_library_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
