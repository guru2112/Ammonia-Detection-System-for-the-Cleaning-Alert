"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "../../utils/auth";
import Link from "next/link";

export default function UserLanding() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<Array<{
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const isValid = await authService.verifyToken();
      if (!isValid) {
        router.push('/login');
        return;
      }

      const u = authService.getUser();
      setUser(u);
      setIsAuthenticated(true);

      // Redirect based on role
      if (u?.role === 'admin' || u?.role === 'worker') {
        router.push('/dashboard');
        return;
      }
    };

    setIsClient(true);
    
    // Generate particles only on client side
    const generatedParticles = Array.from({ length: 40 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }));
    setParticles(generatedParticles);

    checkAuth();
  }, [router]);

  // Scroll animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, observerOptions);

    // Observe cards and profile
    cardRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    if (profileRef.current) observer.observe(profileRef.current);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [isAuthenticated]);

  // Parallax effect for background elements
  const parallaxOffset = scrollY * 0.5;

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  // Show loading screen during authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Access</h2>
          <p className="text-gray-300 mb-6">Checking your authentication...</p>
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
            transform: scale(1.05);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 text-white overflow-x-hidden relative">
      {/* Animated Background Particles */}
      {isClient && (
        <div className="fixed inset-0 pointer-events-none">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Data Waves with Parallax */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse transition-transform duration-1000 ease-out"
          style={{ transform: `translateY(${parallaxOffset * 0.3}px) translateX(${parallaxOffset * 0.1}px)` }}
        />
        <div 
          className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-r from-teal-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000 transition-transform duration-1000 ease-out"
          style={{ transform: `translateY(${-parallaxOffset * 0.2}px) translateX(${-parallaxOffset * 0.15}px)` }}
        />
        <div 
          className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-2000 transition-transform duration-1000 ease-out"
          style={{ transform: `translateY(${parallaxOffset * 0.4}px) translateX(${parallaxOffset * 0.2}px)` }}
        />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with User Info */}
          <div 
            ref={heroRef}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-6 lg:space-y-0 transform transition-all duration-1000 ease-out"
            style={{ 
              transform: `translateY(${-scrollY * 0.1}px)`,
              opacity: Math.max(0, 1 - scrollY / 400)
            }}
          >
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-3xl">🌿</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <p className="text-gray-300 mt-2 text-lg">Environmental Monitoring Portal</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-3 h-3 rounded-full animate-pulse bg-green-400"></div>
                  <span className="text-sm font-medium text-green-400">User Portal Active</span>
                </div>
              </div>
            </div>
            
            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-gray-300 text-xs">{user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-green-400">User</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-4 py-3 rounded-2xl border border-red-400/30 transition-all duration-300"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Welcome Message */}
          <div 
            ref={(el) => { cardRefs.current[0] = el; }}
            className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl mb-12 opacity-0 translate-y-8 transition-all duration-700 ease-out hover:bg-white/10 hover:border-white/20 hover:shadow-3xl transform hover:scale-[1.02]"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float animate-pulse-glow">
                <span className="text-4xl">👋</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Hello, {user?.name}!</h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                Thank you for being part of our environmental monitoring community. As a registered user, you can submit manual environmental reports to help us maintain comprehensive monitoring coverage.
              </p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Submit Report Card */}
            <div 
              ref={(el) => { cardRefs.current[1] = el; }}
              className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 transform hover:scale-105 opacity-0 translate-y-8 hover:shadow-3xl hover:rotate-1"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float" style={{ animationDelay: '1s' }}>
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Submit Environmental Report</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Report environmental concerns, unusual observations, or contribute monitoring data from your location.
                </p>
                <Link
                  href="/AlertForm"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="mr-2">🚀</span>
                  Create New Report
                </Link>
              </div>
            </div>

            {/* Profile Card */}
            <div 
              ref={profileRef}
              className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 transform hover:scale-105 opacity-0 translate-y-8 hover:shadow-3xl hover:-rotate-1"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float" style={{ animationDelay: '2s' }}>
                  <span className="text-3xl">👤</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Your Profile</h3>
                <div className="space-y-3 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white font-medium">{user?.name}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400">Role</p>
                    <div className="text-green-400 font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      User
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div 
            ref={(el) => { cardRefs.current[2] = el; }}
            className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl opacity-0 translate-y-8 transition-all duration-700 ease-out hover:bg-white/10 hover:border-white/20 hover:shadow-3xl transform hover:scale-[1.02]"
            style={{ animationDelay: '0.8s' }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '3s' }}>
                <span className="text-3xl">ℹ️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">How You Can Help</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '4s' }}>
                  <span className="text-2xl">🌱</span>
                </div>
                <h4 className="text-lg font-bold text-green-400 mb-2">Report Environmental Issues</h4>
                <p className="text-gray-300 text-sm">
                  Submit reports about air quality concerns, unusual odors, visible pollution, or other environmental observations in your area.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '5s' }}>
                  <span className="text-2xl">📍</span>
                </div>
                <h4 className="text-lg font-bold text-blue-400 mb-2">Location-Based Monitoring</h4>
                <p className="text-gray-300 text-sm">
                  Your location-specific reports help us build a comprehensive map of environmental conditions across different areas.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '6s' }}>
                  <span className="text-2xl">⚡</span>
</div>
                <h4 className="text-lg font-bold text-purple-400 mb-2">Real-Time Contribution</h4>
                <p className="text-gray-300 text-sm">
                  Your reports complement our automated sensors, providing real-time human observations for complete monitoring coverage.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-gray-400 text-sm">
                IoT Environmental Monitoring System – Developed by Final Year IT Students, VPPCOE Mumbai (2025)
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Guided by Dr. Sonali Pakhmode
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}