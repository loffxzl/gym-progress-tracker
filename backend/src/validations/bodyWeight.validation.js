import { z } from "zod";

export const createBodyWeightSchema = z.object({
  body: z.object({
    weight: z
      .number({ required_error: "Weight is required" })
      .positive("Weight must be a positive number")
      .min(1, "Weight must be at least 1")
      .max(1000, "Weight value cannot exceed 1000"),
    date: z
      .string()
      .optional()
      .transform((val) => (val ? new Date(val) : new Date()))
      .refine((d) => !isNaN(d.getTime()), { message: "Invalid date format" })
      .refine((d) => d.getTime() <= Date.now() + 86400000, { message: "Body weight entry date cannot be in the future" }),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  }),
});

export const updateGoalWeightSchema = z.object({
  body: z.object({
    goalWeight: z
      .number({ required_error: "Goal weight is required" })
      .positive("Goal weight must be a positive number")
      .min(1, "Goal weight must be at least 1")
      .max(1000, "Goal weight value cannot exceed 1000"),
  }),
});

export const getBodyWeightQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.coerce.number().int().positive().optional().default(100),
  }),
});

