import prisma from '../config/prisma.js';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../validation/workspace.validation.js';

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
                        userId: data.userId
                    }
                }
            }
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

        return await prisma.workspace.update({
            where: { id },
            data: { name: data.name, slug }
        });
    },

    deleteWorkspace: async (id: string, userId: string) => {
        // Verify the user has access to this workspace
        const workspace = await prisma.workspace.findFirst({
            where: { id, members: { some: { userId } } }
        });
        if (!workspace) throw new Error("Workspace not found or unauthorized");

        // Delete all members of this workspace first (since we don't have onDelete: Cascade in schema)
        await prisma.workspaceMember.deleteMany({
            where: { workspaceId: id }
        });

        // Delete the workspace
        await prisma.workspace.delete({
            where: { id }
        });
        
        return { message: "Workspace deleted successfully" };
    }
};