
import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import SignUpForm from '@/components/auth/SignUpForm';

const SignUp = () => {
  return (
    <AuthLayout 
      title="Create an account" 
      description="Sign up to start monitoring your security"
    >
      <SignUpForm />
    </AuthLayout>
  );
};

export default SignUp;
