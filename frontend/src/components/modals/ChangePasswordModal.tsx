// components/modals/ChangePasswordModal.tsx
import { useEffect, useState } from "react";
import { usersService } from "@/services/users.service";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setError("");
      setOkMsg("");
    }
  }, [open]);

  if (!open) return null;

  const canSubmit =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= 8 &&
    confirm === newPassword;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOkMsg("");
    if (!canSubmit) {
      setError("Vérifie les champs (8+ caractères et confirmation identique).");
      return;
    }
    try {
      setLoading(true);
      await usersService.changePassword({ currentPassword, newPassword });
      setOkMsg("Mot de passe mis à jour avec succès.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Échec de mise à jour du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel max-w-md">
        <div className="modal-header">
          <h3 className="text-lg font-semibold">Changer le mot de passe</h3>
        </div>
        <form onSubmit={submit} className="modal-body space-y-4">
          {error && <div className="alert error">{error}</div>}
          {okMsg && <div className="alert success">{okMsg}</div>}

          <div>
            <label className="label">Mot de passe actuel</label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Nouveau mot de passe (8+)</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Confirmer le mot de passe</label>
            <input
              type="password"
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button className="btn" disabled={!canSubmit || loading}>
              {loading ? "En cours..." : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
