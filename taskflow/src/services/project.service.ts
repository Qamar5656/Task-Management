import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { createProjectSchema, getProjectsSchema } from '../validation/project.validation.js';
import { WorkspaceRole } from "../prisma/index.js";

export const projectService = {
    createProject: async (data: { name: string; workspaceId: string; userId: string }) => {
        const membership= await prisma.workspaceMember.findFirst({
            where:{ workspaceId:data.workspaceId, userId:data.userId}
        })
        if(!membership){
            throw new AppError("You are not a member of this workspace",403);
        }
        if (
    membership.role !== WorkspaceRole.OWNER &&
    membership.role !== WorkspaceRole.ADMIN
) {

            throw new AppError("You are not authorized to create a project",403);
        }

        const slug = `${data.name.trim().toLocaleLowerCase().replace(/\s+/g, "-")}`;

        const project = await prisma.project.create({
            data: {
                name: data.name,
                workspaceId: data.workspaceId,
                userId:data.userId,
                slug:slug
            }
        });
        return project;
    },

    getProjects: async (data: { workspaceId: string, userId: string }) => {
        const { error } = getProjectsSchema.validate({ workspaceId: data.workspaceId });
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        // Verify membership
        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: data.workspaceId, userId: data.userId }
        });

        if (!membership) {
            throw new AppError("Forbidden: You do not have access to this workspace", 403);
        }

        const projects = await prisma.project.findMany({
            where: {
                workspaceId: data.workspaceId
            }
        });
        return projects;
    },

    getProjectById: async (projectId: string, userId: string) => {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { workspace: true }
        });
        if (!project) throw new AppError("Project not found", 404);

        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: project.workspaceId, userId }
        });
        if (!membership) throw new AppError("Forbidden: You do not have access to this workspace", 403);

        return project;
    },

    updateProject: async (projectId: string, data: { name: string }, userId: string) => {
        const { error } = updateProjectSchema.validate(data);
        if (error) throw new AppError(error.details[0].message, 400);

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new AppError("Project not found", 404);

        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: project.workspaceId, userId }
        });
        if (!membership || (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN)) {
            throw new AppError("Forbidden: Only workspace admins can update projects", 403);
        }

        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        return await prisma.project.update({
            where: { id: projectId },
            data: { name: data.name, slug }
        });
    },

    deleteProject: async (projectId: string, userId: string) => {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new AppError("Project not found", 404);

        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: project.workspaceId, userId }
        });
        if (!membership || (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN)) {
            throw new AppError("Forbidden: Only workspace admins can delete projects", 403);
        }

        await prisma.project.delete({ where: { id: projectId } });
        return { message: "Project deleted successfully" };
    }
}