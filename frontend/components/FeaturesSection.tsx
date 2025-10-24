import React from 'react';

const features = [
  {
    icon: "�",
    title: "Smart Alert System",
    description: "Automated notifications when ammonia levels exceed safe thresholds with customizable alert frequencies.",
    color: "from-orange-400 to-red-400",
    bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
    borderColor: "border-orange-200"
  },
  {
    icon: "📊",
    title: "Real-time Analytics",
    description: "Live charts and graphs showing ammonia, temperature, and humidity trends over time.",
    color: "from-blue-400 to-cyan-400",
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
    borderColor: "border-blue-200"
  },
  {
    icon: "🎯",
    title: "Threshold Monitoring",
    description: "Configurable safety thresholds with instant detection when conditions require attention.",
    color: "from-green-400 to-emerald-400",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
    borderColor: "border-green-200"
  },
  {
    icon: "📧",
    title: "Email Persistence",
    description: "Persistent email alerts: the system will resend alert emails at configured intervals until an incident is acknowledged or resolved.",
    color: "from-purple-400 to-pink-400",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
    borderColor: "border-purple-200"
  },
  {
    icon: "�",
    title: "Manual Alert Fallback",
    description: "If a device fails to send alerts, staff can submit manual alerts which integrate into the same alerting workflow to ensure incidents are recorded and escalated.",
    color: "from-indigo-400 to-purple-400",
    bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
    borderColor: "border-indigo-200"
  },
  {
    icon: "🌙",
    title: "24/7 Monitoring",
    description: "Round-the-clock surveillance with no downtime, ensuring continuous facility safety.",
    color: "from-cyan-400 to-blue-400",
    bgColor: "bg-gradient-to-br from-cyan-50 to-blue-50",
    borderColor: "border-cyan-200"
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-20 px-6 bg-gradient-to-br from-white via-blue-50 to-purple-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 border border-purple-200 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-semibold">✨ Core Features</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Powerful
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Monitoring Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
            🎯 Comprehensive environmental monitoring with cutting-edge technology designed for 
            industrial safety and compliance excellence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`group relative ${feature.bgColor} rounded-3xl p-6 md:p-8 min-h-[220px] border-2 ${feature.borderColor} hover:border-transparent transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
              role="article"
              aria-labelledby={`feature-${idx}`}
            >
              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10`}></div>
              
              {/* Icon (badge) */}
              <div className="mb-4 md:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 text-2xl md:text-3xl shadow-sm transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h3 id={`feature-${idx}`} className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {feature.description}
              </p>

              {/* Hover Arrow */}
              <div className={`absolute bottom-6 right-6 w-10 h-10 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex items-center justify-center`}>
                <span className="text-white font-bold">→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-12 max-w-4xl mx-auto border-2 border-purple-200 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              🚀 Ready to Enhance Your Facility Safety?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join industry leaders who trust our Cleaning Alert System for uncompromising environmental monitoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="#dashboard" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3"
              >
                ✨ Start Monitoring Today
              </a>
              <a 
                href="#manual" 
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:border-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all flex items-center gap-3"
              >
                📝 Manual Report
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;