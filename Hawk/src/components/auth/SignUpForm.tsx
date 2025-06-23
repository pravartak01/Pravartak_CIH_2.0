import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, User, Briefcase, Shield, ArrowRight } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }) => {
  // Calculate password strength
  const getStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    
    // Length check
    if (pass.length > 6) score += 1;
    if (pass.length > 10) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    return score;
  };
  
  const strength = getStrength(password);
  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-400',
    'bg-green-500',
    'bg-green-600'
  ][strength];
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-300">Password Strength</span>
        <span className="text-xs font-medium" style={{ color: ['#f87171', '#fb923c', '#facc15', '#4ade80', '#22c55e', '#16a34a'][strength] }}>
          {strengthText}
        </span>
      </div>
      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${strengthColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${(strength / 5) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

// 3D Floating Element
const FloatingElement = () => {
  const [{ rotateX, rotateY, translateZ }, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    translateZ: 0,
    config: { mass: 5, tension: 350, friction: 40 }
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      api.start({
        rotateX: Math.random() * 20 - 10,
        rotateY: Math.random() * 20 - 10,
        translateZ: Math.random() * 5,
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="flex justify-center mb-6 h-20 pointer-events-none">
      <animated.div
        style={{
          transform: 'perspective(600px)',
          rotateX,
          rotateY,
          translateZ
        }}
      >
        <div className="w-20 h-20 flex items-center justify-center rounded-xl border border-white/20 bg-white/5 shadow-lg">
          <User size={32} className="text-primary" />
        </div>
      </animated.div>
    </div>
  );
};

const SignUpForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [userType, setUserType] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; fullName?: string }>({});

  // Form validation
  const validateStep = (step) => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string; fullName?: string } = {};
    
    if (step === 0) {
      if (!email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
      
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      
      if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (step === 1) {
      if (!fullName) newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(formStep + 1);
    }
  };

  const prevStep = () => {
    setFormStep(formStep - 1);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!validateStep(formStep)) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            organization: organization,
            role: userType,
          },
        }
      });
      
      if (error) throw error;
      
      toast.success('Sign up successful! Please check your email for verification.');
      navigate('/auth/login');
      
    } catch (error) {
      toast.error(error.message || 'Failed to sign up');
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // Animated background particles
  const Background = () => {
    return (
      <div className="absolute inset-0 overflow-hidden -z-10">
        {/* Maintain original dark background */}
        <div className="absolute inset-0 bg-black/80" />
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                x: [
                  Math.random() * 100 + "%", 
                  Math.random() * 100 + "%", 
                  Math.random() * 100 + "%"
                ],
                y: [
                  Math.random() * 100 + "%", 
                  Math.random() * 100 + "%", 
                  Math.random() * 100 + "%"
                ]
              }}
              transition={{ 
                duration: 10 + Math.random() * 20, 
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                opacity: Math.random() * 0.3 + 0.1
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Background />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full mx-auto"
      >
        <div className="text-center mb-6">
          <FloatingElement />
          <motion.h2 
            className="text-2xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Create your account
          </motion.h2>
          <motion.p 
            className="text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Join our community and unlock all features
          </motion.p>
        </div>
        
        <form onSubmit={handleSignUp} className="relative">
          {/* Step indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <motion.div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${formStep === 0 ? 'bg-primary' : 'bg-primary/70'}`}
                whileHover={{ scale: 1.05 }}
              >
                <Mail size={14} />
              </motion.div>
              <div className={`w-8 h-0.5 ${formStep >= 1 ? 'bg-primary/70' : 'bg-gray-600'}`} />
              <motion.div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${formStep === 1 ? 'bg-primary' : formStep > 1 ? 'bg-primary/70' : 'bg-gray-600'}`}
                whileHover={{ scale: 1.05 }}
              >
                <User size={14} />
              </motion.div>
              <div className={`w-8 h-0.5 ${formStep >= 2 ? 'bg-primary/70' : 'bg-gray-600'}`} />
              <motion.div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${formStep === 2 ? 'bg-primary' : 'bg-gray-600'}`}
                whileHover={{ scale: 1.05 }}
              >
                <Shield size={14} />
              </motion.div>
            </div>
          </div>

          {/* Step 1: Account credentials */}
          {formStep === 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center">
                  <Mail size={14} className="mr-2" />
                  Email
                </Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" 
                    className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="password" className="text-white flex items-center">
                  <Shield size={14} className="mr-2" />
                  Password
                </Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                <PasswordStrengthIndicator password={password} />
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white flex items-center">
                  <Shield size={14} className="mr-2" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                    className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                className="pt-4"
              >
                <motion.button
                  type="button"
                  onClick={nextStep}
                  className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Personal information */}
          {formStep === 1 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="fullName" className="text-white flex items-center">
                  <User size={14} className="mr-2" />
                  Full Name
                </Label>
                <div className="relative">
                  <Input 
                    id="fullName" 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe" 
                    className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="organization" className="text-white flex items-center">
                  <Briefcase size={14} className="mr-2" />
                  Organization (Optional)
                </Label>
                <div className="relative">
                  <Input 
                    id="organization" 
                    type="text" 
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Your Company" 
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                  />
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </motion.div>
              
              <motion.div className="flex space-x-3 pt-4">
                <motion.button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-md transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Account type */}
          {formStep === 2 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="userType" className="text-white">Account Type</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger id="userType" className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Individual User</SelectItem>
                    <SelectItem value="admin">Organization Admin</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
              
              <motion.div variants={itemVariants} className="pt-4 space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/20">
                  <h3 className="font-medium text-white mb-2">
                    {userType === 'user' ? 'Individual User' : 'Organization Admin'}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {userType === 'user' 
                      ? 'Access all standard features and personal dashboard.' 
                      : 'Manage organization members, billing, and access advanced admin controls.'}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-md transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          <motion.div 
            variants={itemVariants}
            className="text-center text-sm text-gray-300 mt-6"
          >
            Already have an account?{' '}
            <motion.a 
              href="/auth/login" 
              className="text-primary hover:text-primary/80 hover:underline"
              whileHover={{ scale: 1.05 }}
            >
              Sign in
            </motion.a>
          </motion.div>
        </form>
      </motion.div>
    </>
  );
};

export default SignUpForm;