import type { DateRange } from "../utils/dateRange";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Expense, ExpenseTotals } from "../types";
import {
  getExpensesAPI,
  createExpenseAPI,
  updateExpenseAPI,
  deleteExpenseAPI,
} from "../api/expenses.api";

export function useExpenses(range: DateRange) {
  const [items, setItems] = useState<Expense[]>([]);
  const [totals, setTotals] = useState<ExpenseTotals>({
    totalPaid: 0,
    totalReimbursed: 0,
    outOfPocket: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await getExpensesAPI(range);
      if (id !== requestId.current) return;
      setItems(data.items);
      setTotals(data.totals);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [range.startDate, range.endDate]);

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
    }>,
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
