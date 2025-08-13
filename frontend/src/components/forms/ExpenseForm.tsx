// components/forms/ExpenseForm.tsx
import { useRef, useState } from "react";
import type { CreateExpenseDTO } from "@/lib/types";
import { Paperclip, Trash2, Upload } from "lucide-react";

type Props = {
  onSubmit: (dto: CreateExpenseDTO) => void;
  loading?: boolean;
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
const ACCEPT = "application/pdf,image/*";

function fmtBytes(n: number) {
  if (n < 1024) return `${n} o`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} Ko`;
  return `${(kb / 1024).toFixed(1)} Mo`;
}

export default function ExpenseForm({ onSubmit, loading }: Props) {
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    const accepted = incoming.filter((f) => {
      const okType = f.type === "application/pdf" || f.type.startsWith("image/");
      const okSize = f.size <= MAX_SIZE;
      return okType && okSize;
    });
    const unique = accepted.filter(
      (f) => !files.some((g) => g.name === f.name && g.size === f.size && g.lastModified === f.lastModified)
    );
    const rejected = incoming.length - accepted.length;
    if (rejected > 0) {
      setError("Certains fichiers ont été ignorés (type non supporté ou > 10 Mo).");
      setTimeout(() => setError(""), 3000);
    }
    setFiles((prev) => [...prev, ...unique]);
  };

  const handleInputFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    // permet de re-sélectionner le même fichier
    e.currentTarget.value = "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onSubmit({ title: t, comment: comment.trim() || undefined, files: files.length ? files : undefined });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <form onSubmit={submit} className="form">
      {/* Titre */}
      <div className="form-field">
        <label className="form-label">Titre *</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Déjeuner client — Projet X"
          required
        />
      </div>

      {/* Commentaire */}
      <div className="form-field">
        <label className="form-label">Commentaire</label>
        <textarea
          className="input h-32 resize-y"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Notes additionnelles (optionnel)"
        />
      </div>

      {/* Pièces justificatives */}
      <div className="form-field">
        <label className="form-label">Pièces justificatives</label>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-dashed p-4 cursor-pointer transition"
          style={{
            borderColor: dragging ? "rgb(var(--primary))" : "rgb(var(--border))",
            backgroundColor: dragging ? "rgb(var(--primary) / 0.08)" : "rgb(var(--accent))",
          }}
          aria-label="Déposer des fichiers ici ou cliquer pour sélectionner"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                 style={{ backgroundColor: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}>
              <Upload className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-medium">Glisse & dépose les fichiers, ou clique pour parcourir</div>
              <div className="form-hint">PDF, JPG, PNG — max 10 Mo par fichier</div>
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          onChange={handleInputFiles}
          className="sr-only"
        />

        {/* Erreur courte */}
        {error && <div className="form-hint mt-2" role="alert">{error}</div>}

        {/* Liste des fichiers */}
        {!!files.length && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${f.size}-${f.lastModified}`}
                  className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: "rgb(var(--border))" }}>
                <div className="flex min-w-0 items-center gap-2">
                  <Paperclip className="h-4 w-4 shrink-0" />
                  <span className="truncate">{f.name}</span>
                  <span className="shrink-0" style={{ color: "rgb(var(--muted))" }}>· {fmtBytes(f.size)}</span>
                </div>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label={`Supprimer ${f.name}`}
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn">
          {loading ? "Création…" : "Créer la note"}
        </button>
      </div>
    </form>
  );
}
