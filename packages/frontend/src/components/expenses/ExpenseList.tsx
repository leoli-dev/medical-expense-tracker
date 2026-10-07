import { Receipt } from "@phosphor-icons/react";
import type { Expense } from "../../types";
import { ExpenseRow } from "./ExpenseRow";
import { Spinner } from "../ui/Spinner";

interface ExpenseListProps {
  items: Expense[];
  loading: boolean;
  error: string | null;
  onAdd: () => void;
  onSelect: (expense: Expense) => void;
}

export function ExpenseList({
  items,
  loading,
  error,
  onSelect,
  onAdd,
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
        <Receipt
          size={40}
          weight="light"
          className="mx-auto mb-3 text-primary-700"
        />
        <h3 className="font-semibold text-gray-900">
          No expenses in this period
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Add a receipt or enter an expense to get started.
        </p>
        <button className="empty-add" onClick={onAdd}>
          Add your first expense
        </button>
      </div>
    );
  }

  return (
    <div className="expense-list">
      {items.map((item) => (
        <ExpenseRow
          key={item.id}
          expense={item}
          onClick={() => onSelect(item)}
        />
      ))}
    </div>
  );
}
