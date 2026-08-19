import { z } from 'zod';
import { Priority, TaskStatus } from '../services/task.service';

export const createTaskSchema = z.object({
  name: z.string().trim().min(2, 'Task name must be at least 2 characters long').max(200, 'Task name must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  userId: z.string().uuid('Invalid user ID').optional().nullable(),
  dueDate: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  startDate: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  estimate: z.union([z.number(), z.string()]).optional().nullable().transform((val) => val === '' ? null : Number(val)),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(Priority),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
