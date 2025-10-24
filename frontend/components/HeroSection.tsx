import React from 'react';

const HeroSection = () => {
  return (
  <section id="home" className="relative min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 overflow-hidden">
      {/* Decorative background shapes (reduced on small screens) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hidden md:block absolute top-16 left-8 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float" />
        <div className="hidden lg:block absolute top-40 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: content */}
          <div className="px-4">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-2 mb-6 border border-blue-200 shadow-sm">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse" />
              <span className="text-gray-700 font-semibold">🚀 Real-time Ammonia Monitoring Active</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
              Clean
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">Alert Pro</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed">
              Advanced ammonia detection that keeps your workforce safe with
              <span className="font-semibold text-blue-600"> real-time monitoring</span>,
              <span className="font-semibold text-purple-600"> instant alerts</span>, and
              <span className="font-semibold text-cyan-600"> actionable analytics</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <a href="#dashboard" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-transform">🚀 View Dashboard</a>
              <a href="#features" className="inline-flex items-center gap-3 border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-medium hover:bg-gray-50 transition">📚 Explore Features</a>
            </div>

            <div className="mt-8 max-w-xs">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-white/50 shadow-sm inline-block">
                <div className="text-xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Monitoring</div>
              </div>
            </div>
          </div>

          {/* Right: illustration */}
          <div className="px-4 flex items-center justify-center">
            <div className="w-full max-w-md bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl">
              <img src="/window.svg" alt="Monitoring illustration" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;