// src/contexts/ApiContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "../components/ui/use-toast";

// Interfaces based on the API collection
export interface User {
  id: number;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: number;
  vehicle_type: string;
  guide_name: string;
  guide_number: string;
  show_name: string;
  adults: number;
  children: number;
  ticket_price: number;
  total_price: number;
  tax: number;
  final_amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Guide {
  id: number;
  name: string;
  number: string;
  vehicle_type: string;
  score: number;
  total_bookings: number;
  rating: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

interface ApiContextType {
  // Auth functions
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    password: string,
    role: string
  ) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;

  // Ticket functions
  createTicket: (
    ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt">
  ) => Promise<boolean>;
  getTickets: (filters?: {
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => Promise<Ticket[]>;
  deleteTicket: (id: number) => Promise<boolean>;

  // Guide functions
  getGuides: (filters?: {
    search?: string;
    status?: string;
    vehicle_type?: string;
  }) => Promise<Guide[]>;
  getTopGuides: (limit?: number) => Promise<Guide[]>;
  getGuide: (id: number) => Promise<Guide | null>;
  createGuide: (
    guideData: Omit<Guide, "id" | "createdAt" | "updatedAt">
  ) => Promise<boolean>;
  updateGuide: (id: number, guideData: Partial<Guide>) => Promise<boolean>;
  deleteGuide: (id: number) => Promise<boolean>;

  loading: boolean;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Auth functions
  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const data: AuthResponse = await makeRequest("/api/user/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.username}!`,
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

  // Ticket functions
  const createTicket = async (
    ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt">
  ): Promise<boolean> => {
    try {
      await makeRequest("/api/user/tickets", {
        method: "POST",
        body: JSON.stringify(ticketData),
      });

      toast({
        title: "Ticket created",
        description: "Ticket has been created successfully",
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const getTickets = async (
    filters: { startDate?: string; endDate?: string; search?: string } = {}
  ): Promise<Ticket[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.search) queryParams.append("search", filters.search);

      const queryString = queryParams.toString();
      const endpoint = `/api/user/tickets${
        queryString ? `?${queryString}` : ""
      }`;

      const data = await makeRequest(endpoint, {
        method: "GET",
      });

      return data;
    } catch (error) {
      return [];
    }
  };

  const deleteTicket = async (id: number): Promise<boolean> => {
    try {
      await makeRequest(`/api/user/tickets/${id}`, {
        method: "DELETE",
      });

      toast({
        title: "Ticket deleted",
        description: "Ticket has been deleted successfully",
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  // Guide functions
  const getGuides = async (
    filters: { search?: string; status?: string; vehicle_type?: string } = {}
  ): Promise<Guide[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.vehicle_type)
        queryParams.append("vehicle_type", filters.vehicle_type);

      const queryString = queryParams.toString();
      const endpoint = `/api/user/guides${
        queryString ? `?${queryString}` : ""
      }`;

      const data = await makeRequest(endpoint, {
        method: "GET",
      });

      return data;
    } catch (error) {
      return [];
    }
  };

  const getTopGuides = async (limit: number = 3): Promise<Guide[]> => {
    try {
      const data = await makeRequest(`/api/user/guides/top?limit=${limit}`, {
        method: "GET",
      });

      return data;
    } catch (error) {
      return [];
    }
  };

  const getGuide = async (id: number): Promise<Guide | null> => {
    try {
      const data = await makeRequest(`/api/user/guides/${id}`, {
        method: "GET",
      });

      return data;
    } catch (error) {
      return null;
    }
  };

  const createGuide = async (
    guideData: Omit<Guide, "id" | "createdAt" | "updatedAt">
  ): Promise<boolean> => {
    try {
      await makeRequest("/api/user/guides", {
        method: "POST",
        body: JSON.stringify(guideData),
      });

      toast({
        title: "Guide created",
        description: "Guide has been created successfully",
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const updateGuide = async (
    id: number,
    guideData: Partial<Guide>
  ): Promise<boolean> => {
    try {
      await makeRequest(`/api/user/guides/${id}`, {
        method: "PUT",
        body: JSON.stringify(guideData),
      });

      toast({
        title: "Guide updated",
        description: "Guide has been updated successfully",
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteGuide = async (id: number): Promise<boolean> => {
    try {
      await makeRequest(`/api/user/guides/${id}`, {
        method: "DELETE",
      });

      toast({
        title: "Guide deleted",
        description: "Guide has been deleted successfully",
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const value = {
    login,
    register,
    changePassword,
    createTicket,
    getTickets,
    deleteTicket,
    getGuides,
    getTopGuides,
    getGuide,
    createGuide,
    updateGuide,
    deleteGuide,
    loading,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
