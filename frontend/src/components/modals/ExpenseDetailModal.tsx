// components/modals/ExpenseDetailModal.tsx
import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { expenseStatusLabel, type Expense } from "@/lib/types";
import { format } from "date-fns";

type Props = {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  mode: "mine" | "manager" | "accounting";
  // Action handlers
  onApprove?: (id: string, comment?: string) => void;
  onReject?: (id: string, comment?: string) => void;
  onProcess?: (id: string, comment?: string) => void;
  // Optional detailed data (if parent fetched /expenses/:id)
  details?: Expense | null;
};

export default function ExpenseDetailModal({ open, onClose, expense, mode, details, onApprove, onReject, onProcess }: Props) {
  const [comment, setComment] = useState("");
  const e = useMemo(() => details ?? expense, [details, expense]);
  if (!e) return null;

  const canApproveReject = mode === "manager" && e.status === "CREATED";
  const canProcess = mode === "accounting" && e.status === "APPROVED";

  const files = (e.files ?? []).length
    ? e.files!
    : [];

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 translate-y-2" enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-2"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-neutral-900">
                <Dialog.Title className="text-lg font-semibold">{e.title}</Dialog.Title>

                <div className="mt-4 space-y-2 text-sm">
                  <p><span className="text-neutral-500">Statut :</span> <span className="font-medium">{expenseStatusLabel[e.status]}</span></p>
                  <p><span className="text-neutral-500">Soumise le :</span> {e.submitted_at ? format(new Date(e.submitted_at), "dd/MM/yyyy HH:mm") : "—"}</p>
                  {e.employee?.email && (
                    <p><span className="text-neutral-500">Employé :</span> {e.employee.email}</p>
                  )}

                  {e.comment && (
                    <div className="mt-2">
                      <p className="text-neutral-500">Commentaire de la note</p>
                      <p className="rounded-lg border p-3 dark:border-neutral-800">{e.comment}</p>
                    </div>
                  )}

                  {!!files.length && (
                    <div className="mt-2">
                      <p className="text-neutral-500">Pièces justificatives</p>
                      <ul className="list-disc pl-5">
                        {files.map((f) => (
                          <li key={f.id} className="break-all">
                            <a href={f.url || f.storage_path || "#"} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              {f.file_name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(e.manager_comment || e.accounting_comment) && (
                    <div className="grid gap-2 md:grid-cols-2">
                      {e.manager_comment && (
                        <div>
                          <p className="text-neutral-500">Commentaire Manager</p>
                          <p className="rounded-lg border p-3 dark:border-neutral-800">{e.manager_comment}</p>
                        </div>
                      )}
                      {e.accounting_comment && (
                        <div>
                          <p className="text-neutral-500">Commentaire Comptabilité</p>
                          <p className="rounded-lg border p-3 dark:border-neutral-800">{e.accounting_comment}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {(canApproveReject || canProcess) && (
                  <div className="mt-6 space-y-3">
                    <textarea
                      placeholder={canApproveReject ? "Commentaire (optionnel) pour validation/refus" : "Commentaire (optionnel) pour traitement"}
                      className="w-full rounded-lg border p-3 text-sm outline-none focus:ring-2 dark:border-neutral-800"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex items-center justify-end gap-2">
                      {canApproveReject && (
                        <>
                          <button
                            onClick={() => onReject?.(e.id, comment)}
                            className="rounded-lg border px-4 py-2 text-sm font-medium"
                          >
                            Refuser
                          </button>
                          <button
                            onClick={() => onApprove?.(e.id, comment)}
                            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
                          >
                            Valider
                          </button>
                        </>
                      )}
                      {canProcess && (
                        <button
                          onClick={() => onProcess?.(e.id, comment)}
                          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
                        >
                          Marquer « Traitée »
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Fermer</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}