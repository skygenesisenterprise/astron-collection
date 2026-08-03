"use client";

import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { LOGIN_ROUTE, DEFAULT_PLATFORM_ROUTE } from "@/lib/routes";
import { usePathname, useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[]; // Rôles requis pour accéder à la route
  requiredPermissions?: string[]; // Permissions requises pour accéder à la route
  redirectTo?: string; // URL de redirection si non autorisé (par défaut: LOGIN_ROUTE)
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermissions,
  redirectTo,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Vérifier si l'utilisateur a les rôles requis
  const hasRequiredRoles = React.useCallback(() => {
    if (!requiredRoles || !user?.roles) return true;
    return requiredRoles.some((role) => user.roles?.includes(role));
  }, [requiredRoles, user?.roles]);

  // Vérifier si l'utilisateur a les permissions requises
  const hasRequiredPermissions = React.useCallback(() => {
    if (!requiredPermissions || !user?.permissions) return true;
    return requiredPermissions.some((permission) => user.permissions?.includes(permission));
  }, [requiredPermissions, user?.permissions]);

  // Vérifier si l'utilisateur est autorisé
  const isAuthorized = React.useCallback(() => {
    return hasRequiredRoles() && hasRequiredPermissions();
  }, [hasRequiredRoles, hasRequiredPermissions]);

  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Non connecté -> rediriger vers login
      const redirectUrl = `${LOGIN_ROUTE}?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
      return;
    }

    if (!isAuthorized()) {
      // Connecté mais pas autorisé -> rediriger vers une page accessible
      const target = redirectTo || DEFAULT_PLATFORM_ROUTE || "/profile";
      router.push(target);
    }
  }, [isAuthenticated, isLoading, isAuthorized, router, pathname, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1f2022]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1f2022] px-6 text-center text-sm text-zinc-400">
        Redirection vers la connexion…
      </div>
    );
  }

  if (!isAuthorized()) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1f2022] px-6 text-center text-sm text-zinc-400">
        Accès non autorisé. Redirection…
      </div>
    );
  }

  return <>{children}</>;
}

// Composant simplifié pour les routes qui nécessitent juste l'authentification
export function AuthRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

// Composant pour les routes admin (nécessite rôle admin ou superadmin)
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin"]} redirectTo="/profile">
      {children}
    </ProtectedRoute>
  );
}

// Composant pour les routes dashboard (nécessite rôle admin, superadmin ou owner)
export function DashboardRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["admin", "superadmin", "owner"]} redirectTo="/profile">
      {children}
    </ProtectedRoute>
  );
}
