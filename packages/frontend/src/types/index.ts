export interface User {
  id: number;
  username: string;
  displayName: string;
}

export interface Expense {
  id: number;
  userId: number;
  paidDate: string;
  paidAmount: number;
  description: string;
  claimDate: string | null;
  reimbursementAmount: number | null;
  receiptPath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseTotals {
  totalPaid: number;
  totalReimbursed: number;
  outOfPocket: number;
}

export interface ExpenseListResponse {
  items: Expense[];
  totals: ExpenseTotals;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ExtractedReceiptData {
  paid_date: string | null;
  paid_amount: number | null;
  description: string | null;
  confidence: number;
}

export interface ReceiptUploadResponse {
  receiptPath: string;
  extracted: ExtractedReceiptData;
}
