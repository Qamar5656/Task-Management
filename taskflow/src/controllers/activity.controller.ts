import { Request, Response } from 'express';
import { activityService } from '../services/activity.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

export const activityController = {
  getRecentActivities: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const limit = parseInt(req.query.limit as string) || 20;
    const activities = await activityService.getRecentActivities(userId, limit);

    res.status(200).json(activities);
  })
};
