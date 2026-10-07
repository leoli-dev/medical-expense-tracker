import { Camera, UploadSimple, FilePdf, X } from "@phosphor-icons/react";
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
  const [receiptFetchError, setReceiptFetchError] = useState<
    null | "missing" | "forbidden" | "error"
  >(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const session = useRef(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const zoomOverlayRef = useRef<HTMLDivElement | null>(null);

  const {
    upload,
    uploading,
    error: uploadError,
    clearError,
  } = useReceiptUpload();

  useEffect(() => {
    session.current++;
    if (open) {
      if (expense) {
        setPaidDate(expense.paidDate);
        setPaidAmount(String(expense.paidAmount));
        setDescription(expense.description);
        setClaimDate(expense.claimDate || "");
        setReimbursementAmount(
          expense.reimbursementAmount != null
            ? String(expense.reimbursementAmount)
            : "",
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
      setUploadNotice(null);
      clearError();
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

    if (!open || !receiptPath) return;

    const controller = new AbortController();
    const token = getToken();
    fetch(`/api/receipts/file?path=${encodeURIComponent(receiptPath)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          setReceiptFetchError(
            res.status === 404
              ? "missing"
              : res.status === 403
                ? "forbidden"
                : "error",
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
  }, [receiptPath, open]);

  useEffect(() => {
    if (showReceiptZoom) {
      zoomOverlayRef.current?.focus();
    }
  }, [showReceiptZoom]);

  const handleReceiptUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadSession = session.current;
    e.target.value = "";
    setUploadNotice(null);
    const result = await upload(file);
    if (result && uploadSession === session.current) {
      setUploadNotice(
        result.extractionWarning ||
          "Receipt attached. Review the details before saving.",
      );
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
    if (uploading || saving || deleting) return;
    if (
      !paidDate ||
      !paidAmount ||
      !description.trim() ||
      !Number.isFinite(Number(paidAmount)) ||
      Number(paidAmount) < 0
    ) {
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
          <div className="receipt-upload">
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
                  <button
                    type="button"
                    aria-label="Enlarge receipt"
                    className="block mx-auto mb-3"
                    onClick={() => setShowReceiptZoom(true)}
                  >
                    <img
                      src={receiptBlobUrl}
                      alt="Receipt preview"
                      className="max-h-48 rounded-lg object-contain cursor-zoom-in"
                    />
                  </button>
                )}
                {receiptBlobUrl && receiptIsPdf && (
                  <a
                    href={receiptBlobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary-700 font-medium mb-3"
                  >
                    <FilePdf size={20} />
                    View PDF receipt
                  </a>
                )}
                <p className="font-semibold text-sm">
                  {receiptPath ? "Receipt attached" : "Attach a receipt"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Photos or PDF, up to 10 MB. You can also enter details
                  manually.
                </p>
                <div className="upload-actions">
                  <button
                    type="button"
                    onClick={() => cameraRef.current?.click()}
                    disabled={saving || deleting}
                  >
                    <Camera size={20} /> Take photo
                  </button>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={saving || deleting}
                  >
                    <UploadSimple size={20} />
                    {receiptPath ? "Replace file" : "Photos / files"}
                  </button>
                </div>
                <input
                  ref={cameraRef}
                  type="file"
                  aria-label="Take receipt photo"
                  accept="image/*"
                  capture="environment"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
                <input
                  ref={fileRef}
                  type="file"
                  aria-label="Upload receipt from photos or files"
                  accept="image/jpeg,image/png,image/heic,image/heif,application/pdf,.jpg,.jpeg,.png,.heic,.heif,.pdf"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
                {uploadNotice && (
                  <p role="status" className="text-xs text-primary-800 mt-3">
                    {uploadNotice}
                  </p>
                )}
                {receiptFetchError === "missing" && (
                  <p className="text-xs text-amber-600 mt-2">
                    Receipt file missing on server. Please re-upload.
                  </p>
                )}
                {receiptFetchError === "forbidden" && (
                  <p className="text-xs text-gray-500 mt-2">
                    Receipt could not be accessed.
                  </p>
                )}
                {receiptFetchError === "error" && (
                  <p className="text-xs text-red-500 mt-2">
                    Failed to load receipt.
                  </p>
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

          <p className="text-sm text-gray-600 font-medium">
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

          <div className="form-actions flex gap-2">
            <Button
              type="submit"
              disabled={saving || uploading || deleting}
              className="flex-1"
            >
              {saving ? "Saving..." : expense ? "Update" : "Add Expense"}
            </Button>
            {expense && onDelete && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={deleting || uploading || saving}
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
            aria-label="Receipt preview"
            onClick={() => setShowReceiptZoom(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setShowReceiptZoom(false);
              }
            }}
            tabIndex={-1}
          >
            <button
              type="button"
              aria-label="Close receipt zoom"
              className="absolute top-4 right-4 p-2 rounded-full text-white bg-black/40 hover:bg-black/60"
              onClick={(e) => {
                e.stopPropagation();
                setShowReceiptZoom(false);
              }}
            >
              <X size={20} />
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
