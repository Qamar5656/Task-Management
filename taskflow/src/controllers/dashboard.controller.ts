import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const dashboardController = {
    getStats: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);

        // 1. Total Workspaces user is a member of
        const totalWorkspaces = await prisma.workspaceMember.count({
            where: { userId }
        });

        // 2. Total active projects inside those workspaces
        const memberships = await prisma.workspaceMember.findMany({
            where: { userId },
            select: { workspaceId: true }
        });
        const workspaceIds = memberships.map(m => m.workspaceId);

        const activeProjects = await prisma.project.count({
            where: {
                workspaceId: { in: workspaceIds }
            }
        });

        // 3. Tasks Completed (in all user's workspaces)
        const tasksCompleted = await prisma.task.count({
            where: {
                project: {
                    workspaceId: { in: workspaceIds }
                },
                status: 'DONE'
            }
        });

        // 4. Upcoming Deadlines (Due within next 7 days, not completed, in user's workspaces)
        // We use the start of today for 'gte' to ensure tasks due today are still counted.
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const upcomingDeadlines = await prisma.task.count({
            where: {
                project: {
                    workspaceId: { in: workspaceIds }
                },
                status: { not: 'DONE' },
                dueDate: {
                    not: null,
                    lte: sevenDaysFromNow,
                    gte: today
                }
            }
        });

        res.status(200).json({
            message: "Stats fetched successfully",
            stats: {
                totalWorkspaces,
                activeProjects,
                tasksCompleted,
                upcomingDeadlines
            }
        });
    })
};
