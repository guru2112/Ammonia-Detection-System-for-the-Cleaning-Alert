"use client";
import React, { useEffect, useState } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler,
} from "chart.js";
import { useRouter } from "next/navigation";
import { authService, User } from "../../utils/auth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

interface SensorData {
  ammonia_ppm: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [data, setData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<Array<{
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);

  const fetchData = async () => {
    try {
      setConnectionStatus('connecting');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiBase}/api/ammonia`, {
        headers: authService.getAuthHeader(),
      });
      
      if (res.status === 401) {
        // Token expired or invalid
        authService.logout();
        router.push('/login');
        return;
      }
      
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
        setConnectionStatus('connected');
      } else {
        console.error("API did not return an array:", json);
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

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

      setUser(authService.getUser());
      setIsAuthenticated(true);
      fetchData();
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

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const handleManage = () => {
    router.push('/admin/manage');
  };

  const latest = data.length > 0 ? data[data.length - 1] : null;
  
  // Calculate stats
  const avgAmmonia = data.length > 0 ? data.reduce((sum, d) => sum + d.ammonia_ppm, 0) / data.length : 0;
  const maxAmmonia = data.length > 0 ? Math.max(...data.map(d => d.ammonia_ppm)) : 0;
  const alertLevel = latest && latest.ammonia_ppm > 6 ? 'high' : latest && latest.ammonia_ppm > 4 ? 'medium' : 'low';

  // Reuse the authService logout handler defined earlier; keep the reports handler here
  const handleReports = () => {
    router.push("/ReportsPage");
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

      {/* Floating Data Waves */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-r from-teal-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Modern Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-3xl">🔬</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  IoT Dashboard
                </h1>
                <p className="text-gray-300 mt-2 text-lg">Real-Time Environmental Monitoring</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    connectionStatus === 'connected' ? 'bg-green-400' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm font-medium ${
                    connectionStatus === 'connected' ? 'text-green-400' : 
                    connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'
                  } capitalize">{connectionStatus}</span>
                  {connectionStatus === 'connected' && (
                    <span className="text-xs text-gray-400">• Live sensor data</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              {user && (
                <div className="hidden md:flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-gray-300 text-xs">{user.email}</p>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              {(user?.role === 'admin' || user?.role === 'worker') && (
                <button
                  onClick={handleReports}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-2xl font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  <span>📑</span>
                  <span>Reports</span>
                </button>
              )}
              {user?.role === 'admin' && (
                <button
                  onClick={handleManage}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 px-6 py-3 rounded-2xl font-semibold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  <span>🛠️</span>
                  <span>Manage</span>
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-4 py-3 rounded-2xl border border-red-400/30 transition-all duration-300"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-white/30 border-t-cyan-400 rounded-full animate-spin mb-6"></div>
              <p className="text-xl text-white">Loading sensor data...</p>
              <p className="text-sm text-gray-300 mt-2">Connecting to IoT monitoring system</p>
            </div>
          )}

          {/* Main Dashboard Content */}
          {!isLoading && (
            <>
              {/* Real-Time Metrics Grid */}
              {latest && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {/* Current Ammonia Card */}
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🧪</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        alertLevel === 'high' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                        alertLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                        'bg-green-500/20 text-green-300 border border-green-400/30'
                      }`}>
                        {alertLevel.toUpperCase()}
                      </div>
                    </div>
                    <h3 className="text-gray-300 text-sm font-medium mb-2">Ammonia Level</h3>
                    <p className="text-3xl font-bold text-white mb-2">{latest.ammonia_ppm.toFixed(2)}</p>
                    <p className="text-gray-400 text-sm">ppm • Threshold: 15 ppm</p>
                    <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          alertLevel === 'high' ? 'bg-red-500' :
                          alertLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((latest.ammonia_ppm / 15) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Temperature Card */}
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🌡️</span>
                      </div>
                      <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-gray-300 text-sm font-medium mb-2">Temperature</h3>
                    <p className="text-3xl font-bold text-white mb-2">{latest.temperature.toFixed(1)}</p>
                    <p className="text-gray-400 text-sm">°Celsius • DHT11 Sensor</p>
                  </div>

                  {/* Humidity Card */}
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">💧</span>
                      </div>
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-gray-300 text-sm font-medium mb-2">Humidity</h3>
                    <p className="text-3xl font-bold text-white mb-2">{latest.humidity.toFixed(1)}</p>
                    <p className="text-gray-400 text-sm">% • Environmental Monitor</p>
                  </div>

                  {/* Session Average Card */}
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full border border-purple-400/30">
                        AVG
                      </div>
                    </div>
                    <h3 className="text-gray-300 text-sm font-medium mb-2">Session Average</h3>
                    <p className="text-3xl font-bold text-white mb-2">{avgAmmonia.toFixed(2)}</p>
                    <p className="text-gray-400 text-sm">ppm • {data.length} readings</p>
                  </div>
                </div>
              )}

              {/* Advanced Analytics Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                {/* Main Trend Chart */}
                <div className="xl:col-span-2 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-cyan-400 mb-2">Ammonia Trend Analysis</h2>
                      <p className="text-gray-300 text-sm">Real-time environmental monitoring</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-xl text-sm font-medium border border-cyan-400/30">
                        {data.length} readings
                      </div>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-80">
                    <Line
                      data={{
                        labels: data.map((d) =>
                          new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                        ),
                        datasets: [
                          {
                            label: "Ammonia Level (ppm)",
                            data: data.map((d) => d.ammonia_ppm),
                            borderColor: "rgb(34, 211, 238)",
                            backgroundColor: "rgba(34, 211, 238, 0.1)",
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: "rgb(34, 211, 238)",
                            pointBorderColor: "#0f172a",
                            pointBorderWidth: 2,
                            pointRadius: 5,
                            pointHoverRadius: 8,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: {
                              color: "#e2e8f0",
                              font: { size: 14, weight: 'bold' }
                            }
                          },
                          tooltip: {
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            titleColor: "#f1f5f9",
                            bodyColor: "#cbd5e1",
                            borderColor: "#334155",
                            borderWidth: 1,
                          }
                        },
                        scales: {
                          x: {
                            ticks: { color: "#94a3b8", font: { size: 12 } },
                            grid: { color: "rgba(148, 163, 184, 0.1)" },
                          },
                          y: {
                            ticks: { color: "#94a3b8", font: { size: 12 } },
                            grid: { color: "rgba(148, 163, 184, 0.1)" },
                            beginAtZero: true,
                          },
                        },
                        interaction: {
                          intersect: false,
                          mode: 'index' as const,
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-purple-400 mb-2">Alert Distribution</h2>
                    <p className="text-gray-300 text-sm">Safety level analysis</p>
                  </div>
                  <div className="h-80 flex flex-col justify-center">
                    <Doughnut
                      data={{
                        labels: ['Safe', 'Warning', 'Critical'],
                        datasets: [{
                          data: [
                            data.filter(d => d.ammonia_ppm <= 4).length,
                            data.filter(d => d.ammonia_ppm > 4 && d.ammonia_ppm <= 6).length,
                            data.filter(d => d.ammonia_ppm > 6).length,
                          ],
                          backgroundColor: [
                            '#22c55e',
                            '#f59e0b', 
                            '#ef4444'
                          ],
                          borderColor: [
                            '#166534',
                            '#92400e', 
                            '#991b1b'
                          ],
                          borderWidth: 2,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                            labels: {
                              color: "#e2e8f0",
                              font: { size: 12, weight: 'bold' },
                              padding: 20,
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Data Table */}
              <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-green-400 mb-2">Recent Sensor Readings</h2>
                      <p className="text-gray-300">Live data updates every 5 seconds</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Live Stream</span>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Ammonia (ppm)</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Temperature (°C)</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Humidity (%)</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {data.slice(-10).reverse().map((d, i) => {
                        const status = d.ammonia_ppm > 6 ? 'critical' : d.ammonia_ppm > 4 ? 'warning' : 'safe';
                        return (
                          <tr key={i} className="hover:bg-white/5 transition-all duration-200 border-b border-white/5">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(d.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-bold ${
                                status === 'critical' ? 'text-red-400' :
                                status === 'warning' ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                                {d.ammonia_ppm.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                              {d.temperature.toFixed(1)}°C
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                              {d.humidity.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full border ${
                                status === 'critical' ? 'bg-red-500/20 text-red-300 border-red-400/30' :
                                status === 'warning' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' :
                                'bg-green-500/20 text-green-300 border-green-400/30'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                  status === 'critical' ? 'bg-red-400' :
                                  status === 'warning' ? 'bg-yellow-400' : 'bg-green-400'
                                } animate-pulse`}></div>
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* IoT System Status Footer */}
              <div className="mt-12 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto">
                      <span className="text-2xl">🔬</span>
                    </div>
                    <h3 className="text-lg font-bold text-blue-400">ESP32 Controller</h3>
                    <p className="text-gray-300 text-sm">IoT microcontroller managing sensor data collection and wireless transmission</p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto">
                      <span className="text-2xl">🌡️</span>
                    </div>
                    <h3 className="text-lg font-bold text-orange-400">DHT11 & MQ-137</h3>
                    <p className="text-gray-300 text-sm">Temperature, humidity, and ammonia gas concentration monitoring sensors</p>
                  </div>
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto">
                      <span className="text-2xl">☁️</span>
                    </div>
                    <h3 className="text-lg font-bold text-teal-400">Cloud Analytics</h3>
                    <p className="text-gray-300 text-sm">MongoDB Atlas database with real-time data processing and alerting system</p>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-gray-400 text-sm">
                    Developed by Final Year IT Students, VPPCOE Mumbai – Guided by Dr. Sonali Pakhmode (2025)
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
