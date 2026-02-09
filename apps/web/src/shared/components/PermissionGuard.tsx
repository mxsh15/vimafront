"use client";

import { usePermissions } from "@/context/PermissionContext";
import { ReactNode } from "react";

interface PermissionGuardProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component برای نمایش شرطی محتوا بر اساس permission
 */
export function PermissionGuard({
  permission,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return null; // یا یک loading indicator
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AnyPermissionGuardProps {
  permissions: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component برای نمایش شرطی محتوا بر اساس داشتن حداقل یکی از permissions
 */
export function AnyPermissionGuard({
  permissions,
  fallback = null,
  children,
}: AnyPermissionGuardProps) {
  const { hasAnyPermission, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!hasAnyPermission(...permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

