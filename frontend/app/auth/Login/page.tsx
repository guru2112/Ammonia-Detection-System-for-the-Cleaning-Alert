"use client";
import React from 'react';
import { authService, User } from '../../../utils/auth';
import { FcGoogle } from 'react-icons/fc';
import { FiMail, FiLock, FiLogIn, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce"></div>
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce delay-500"></div>
      
      <div className="relative bg-gray-800/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiLogIn className="text-2xl text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-300 mt-2">Sign in to your account</p>
        </div>
        
        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const email = formData.get('email');
          const password = formData.get('password');
          try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiBase}/api/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
              // store token and user with role
              authService.setAuth(data.token, data.user as User);
              // Redirect based on role
              if (data.user.role === 'admin' || data.user.role === 'worker') {
                window.location.href = '/dashboard';
              } else {
                window.location.href = '/user-landing';
              }
            } else {
              alert(data.error || 'Login failed');
            }
          } catch (err) {
            alert('Network error');
          }
        }}>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="email" 
              name="email"
              placeholder="Email address" 
              className="w-full border border-gray-600 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-white placeholder-gray-400"
              required 
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              className="w-full border border-gray-600 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-white placeholder-gray-400"
              required 
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-600" />
              Remember me
            </label>
            <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline">Forgot password?</a>
          </div>
          <button 
            type="submit" 
            className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            Sign In
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          <span className="px-4 text-sm text-gray-400 font-medium">or continue with</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        </div>
        
        {/* Google Button */}
        <button className="flex items-center justify-center gap-3 w-full py-4 border border-gray-600 rounded-xl bg-gray-700 hover:bg-gray-600/80 transition-all duration-300 shadow-sm hover:shadow-lg group hover:scale-[1.02]">
          <FcGoogle className="text-2xl" /> 
          <span className="text-gray-200 font-medium group-hover:text-white">Google</span>
        </button>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/Signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline flex items-center justify-center gap-1">
            Sign Up <FiArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;