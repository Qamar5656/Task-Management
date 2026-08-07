import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailCheck, Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Email is missing. Go back and try registering again.");
    if (otp.length !== 6) return toast.error("OTP must be 6 digits.");

    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-email', { email, otp });
      
      // Log the user in with the received tokens
      login(response.data.accessToken, response.data.refreshToken, response.data.user);
      
      toast.success('Email verified! Welcome to TaskFlow!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 mb-4 shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Verify Your Email
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              We just sent a 6-digit code to <span className="font-semibold text-white">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="6-Digit OTP"
              type="text"
              placeholder="123456"
              maxLength={6}
              icon={MailCheck}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow numbers
              required
            />
            
            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} variant="primary" className='cursor-pointer'>
                Verify & Continue
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/register" className="text-slate-400 hover:text-slate-300 transition-colors font-medium inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Wrong email? Sign up again
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
