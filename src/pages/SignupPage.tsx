import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function SignupPage() {
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

    if (!email.trim()) return setError("Please enter your email.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");

    setSubmitting(true);
    // Better Auth requires a name; we derive a placeholder from the email.
    // Real name is collected in the first intake step, never in signup.
    const { error: authError } = await authClient.signUp.email({
      email: email.trim(),
      password,
      name: email.split("@")[0],
    });
    setSubmitting(false);

    if (authError) {
      setError(
        authError.message ?? "We could not create your account. Try again.",
      );
      return;
    }
    navigate(next, { replace: true });
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One account for browsing, intake, and tracking your orders."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-brand hover:text-brand-hover"
          >
            Sign in
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
        <Field
          label="Password"
          htmlFor="password"
          required
          hint="At least 8 characters."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
        </Field>

        {error && (
          <p className="rounded-[10px] bg-[#f7e8e6] px-3.5 py-2.5 text-[13px] font-medium text-error">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? "Creating account..." : "Create account"}
        </Button>
        <p className="text-center text-[12px] leading-relaxed text-muted">
          By continuing you agree to a private, clinician-reviewed intake. We
          collect your details on the next screens, not here.
        </p>
      </form>
    </AuthLayout>
  );
}
