"use client";
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      
      <div className="relative bg-gray-800/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiUser className="text-2xl text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Join Us
          </h2>
          <p className="text-gray-300 mt-2">Create your account to get started</p>
        </div>
        
        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const name = formData.get('name');
          const email = formData.get('email');
          const password = formData.get('password');
          try {
            const res = await fetch('http://localhost:5000/api/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
              alert('Signup successful!');
              window.location.href = '/auth/Login';
            } else {
              alert(data.error || 'Signup failed');
            }
          } catch (err) {
            alert('Network error');
          }
        }}>
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              name="name"
              placeholder="Full Name" 
              className="w-full border border-gray-600 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-white placeholder-gray-400"
              required 
            />
          </div>
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="email" 
              name="email"
              placeholder="Email address" 
              className="w-full border border-gray-600 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-white placeholder-gray-400"
              required 
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              className="w-full border border-gray-600 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-white placeholder-gray-400"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            Create Account
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          <span className="px-4 text-sm text-gray-400 font-medium">or sign up with</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        </div>
        
        {/* Google Button */}
        <button className="flex items-center justify-center gap-3 w-full py-4 border border-gray-600 rounded-xl bg-gray-700 hover:bg-gray-600/80 transition-all duration-300 shadow-sm hover:shadow-lg group hover:scale-[1.02]">
          <FcGoogle className="text-2xl" /> 
          <span className="text-gray-200 font-medium group-hover:text-white">Google</span>
        </button>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/Login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200 hover:underline flex items-center justify-center gap-1">
            Sign In <FiArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;