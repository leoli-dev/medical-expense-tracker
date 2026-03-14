import { useState, useEffect, useRef } from "react";
import type { Expense } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import { useReceiptUpload } from "../../hooks/useReceiptUpload";
import { getToken } from "../../api/client";

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
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [receiptIsPdf, setReceiptIsPdf] = useState(false);
  const [showReceiptZoom, setShowReceiptZoom] = useState(false);
  const [receiptFetchError, setReceiptFetchError] = useState<null | "missing" | "forbidden" | "error">(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const zoomOverlayRef = useRef<HTMLDivElement | null>(null);

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

  // Fetch receipt blob for preview when editing an expense with a stored receipt
  useEffect(() => {
    // Revoke previous blob URL to avoid memory leaks
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setReceiptBlobUrl(null);
    setReceiptIsPdf(false);
    setShowReceiptZoom(false);
    setReceiptFetchError(null);

    if (!receiptPath) return;

    const controller = new AbortController();
    const token = getToken();
    fetch(`/api/receipts/file?path=${encodeURIComponent(receiptPath)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          setReceiptFetchError(
            res.status === 404 ? "missing" : res.status === 403 ? "forbidden" : "error"
          );
          return;
        }
        const contentType = res.headers.get("content-type") || "";
        setReceiptIsPdf(contentType.includes("pdf"));
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setReceiptBlobUrl(url);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setReceiptFetchError("error");
      });

    return () => {
      controller.abort();
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [receiptPath]);

  useEffect(() => {
    if (showReceiptZoom) {
      zoomOverlayRef.current?.focus();
    }
  }, [showReceiptZoom]);

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
      <>
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
              {receiptBlobUrl && !receiptIsPdf && (
                <img
                  src={receiptBlobUrl}
                  alt="Receipt preview"
                  className="max-h-48 mx-auto rounded-lg mb-3 object-contain cursor-zoom-in"
                  onClick={() => setShowReceiptZoom(true)}
                />
              )}
              {receiptBlobUrl && receiptIsPdf && (
                <a
                  href={receiptBlobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary-700 font-medium mb-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  View PDF receipt
                </a>
              )}
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
              {receiptFetchError === "missing" && (
                <p className="text-xs text-amber-600 mt-2">Receipt file missing on server. Please re-upload.</p>
              )}
              {receiptFetchError === "forbidden" && (
                <p className="text-xs text-gray-500 mt-2">Receipt could not be accessed.</p>
              )}
              {receiptFetchError === "error" && (
                <p className="text-xs text-red-500 mt-2">Failed to load receipt.</p>
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
      {showReceiptZoom && receiptBlobUrl && !receiptIsPdf && (
        <div
          ref={zoomOverlayRef}
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowReceiptZoom(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowReceiptZoom(false);
            }
          }}
          tabIndex={-1}
        >
          <button
            type="button"
            aria-label="Close receipt zoom"
            className="absolute top-4 right-4 p-2 rounded-full text-white bg-black/40 hover:bg-black/60"
            onClick={(e) => { e.stopPropagation(); setShowReceiptZoom(false); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={receiptBlobUrl}
            alt="Receipt zoomed preview"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      </>
    </Modal>
  );
}
