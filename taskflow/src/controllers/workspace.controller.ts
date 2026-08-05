import { Request, Response } from "express";
import { workspaceService } from "../services/workspace.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const workspaceController = {
    create: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized: Please log in", 401);
        
        const workspace = await workspaceService.createWorkspace({ ...req.body, userId });
        res.status(201).json({ message: "Workspace created successfully", workspace });
    }),
    
    getAll: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const workspaces = await workspaceService.getAllWorkspaces(userId);
        res.status(200).json(workspaces);
    }),

    getById: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const workspace = await workspaceService.getWorkspaceById(req.params.id, userId);
        res.status(200).json(workspace);
    }),

    update: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const workspace = await workspaceService.updateWorkspace(req.params.id, userId, req.body);
        res.status(200).json({ message: "Workspace updated successfully", workspace });
    }),

    delete: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const result = await workspaceService.deleteWorkspace(req.params.id, userId);
        res.status(200).json(result);
    }),

    addMember: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const member = await workspaceService.addMember(req.params.id, userId, req.body);
        res.status(201).json({ message: "Member added successfully", member });
    }),

    getMembers: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const members = await workspaceService.getMembers(req.params.id, userId);
        res.status(200).json(members);
    }),

    removeMember: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        
        const result = await workspaceService.removeMember(req.params.id, userId, req.params.userId);
        res.status(200).json(result);
    })
};