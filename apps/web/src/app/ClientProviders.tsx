"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import { PermissionProvider } from "@/context/PermissionContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import QueryProvider from "./QueryProvider";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PermissionProvider>
          <SidebarProvider>
            <QueryProvider>{children}</QueryProvider>
          </SidebarProvider>
        </PermissionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
