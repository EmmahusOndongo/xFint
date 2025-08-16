// components/modals/ExpenseDetailModal.tsx
import { useMemo, useState } from "react";
import { expenseStatusLabel, type Expense } from "@/lib/types";
import { format } from "date-fns";
import { api } from "@/lib/apiClient";

type Props = {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  mode: "mine" | "manager" | "accounting";
  onApprove?: (id: string, comment?: string) => void;
  onReject?: (id: string, comment?: string) => void;
  onProcess?: (id: string, comment?: string) => void;
  details?: Expense | null;
};

type ExpenseFileView = {
  id: string;
  file_name: string;
  mime_type: string;
  storage_path?: string | null;
  signed_url?: string | null;
};

export default function ExpenseDetailModal({
  open,
  onClose,
  expense,
  mode,
  details,
  onApprove,
  onReject,
  onProcess,
}: Props) {
  const [comment, setComment] = useState("");
  const e = useMemo(() => details ?? expense, [details, expense]);

  if (!open || !e) return null;

  const canApproveReject = mode === "manager" && e.status === "CREATED";
  const canProcess = mode === "accounting" && e.status === "APPROVED";
  const files = ((e.files ?? []) as any[]) as ExpenseFileView[];

  return (
    <div className="modal-backdrop">
      <div className="modal-panel max-w-2xl">
        <div className="modal-header">
          <h3 className="text-lg font-semibold">{e.title}</h3>
        </div>

        <div className="modal-body space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-3" style={{ borderColor: "rgb(var(--border))" }}>
              <div className="text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                Statut
              </div>
              <div className="mt-1 font-medium">{expenseStatusLabel[e.status]}</div>
            </div>

            <div className="rounded-xl border p-3" style={{ borderColor: "rgb(var(--border))" }}>
              <div className="text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                Soumise le
              </div>
              <div className="mt-1">
                {e.submitted_at ? format(new Date(e.submitted_at), "dd/MM/yyyy HH:mm") : "—"}
              </div>
            </div>

            {e.employee?.email && (
              <div
                className="rounded-xl border p-3 sm:col-span-2"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                <div className="text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                  Employé
                </div>
                <div className="mt-1">{e.employee.email}</div>
              </div>
            )}
          </div>

          {e.comment && (
            <div className="rounded-xl border p-3" style={{ borderColor: "rgb(var(--border))" }}>
              <div className="text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                Commentaire de la note
              </div>
              <p
                className="mt-2 rounded-lg border p-3"
                style={{
                  borderColor: "rgb(var(--border))",
                  backgroundColor: "rgb(var(--card-muted))",
                }}
              >
                {e.comment}
              </p>
            </div>
          )}

          {!!files.length && (
            <div>
              <div className="mb-2 text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                Pièces justificatives
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-xl border p-2"
                    style={{
                      borderColor: "rgb(var(--border))",
                      backgroundColor: "rgb(var(--card-muted))",
                    }}
                  >
                    {String(f.mime_type).startsWith("image/") && f.signed_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.signed_url}
                        alt={f.file_name}
                        className="max-h-64 w-full rounded-lg object-contain"
                      />
                    ) : (
                      <div className="text-sm">
                        {f.file_name} —{" "}
                        <a
                          href="#"
                          className="underline underline-offset-2"
                          style={{ color: "rgb(var(--accent))" }}
                          onClick={async (ev) => {
                            ev.preventDefault();
                            const { data } = await api.get<{ url: string }>(
                              `/expenses/${e.id}/files/${f.id}/url`,
                              { withCredentials: true }
                            );
                            window.open(data.url, "_blank");
                          }}
                        >
                          ouvrir
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(canApproveReject || canProcess) && (
            <div className="space-y-3">
              <textarea
                placeholder={
                  canApproveReject
                    ? "Commentaire (optionnel) pour validation/refus"
                    : "Commentaire (optionnel) pour traitement"
                }
                className="w-full rounded-xl border px-3 py-3 text-sm outline-none"
                style={{
                  borderColor: "rgb(var(--border))",
                  backgroundColor: "rgb(var(--card-muted))",
                }}
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex items-center justify-end gap-2">
                {canApproveReject && (
                  <>
                    {/* Rouge */}
                    <button
                      onClick={() => onReject?.(e.id, comment)}
                      className="btn btn-danger"
                    >
                      Refuser
                    </button>

                    {/* Vert */}
                    <button
                      onClick={() => onApprove?.(e.id, comment)}
                      className="btn btn-success"
                    >
                      Valider
                    </button>
                  </>
                )}
                {canProcess && (
                  <button onClick={() => onProcess?.(e.id, comment)} className="btn">
                    Marquer « Traitée »
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
