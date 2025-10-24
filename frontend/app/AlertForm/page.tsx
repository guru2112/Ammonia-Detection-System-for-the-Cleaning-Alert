"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "../../utils/auth";

interface ManualReportForm {
  name: string;
  email: string;
  latitude: string;
  longitude: string;
  comments: string;
}

export default function AlertForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ManualReportForm>({
    name: "",
    email: "",
    latitude: "",
    longitude: "",
    comments: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [particles, setParticles] = useState<Array<{
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);

  useEffect(() => {
    // Check authentication immediately before rendering anything
    const checkAuth = async () => {
      const token = authService.getToken();
      if (!token) {
        // No token, redirect to login immediately
        router.replace('/login');
        return;
      }

      const isValid = await authService.verifyToken();
      if (!isValid) {
        // Invalid token, redirect to login immediately
        router.replace('/login');
        return;
      }

      // User is authenticated, allow form to render
      setIsAuthenticated(true);
      setIsClient(true);
      
      // Generate particles only after authentication is confirmed
      const generatedParticles = Array.from({ length: 30 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
      }));
      setParticles(generatedParticles);
    };

    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user starts typing
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        setLocationLoading(false);
      },
      (error) => {
        setError("Unable to retrieve your location. Please enter coordinates manually.");
        setLocationLoading(false);
      }
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.latitude.trim() || !formData.longitude.trim()) {
      setError("Location coordinates are required");
      return false;
    }
    if (!formData.comments.trim()) {
      setError("Comments/description is required");
      return false;
    }
    
    // Validate coordinates are numbers
    if (isNaN(parseFloat(formData.latitude)) || isNaN(parseFloat(formData.longitude))) {
      setError("Please enter valid numeric coordinates");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiBase}/api/manual-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          comments: formData.comments,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Manual report submitted successfully! Thank you for helping monitor environmental conditions.");
        setFormData({
          name: "",
          email: "",
          latitude: "",
          longitude: "",
          comments: "",
        });
        
        // Redirect back to appropriate page after success
        setTimeout(() => {
          const token = authService.getToken();
          if (token) {
            const user = authService.getUser();
            if (user?.role === 'admin' || user?.role === 'worker') {
              router.push('/dashboard');
            } else {
              router.push('/user-landing');
            }
          } else {
            router.push('/');
          }
        }, 3000);
      } else {
        setError(data.error || "Failed to submit report");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 flex items-center justify-center px-6 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 flex items-center justify-center px-6 py-12">
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

      {/* Floating Data Waves */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-r from-green-400/15 to-emerald-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Alert Form Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚨</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Manual Alert Report</h1>
            <p className="text-gray-300">Submit environmental monitoring data and observations</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-xl text-green-300 text-sm">
              <div className="flex items-center gap-2">
                <span>✅</span>
                {success}
              </div>
            </div>
          )}

          {/* Report Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <span>👤</span> Reporter Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <span>📍</span> Location Details
              </h3>
              
              <div className="mb-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-300 px-4 py-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
                >
                  {locationLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <span>🎯</span>
                      Use Current Location
                    </>
                  )}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="e.g., 40.7128"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="e.g., -74.0060"
                  />
                </div>
              </div>
            </div>

            {/* Report Details */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <span>📝</span> Environmental Observations
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Detailed Comments & Description
                </label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Describe the environmental conditions, concerns, or observations you'd like to report. Include details about air quality, unusual odors, visible pollution, or any other relevant environmental factors..."
                />
                <div className="text-xs text-gray-400 mt-2">
                  💡 Include specific details like time of observation, weather conditions, and any immediate health concerns
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Report...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>📤</span>
                  Submit Environmental Report
                </div>
              )}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                // Check if user is authenticated and redirect accordingly
                const token = authService.getToken();
                if (token) {
                  const user = authService.getUser();
                  if (user?.role === 'admin' || user?.role === 'worker') {
                    router.push('/dashboard');
                  } else {
                    router.push('/user-landing');
                  }
                } else {
                  router.push('/');
                }
              }}
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors duration-200 text-center"
            >
              ← Back
            </button>
            <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200 text-center">
              Login / Sign Up →
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 text-sm">Secure Environmental Reporting</span>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="text-center">
            <div className="text-2xl mb-3">🌱</div>
            <h4 className="text-lg font-bold text-white mb-2">Environmental Monitoring Guidelines</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your manual reports complement our automated sensor network. All submissions are reviewed by environmental specialists and integrated into our monitoring system for comprehensive safety analysis and compliance reporting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
