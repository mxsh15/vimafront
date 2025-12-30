"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getMyPermissions } from "@/modules/auth/client-api";
import { useAuth } from "./AuthContext";

interface PermissionContextType {
  permissions: string[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  const loadPermissions = async () => {
    if (!isAuthenticated) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const perms = await getMyPermissions();
      setPermissions(perms);
    } catch (error) {
      console.error("[PermissionContext] Failed to load permissions:", error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [isAuthenticated, user]);

  const hasPermission = (permission: string): boolean => {
    if (!permission) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (...permissionNames: string[]): boolean => {
    if (permissionNames.length === 0) return true;
    return permissionNames.some((perm) => permissions.includes(perm));
  };

  const refreshPermissions = async () => {
    await loadPermissions();
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        loading,
        hasPermission,
        hasAnyPermission,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within PermissionProvider");
  }
  return context;
}
