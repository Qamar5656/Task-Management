import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import bcrypt from 'bcrypt';
import Joi from 'joi';

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

export const userController = {
  getProfile: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) throw new AppError("User not found", 404);

    res.status(200).json(user);
  }),

  updateProfile: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: value.name },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    res.status(200).json({ message: "Profile updated successfully", user });
  }),

  updatePassword: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { error, value } = updatePasswordSchema.validate(req.body);
    if (error) throw new AppError(error.details[0].message, 400);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const isMatch = await bcrypt.compare(value.currentPassword, user.password);
    if (!isMatch) throw new AppError("Incorrect current password", 400);

    const newPasswordHash = await bcrypt.hash(value.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: newPasswordHash }
    });

    res.status(200).json({ message: "Password updated successfully" });
  })
};
