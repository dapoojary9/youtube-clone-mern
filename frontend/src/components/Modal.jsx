import { useEffect } from "react";
import { IoClose } from "react-icons/io5";

/** Accessible modal dialog (closes on Escape / backdrop click). */
export default function Modal({ title, onClose, children, width = 560 }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IoClose size={24} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

/** Small yes/no confirmation dialog. */
export function ConfirmModal({ title, message, confirmLabel = "Delete", onConfirm, onClose, busy }) {
  return (
    <Modal title={title} onClose={onClose} width={420}>
      <p className="confirm__msg">{message}</p>
      <div className="form-actions">
        <button className="btn btn--text" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn btn--danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Deleting..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
