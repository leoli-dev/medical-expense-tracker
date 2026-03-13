import type { Expense } from "../../types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${month}/${day}`;
}

interface ExpenseRowProps {
  expense: Expense;
  onClick: () => void;
}

export function ExpenseRow({ expense, onClick }: ExpenseRowProps) {
  const hasReimbursement =
    expense.reimbursementAmount != null && expense.reimbursementAmount > 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-primary-200 active:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-gray-400 font-mono">
              {formatDate(expense.paidDate)}
            </span>
            {hasReimbursement && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                Claimed
              </span>
            )}
            {expense.receiptPath && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                Receipt
              </span>
            )}
          </div>
          <p className="text-sm text-gray-900 truncate">
            {expense.description}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(expense.paidAmount)}
          </p>
          {hasReimbursement && (
            <p className="text-xs text-green-600">
              -{formatCurrency(expense.reimbursementAmount!)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
