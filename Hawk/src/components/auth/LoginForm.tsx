import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, LogIn, Shield, Loader } from 'lucide-react';
import Tilt from 'react-parallax-tilt';
import { z } from 'zod';

const emailSchema = z.string().email({ message: "Invalid email address" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });

// SVG animation for the loading spinner
const LoadingSpinner = () => (
  <motion.svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  >
    <circle cx="12" cy="12" r="10" opacity="0.25" />
    <motion.path
      d="M12 2a10 10 0 0 1 10 10"
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  </motion.svg>
);

// Shield icon with animation
const SecurityIcon = () => (
  <motion.div
    initial={{ scale: 0.8 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 100 }}
  >
    <motion.div
      
      transition={{ duration: 3, repeat: Infinity }}
      className="relative flex items-center justify-center h-24 w-24"
    >
      <motion.div 
        className="absolute inset-0 rounded-full bg-blue-500/10"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <Shield size={54} className="text-blue-500" strokeWidth={1.5} />
      <motion.div
        className="absolute h-2 w-2 rounded-full bg-blue-500"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0, 1.5, 0],
          y: [-10, -20, -10]
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
    </motion.div>
  </motion.div>
);

const LoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [formFocused, setFormFocused] = useState(false);

  // Animated background configuration
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const validateEmail = () => {
    try {
      emailSchema.parse(email);
      setErrors(prev => ({ ...prev, email: '' }));
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, email: error.errors[0].message }));
      return false;
    }
  };

  const validatePassword = () => {
    try {
      passwordSchema.parse(password);
      setErrors(prev => ({ ...prev, password: '' }));
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, password: error.errors[0].message }));
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Login successful! Redirecting to dashboard...');
      
      // Delay navigation slightly for better UX
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      if (error.message.includes('Invalid login')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message || 'Failed to sign in');
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500/10"
            initial={{ opacity: 0.1, scale: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 2, 1],
              x: mousePosition.x / 20 - 25 + (i % 5) * 50,
              y: mousePosition.y / 20 - 25 + Math.floor(i / 5) * 50,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.2,
            }}
            style={{
              width: `${30 + i * 2}px`,
              height: `${30 + i * 2}px`,
            }}
          />
        ))}
      </div>

      <Tilt
        tiltMaxAngleX={5}
        tiltMaxAngleY={5}
        glareEnable={true}
        glareMaxOpacity={0.1}
        glareColor="white"
        glarePosition="all"
        scale={1.02}
        className="relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-lg bg-black/40 p-8 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex justify-center mb-6">
              <SecurityIcon />
            </div>

            <motion.h2 
              className="text-3xl font-bold text-center mb-6 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-gray-400 mb-8"
            >
              Sign in to access your account and continue your journey
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="email" className="text-white flex items-center gap-2">
                  <Mail size={16} className="text-blue-400" />
                  Email
                </Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={validateEmail}
                    onFocus={() => setFormFocused(true)}
                    placeholder="you@example.com" 
                    className={`bg-white/10 border-white/20 text-white placeholder:text-gray-500 pl-10 transition-all duration-200 ${
                      errors.email ? 'border-red-500' : 'focus:border-blue-500'
                    }`}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="password" className="text-white flex items-center gap-2">
                  <Lock size={16} className="text-blue-400" />
                  Password
                </Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={validatePassword}
                    onFocus={() => setFormFocused(true)}
                    placeholder="••••••••" 
                    className={`bg-white/10 border-white/20 text-white placeholder:text-gray-500 pl-10 transition-all duration-200 ${
                      errors.password ? 'border-red-500' : 'focus:border-blue-500'
                    }`}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>
              
              <motion.div 
                className="flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.a 
                  href="/auth/forgot-password" 
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Forgot password?
                </motion.a>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 h-12 flex items-center justify-center gap-2"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Sign in</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
              
              <motion.div 
                className="text-center text-sm text-gray-400 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Don't have an account?{' '}
                <motion.a 
                  href="/auth/signup" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign up
                </motion.a>
              </motion.div>

              <motion.div 
                className="pt-6 text-center text-xs text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                By signing in, you agree to our{' '}
                <a href="/terms" className="text-blue-400 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </Tilt>

      {/* 3D Interactive Elements */}
      {formFocused && (
        <>
          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute h-1 w-1 rounded-full bg-blue-500"
              initial={{ 
                opacity: 0,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{ 
                opacity: [0, 0.8, 0],
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
          
          {/* Pulsing circles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`pulse-${i}`}
              className="absolute rounded-full border border-blue-500/30"
              initial={{ 
                opacity: 0,
                scale: 0.5,
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
              }}
              animate={{ 
                opacity: [0, 0.2, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 1.3,
              }}
              style={{
                width: `${150 + i * 50}px`,
                height: `${150 + i * 50}px`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default LoginForm;