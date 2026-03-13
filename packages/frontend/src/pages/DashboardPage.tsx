import { useState } from "react";
import type { Expense } from "../types";
import { useExpenses } from "../hooks/useExpenses";
import { AppShell } from "../components/layout/AppShell";
import { YearSelector } from "../components/expenses/YearSelector";
import { ExpenseSummary } from "../components/expenses/ExpenseSummary";
import { ExpenseList } from "../components/expenses/ExpenseList";
import { ExpenseForm } from "../components/expenses/ExpenseForm";
import { ExportButton } from "../components/export/ExportButton";
import { Toast } from "../components/ui/Toast";

export function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [formOpen, setFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { items, totals, loading, error, addExpense, editExpense, removeExpense } =
    useExpenses(year);

  const handleSelect = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedExpense(null);
    setFormOpen(true);
  };

  const handleSave = async (data: {
    paidDate: string;
    paidAmount: number;
    description: string;
    claimDate?: string | null;
    reimbursementAmount?: number | null;
    receiptPath?: string | null;
  }) => {
    try {
      if (selectedExpense) {
        await editExpense(selectedExpense.id, data);
        setToast({ message: "Expense updated", type: "success" });
      } else {
        await addExpense(data);
        setToast({ message: "Expense added", type: "success" });
      }
    } catch {
      setToast({ message: "Failed to save expense", type: "error" });
      throw new Error("Save failed");
    }
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;
    try {
      await removeExpense(selectedExpense.id);
      setToast({ message: "Expense deleted", type: "success" });
    } catch {
      setToast({ message: "Failed to delete expense", type: "error" });
      throw new Error("Delete failed");
    }
  };

  return (
    <AppShell>
      <div className="space-y-4" style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}>
        <YearSelector year={year} onChange={setYear} />

        <ExpenseSummary totals={totals} />

        <div className="flex justify-end">
          <ExportButton year={year} disabled={items.length === 0} />
        </div>

        <ExpenseList
          items={items}
          loading={loading}
          error={error}
          onSelect={handleSelect}
        />
      </div>

      {/* Floating Add Button */}
      <button
        onClick={handleAdd}
        className="fixed right-6 w-14 h-14 bg-primary-700 text-white rounded-full shadow-lg hover:bg-primary-800 active:bg-primary-900 transition-colors flex items-center justify-center"
        style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <ExpenseForm
        open={formOpen}
        expense={selectedExpense}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        onDelete={selectedExpense ? handleDelete : undefined}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppShell>
  );
}
