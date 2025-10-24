"use client";
import React, { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-blue-100 px-6 py-3 sticky top-0 z-50 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CleanAlert
          </div>

          {/* Desktop Links */}
          <ul className="hidden md:flex space-x-6 items-center" aria-hidden={open}>
            <li><a href="#home" className="text-gray-700 hover:text-blue-500 font-medium transition-colors duration-200">Home</a></li>
            <li><a href="#features" className="text-gray-700 hover:text-purple-500 font-medium transition-colors duration-200">Features</a></li>
            <li><a href="#manual" className="text-gray-700 hover:text-green-500 font-medium transition-colors duration-200">Manual Report</a></li>
            <li><a href="#about" className="text-gray-700 hover:text-cyan-500 font-medium transition-colors duration-200">About</a></li>
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <button className="text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 border border-blue-100">Sign In</button>
            </Link>
            <Link href="/signup">
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-md transition-all duration-200">Get Started</button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden px-6 pb-4">
          <ul className="flex flex-col gap-3 py-2">
            <li><a href="#home" className="block text-gray-700 py-2">Home</a></li>
            <li><a href="#features" className="block text-gray-700 py-2">Features</a></li>
            <li><a href="#manual" className="block text-gray-700 py-2">Manual Report</a></li>
            <li><a href="#about" className="block text-gray-700 py-2">About</a></li>
          </ul>
          <div className="flex flex-col gap-2 mt-2">
            <Link href="/auth/Login"><a className="block text-center text-blue-600 border border-blue-100 rounded-lg px-4 py-2">Sign In</a></Link>
            <Link href="/auth/Signup"><a className="block text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-4 py-2">Get Started</a></Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;