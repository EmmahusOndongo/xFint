import protectedRoute from "../../lib/protectedRoute";
import Sidebar from "../../components/layout/Sidebar";
import ExpensesTable from "../../components/tables/ExpensesTable";
import ExpenseDetailModal from "../../components/modals/ExpenseDetailModal";
import { useExpenses } from "../../hooks/useExpenses";
import { useState } from "react";
import type { Expense } from "../../lib/types";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

function MyExpensesPage() {
  const { list, details } = useExpenses("mine");
  const [selected, setSelected] = useState<Expense | null>(null);
  const detailQuery = details(selected?.id);

  return (
    <Sidebar>
      <div className="mx-auto max-w-6xl space-y-4">
        {/* Header */}
        <div className="surface p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold">Mes notes de frais</h1>

            {/* Actions : recherche + bouton */}
            <div className="flex w-full items-center gap-3 sm:w-auto">
              {/* Recherche */}
              <div className="relative flex-1 min-w-[220px] max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
                <input
                  placeholder="Rechercher par titre…"
                  className="input w-full pl-9"
                  // Optionnel : ajouter un état local si tu veux la recherche
                />
              </div>

              {/* Nouvelle note */}
              <Link href="/expenses/new" className="btn">
                <Plus className="h-4 w-4" /> Nouvelle note
              </Link>
            </div>
          </div>
        </div>

        {/* Table des notes */}
        <ExpensesTable
          data={list.data || []}
          mode="mine"
          onRowClick={setSelected}
        />

        {/* Modal détails */}
        <ExpenseDetailModal
          open={!!selected}
          onClose={() => setSelected(null)}
          expense={selected}
          details={detailQuery.data ?? null}
          mode="mine"
        />
      </div>
    </Sidebar>
  );
}

export default protectedRoute(MyExpensesPage);