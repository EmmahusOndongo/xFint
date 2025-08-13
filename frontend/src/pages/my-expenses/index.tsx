import protectedRoute from "../../lib/protectedRoute";
import Sidebar from "../../components/layout/Sidebar";
import ExpensesTable from "../../components/tables/ExpensesTable";
import ExpenseDetailModal from "../../components/modals/ExpenseDetailModal";
import { useExpenses } from "../../hooks/useExpenses";
import { useState } from "react";
import type { Expense } from "../../lib/types";

function MyExpensesPage() {
  const { list, details, approve, reject, process } = useExpenses("mine");
  const [selected, setSelected] = useState<Expense | null>(null);
  const detailQuery = details(selected?.id);

  return (
    <Sidebar>
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-xl font-semibold">Mes notes de frais</h1>
        <ExpensesTable data={list.data || []} mode="mine" onRowClick={setSelected} />
        <ExpenseDetailModal
          open={!!selected}
          onClose={() => setSelected(null)}
          expense={selected}
          details={detailQuery.data ?? null}
          mode="mine"
          // no actions for an employee in the details modal
        />
      </div>
    </Sidebar>
  );
}
export default protectedRoute(MyExpensesPage);