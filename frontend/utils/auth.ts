// Authentication utilities for token management

export interface User {
  name: string;
  email: string;
  role: 'admin' | 'worker' | 'user';
}

class AuthService {
  private tokenKey = "authToken";
  private userKey = "userInfo";

  // Get stored token
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.tokenKey);
  }

  // Get stored user info
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Store authentication data
  setAuth(token: string, user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Clear authentication data
  logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Get authorization header for API requests
  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Verify token with server
  async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiBase}/api/verify-token`, {
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        this.logout(); // Clear invalid token
        return false;
      }
      const data = await response.json();
      if (data?.user) {
        // keep local user in sync (esp. role)
        this.setAuth(token, data.user as User);
      }
      return true;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  }
}

export const authService = new AuthService();