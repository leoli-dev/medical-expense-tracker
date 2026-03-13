import { useState, useEffect } from "react";
import type { Expense } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import { useReceiptUpload } from "../../hooks/useReceiptUpload";

interface ExpenseFormProps {
  open: boolean;
  expense: Expense | null; // null = create mode
  onClose: () => void;
  onSave: (data: {
    paidDate: string;
    paidAmount: number;
    description: string;
    claimDate?: string | null;
    reimbursementAmount?: number | null;
    receiptPath?: string | null;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function ExpenseForm({
  open,
  expense,
  onClose,
  onSave,
  onDelete,
}: ExpenseFormProps) {
  const [paidDate, setPaidDate] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [description, setDescription] = useState("");
  const [claimDate, setClaimDate] = useState("");
  const [reimbursementAmount, setReimbursementAmount] = useState("");
  const [receiptPath, setReceiptPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { upload, uploading, error: uploadError } = useReceiptUpload();

  useEffect(() => {
    if (open) {
      if (expense) {
        setPaidDate(expense.paidDate);
        setPaidAmount(String(expense.paidAmount));
        setDescription(expense.description);
        setClaimDate(expense.claimDate || "");
        setReimbursementAmount(
          expense.reimbursementAmount != null
            ? String(expense.reimbursementAmount)
            : ""
        );
        setReceiptPath(expense.receiptPath);
      } else {
        setPaidDate("");
        setPaidAmount("");
        setDescription("");
        setClaimDate("");
        setReimbursementAmount("");
        setReceiptPath(null);
      }
      setError(null);
    }
  }, [open, expense]);

  const handleReceiptUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file);
    if (result) {
      setReceiptPath(result.receiptPath);
      if (result.extracted.paid_date && !paidDate) {
        setPaidDate(result.extracted.paid_date);
      }
      if (result.extracted.paid_amount != null && !paidAmount) {
        setPaidAmount(String(result.extracted.paid_amount));
      }
      if (result.extracted.description && !description) {
        setDescription(result.extracted.description);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidDate || !paidAmount || !description) {
      setError("Date, amount, and description are required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        paidDate,
        paidAmount: parseFloat(paidAmount),
        description,
        claimDate: claimDate || null,
        reimbursementAmount: reimbursementAmount
          ? parseFloat(reimbursementAmount)
          : null,
        receiptPath,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !confirm("Delete this expense?")) return;
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={expense ? "Edit Expense" : "Add Expense"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Receipt Upload */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner />
              <span className="text-sm text-gray-500">
                Scanning receipt...
              </span>
            </div>
          ) : (
            <>
              <label className="cursor-pointer inline-flex flex-col items-center gap-1">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm text-primary-700 font-medium">
                  {receiptPath ? "Replace receipt" : "Scan Receipt"}
                </span>
                <span className="text-xs text-gray-400">
                  JPG, PNG, HEIC, or PDF
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/heic,image/heif,application/pdf"
                  capture="environment"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </label>
              {receiptPath && (
                <p className="text-xs text-green-600 mt-2">Receipt attached</p>
              )}
            </>
          )}
          {uploadError && (
            <p className="text-xs text-red-500 mt-2">{uploadError}</p>
          )}
        </div>

        <Input
          label="Date"
          id="paidDate"
          type="date"
          value={paidDate}
          onChange={(e) => setPaidDate(e.target.value)}
          required
        />

        <Input
          label="Amount ($)"
          id="paidAmount"
          type="number"
          step="0.01"
          min="0"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          required
        />

        <Input
          label="Description"
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Dental cleaning, Eye exam"
          required
        />

        <hr className="border-gray-100" />

        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          Claim / Reimbursement (optional)
        </p>

        <Input
          label="Claim Date"
          id="claimDate"
          type="date"
          value={claimDate}
          onChange={(e) => setClaimDate(e.target.value)}
        />

        <Input
          label="Reimbursement Amount ($)"
          id="reimbursementAmount"
          type="number"
          step="0.01"
          min="0"
          value={reimbursementAmount}
          onChange={(e) => setReimbursementAmount(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            {saving ? "Saving..." : expense ? "Update" : "Add Expense"}
          </Button>
          {expense && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "..." : "Delete"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
