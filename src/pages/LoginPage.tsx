import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/orders";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      return setError("Enter your email and password.");
    }

    setSubmitting(true);
    const { error: authError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });
    setSubmitting(false);

    if (authError) {
      setError("Those credentials did not match. Please try again.");
      return;
    }
    navigate(next, { replace: true });
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your intake or check on an order."
      footer={
        <>
          New to PeptideRx?{" "}
          <Link
            to={`/signup?next=${encodeURIComponent(next)}`}
            className="font-semibold text-brand hover:text-brand-hover"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
          <div className="mt-0.5 text-right">
            <Link
              to={
                email.trim()
                  ? `/reset-password?email=${encodeURIComponent(email.trim())}`
                  : "/reset-password"
              }
              className="text-[13px] font-medium text-brand hover:text-brand-hover"
            >
              Forgot password?
            </Link>
          </div>
        </Field>

        {error && (
          <p className="rounded-[10px] bg-[#f7e8e6] px-3.5 py-2.5 text-[13px] font-medium text-error">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
