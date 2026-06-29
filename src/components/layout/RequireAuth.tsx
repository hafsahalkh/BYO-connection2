import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/use-auth";

// Gate a route behind authentication. Unauthenticated users are sent to
// login with a `next` that returns them here after signing in.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    );
  }

  if (!user) {
    const next = location.pathname + location.search;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return <>{children}</>;
}
