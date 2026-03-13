import type { Expense } from "../../types";
import { ExpenseRow } from "./ExpenseRow";
import { Spinner } from "../ui/Spinner";

interface ExpenseListProps {
  items: Expense[];
  loading: boolean;
  error: string | null;
  onSelect: (expense: Expense) => void;
}

export function ExpenseList({
  items,
  loading,
  error,
  onSelect,
}: ExpenseListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-12 h-12 text-gray-300 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-gray-400 text-sm">No expenses for this year</p>
        <p className="text-gray-400 text-xs mt-1">
          Tap + to add your first expense
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ExpenseRow key={item.id} expense={item} onClick={() => onSelect(item)} />
      ))}
    </div>
  );
}
