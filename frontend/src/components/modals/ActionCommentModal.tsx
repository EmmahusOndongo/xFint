import { useState, useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;                 // ex: "Valider la note", "Refuser la note"
  ctaLabel: string;              // ex: "Valider", "Refuser"
  defaultComment?: string;
  requireComment?: boolean;      // true pour approve/reject
  onConfirm: (comment: string) => void;
  onClose: () => void;
  loading?: boolean;
};

export default function ActionCommentModal({
  open,
  title,
  ctaLabel,
  defaultComment = "",
  requireComment = true,
  onConfirm,
  onClose,
  loading
}: Props) {
  const [comment, setComment] = useState(defaultComment);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = "action-modal-title";

  useEffect(() => {
    if (open) setComment(defaultComment);
  }, [open, defaultComment]);

  // Désactiver le scroll derrière le modal
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ESC pour fermer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const canSubmit = requireComment ? comment.trim().length > 0 : true;

  // Map CTA → classe bouton (sans imposer de couleurs)
  const getCtaClass = () => {
    const label = ctaLabel.toLowerCase();
    if (label.includes("refus")) return "btn-danger";
    if (label.includes("valid")) return "btn-success";
    if (label.includes("trait")) return "btn-info";
    return "btn"; // fallback transparent
  };

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return;
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={onBackdropClick}
    >
      <div ref={panelRef} className="modal-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id={titleId} className="text-lg font-semibold">{title}</h3>
        </div>

        <div className="modal-body space-y-2">
          <label className="text-sm font-medium">
            Commentaire {requireComment && <span className="text-rose-500">*</span>}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={requireComment ? "Ajoutez un commentaire utile (obligatoire)…" : "Commentaire (optionnel)…"}
            rows={5}
            className="input textarea w-full"
          />
          {requireComment && comment.trim().length === 0 && (
            <p className="text-xs text-rose-500">Un commentaire est requis.</p>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>Annuler</button>
          <button
            className={`btn ${getCtaClass()}`}
            onClick={() => onConfirm(comment.trim())}
            disabled={!canSubmit || !!loading}
          >
            {loading ? "Veuillez patienter…" : ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
