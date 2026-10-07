import { SignOut } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <a href="/" className="brand">
            <img src="/favicon.svg" alt="" />
            <span>MedExpense</span>
          </a>
          {user && (
            <div className="account">
              <span>{user.displayName}</span>
              <button onClick={logout} aria-label="Logout" title="Logout">
                <SignOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
