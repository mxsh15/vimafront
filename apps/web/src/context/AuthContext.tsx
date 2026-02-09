"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/client-api";
import { logoutAction } from "@/modules/auth/actions";
import { UserDto } from "@/modules/auth/types";

interface AuthContextType {
  user: UserDto | null;
  loading: boolean;
  login: (user: UserDto) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  function login(userData: UserDto) {
    setUser(userData);
  }

  function logout() {
    // HttpOnly cookie را فقط سرور می‌تواند پاک کند
    logoutAction().finally(() => {
      setUser(null);
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
