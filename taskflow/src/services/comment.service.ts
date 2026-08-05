import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { createCommentSchema } from "../validation/comment.validation.js";

export const commentService = {
    createComment: async (data: { content: string, taskId: string, userId: string }) => {
        const { error } = createCommentSchema.validate({ content: data.content, taskId: data.taskId });
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        // 1. Find the Task and include its Project to get the workspaceId
        const task = await prisma.task.findUnique({
            where: { id: data.taskId },
            include: { project: true }
        });

        if (!task) throw new AppError("Task not found", 404);

        // 2. Verify the user is a member of the Workspace that owns this Project
        const membership = await prisma.workspaceMember.findFirst({
            where: { 
                workspaceId: task.project.workspaceId, 
                userId: data.userId 
            }
        });

        if (!membership) {
            throw new AppError("Forbidden: You do not have access to this task's workspace", 403);
        }

        // 3. Create the TaskComment
        const comment = await prisma.taskComment.create({
            data: {
                content: data.content,
                taskId: data.taskId,
                userId: data.userId
            }
        });

        return comment;
    },

    getComments: async (taskId: string, userId: string) => {
        // Find task and verify access before returning comments...
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });

        if (!task) throw new AppError("Task not found", 404);

        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: task.project.workspaceId, userId }
        });

        if (!membership) throw new AppError("Forbidden: You do not have access to this task", 403);

        return await prisma.taskComment.findMany({
            where: { taskId },
            orderBy: { createdAt: 'desc' }
        });
    },

    getCommentById: async (commentId: string, userId: string) => {
        const comment = await prisma.taskComment.findUnique({
            where: { id: commentId },
            include: { task: true }
        });
        if (!comment) throw new AppError("Comment not found", 404);

        // Verify user has access to the workspace of the task this comment belongs to
        const membership = await prisma.workspaceMember.findFirst({
            where: { 
                workspaceId: (await prisma.project.findUnique({ where: { id: comment.task.projectId } }))?.workspaceId, 
                userId 
            }
        });

        if (!membership) throw new AppError("Forbidden: You do not have access to this comment", 403);

        return comment;
    },

    updateComment: async (commentId: string, userId: string, data: { content: string }) => {
        const comment = await prisma.taskComment.findUnique({
            where: { id: commentId }
        });
        if(!comment) throw new AppError("Comment not found", 404);
        if(comment.userId !== userId) throw new AppError("Unauthorized", 401);
        return await prisma.taskComment.update({
            where: { id: commentId },
            data: { content: data.content }
        });
    },
    deleteComment: async (commentId: string, userId: string) => {
        const comment = await prisma.taskComment.findUnique({
            where: { id: commentId }
        });
        if(!comment) throw new AppError("Comment not found", 404);
        if(comment.userId !== userId) throw new AppError("Unauthorized", 401);
        await prisma.taskComment.delete({ where: { id: commentId } });
        return { message: "Comment deleted successfully" };
    }
};
