import { useState, useEffect, useCallback } from "react";
import type { Expense, ExpenseTotals } from "../types";
import {
  getExpensesAPI,
  createExpenseAPI,
  updateExpenseAPI,
  deleteExpenseAPI,
} from "../api/expenses.api";

export function useExpenses(year: number) {
  const [items, setItems] = useState<Expense[]>([]);
  const [totals, setTotals] = useState<ExpenseTotals>({
    totalPaid: 0,
    totalReimbursed: 0,
    outOfPocket: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpensesAPI(year);
      setItems(data.items);
      setTotals(data.totals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addExpense = async (data: {
    paidDate: string;
    paidAmount: number;
    description: string;
    claimDate?: string | null;
    reimbursementAmount?: number | null;
    receiptPath?: string | null;
  }) => {
    await createExpenseAPI(data);
    await refresh();
  };

  const editExpense = async (
    id: number,
    data: Partial<{
      paidDate: string;
      paidAmount: number;
      description: string;
      claimDate: string | null;
      reimbursementAmount: number | null;
      receiptPath: string | null;
    }>
  ) => {
    await updateExpenseAPI(id, data);
    await refresh();
  };

  const removeExpense = async (id: number) => {
    await deleteExpenseAPI(id);
    await refresh();
  };

  return {
    items,
    totals,
    loading,
    error,
    refresh,
    addExpense,
    editExpense,
    removeExpense,
  };
}
