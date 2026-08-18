import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { createProjectSchema, getProjectsSchema, updateProjectSchema } from '../validation/project.validation.js';
import { WorkspaceRole } from "../prisma/index.js";
import { activityService } from './activity.service.js';

export const projectService = {
    createProject: async (data: { name: string; workspaceId: string; userId: string }) => {
        const { error, value } = createProjectSchema.validate(data);
        if (error) throw new AppError(error.details[0].message, 400);

        const membership= await prisma.workspaceMember.findFirst({
            where:{ workspaceId:value.workspaceId, userId:data.userId}
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

        const slug = `${value.name.trim().toLocaleLowerCase().replace(/\s+/g, "-")}`;

        const project = await prisma.project.create({
            data: {
                name: value.name,
                workspaceId: value.workspaceId,
                userId:data.userId,
                slug:slug
            }
        });
        
        await activityService.logActivity({
            userId: data.userId,
            workspaceId: value.workspaceId,
            projectId: project.id,
            action: 'CREATED',
            entityType: 'PROJECT',
            entityName: value.name
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
        const { error, value } = updateProjectSchema.validate(data);
        if (error) throw new AppError(error.details[0].message, 400);

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new AppError("Project not found", 404);

        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId: project.workspaceId, userId }
        });
        if (!membership || (membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN)) {
            throw new AppError("Forbidden: Only workspace admins can update projects", 403);
        }

        const slug = value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: { name: value.name, slug }
        });

        await activityService.logActivity({
            userId,
            workspaceId: project.workspaceId,
            projectId: projectId,
            entityType: 'Project',
            entityName: data.name
        });

        return updated;
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

        await activityService.logActivity({
            userId,
            workspaceId: project.workspaceId,
            action: 'Deleted',
            entityType: 'Project',
            entityName: project.name
        });

        await prisma.project.delete({ where: { id: projectId } });

        await activityService.logActivity({
            userId,
            workspaceId: project.workspaceId,
            projectId: project.id,
            action: 'DELETED',
            entityType: 'PROJECT',
            entityName: project.name
        });

        return { message: "Project deleted successfully" };
    }
}