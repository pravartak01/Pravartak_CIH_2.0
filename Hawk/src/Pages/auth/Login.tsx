
import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <AuthLayout 
      title="Welcome back" 
      description="Sign in to access your security dashboard"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
