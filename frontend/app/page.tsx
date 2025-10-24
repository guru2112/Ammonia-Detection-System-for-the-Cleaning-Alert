"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<Array<{
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);

  useEffect(() => {
    setIsClient(true);
    
    // Generate particles only on client side
    const generatedParticles = Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }));
    setParticles(generatedParticles);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 text-white overflow-x-hidden">
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
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-r from-teal-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">🤖 AI-Powered IoT Monitoring</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              <span className="block">Smarter</span>
              <span className="block bg-gradient-to-r from-blue-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Cleaning.</span>
              <span className="block text-4xl md:text-5xl text-gray-300 mt-2">Safer Environments.</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
              AI-powered <span className="text-teal-400 font-semibold">ammonia detection</span> for 24/7 hygiene monitoring.
              Real-time sensor data from <span className="text-blue-400 font-semibold">MQ-137</span>, 
              <span className="text-cyan-400 font-semibold"> DHT11</span>, and 
              <span className="text-teal-400 font-semibold"> ESP32</span> ensures cleaner public spaces.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/login" className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-teal-500 px-8 py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                <span>🚀</span> Access Live Dashboard
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <button className="group inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300">
                <span>📖</span> Learn How It Works
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right: Sensor Visualization */}
          <div className="relative flex justify-center">
            <div className="relative w-80 h-80">
              {/* ESP32 Core */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-teal-500/30 rounded-3xl backdrop-blur-sm border border-white/20 flex items-center justify-center animate-pulse">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔬</div>
                  <div className="text-lg font-bold">ESP32</div>
                  <div className="text-sm text-gray-300">IoT Controller</div>
                </div>
              </div>

              {/* Floating Sensors */}
              <div className="absolute -top-8 -left-8 w-20 h-20 bg-gradient-to-br from-green-400/40 to-emerald-400/40 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center animate-bounce">
                <div className="text-center text-xs">
                  <div className="text-2xl">🌡️</div>
                  <div className="font-bold">DHT11</div>
                </div>
              </div>

              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-red-400/40 to-orange-400/40 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center animate-bounce delay-500">
                <div className="text-center text-xs">
                  <div className="text-2xl">💨</div>
                  <div className="font-bold">MQ-137</div>
                </div>
              </div>

              {/* Data Flow Lines */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="dataFlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <path d="M80 80 Q200 120 280 160" stroke="url(#dataFlow)" strokeWidth="3" fill="none" strokeDasharray="10,5" className="animate-pulse" />
                <path d="M280 80 Q200 120 80 160" stroke="url(#dataFlow)" strokeWidth="3" fill="none" strokeDasharray="10,5" className="animate-pulse delay-1000" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* System Overview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              System Overview
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced IoT sensors collaborate seamlessly to monitor air quality and automate cleaning protocols
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">📡</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-blue-400">Data Collection</h3>
              <p className="text-gray-300 leading-relaxed">
                MQ-137 gas sensors detect ammonia concentrations while DHT11 monitors temperature and humidity levels in real-time.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">☁️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-teal-400">Cloud Processing</h3>
              <p className="text-gray-300 leading-relaxed">
                ESP32 microcontroller transmits sensor data to MongoDB Atlas via secure wireless connections for analysis.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-purple-400">AI Alerts</h3>
              <p className="text-gray-300 leading-relaxed">
                Intelligent algorithms trigger automated email alerts when ammonia exceeds 15 ppm threshold levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Dashboard Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-400">Live Dashboard Preview</h2>
              <p className="text-xl text-gray-300">Real-time monitoring of environmental conditions</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-400/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-blue-400 text-sm font-medium">AMMONIA LEVEL</span>
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">8.5 <span className="text-lg text-gray-300">ppm</span></div>
                <div className="text-sm text-green-400">Normal Range</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-400/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-orange-400 text-sm font-medium">TEMPERATURE</span>
                  <span className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">24.2 <span className="text-lg text-gray-300">°C</span></div>
                <div className="text-sm text-orange-400">Optimal</div>
              </div>

              <div className="bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-2xl p-6 border border-teal-400/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-teal-400 text-sm font-medium">HUMIDITY</span>
                  <span className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">65 <span className="text-lg text-gray-300">%</span></div>
                <div className="text-sm text-teal-400">Good</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manual Report Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-purple-400">Manual Alert System</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                When sensors need attention or immediate cleaning is required, users can submit manual reports 
                directly to our MongoDB database with precise location tracking.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📍</span>
                  </div>
                  <span className="text-gray-300">GPS-based location detection</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm">💾</span>
                  </div>
                  <span className="text-gray-300">Instant MongoDB Atlas storage</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm">⚡</span>
                  </div>
                  <span className="text-gray-300">Real-time alert notifications</span>
                </div>
              </div>
              <a href="/AlertForm" className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-2xl font-semibold hover:shadow-purple-500/25 shadow-lg transition-all duration-300 transform hover:scale-105">
                <span>📝</span> Submit Manual Report
              </a>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Quick Report Form</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Location Detected</label>
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 text-green-400 text-sm">
                      📍 Mumbai, Maharashtra (Auto-detected)
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Issue Type</label>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-white">
                      High ammonia levels detected
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Priority Level</label>
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 text-red-400">
                      🚨 Urgent - Immediate cleaning required
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Swachh Bharat Integration */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
              Swachh Bharat Integration
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Supporting India's cleanliness mission through intelligent IoT monitoring
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏫</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">Educational Institutions</h3>
                  <p className="text-gray-300">Monitor air quality in schools and colleges to ensure healthy learning environments.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-400 mb-2">Public Facilities</h3>
                  <p className="text-gray-300">Automated monitoring of restrooms, parks, and community centers.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-400 mb-2">Environmental Impact</h3>
                  <p className="text-gray-300">Contributing to sustainable development goals through smart city initiatives.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-3xl p-8 border border-green-400/20">
                <div className="text-center">
                  <div className="text-8xl mb-4">🇮🇳</div>
                  <h3 className="text-2xl font-bold text-green-400 mb-4">Clean India Mission</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Our IoT solution directly supports the Swachh Bharat Abhiyan by providing 
                    real-time environmental monitoring and automated alerts for maintaining hygiene standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-teal-400 mb-2">Powered by IoE & AI</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Developed by Final Year IT Students, VPPCOE Mumbai – Guided by Dr. Sonali Pakhmode (2025)
            </p>
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <span className="text-xl">📧</span>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <span className="text-xl">🐙</span>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <span className="text-xl">💼</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="text-gray-400 text-sm">
              © 2025 Ammonia Detection System. Built for Swachh Bharat Abhiyan.
            </p>
          </div>
        </div>
      </footer>

      {/* AI Progress Indicator */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full shadow-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
          <div className="text-xl animate-pulse">🤖</div>
        </div>
      </div>
    </div>
  );
}