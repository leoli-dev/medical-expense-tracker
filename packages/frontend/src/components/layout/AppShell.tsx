import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-700 text-white shadow-sm" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <h1 className="text-lg font-semibold">MedExpense</h1>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary-100">
                {user.displayName}
              </span>
              <button
                onClick={logout}
                className="text-sm text-primary-200 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-4">{children}</main>
    </div>
  );
}
