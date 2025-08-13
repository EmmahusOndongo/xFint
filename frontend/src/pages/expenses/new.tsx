// pages/expenses/new.tsx
import protectedRoute from "../../lib/protectedRoute";
import Sidebar from "../../components/layout/Sidebar";
import ExpenseForm from "../../components/forms/ExpenseForm";
import { useExpenses } from "../../hooks/useExpenses";
import { useAuth } from "../../hooks/useAuth";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";

function NewExpensePage() {
  const router = useRouter();
  const { user } = useAuth();

  // le bouton "Retour" renvoie vers la bonne liste selon le rôle
  const backHref = useMemo(
    () => (user?.role === "MANAGER" || user?.role === "ACCOUNTING" ? "/expenses" : "/my-expenses"),
    [user?.role],
  );

  const { create } = useExpenses("mine");

  // après création, on revient à la liste
  useEffect(() => {
    if (create.isSuccess) router.push(backHref);
  }, [create.isSuccess, router, backHref]);

  return (
    <Sidebar>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Nouvelle note de frais</h1>
          <Link href={backHref} className="btn">← Retour</Link>
        </div>

        {/* Petit hint (formats acceptés etc.) */}
        <div
          className="rounded-xl border p-3 text-sm"
          style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--accent))" }}
        >
          Ajoute un <b>titre</b>, un <b>commentaire</b> (optionnel) et une ou plusieurs
          <b> pièces justificatives</b>. Formats conseillés : PDF, JPG, PNG. Taille max ~10 Mo par fichier.
        </div>

        {/* Formulaire */}
        <div className="card p-6">
          <ExpenseForm
            onSubmit={(dto) => create.mutate(dto)}
            loading={create.isPending}
          />
        </div>
      </div>
    </Sidebar>
  );
}

export default protectedRoute(NewExpensePage);
