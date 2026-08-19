import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../../validation/auth.validation';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      // We always show success even if the email doesn't exist for security reasons
      toast.success('If your email is registered, you will receive an OTP.');
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-white dark:border-white/10 rounded-2xl p-8 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 mb-4 shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Forgot Password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Enter your email to receive a secure 6-digit OTP.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />
            
            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} variant="primary" className='cursor-pointer'>
                Send OTP
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition-colors font-medium inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
