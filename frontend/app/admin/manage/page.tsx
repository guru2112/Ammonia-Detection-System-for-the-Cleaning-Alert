"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, User } from "../../../utils/auth";

interface Worker {
  id: string;
  name: string;
  email: string;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface ActivityLog {
  id: string;
  event_type: string;
  actor?: string;
  timestamp: string;
  details?: Record<string, any>;
}

export default function AdminManage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // form state for new/edit worker
  const [form, setForm] = useState<{ id?: string; name: string; email: string; password: string }>({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [wRes, uRes, lRes] = await Promise.all([
        fetch(`${apiBase}/api/workers`, { headers: authService.getAuthHeader() }),
        fetch(`${apiBase}/api/users`, { headers: authService.getAuthHeader() }),
        fetch(`${apiBase}/api/activity-logs?limit=100`, { headers: authService.getAuthHeader() }),
      ]);
      if (wRes.status === 401 || uRes.status === 401 || lRes.status === 401) {
        authService.logout();
        router.push("/login");
        return;
      }
      if (!wRes.ok || !uRes.ok || !lRes.ok) {
        setError("Failed to load management data");
        return;
      }
      const [wData, uData, lData] = await Promise.all([wRes.json(), uRes.json(), lRes.json()]);
      setWorkers(wData);
      setUsers(uData);
      setLogs(lData);
    } catch (e) {
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = authService.getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      const valid = await authService.verifyToken();
      if (!valid) {
        router.push("/login");
        return;
      }
      const u = authService.getUser();
      setUser(u);
      setIsAuthenticated(true);
      if (u?.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      fetchAll();
    };
    init();
  }, [router]);

  const resetForm = () => setForm({ name: "", email: "", password: "" });

  const saveWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `${apiBase}/api/workers/${form.id}` : `${apiBase}/api/workers`;
      const payload: any = { name: form.name, email: form.email };
      if (!form.id || form.password) payload.password = form.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authService.getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save worker");
        return;
      }
      setSuccess("Worker saved successfully");
      resetForm();
      fetchAll();
    } catch (e) {
      setError("Network error while saving worker");
    } finally {
      setSaving(false);
    }
  };

  const editWorker = (w: Worker) => {
    setForm({ id: w.id, name: w.name, email: w.email, password: "" });
  };

  const deleteWorker = async (id: string) => {
    if (!confirm("Delete this worker?")) return;
    try {
      const res = await fetch(`${apiBase}/api/workers/${id}`, {
        method: "DELETE",
        headers: authService.getAuthHeader(),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete");
        return;
      }
      fetchAll();
    } catch (e) {
      setError("Network error while deleting worker");
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Admin Management</h1>
          <div className="flex gap-3">
            <button onClick={() => router.push("/dashboard")} className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl">Dashboard</button>
            <button onClick={() => { authService.logout(); router.push("/login"); }} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30 px-4 py-2 rounded-xl">Logout</button>
          </div>
        </div>

        {error && <div className="mb-4 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl">{error}</div>}
        {success && <div className="mb-4 bg-green-500/20 border border-green-400/30 text-green-200 px-4 py-3 rounded-xl">{success}</div>}

        {/* Worker Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-cyan-300">Staff / Workers</h2>
              <span className="text-sm text-gray-300">{workers.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-300 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-300 uppercase">Email</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {workers.map(w => (
                    <tr key={w.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">{w.name}</td>
                      <td className="px-4 py-3 text-gray-300">{w.email}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => editWorker(w)} className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg border border-yellow-400/30 mr-2">Edit</button>
                        <button onClick={() => deleteWorker(w.id)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-400/30">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create / Edit Worker */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-emerald-300 mb-4">{form.id ? 'Edit Worker' : 'Add New Worker'}</h2>
            <form onSubmit={saveWorker} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">{form.id ? 'New Password (optional)' : 'Password'}</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl" placeholder={form.id ? 'Leave blank to keep unchanged' : ''} />
              </div>
              <div className="flex gap-2">
                <button disabled={saving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl">{saving ? 'Saving...' : (form.id ? 'Update' : 'Create')}</button>
                {form.id && <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-xl">Cancel</button>}
              </div>
            </form>
          </div>
        </div>

        {/* Users and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-300">Registered Users</h2>
              <span className="text-sm text-gray-300">{users.length} total</span>
            </div>
            <ul className="space-y-2 max-h-80 overflow-auto pr-2">
              {users.map(u => (
                <li key={u.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-gray-300">{u.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-purple-300">Activity Logs</h2>
              <button onClick={fetchAll} className="text-sm px-3 py-1 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20">Refresh</button>
            </div>
            <ul className="space-y-2 max-h-80 overflow-auto pr-2">
              {logs.map(l => (
                <li key={l.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-200">{l.event_type.replaceAll('_',' ')}</div>
                    <div className="text-xs text-gray-400">{new Date(l.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-400">{l.actor || 'system'}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
