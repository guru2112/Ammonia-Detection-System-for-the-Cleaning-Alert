import React from 'react';

const About = () => {
  return (
    <section id="about" className="relative py-20 px-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 border border-purple-200 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-semibold">🌟 About CleanAlert Pro</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Revolutionizing
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Environmental Safety
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
            🛡️ We're committed to creating safer industrial environments through innovative 
            ammonia monitoring technology and real-time alert systems.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Story */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-8 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">📖 Our Story</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Founded with a vision to transform industrial safety standards, CleanAlert Pro emerged from 
                recognizing the critical need for reliable ammonia monitoring in agriculture, manufacturing, 
                and cold storage facilities.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our team of environmental engineers and software developers created a comprehensive solution 
                that detects hazardous ammonia levels and provides actionable insights with persistent alerts.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <h3 className="text-2xl font-bold mb-4">🎯 Our Mission</h3>
              <p className="text-purple-100 text-lg leading-relaxed">
                To protect workers, facilities, and the environment through cutting-edge monitoring 
                technology that prevents ammonia-related incidents before they occur.
              </p>
            </div>
          </div>

          {/* Stats & Features */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "24/7", label: "Monitoring", color: "from-blue-400 to-cyan-400" },
                { value: "99.9%", label: "Uptime", color: "from-green-400 to-emerald-400" },
                { value: "50+", label: "Facilities", color: "from-purple-400 to-pink-400" },
                { value: "0", label: "Major Incidents", color: "from-orange-400 to-red-400" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-6 border-2 border-gray-200 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Commitment */}
            <div className="bg-gradient-to-br from-white to-pink-50 rounded-3xl p-8 border-2 border-pink-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">💫 Our Commitment</h3>
              <div className="space-y-6">
                {[
                  { icon: "🛡️", title: "Safety First", desc: "Worker and environmental protection is our top priority", color: "text-blue-500" },
                  { icon: "🚀", title: "Innovation Driven", desc: "Continuous R&D to stay ahead of industry needs", color: "text-purple-500" },
                  { icon: "🤝", title: "Customer Focused", desc: "Tailored solutions for unique facility challenges", color: "text-pink-500" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 group hover:scale-105 transition-transform duration-300">
                    <div className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</div>
                    <div>
                      <h4 className={`font-semibold text-gray-900 ${item.color}`}>{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-12 border-2 border-cyan-200 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              🎉 Ready to Get Started?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join the growing number of facilities ensuring safety with CleanAlert Pro.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="#home" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3"
              >
                ✨ Start Free Trial
              </a>
              <a 
                href="#features" 
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:border-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all flex items-center gap-3"
              >
                📚 View Features
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;