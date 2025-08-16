// pages/expenses/index.tsx
import protectedRoute from "../../lib/protectedRoute";
import Sidebar from "../../components/layout/Sidebar";
import ExpensesTable from "../../components/tables/ExpensesTable";
import ExpenseDetailModal from "../../components/modals/ExpenseDetailModal";
import { useExpenses } from "../../hooks/useExpenses";
import { useAuth } from "../../hooks/useAuth";
import { useMemo, useState } from "react";
import type { Expense } from "../../lib/types";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  PieChart,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

function countStats(list: Expense[]) {
  const total = list.length;
  const created = list.filter((e) => e.status === "CREATED").length;
  const approved = list.filter((e) => e.status === "APPROVED").length;
  const rejected = list.filter((e) => e.status === "REJECTED").length;
  return { total, created, approved, rejected };
}

// Onglets possibles (inclure PROCESSED si besoin)
type Tab = "ALL" | "CREATED" | "APPROVED" | "REJECTED"; // | "PROCESSED"

function ExpensesListPage() {
  const { user } = useAuth();
  const mode = useMemo(
    () => (user?.role === "MANAGER" ? "manager" : "accounting"),
    [user]
  );
  const { list, details, approve, reject, process } = useExpenses(mode);

  const [selected, setSelected] = useState<Expense | null>(null);
  const detailQuery = details(selected?.id);

  // Recherche et onglets
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("ALL");

  // Filtrage par onglet PUIS recherche
  const base =
    (list.data || []).filter((e) =>
      tab === "ALL" ? true : e.status === (tab as Exclude<Tab, "ALL">)
    );
  const filtered = base.filter((e) =>
    (e.title || "").toLowerCase().includes(q.toLowerCase())
  );

  const stats = countStats(list.data || []);

  return (
    <Sidebar>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="surface p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold">Toutes les notes</h1>

            {/* ACTIONS: search + button */}
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <div className="relative flex-1 min-w-[220px] max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher par titre…"
                  className="input w-full pl-9"
                />
              </div>

              <Link href="/expenses/new" className="btn">
                <Plus className="h-4 w-4" /> Nouvelle note
              </Link>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Total</div>
              <div className="kpi-value">{stats.total}</div>
              <div className="stat-sub">Toutes les notes</div>
            </div>
            <div className="stat-icon text-violet-600 bg-violet-50 dark:text-violet-300 dark:bg-violet-500/15">
              <PieChart className="h-5 w-5" />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-title">En attente</div>
              <div className="kpi-value">{stats.created}</div>
              <div className="stat-sub">À valider par le manager</div>
            </div>
            <div className="stat-icon text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/15">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-title">Validées</div>
              <div className="kpi-value">{stats.approved}</div>
              <div className="stat-sub">Prêtes pour comptabilité</div>
            </div>
            <div className="stat-icon text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/15">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-title">Refusées</div>
              <div className="kpi-value">{stats.rejected}</div>
              <div className="stat-sub">Derniers refus</div>
            </div>
            <div className="stat-icon text-rose-600 bg-rose-50 dark:text-rose-300 dark:bg-rose-500/15">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Toolbar + table */}
        <div className="surface p-0">
          <div className="toolbar-row">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <div className="font-medium">Gérer les notes</div>

              {/* Onglets (desktop) */}
              <div className="segmented">
                <button
                  className={`seg-item ${tab === "ALL" ? "active" : ""}`}
                  onClick={() => setTab("ALL")}
                >
                  Toutes <span className="chip">{list.data?.length ?? 0}</span>
                </button>
                <button
                  className={`seg-item ${tab === "CREATED" ? "active" : ""}`}
                  onClick={() => setTab("CREATED")}
                >
                  À valider{" "}
                  <span className="chip">
                    {(list.data || []).filter((e) => e.status === "CREATED").length}
                  </span>
                </button>
                <button
                  className={`seg-item ${tab === "APPROVED" ? "active" : ""}`}
                  onClick={() => setTab("APPROVED")}
                >
                  Validées{" "}
                  <span className="chip">
                    {(list.data || []).filter((e) => e.status === "APPROVED").length}
                  </span>
                </button>
                <button
                  className={`seg-item ${tab === "REJECTED" ? "active" : ""}`}
                  onClick={() => setTab("REJECTED")}
                >
                  Refusées{" "}
                  <span className="chip">
                    {(list.data || []).filter((e) => e.status === "REJECTED").length}
                  </span>
                </button>
              </div>

              {/* Sélecteur (mobile) */}
              <div className="md:hidden">
                <select
                  className="input input-select"
                  value={tab}
                  onChange={(e) => setTab(e.target.value as Tab)}
                >
                  <option value="ALL">Toutes</option>
                  <option value="CREATED">À valider</option>
                  <option value="APPROVED">Validées</option>
                  <option value="REJECTED">Refusées</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="ghost-btn">
                <Filter className="h-4 w-4" /> Filtrer
              </button>
              <button className="ghost-btn">
                <ArrowUpDown className="h-4 w-4" /> Trier
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="p-4">
            <ExpensesTable
              data={filtered}
              mode={mode}
              showEmail
              loading={list.isPending}
              onRowClick={setSelected}
              // Les actions ouvrent le détail (approbation/rejet/traitement depuis le modal)
              onApprove={setSelected}
              onReject={setSelected}
              onProcess={setSelected}
            />
          </div>
        </div>

        {/* Détail + actions (avec commentaire) */}
        <ExpenseDetailModal
          open={!!selected}
          onClose={() => setSelected(null)}
          expense={selected}
          details={detailQuery.data ?? null}
          mode={mode}
          onApprove={(id, comment) => approve.mutate({ id, comment })}
          onReject={(id, comment) => reject.mutate({ id, comment })}
          onProcess={(id, comment) => process.mutate({ id, comment })}
        />
      </div>
    </Sidebar>
  );
}

export default protectedRoute(ExpensesListPage);
