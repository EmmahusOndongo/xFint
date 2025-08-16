// components/modals/AvatarModal.tsx
import { useEffect, useMemo, useState } from "react";
import { usersService } from "@/services/users.service";

type Props = {
  open: boolean;
  onClose: () => void;
  onUploaded?: (url?: string) => void; // callback pour mettre à jour l'avatar dans la page
};

export default function AvatarModal({ open, onClose, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFile(null);
      setError("");
    }
  }, [open]);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  if (!open) return null;

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Le fichier doit être une image.");
      return;
    }
    setError("");
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Sélectionne une image.");
      return;
    }
    try {
      setLoading(true);
      const res = await usersService.setAvatar(file);
      // Si bucket privé, on récupère une URL signée fraîche :
      let finalUrl = res.url;
      if (!finalUrl) {
        try {
          const signed = await usersService.getAvatarSignedUrl();
          finalUrl = signed.url;
        } catch {
          // si endpoint non dispo/public bucket, on ne fait rien
        }
      }
      onUploaded?.(finalUrl);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Échec de l’upload de la photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel max-w-md">
        <div className="modal-header">
          <h3 className="text-lg font-semibold">Mettre à jour la photo de profil</h3>
        </div>
        <form onSubmit={submit} className="modal-body space-y-4">
          {error && <div className="alert error">{error}</div>}

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border" style={{ borderColor: "rgb(var(--border))" }}>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs" style={{ color: "rgb(var(--muted))" }}>
                  Aperçu
                </div>
              )}
            </div>
            <label className="btn-ghost cursor-pointer">
              Choisir une image
              <input type="file" accept="image/*" className="hidden" onChange={pick} />
            </label>
          </div>

          <div className="text-xs" style={{ color: "rgb(var(--muted))" }}>
            Formats recommandés: JPG/PNG/WebP. Taille ≤ 5 Mo (par exemple).
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button className="btn" disabled={!file || loading}>
              {loading ? "Envoi..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}