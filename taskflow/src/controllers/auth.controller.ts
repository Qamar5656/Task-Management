import { Request, Response } from 'express';
import {authService} from "../services/auth.service.js";

export const authController = {
  register: async (req:Request, res: Response)=>{
    try{
      const result = await authService.registerUser(req.body);
      res.status(201).json(result);
    }catch(error:any){
      res.status(400).json({
        message:error.message
      });
    }
  },
  verifyEmail: async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) throw new Error("Email and OTP are required");
      const result = await authService.verifyEmail(email, otp);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  login:async(req:Request, res:Response)=>{
    try{
      const user= await authService.loginUser(req.body);
      res.status(201).json({
        messsage:"user logged-in successfully",
        ...user
      })
    }catch(error:any){
      res.status(400).json({
        message:error.message
      })
    }
  },
  refresh: async(req:Request, res:Response)=>{
    try{
      const { refreshToken } = req.body;
      const result = await authService.refreshAccess(refreshToken);
      res.status(200).json(result);
    }catch(error:any){
      res.status(401).json({
        message: error.message
      })
    }
  },
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) throw new Error("Email is required");
      const result = await authService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  verifyOtp: async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) throw new Error("Email and OTP are required");
      const result = await authService.verifyOtp(email, otp);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  resetPassword: async (req: Request, res: Response) => {
    try {
      const { resetToken, newPassword } = req.body;
      if (!resetToken || !newPassword) throw new Error("Token and new password are required");
      const result = await authService.resetPassword(resetToken, newPassword);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};