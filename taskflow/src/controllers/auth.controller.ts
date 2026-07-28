import { Request, Response } from 'express';
import {authService} from "../services/auth.service.js";

export const authController = {
  register: async (req:Request, res: Response)=>{
    try{
      const user= await authService.registerUser(req.body);
      res.status(201).json({
        message:"User registered successfully",
        user
      });
    }catch(error:any){
      res.status(400).json({
        message:error.message
      });
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
  }
};