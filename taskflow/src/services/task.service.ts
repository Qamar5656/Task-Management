import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { createTaskSchema, updateTaskSchema } from "../validation/task.validation.js";

export const taskService = {
    createTask: async (data: any, createdById: string) => {
        const { error, value } = createTaskSchema.validate(data);
        if (error) throw new AppError(error.details[0].message, 400);

        // Verify project and get workspaceId
        const project = await prisma.project.findUnique({ where: { id: value.projectId } });
        if (!project) throw new AppError("Project not found", 404);

        // Verify membership
        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: project.workspaceId, userId: createdById }
        });
        if (!membership) throw new AppError("Forbidden: You do not have access to this workspace", 403);

        const slug = `${value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
        const assigneeId = value.userId || createdById; // Default assignment

        return await prisma.task.create({
            data: {
                name: value.name,
                description: value.description,
                status: value.status,
                priority: value.priority,
                projectId: value.projectId,
                slug,
                userId: assigneeId,
                createdById
            }
        });
    },

    getTasksByProject: async (projectId: string, userId: string) => {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new AppError("Project not found", 404);

        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: project.workspaceId, userId }
        });
        if (!membership) throw new AppError("Forbidden: You do not have access to this workspace", 403);

        return await prisma.task.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' }
        });
    },

    getTaskById: async (taskId: string, userId: string) => {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });
        if (!task) throw new AppError("Task not found", 404);

        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: task.project.workspaceId, userId }
        });
        if (!membership) throw new AppError("Forbidden: You do not have access to this workspace", 403);

        return task;
    },

    updateTask: async (taskId: string, data: any, userId: string) => {
        const { error, value } = updateTaskSchema.validate(data);
        if (error) throw new AppError(error.details[0].message, 400);

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });
        if (!task) throw new AppError("Task not found", 404);

        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: task.project.workspaceId, userId }
        });
        if (!membership) throw new AppError("Forbidden: You do not have access to this workspace", 403);

        let slug = task.slug;
        if (value.name) {
             slug = `${value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
        }

        return await prisma.task.update({
            where: { id: taskId },
            data: { ...value, slug }
        });
    },

    deleteTask: async (taskId: string, userId: string) => {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });
        if (!task) throw new AppError("Task not found", 404);

        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: task.project.workspaceId, userId }
        });
        if (!membership) throw new AppError("Forbidden: You do not have access to this workspace", 403);

        await prisma.task.delete({ where: { id: taskId } });
        return { message: "Task deleted successfully" };
    }
};
