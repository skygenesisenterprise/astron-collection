"use client";

import * as React from "react";
import { DashboardShell } from '@/components/admin/dashboard-shell'
import { useAuth } from "@/context/AuthContext";
import { isProfileSelected, setProfileSelected, saveSelectedProfile } from "@/lib/profile-selection";
import { profileApi } from "@/lib/api/profiles";
import { getDomainUrl } from "@/lib/domains";
import { RouteTransition } from "@/components/route-transition";

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isAuthenticated, isLoading } = useAuth();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      window.location.href = getDomainUrl('sso', '/login');
      return;
    }

    if (isProfileSelected()) {
      setReady(true);
      return;
    }

    // Profile not selected — auto-select from server instead of redirecting
    profileApi.list().then((profiles) => {
      if (profiles.length === 0) {
        // No profiles at all — must go to profile-change
        const returnTo = encodeURIComponent(window.location.href);
        window.location.href = getDomainUrl('sso', `/profile-change?redirect=${returnTo}`);
        return;
      }

      // Pick the default profile, or fall back to the first one
      const profile = profiles.find((p) => p.isDefault) ?? profiles[0];

      // Save locally + cookie
      saveSelectedProfile({
        id: profile.id,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      });
      setProfileSelected(true);

      // Persist selection on the server in the background
      profileApi.select(profile.id).catch(() => {});

      setReady(true);
    }).catch(() => {
      // API error — redirect to profile-change as last resort
      const returnTo = encodeURIComponent(window.location.href);
      window.location.href = getDomainUrl('sso', `/profile-change?redirect=${returnTo}`);
    });
  }, [isAuthenticated, isLoading]);

  if (isLoading || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          <span>Vérification de la session…</span>
        </div>
      </div>
    );
  }

  return (
    <RouteTransition>
      <DashboardShell>{children}</DashboardShell>
    </RouteTransition>
  )
}
