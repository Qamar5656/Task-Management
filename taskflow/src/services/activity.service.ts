import prisma from "../config/prisma.js";

export const activityService = {
  logActivity: async (data: {
    userId: string;
    workspaceId?: string;
    projectId?: string;
    action: string;
    entityType: string;
    entityName: string;
  }) => {
    try {
      await prisma.activityLog.create({
        data: {
          userId: data.userId,
          workspaceId: data.workspaceId,
          projectId: data.projectId,
          action: data.action,
          entityType: data.entityType,
          entityName: data.entityName,
        }
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
      // We don't want to throw and break the main request just because logging failed
    }
  },

  getRecentActivities: async (userId: string, limit: number = 20) => {
    // Get activities for this user or workspaces this user is a member of
    const userWorkspaces = await prisma.workspaceMember.findMany({
      where: { userId },
      select: { workspaceId: true }
    });
    
    const workspaceIds = userWorkspaces.map(w => w.workspaceId);

    const activities = await prisma.activityLog.findMany({
      where: {
        OR: [
          { userId },
          { workspaceId: { in: workspaceIds } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return activities;
  }
};
