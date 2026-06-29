import { authClient } from "@/lib/auth-client";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
};

// Thin wrapper over Better Auth's reactive session hook.
export function useAuth(): AuthState {
  const session = authClient.useSession();
  const data = session.data;
  const user = data?.user
    ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      }
    : null;
  return {
    user,
    isLoading: session.isPending,
  };
}
