/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import api from "../api/axios";
import type { User, UserRole } from "../types";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface MeResponse {
  id: number;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreUser = async () => {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<MeResponse>("/me");

        const storedUser = localStorage.getItem("user");
        const parsedUser: User | null = storedUser
          ? (JSON.parse(storedUser) as User)
          : null;

        setUser({
          id: response.data.id,
          name: response.data.name,
          role: response.data.role,
          email: parsedUser?.email ?? "",
        });
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<LoginResponse>("/login", {
      email,
      password,
    });

    const { access_token, refresh_token, user: loggedInUser } =
      response.data;

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setUser(null);
    window.location.replace("/login");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};