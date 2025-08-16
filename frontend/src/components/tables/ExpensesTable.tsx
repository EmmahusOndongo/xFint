import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import type { Expense, ExpenseStatus } from "@/lib/types";
import { expenseStatusLabel } from "@/lib/types";
import { Eye, Check, X as XIcon, BadgeCheck } from "lucide-react";

type Mode = "manager" | "accounting" | "mine";

type Props = {
  data: Expense[];
  onRowClick?: (exp: Expense) => void;
  loading?: boolean;
  showEmail?: boolean;
  mode?: Mode;
  onApprove?: (e: Expense) => void;
  onReject?: (e: Expense) => void;
  onProcess?: (e: Expense) => void;
};

const statusBadgeClass = (status: ExpenseStatus) => {
  switch (status) {
    case "APPROVED":  return "status-badge status-success";
    case "REJECTED":  return "status-badge status-danger";
    case "PROCESSED": return "status-badge status-info";
    case "CREATED":   return "status-badge status-warning";
    default:          return "status-badge";
  }
};

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-5">
          <div className="h-4 w-28 rounded bg-[rgb(var(--skeleton))]" />
        </td>
      ))}
    </tr>
  );
}

export default function ExpensesTable({
  data,
  onRowClick,
  loading,
  showEmail,
  mode = "mine",
  onApprove,
  onReject,
  onProcess,
}: Props) {
  const hasData = data && data.length > 0;
  const cols = 4 + (showEmail ? 1 : 0);

  /* -------------------- MOBILE (cards) -------------------- */
  const MobileList = () => (
    <div className="md:hidden space-y-3">
      {loading && Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
          <div className="h-5 w-40 rounded bg-[rgb(var(--skeleton))]" />
          <div className="mt-3 h-4 w-24 rounded bg-[rgb(var(--skeleton))]" />
          <div className="mt-5 h-8 w-28 rounded bg-[rgb(var(--skeleton))]" />
        </div>
      ))}

      {!loading && hasData && data.map((e) => (
        <div
          key={e.id}
          className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4"
        >
          {/* Titre + Statut */}
          <div className="flex items-start justify-between gap-3">
            <button
              className="text-left font-semibold text-[rgb(var(--foreground))] underline-offset-2 hover:underline"
              onClick={() => onRowClick?.(e)}
              title="Voir les détails"
            >
              {e.title}
            </button>
            <span className={statusBadgeClass(e.status)}>
              {expenseStatusLabel[e.status]}
            </span>
          </div>

          {/* Meta */}
          <div className="mt-2 text-xs text-[rgb(var(--muted))]">
            Soumise le{" "}
            {e.submitted_at ? format(new Date(e.submitted_at), "PP", { locale: fr }) : "—"}
          </div>
          {showEmail && (
            <div className="mt-1 text-xs text-[rgb(var(--secondary-foreground))]">
              {e.employee?.email ?? "—"}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button className="btn-chip btn-info" onClick={() => onRowClick?.(e)} title="Voir">
              <Eye className="h-4 w-4" />
            </button>

            {mode === "manager" && e.status === "CREATED" && (
              <>
                <button className="btn-chip btn-success" onClick={() => onApprove?.(e)} title="Valider">
                  <Check className="h-4 w-4" />
                </button>
                <button className="btn-chip btn-danger" onClick={() => onReject?.(e)} title="Refuser">
                  <XIcon className="h-4 w-4" />
                </button>
              </>
            )}

            {mode === "accounting" && e.status === "APPROVED" && (
              <button className="btn-chip btn-info-soft" onClick={() => onProcess?.(e)} title="Marquer traitée">
                <BadgeCheck className="h-4 w-4" /> Marquer traitée
              </button>
            )}
          </div>
        </div>
      ))}

      {!loading && !hasData && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 text-center text-sm text-[rgb(var(--muted))]">
          Aucune note pour le moment.
        </div>
      )}
    </div>
  );

  /* -------------------- DESKTOP (table) -------------------- */
  const DesktopTable = () => (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm">
      <table className="min-w-full table-fixed">
        <thead className="bg-[rgb(var(--table-head))]">
          <tr className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
            <th className="px-5 py-4 text-left">Titre</th>
            <th className="w-44 px-5 py-4 text-left">Soumise le</th>
            {showEmail && <th className="px-5 py-4 text-left">Employé</th>}
            <th className="w-40 px-5 py-4 text-left">Statut</th>
            <th className="w-[18rem] px-5 py-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading && Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} cols={cols} />)}

          {!loading && hasData && data.map((e, idx) => (
            <tr
              key={e.id}
              className={`transition-colors hover:bg-[rgb(var(--table-hover))]
                          border-b border-[rgb(var(--border))] last:border-0
                          ${idx % 2 === 0 ? "bg-[rgb(var(--card))]" : "bg-[rgb(var(--table-alt))]"}`}
            >
              <td className="px-5 py-3">
                <button
                  className="max-w-[28ch] truncate font-medium text-[rgb(var(--foreground))] hover:underline"
                  onClick={() => onRowClick?.(e)}
                  title="Voir les détails"
                >
                  {e.title}
                </button>
              </td>

              <td className="px-5 py-3 text-sm text-[rgb(var(--muted))]">
                {e.submitted_at ? format(new Date(e.submitted_at), "PP", { locale: fr }) : "—"}
              </td>

              {showEmail && (
                <td className="px-5 py-3 text-sm text-[rgb(var(--secondary-foreground))]">
                  {e.employee?.email ?? "—"}
                </td>
              )}

              <td className="px-5 py-3">
                <span className={statusBadgeClass(e.status)}>
                  {expenseStatusLabel[e.status]}
                </span>
              </td>

              <td className="px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button className="btn-chip btn-info" onClick={() => onRowClick?.(e)} title="Voir">
                    <Eye className="h-4 w-4" />
                  </button>

                  {mode === "manager" && e.status === "CREATED" && (
                    <>
                      <button className="btn-chip btn-success" onClick={() => onApprove?.(e)} title="Valider">
                        <Check className="h-4 w-4" />
                      </button>
                      <button className="btn-chip btn-danger" onClick={() => onReject?.(e)} title="Refuser">
                        <XIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {mode === "accounting" && e.status === "APPROVED" && (
                    <button className="btn-chip btn-info-soft" onClick={() => onProcess?.(e)} title="Marquer traitée">
                      <BadgeCheck className="h-4 w-4" /> Marquer traitée
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {!loading && !hasData && (
            <tr>
              <td className="px-6 py-12 text-center text-sm text-[rgb(var(--muted))]" colSpan={cols}>
                Aucune note pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full">
      <MobileList />
      <DesktopTable />
    </div>
  );
}
