import { rangeQuery, type DateRange } from "../utils/dateRange";
import { apiFetch } from "./client";
import type { Expense, ExpenseListResponse } from "../types";

export async function getExpensesAPI(
  range: DateRange,
): Promise<ExpenseListResponse> {
  return apiFetch<ExpenseListResponse>(`/api/expenses?${rangeQuery(range)}`);
}

export async function createExpenseAPI(data: {
  paidDate: string;
  paidAmount: number;
  description: string;
  claimDate?: string | null;
  reimbursementAmount?: number | null;
  receiptPath?: string | null;
}): Promise<Expense> {
  return apiFetch<Expense>("/api/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateExpenseAPI(
  id: number,
  data: Partial<{
    paidDate: string;
    paidAmount: number;
    description: string;
    claimDate: string | null;
    reimbursementAmount: number | null;
    receiptPath: string | null;
  }>,
): Promise<Expense> {
  return apiFetch<Expense>(`/api/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteExpenseAPI(id: number): Promise<void> {
  await apiFetch(`/api/expenses/${id}`, { method: "DELETE" });
}

export async function exportExpensesCSV(range: DateRange): Promise<void> {
  const blob = await apiFetch<Blob>(
    `/api/expenses/export?${rangeQuery(range)}`,
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `medical-expenses-${range.startDate}-to-${range.endDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
