import type { ExpenseTotals } from "../../types";
const money = (value: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(
    value,
  );
export function ExpenseSummary({ totals }: { totals: ExpenseTotals }) {
  return (
    <section className="summary" aria-label="Expense totals">
      <div className="summary-main">
        <p>Out of Pocket</p>
        <strong>{money(totals.outOfPocket)}</strong>
        <span>Paid by you, after reimbursement</span>
      </div>
      <div className="summary-details">
        <div>
          <p>Total Paid</p>
          <strong>{money(totals.totalPaid)}</strong>
        </div>
        <div>
          <p>Reimbursed</p>
          <strong>{money(totals.totalReimbursed)}</strong>
        </div>
      </div>
    </section>
  );
}
