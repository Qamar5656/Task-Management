import prisma from '../config/prisma.js';
import { createWorkspaceSchema, updateWorkspaceSchema, addMemberSchema } from '../validation/workspace.validation.js';
import { WorkspaceRole } from '../prisma/index.js';
import { AppError } from '../utils/AppError.js';
import { activityService } from './activity.service.js';

export const workspaceService = {
    createWorkspace: async (data: { name: string; userId: string }) => {
        const { error } = createWorkspaceSchema.validate({ name: data.name });
        if (error) {
            throw new Error(error.details[0].message);
        }

        // Generate URL-friendly slug
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // Check if slug exists to avoid unique constraint errors
        const existing = await prisma.workspace.findUnique({ where: { slug } });
        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        // Nested Write: Create Workspace AND link the WorkspaceMember immediately
        const workspace = await prisma.workspace.create({
            data: {
                name: data.name,
                slug: finalSlug,
                members: {
                    create: {
                        userId: data.userId,
                        role: WorkspaceRole.OWNER // Assign the creator as OWNER
                    }
                }
            }
        });
        
        await activityService.logActivity({
            userId: data.userId,
            workspaceId: workspace.id,
            action: 'CREATED',
            entityType: 'WORKSPACE',
            entityName: workspace.name
        });

        return workspace;
    },

    getAllWorkspaces: async (userId: string) => {
        // Only return workspaces that this user is a member of
        return await prisma.workspace.findMany({
            where: {
                members: {
                    some: { userId }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });
    },

    getWorkspaceById: async (id: string, userId: string) => {
        const workspace = await prisma.workspace.findFirst({
            where: {
                id,
                members: {
                    some: { userId }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        if (!workspace) throw new Error("Workspace not found or unauthorized");
        return workspace;
    },

    updateWorkspace: async (id: string, userId: string, data: { name: string }) => {
        const { error } = updateWorkspaceSchema.validate(data);
        if (error) throw new Error(error.details[0].message);

        // Verify the user has access to this workspace
        const workspace = await prisma.workspace.findFirst({
            where: { id, members: { some: { userId } } }
        });
        if (!workspace) throw new Error("Workspace not found or unauthorized");

        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const updated = await prisma.workspace.update({
            where: { id },
            data: { name: data.name, slug }
        });

        await activityService.logActivity({
            userId,
            workspaceId: id,
            action: 'UPDATED',
            entityType: 'WORKSPACE',
            entityName: updated.name
        });

        return updated;
    },

    deleteWorkspace: async (id: string, userId: string) => {
        // Verify the user has access to this workspace
        const workspace = await prisma.workspace.findFirst({
            where: { id, members: { some: { userId } } }
        });
        if (!workspace) throw new Error("Workspace not found or unauthorized");

        // Delete the workspace
        await prisma.workspace.delete({
            where: { id }
        });

        await activityService.logActivity({
            userId,
            workspaceId: id,
            action: 'DELETED',
            entityType: 'WORKSPACE',
            entityName: workspace.name
        });
        
        return { message: "Workspace deleted successfully" };
    },

    addMember: async (workspaceId: string, inviterUserId: string, data: { email: string, role: string }) => {
        const { error, value } = addMemberSchema.validate(data);
        if (error) throw new AppError(error.details[0].message, 400);

        // Verify the inviter is an OWNER or ADMIN
        const inviter = await prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: inviterUserId }
        });
        if (!inviter || (inviter.role !== WorkspaceRole.OWNER && inviter.role !== WorkspaceRole.ADMIN)) {
            throw new AppError("Forbidden: Only workspace admins can add members", 403);
        }

        // Find the user to invite
        const userToInvite = await prisma.user.findUnique({ where: { email: value.email } });
        if (!userToInvite) throw new AppError("User with this email not found. They must register first.", 404);

        // Check if they are already in the workspace
        const existingMember = await prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: userToInvite.id }
        });
        if (existingMember) throw new AppError("User is already a member of this workspace", 400);

        // Add them to the workspace
        const newMember = await prisma.workspaceMember.create({
            data: {
                workspaceId,
                userId: userToInvite.id,
                role: value.role as WorkspaceRole
            },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });

        await activityService.logActivity({
            userId: inviterUserId,
            workspaceId,
            action: 'ADDED_MEMBER',
            entityType: 'USER',
            entityName: userToInvite.email
        });

        return newMember;
    },

    getMembers: async (workspaceId: string, userId: string) => {
        // Verify access
        const membership = await prisma.workspaceMember.findFirst({
            where: { workspaceId, userId }
        });
        if (!membership) throw new AppError("Forbidden: You do not have access to this workspace", 403);

        return await prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });
    },

    removeMember: async (workspaceId: string, adminUserId: string, memberUserId: string) => {
        // Verify the person doing the removing is an OWNER or ADMIN
        const inviter = await prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: adminUserId }
        });
        if (!inviter || (inviter.role !== WorkspaceRole.OWNER && inviter.role !== WorkspaceRole.ADMIN)) {
            throw new AppError("Forbidden: Only workspace admins can remove members", 403);
        }

        // Verify the member to remove exists in the workspace
        const memberToRemove = await prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: memberUserId },
            include: { user: true }
        });
        if (!memberToRemove) throw new AppError("Member not found in this workspace", 404);

        // Prevent OWNER from removing themselves or being removed by an ADMIN
        if (memberToRemove.role === WorkspaceRole.OWNER) {
            throw new AppError("Forbidden: Workspace Owner cannot be removed", 403);
        }

        await prisma.workspaceMember.delete({ where: { id: memberToRemove.id } });

        await activityService.logActivity({
            userId: adminUserId,
            workspaceId,
            action: 'REMOVED_MEMBER',
            entityType: 'USER',
            entityName: memberToRemove.user.email
        });

        return { message: "Member removed successfully" };
    }
};