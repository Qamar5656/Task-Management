import { Request, Response } from 'express';
import { labelService } from '../services/label.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

export const labelController = {
    create: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const label = await labelService.createLabel(req.body, userId);
        res.status(201).json({ message: "Label created successfully", label });
    }),

    getByWorkspace: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const labels = await labelService.getLabelsByWorkspace(req.params.workspaceId, userId);
        res.status(200).json(labels);
    }),

    attach: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const task = await labelService.attachLabelToTask(req.body, userId);
        res.status(200).json({ message: "Label attached successfully", task });
    })
};
