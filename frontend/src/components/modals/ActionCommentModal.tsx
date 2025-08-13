import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (open) setComment(defaultComment);
  }, [open, defaultComment]);

  if (!open) return null;

  const canSubmit = requireComment ? comment.trim().length > 0 : true;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="modal-header">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        <div className="modal-body space-y-2">
          <label className="text-sm font-medium">
            Commentaire {requireComment && <span className="text-rose-500">*</span>}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ajoutez un commentaire utile (obligatoire)…"
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
            className="btn-primary"
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