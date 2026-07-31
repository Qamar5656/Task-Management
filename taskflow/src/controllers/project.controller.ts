import {Request, Response} from 'express';
import prisma from '../config/prisma.js';
import { projectService } from '../services/project.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { createProjectSchema } from '../validation/project.validation.js';

export const projectController = {
    createProject: catchAsync(async (req: Request, res: Response) => {
        const { error } = createProjectSchema.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);

        const { name, workspaceId } = req.body;

        const project = await projectService.createProject({ name, workspaceId, userId });

        res.status(201).json({ message: "Project created successfully", project });
    }),

    getProjects: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);

        const projects = await projectService.getProjects({ workspaceId: req.query.workspaceId as string, userId });

        res.status(200).json(projects);
    }),

    getById: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        const project = await projectService.getProjectById(req.params.id, userId);
        res.status(200).json(project);
    }),

    update: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        const project = await projectService.updateProject(req.params.id, req.body, userId);
        res.status(200).json({ message: "Project updated successfully", project });
    }),

    delete: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        const result = await projectService.deleteProject(req.params.id, userId);
        res.status(200).json(result);
    })
}