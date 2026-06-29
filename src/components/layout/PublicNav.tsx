import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/use-auth";

export function PublicNav() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-paper/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="PeptideRx home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-muted md:flex">
          <Link to="/catalog" className="transition-colors hover:text-ink">
            Catalog
          </Link>
          <a href="/#how-it-works" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="/#safety" className="transition-colors hover:text-ink">
            Safety
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {!isLoading && user ? (
            <>
              <Link
                to="/orders"
                className="hidden text-[15px] font-medium text-muted transition-colors hover:text-ink sm:block"
              >
                My orders
              </Link>
              <Button size="md" onClick={() => navigate("/catalog")}>
                Browse
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-[15px] font-medium text-muted transition-colors hover:text-ink sm:block"
              >
                Sign in
              </Link>
              <Button size="md" onClick={() => navigate("/catalog")}>
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
