"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "../../utils/auth";

interface Location {
  country: string;
  state: string;
  city: string;
  postcode: string;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
}

interface Report {
  name: string;
  email: string;
  latitude: number;
  longitude: number;
  location: Location;
  comments: string;
  timestamp: string;
  id?: string;
  // Note: status fields retained only for display if present from backend
  status?: string;
  deactivated_by?: string;
  deactivated_at?: string;
}

const ReportsPage = () => {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<Array<{
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);

  // Filter states
  const [filterCity, setFilterCity] = useState("");
  const [filterPostcode, setFilterPostcode] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);

  // Modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    try {
      let url = process.env.NEXT_PUBLIC_API_URL + (showDeactivated ? "/api/deactivated-reports" : "/api/manual-reports");

      const params = new URLSearchParams();
      if (filterCity) params.append("city", filterCity);
      if (filterPostcode) params.append("postcode", filterPostcode);
      if (filterDateFrom) params.append("date_from", filterDateFrom);
      if (filterDateTo) params.append("date_to", filterDateTo);

      if (params.toString()) url += "?" + params.toString();

      const res = await fetch(url, {
        headers: authService.getAuthHeader(),
      });

      if (res.status === 401) {
        authService.logout();
        router.push('/login');
        return;
      }

      const data = await res.json();

      if (res.status === 200) {
        // Ensure reports are ordered newest -> oldest by timestamp
        try {
          data.sort((a: Report, b: Report) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (e) {
          console.warn('Failed to sort reports by timestamp', e);
        }
        setReports(data);
      } else {
        setError(data.error || "Failed to fetch reports");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching reports");
    } finally {
      setLoading(false);
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

      const u = authService.getUser();
      setUser(u);
      setIsAuthenticated(true);
      // Only staff/admin can access this page; normal users are redirected to manual alert form
      if (u?.role === 'admin' || u?.role === 'worker') {
        fetchReports();
      } else {
        router.push('/AlertForm');
      }
    };

    setIsClient(true);
    
    // Generate particles only on client side
    const generatedParticles = Array.from({ length: 30 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }));
    setParticles(generatedParticles);

    checkAuth();
  }, [router]);

  // Refetch when toggling between active and deactivated view
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeactivated]);

  // Apply filter button
  const handleFilter = () => {
    setLoading(true);
    fetchReports();
  };

  // Simple delete function that triggers backend and refreshes list
  const deleteReport = async (id?: string, fallbackTimestamp?: string) => {
    const reportId = id || fallbackTimestamp;
    if (!reportId) return;
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const encoded = encodeURIComponent(reportId);
      await fetch(`${baseUrl}/api/reports/${encoded}`, {
        method: 'DELETE',
        headers: authService.getAuthHeader()
      });
      fetchReports();
    } catch (err) {
      console.error(err);
      setError('Error deleting report');
    }
  };

  // Simple deactivate function (moves report to deactivated_reports on backend)
  const deactivateReport = async (id?: string, fallbackTimestamp?: string) => {
    const reportId = id || fallbackTimestamp;
    if (!reportId) return;
    if (!confirm('Are you sure you want to deactivate this report?')) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const encoded = encodeURIComponent(reportId);
      await fetch(`${baseUrl}/api/reports/${encoded}/deactivate`, {
        method: 'PUT',
        headers: authService.getAuthHeader()
      });
      fetchReports();
    } catch (err) {
      console.error(err);
      setError('Error deactivating report');
    }
  };

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
            <span className="text-2xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Reports</h2>
          <p className="text-gray-300 mb-6">Verifying access and fetching data...</p>
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
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-3xl">📊</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Manual Reports
                </h1>
                <p className="text-gray-300 mt-2 text-lg">IoT Environmental Monitoring System</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Live Data Stream</span>
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
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 px-6 py-3 rounded-2xl font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <span>📈</span>
                <span>Dashboard</span>
              </button>
              
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-4 py-3 rounded-2xl border border-red-400/30 transition-all duration-300"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🔍</span>
              </div>
              <h2 className="text-2xl font-bold text-cyan-400">Smart Filters</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">City Location</label>
                <input
                  type="text"
                  placeholder="Enter city name..."
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Postal Code</label>
                <input
                  type="text"
                  placeholder="Enter postcode..."
                  value={filterPostcode}
                  onChange={(e) => setFilterPostcode(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Date From</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Date To</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Found <span className="text-cyan-400 font-semibold">{reports.length}</span> reports
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleFilter}
                  disabled={loading}
                  className="flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-6 py-3 rounded-2xl font-semibold shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Apply Filters
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDeactivated(v => !v)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold border transition-all duration-300 ${showDeactivated ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-400/30' : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border-gray-400/30'}`}
                >
                  {showDeactivated ? 'Viewing Deactivated' : 'View Deactivated'}
                </button>
              </div>
            </div>
          </div>



          {/* Reports Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-white/30 border-t-cyan-400 rounded-full animate-spin mb-6"></div>
              <p className="text-xl text-gray-300">Loading environmental reports...</p>
              <p className="text-sm text-gray-400 mt-2">Analyzing sensor data and manual submissions</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">Error Loading Reports</h3>
              <p className="text-red-300">{error}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📭</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-400 mb-2">No Reports Found</h3>
              <p className="text-gray-300">Try adjusting your filters or check back later for new reports.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report, index) => (
                <div
                  key={index}
                  className={`bg-white/5 backdrop-blur-md rounded-3xl p-6 border shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-cyan-500/10 ${
                    report.status === 'deactivated' 
                      ? 'border-red-400/30 bg-red-900/10' 
                      : 'border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Report Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{report.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{report.name}</h3>
                        <p className="text-xs text-gray-400">{report.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {report.status === 'deactivated' ? (
                        <>
                          <div className="w-3 h-3 bg-red-400 rounded-full mb-1"></div>
                          <span className="text-xs text-red-400">Deactivated</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mb-1"></div>
                          <span className="text-xs text-green-400">Active</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-400">📍</span>
                      <span className="text-blue-400 font-medium text-sm">{report.location.city}</span>
                    </div>
                    {report.location.postcode && (
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">🏠</span>
                        <span className="text-purple-400 text-sm">{report.location.postcode}</span>
                      </div>
                    )}
                  </div>

                  {/* Comments Preview */}
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {report.comments.length > 100 
                        ? report.comments.substring(0, 100) + "..." 
                        : report.comments}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">🕐</span>
                      <span className="text-cyan-400 text-xs">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(report.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 space-y-2">
                    <button 
                      onClick={() => setSelectedReport(report)}
                      className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/30 text-cyan-300 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                    >
                      View Full Details →
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      {!showDeactivated && (user?.role === 'admin' || user?.role === 'worker') && (
                        <button
                          onClick={() => deactivateReport(report.id, report.timestamp)}
                          className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 text-yellow-300 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                        >
                          ⏸️ Deactivate
                        </button>
                      )}
                      {(user?.role === 'admin' || user?.role === 'worker') && (
                        <button
                          onClick={() => deleteReport(report.id, report.timestamp)}
                          className={`w-full bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${showDeactivated ? 'col-span-2' : ''}`}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Modal */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Modal Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 p-6 rounded-t-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">{selectedReport.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Report Details</h3>
                        <p className="text-gray-400">Environmental monitoring data</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl flex items-center justify-center text-red-300 hover:text-red-200 transition-all duration-300"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-8">
                  {/* User Information */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                      <span>👤</span> Reporter Information
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Full Name</label>
                        <p className="text-white font-medium">{selectedReport.name}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Email Address</label>
                        <p className="text-white font-medium">{selectedReport.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                      <span>📍</span> Location Details
                    </h4>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Country</label>
                        <p className="text-white font-medium">{selectedReport.location.country}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">State/Province</label>
                        <p className="text-white font-medium">{selectedReport.location.state}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">City</label>
                        <p className="text-white font-medium">{selectedReport.location.city}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Postal Code</label>
                        <p className="text-white font-medium">{selectedReport.location.postcode}</p>
                      </div>
                      {selectedReport.location.road && (
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Road/Street</label>
                          <p className="text-white font-medium">{selectedReport.location.road}</p>
                        </div>
                      )}
                      {selectedReport.location.suburb && (
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Suburb</label>
                          <p className="text-white font-medium">{selectedReport.location.suburb}</p>
                        </div>
                      )}
                      {selectedReport.location.neighbourhood && (
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Neighbourhood</label>
                          <p className="text-white font-medium">{selectedReport.location.neighbourhood}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                      <span>📝</span> Report Content
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-2">Comments & Description</label>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white leading-relaxed">{selectedReport.comments}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp Information */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                      <span>🕐</span> Submission Details
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Date Submitted</label>
                        <p className="text-white font-medium">{new Date(selectedReport.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Time Submitted</label>
                        <p className="text-white font-medium">{new Date(selectedReport.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 text-gray-300 rounded-xl font-medium transition-all duration-300"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
