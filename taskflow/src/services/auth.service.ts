import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {registerSchema, loginSchema} from '../validation/auth.validation.js';

interface RegisterUserDTO{
    name:string
    email:string
    password:string
}

interface LoginUserDTO{
    email:string
    password:string
}

export const authService = {  
    
    //SignUp
    registerUser: async (data: RegisterUserDTO) => {
        const {error} = registerSchema.validate(data);

        if(error){
            throw new Error(error.details[0].message)
        }

        const { name, email, password } = data;
        
        const existingUser =await prisma.user.findUnique({where: {email} }) 
        
        if (existingUser) {
            throw new Error("Email already exists");
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user= await prisma.user.create({
            data:{
                name,
                email,
                password: hashedPassword
            }
        })
        
        const { password: _, ...userWithoutPassword } = user;
        
        // Generate Tokens
        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", { expiresIn: "7d" });

        // Save Refresh Token to DB
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
            }
        });

        return { user: userWithoutPassword, accessToken, refreshToken };
    },

    //Login
    loginUser: async (data:LoginUserDTO)=>{
        const {email,password}=data;
        
        if(!email || !password){
            throw new Error("plese enter your Email and Password");
        }
        const uniqueUser= await prisma.user.findUnique({ where: {email}});

        if(!uniqueUser){
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password,uniqueUser.password);

        if(!isPasswordValid){
            throw new Error("Invalid credentials");
        }

        const { password: _, ...userWithoutPassword } = uniqueUser;

        // Generate Tokens
        const accessToken = jwt.sign({ userId: uniqueUser.id }, process.env.JWT_SECRET || "secret", { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: uniqueUser.id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", { expiresIn: "7d" });

        // Save Refresh Token to DB
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: uniqueUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        return { user: userWithoutPassword, accessToken, refreshToken };
    },
    // Refresh Token Exchange
    refreshAccess: async (token: string) => {
        if (!token) throw new Error("No refresh token provided");

        // Verify token exists in DB and is not expired
        const savedToken = await prisma.refreshToken.findUnique({ where: { token } });
        if (!savedToken || savedToken.expiresAt < new Date()) {
            throw new Error("Invalid or expired refresh token");
        }

        // Verify JWT signature
        let payload: any;
        try {
            payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "refresh_secret");
        } catch (e) {
            throw new Error("Invalid refresh token signature");
        }

        // Generate new Access Token
        const accessToken = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET || "secret", { expiresIn: "15m" });
        return { accessToken };
    }
}