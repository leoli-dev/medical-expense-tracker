import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { loginAPI } from "../api/auth.api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Eye, EyeSlash, Receipt } from "@phosphor-icons/react";
export function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Read the actual inputs: password managers may fill them without React events.
    const data = new FormData(e.currentTarget);
    setError(null);
    setLoading(true);
    try {
      const result = await loginAPI(
        String(data.get("username") || ""),
        String(data.get("password") || ""),
      );
      login(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="login-page">
      <div className="login-layout">
        <div className="login-intro">
          <a href="/" className="brand">
            <img src="/favicon.svg" alt="" />
            <span>MedExpense</span>
          </a>
          <div className="login-story">
            <Receipt size={48} weight="light" />
            <h1>
              Your health expenses.
              <br />
              All accounted for.
            </h1>
            <p>
              Keep receipts, track reimbursements, and bring your medical
              expenses together in one place.
            </p>
          </div>
          <p className="login-footnote">Medical Expense Tracker</p>
        </div>
        <section className="login-card">
          <h2>Welcome back</h2>
          <p>Sign in to your expense tracker.</p>
          <form
            id="login-form"
            action="/api/auth/login"
            onSubmit={handleSubmit}
            method="post"
            autoComplete="on"
            className="space-y-5"
          >
            <Input
              label="Username"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
            />
            <div className="password-field">
              <Input
                label="Password"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
