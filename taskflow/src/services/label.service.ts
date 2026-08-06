import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { createLabelSchema, attachLabelSchema } from "../validation/label.validation.js";
import { WorkspaceRole } from "../prisma/index.js";

export const labelService = {
    createLabel: async (data: { name: string, color: string, workspaceId: string }, userId: string) => {
        const { error, value } = createLabelSchema.validate(data);
        if (error) throw new AppError(error.details[0].message, 400);

        // Verify user is OWNER or ADMIN of the workspace
        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: value.workspaceId, userId }
        });

        if (!membership || (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN)) {
            throw new AppError("Forbidden: Only workspace admins can create labels", 403);
        }

        return await prisma.label.create({
            data: {
                name: value.name,
                color: value.color,
                workspaceId: value.workspaceId
            }
        });
    },

    getLabelsByWorkspace: async (workspaceId: string, userId: string) => {
        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId, userId }
        });
        if (!membership) throw new AppError("Forbidden: You do not have access to this workspace", 403);

        return await prisma.label.findMany({
            where: { workspaceId }
        });
    },

    attachLabelToTask: async (data: { labelId: string, taskId: string }, userId: string) => {
        const { error, value } = attachLabelSchema.validate(data);
        if (error) throw new AppError(error.details[0].message, 400);

        // Verify the task exists and get its workspaceId
        const task = await prisma.task.findUnique({
            where: { id: value.taskId },
            include: { project: true }
        });
        if (!task) throw new AppError("Task not found", 404);

        // Verify the label exists and belongs to the same workspace
        const label = await prisma.label.findUnique({
            where: { id: value.labelId }
        });
        if (!label) throw new AppError("Label not found", 404);
        if (label.workspaceId !== task.project.workspaceId) {
            throw new AppError("Label and Task do not belong to the same workspace", 400);
        }

        // Verify user has access to the workspace
        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: task.project.workspaceId, userId }
        });
        if (!membership) throw new AppError("Forbidden: You do not have access to this task", 403);

        // Attach the label using Prisma's implicit many-to-many connect
        return await prisma.task.update({
            where: { id: value.taskId },
            data: {
                labels: {
                    connect: { id: value.labelId }
                }
            },
            include: { labels: true }
        });
    }
};
