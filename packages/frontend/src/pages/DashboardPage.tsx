import { Plus } from "@phosphor-icons/react";
import { yearRange } from "../utils/dateRange";
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
  const [range, setRange] = useState(() => yearRange(new Date().getFullYear()));
  const [formOpen, setFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const {
    items,
    totals,
    loading,
    error,
    addExpense,
    editExpense,
    removeExpense,
  } = useExpenses(range);

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
      <div className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <h1>Medical expenses</h1>
            <p>Your payments, receipts, and reimbursements in one place.</p>
          </div>
          <button className="add-desktop" onClick={handleAdd}>
            <Plus size={20} /> Add Expense
          </button>
        </div>
        <YearSelector range={range} onChange={setRange} />
        {error ? (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        ) : loading ? (
          <div className="summary-loading" role="status">
            Updating totals...
          </div>
        ) : (
          <ExpenseSummary totals={totals} />
        )}
        <section className="ledger">
          <div className="ledger-heading">
            <div>
              <h2>Expense history</h2>
              <span>
                {loading
                  ? "Loading expenses..."
                  : `${items.length} ${items.length === 1 ? "expense" : "expenses"} in this period`}
              </span>
            </div>
            <ExportButton
              range={range}
              disabled={loading || !!error || items.length === 0}
            />
          </div>
          <ExpenseList
            items={items}
            loading={loading}
            error={error}
            onSelect={handleSelect}
            onAdd={handleAdd}
          />
        </section>
      </div>
      <div className="mobile-action">
        <button onClick={handleAdd}>
          <Plus size={22} /> Add Expense
        </button>
      </div>

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
