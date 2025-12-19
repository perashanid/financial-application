import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { registerSchema } from '../utils/validators';
import { RegisterFormData } from '../types';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success('Registration successful!');
      navigate('/app/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative">
        <div className="text-center animate-fade-in-up">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-xl">
            <FiTrendingUp className="w-8 h-8 text-white" />
          </Link>
          <h2 className="text-5xl font-bold text-gray-900 mb-2">
            Get Started
          </h2>
          <p className="text-lg text-gray-600">Create your FinLedger account</p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-10 rounded-3xl shadow-2xl animate-fade-in-up border border-gray-100" style={{ animationDelay: '0.2s' }} onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <Input label="Full Name" {...register('name')} error={errors.name?.message} placeholder="Enter your name" />

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="Enter your email"
            />

            <Input
              label="Phone (Optional)"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="Enter your phone number"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
              <select
                {...register('role')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="individual">Individual</option>
                <option value="business">Small Business</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="Create a password"
            />

            <Input
              label="Confirm Password"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="Confirm your password"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 py-4 text-lg font-semibold" 
            isLoading={isLoading}
          >
            Create Account
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 link-hover">
              Sign in
            </Link>
          </p>
        </form>
        
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
