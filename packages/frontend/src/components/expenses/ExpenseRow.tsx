import { CaretRight, Paperclip } from "@phosphor-icons/react";
import type { Expense } from "../../types";
const money = (value: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(
    value,
  );
export function ExpenseRow({
  expense,
  onClick,
}: {
  expense: Expense;
  onClick: () => void;
}) {
  const reimbursed =
    expense.reimbursementAmount != null && expense.reimbursementAmount > 0;
  const date = new Date(`${expense.paidDate}T12:00:00`);
  return (
    <button onClick={onClick} className="expense-row">
      <div className="date-tile">
        <span>{date.toLocaleDateString("en-CA", { month: "short" })}</span>
        <strong>{date.getDate()}</strong>
        <small>{date.getFullYear()}</small>
      </div>
      <div className="expense-description">
        <strong>{expense.description}</strong>
        <div className="expense-meta">
          <span className={reimbursed ? "status-reimbursed" : "status-paid"}>
            {reimbursed ? "Reimbursed" : "Paid"}
          </span>
          {expense.receiptPath && (
            <span>
              <Paperclip size={14} />
              Receipt
            </span>
          )}
        </div>
      </div>
      <div className="expense-amount">
        <strong>{money(expense.paidAmount)}</strong>
        {reimbursed && <span>{money(expense.reimbursementAmount!)} back</span>}
      </div>
      <CaretRight size={18} className="row-caret" />
    </button>
  );
}
