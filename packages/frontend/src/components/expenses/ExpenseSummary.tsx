import type { ExpenseTotals } from "../../types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

interface ExpenseSummaryProps {
  totals: ExpenseTotals;
}

export function ExpenseSummary({ totals }: ExpenseSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 mb-1">Total Paid</p>
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(totals.totalPaid)}
        </p>
      </div>
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 mb-1">Reimbursed</p>
        <p className="text-sm font-semibold text-green-600">
          {formatCurrency(totals.totalReimbursed)}
        </p>
      </div>
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 mb-1">Out of Pocket</p>
        <p className="text-sm font-semibold text-red-600">
          {formatCurrency(totals.outOfPocket)}
        </p>
      </div>
    </div>
  );
}
