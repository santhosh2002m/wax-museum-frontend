// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "../components/ui/use-toast";

export interface User {
  id: number;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    username: string,
    password: string,
    role: string
  ) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const url = `${baseUrl}${endpoint}`;

      const defaultOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          error.message || `Request failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message || "Network error. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const data = await makeRequest("/api/user/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      // Check if the response contains a token (adjust based on your API response)
      if (data.token) {
        setToken(data.token);
        setUser(
          data.user || {
            id: data.id,
            username: data.username,
            role: data.role,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          }
        );

        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user || {
              id: data.id,
              username: data.username,
              role: data.role,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            }
          )
        );

        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user?.username || data.username}!`,
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const register = async (
    username: string,
    password: string,
    role: string
  ): Promise<boolean> => {
    try {
      await makeRequest("/api/user/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password, role }),
      });

      toast({
        title: "Registration successful",
        description: `User ${username} has been created successfully`,
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      await makeRequest("/api/user/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear any cookies
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });

    // Navigate to login page
    window.location.href = "/login";
  };

  const value = {
    user,
    token,
    login,
    logout,
    register,
    changePassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
