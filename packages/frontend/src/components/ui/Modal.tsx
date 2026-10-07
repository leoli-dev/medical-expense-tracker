import { useEffect, useRef, useId, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}
export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = dialog.current;
    if (!open || !el) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    el.showModal();
    document.body.style.overflow = "hidden";
    // Focus the close control without opening the mobile keyboard.
    el.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      el.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  if (!open) return null;
  return (
    <dialog
      ref={dialog}
      className="expense-dialog"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <div className="dialog-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            <p>Keep the details and receipt together.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close expense form"
          >
            <X size={22} />
          </button>
        </div>
        <div className="dialog-body">{children}</div>
      </div>
    </dialog>
  );
}
