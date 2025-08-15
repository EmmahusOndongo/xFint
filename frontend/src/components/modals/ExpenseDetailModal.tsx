import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { expenseStatusLabel, type Expense } from "@/lib/types";
import { format } from "date-fns";

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
  if (!e) return null;

  const canApproveReject = mode === "manager" && e.status === "CREATED";
  const canProcess = mode === "accounting" && e.status === "APPROVED";

  const files = (e.files ?? []).length ? e.files! : [];

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}>
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment}>
              <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-2xl bg-[#0F1418] p-6 text-left align-middle text-gray-100 shadow-xl ring-1 ring-white/10">
                
                <Dialog.Title className="text-lg font-semibold">
                  {e.title}
                </Dialog.Title>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Statut :</span>{" "}
                    <span className="font-medium">
                      {expenseStatusLabel[e.status]}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Soumise le :</span>{" "}
                    {e.submitted_at
                      ? format(new Date(e.submitted_at), "dd/MM/yyyy HH:mm")
                      : "—"}
                  </p>
                  {e.employee?.email && (
                    <p>
                      <span className="text-gray-400">Employé :</span>{" "}
                      {e.employee.email}
                    </p>
                  )}

                  {e.comment && (
                    <div className="mt-2">
                      <p className="text-gray-400">Commentaire de la note</p>
                      <p className="rounded-xl border border-white/10 bg-white/5 p-3">
                        {e.comment}
                      </p>
                    </div>
                  )}

                  {!!files.length && (
                    <div className="mt-2">
                      <p className="text-gray-400">Pièces justificatives</p>
                      <ul className="list-disc pl-5">
                        {files.map((f) => (
                          <li key={f.id} className="break-all">
                            <a
                              href={f.url || f.storage_path || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-violet-300 underline underline-offset-2 hover:text-violet-200"
                            >
                              {f.file_name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {(canApproveReject || canProcess) && (
                  <div className="mt-6 space-y-3">
                    <textarea
                      placeholder={
                        canApproveReject
                          ? "Commentaire (optionnel) pour validation/refus"
                          : "Commentaire (optionnel) pour traitement"
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500/40"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex items-center justify-end gap-2">
                      {canApproveReject && (
                        <>
                          <button
                            onClick={() => onReject?.(e.id, comment)}
                            className="btn btn-danger"
                          >
                            Refuser
                          </button>
                          <button
                            onClick={() => onApprove?.(e.id, comment)}
                            className="btn btn-success"
                          >
                            Valider
                          </button>
                        </>
                      )}
                      {canProcess && (
                        <button
                          onClick={() => onProcess?.(e.id, comment)}
                          className="btn btn-info"
                        >
                          Marquer « Traitée »
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button onClick={onClose} className="btn">
                    Fermer
                  </button>
                </div>

              </Dialog.Panel> {/* ✅ fermeture correcte */}
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
