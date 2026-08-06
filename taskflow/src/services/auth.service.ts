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
        
        // Generate a 6-digit OTP for email verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        
        const user= await prisma.user.create({
            data:{
                name,
                email,
                password: hashedPassword,
                verifyEmailOtp: otp,
                verifyEmailOtpExpiry: otpExpiry,
                isActive: false
            }
        })
        
        // SIMULATE SENDING EMAIL
        console.log(`\n\n==============================================`);
        console.log(`📨 Verification OTP for ${email}: ${otp}`);
        console.log(`==============================================\n\n`);

        return { message: "OTP sent to email. Please verify to continue." };
    },

    // Verify Email
    verifyEmail: async (email: string, otp: string) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.verifyEmailOtp !== otp || !user.verifyEmailOtpExpiry) {
            throw new Error("Invalid OTP");
        }

        if (user.verifyEmailOtpExpiry < new Date()) {
            throw new Error("OTP has expired");
        }

        // OTP is valid, mark email as verified and user as active
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerifiedAt: new Date(),
                isActive: true,
                verifyEmailOtp: null,
                verifyEmailOtpExpiry: null
            }
        });

        const { password: _, ...userWithoutPassword } = updatedUser;

        // Generate Tokens to log them in
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

        return { user: userWithoutPassword, accessToken, refreshToken, message: "Email verified successfully!" };
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
    },

    // Forgot Password
    forgotPassword: async (email: string) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // For security, don't reveal if user exists or not
            return { message: "If your email is registered, you will receive an OTP." };
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Set expiry to 15 minutes from now
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordOtp: otp,
                resetPasswordOtpExpiry: otpExpiry
            }
        });

        // SIMULATE SENDING EMAIL
        console.log(`\n\n==============================================`);
        console.log(` OTP for ${email}: ${otp}`);
        console.log(`==============================================\n\n`);

        return { message: "If your email is registered, you will receive an OTP." };
    },

    // Verify OTP
    verifyOtp: async (email: string, otp: string) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.resetPasswordOtp !== otp || !user.resetPasswordOtpExpiry) {
            throw new Error("Invalid OTP");
        }

        if (user.resetPasswordOtpExpiry < new Date()) {
            throw new Error("OTP has expired");
        }

        // Generate a temporary reset token valid for 15 minutes
        const resetToken = jwt.sign({ userId: user.id, purpose: "reset_password" }, process.env.JWT_SECRET || "secret", { expiresIn: "15m" });

        return { resetToken, message: "OTP verified successfully" };
    },

    // Reset Password
    resetPassword: async (resetToken: string, newPassword: string) => {
        let payload: any;
        try {
            payload = jwt.verify(resetToken, process.env.JWT_SECRET || "secret");
        } catch (e) {
            throw new Error("Invalid or expired reset token");
        }

        if (payload.purpose !== "reset_password") {
            throw new Error("Invalid token purpose");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: payload.userId },
            data: {
                password: hashedPassword,
                resetPasswordOtp: null,
                resetPasswordOtpExpiry: null
            }
        });

        return { message: "Password reset successfully" };
    }
}