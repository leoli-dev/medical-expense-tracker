interface ExpenseRow {
  paidDate: string;
  description: string;
  paidAmount: number;
  claimDate: string | null;
  reimbursementAmount: number | null;
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCSV(expenses: ExpenseRow[]): string {
  const header = "paid_date,description,paid_amount,claim_date,reimbursement_amount";
  const rows = expenses.map((e) => {
    return [
      escapeCSV(e.paidDate),
      escapeCSV(e.description),
      e.paidAmount.toFixed(2),
      e.claimDate ? escapeCSV(e.claimDate) : "",
      e.reimbursementAmount !== null ? e.reimbursementAmount.toFixed(2) : "",
    ].join(",");
  });

  return [header, ...rows].join("\n");
}
