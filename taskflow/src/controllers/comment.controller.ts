import { Request, Response } from "express";
import prisma  from "../config/prisma.js"
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { commentService } from "../services/comment.service.js";

export const commentController = {
    createComment: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);

        const comment = await commentService.createComment({ 
            content: req.body.content, 
            taskId: req.body.taskId, 
            userId 
        });

        res.status(201).json({ message: "Comment created successfully", comment });
    }),
    
    
    getComments: catchAsync(async (req:Request, res:Response) => {
        const userId= req.user?.id;
        if(!userId) throw new AppError("Unauthorized", 401);

        const { taskId } = req.params;
        if(!taskId) throw new AppError("Task id is required", 400);
        
        const comments = await commentService.getComments(taskId, userId);
        res.status(200).json({ message: "Comments fetched successfully", comments });
    }),
    
    getById: catchAsync(async (req:Request, res:Response) => {
        const userId= req.user?.id;
        if(!userId) throw new AppError("Unauthorized", 401);

        const commentId = req.params.id; // Extract from /:id
        if(!commentId) throw new AppError("Comment id is required", 400);
        
        const comment = await commentService.getCommentById(commentId, userId);
        res.status(200).json({ message: "Comment fetched successfully", comment });
    }),
    
    update: catchAsync(async (req:Request, res:Response) => {
        const userId = req.user?.id;
        if(!userId) throw new AppError("Unauthorized", 401);

        const commentId = req.params.id; // Extract from /:id
        if(!commentId) throw new AppError("Comment id is required", 400);

        const comment = await commentService.updateComment(commentId, userId, req.body);
        res.status(200).json({ message: "Comment updated successfully", comment });
    }),
    
    delete: catchAsync(async (req:Request, res:Response) => {
        const userId = req.user?.id;
        if(!userId) throw new AppError("Unauthorized", 401);

        const commentId = req.params.id; // Extract from /:id
        if(!commentId) throw new AppError("Comment id is required", 400);

        const comment = await commentService.deleteComment(commentId, userId);
        res.status(200).json({ message: "Comment deleted successfully", comment });
    })
};
