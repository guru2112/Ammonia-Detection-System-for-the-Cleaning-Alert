"use client";
import Link from "next/link";
import React from "react";
import { authService } from "../utils/auth";

const ManualAlerts = () => {
  return (
    <section id="manual" className="relative py-20 px-6 bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 mb-8 border border-orange-200 shadow-lg">
          <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
          <span className="text-gray-700 font-semibold">🛠️ Manual Reporting System</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Manual
          <span className="block bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Alert System
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          🔧 For situations where sensors require maintenance or for additional reporting needs, 
          use our manual alert system to ensure <span className="font-semibold text-orange-500">continuous safety compliance</span>.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all">🔧</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sensor Maintenance</h3>
            <p className="text-gray-600">Use when sensors are undergoing calibration, repair, or technical upgrades</p>
          </div>

          <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Additional Reports</h3>
            <p className="text-gray-600">Submit supplementary environmental condition documentation and compliance reports</p>
          </div>
        </div>

        {/* Main CTA */}
        <button
          onClick={async () => {
            // Check if user is authenticated first
            const token = authService.getToken();
            if (!token) {
              // User not logged in, redirect to login
              window.location.href = '/login';
              return;
            }
            
            // Verify token is still valid
            const isValid = await authService.verifyToken();
            if (isValid) {
              // Token is valid, go to form
              window.location.href = '/AlertForm';
            } else {
              // Token is invalid, redirect to login
              window.location.href = '/login';
            }
          }}
          className="group inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-12 py-6 rounded-2xl font-semibold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 mb-12 border-2 border-transparent hover:border-white/30"
        >
          <span className="flex items-center gap-4">
            📝 Submit Manual Report
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </span>
        </button>

        {/* Info Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-blue-200 shadow-lg max-w-2xl mx-auto hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4 mb-4 justify-center">
            <div className="text-3xl">💡</div>
            <h4 className="text-2xl font-bold text-gray-900">Reporting Guidelines</h4>
          </div>
          <p className="text-gray-600 text-lg bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            📋 Manual reports are integrated with automated sensor data and undergo administrator verification. 
            Ensure accurate timestamps and detailed observations for compliance auditing and safety records.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ManualAlerts;