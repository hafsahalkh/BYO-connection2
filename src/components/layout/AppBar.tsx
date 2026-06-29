import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/use-auth";

// Minimal authenticated top bar (no heavy sidebar in this slice).
export function AppBar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function logout() {
    await authClient.signOut();
    navigate("/", { replace: true });
  }

  return (
    <header className="border-b border-border bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="PeptideRx home">
          <Logo />
        </Link>
        <div className="flex items-center gap-5">
          <Link
            to="/catalog"
            className="text-[15px] font-medium text-muted transition-colors hover:text-ink"
          >
            Catalog
          </Link>
          {user && (
            <span className="hidden text-[14px] text-muted sm:block">
              {user.email}
            </span>
          )}
          <button
            onClick={logout}
            aria-label="Sign out"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-muted transition-colors hover:text-ink"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
