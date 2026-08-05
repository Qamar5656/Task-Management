import { Request, Response } from 'express';
import { taskService } from '../services/task.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

export const taskController = {
    create: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        const task = await taskService.createTask(req.body, userId);
        res.status(201).json({ message: "Task created successfully", task });
    }),

    getByProject: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const projectId = req.query.projectId as string;
        if (!userId) throw new AppError("Unauthorized", 401);
        if (!projectId) throw new AppError("projectId query parameter is required", 400);

        const tasks = await taskService.getTasksByProject(projectId, userId);
        res.status(200).json(tasks);
    }),

    getById: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        const task = await taskService.getTaskById(req.params.id, userId);
        res.status(200).json(task);
    }),

    update: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        const task = await taskService.updateTask(req.params.id, req.body, userId);
        res.status(200).json({ message: "Task updated successfully", task });
    }),

    delete: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        const result = await taskService.deleteTask(req.params.id, userId);
        res.status(200).json(result);
    })
};
