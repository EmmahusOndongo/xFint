// pages/users/new.tsx
import protectedRoute from "../../lib/protectedRoute";
import Sidebar from "../../components/layout/Sidebar";
import { useState } from "react";
import { usersService } from "../../services/users.service";
import { useAuth } from "../../hooks/useAuth";
import { can } from "../../lib/rbac";
import type { Role } from "@/lib/types";
import { ChevronDown } from "lucide-react";

function InviteUserPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [loading, setLoading] = useState(false);
  const [tempPwd, setTempPwd] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!can(user?.role, "user:create")) {
    return (
      <Sidebar>
        <div className="mx-auto max-w-2xl">
          <div className="card p-6">You don't have permission.</div>
        </div>
      </Sidebar>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTempPwd(null);
    setLoading(true);
    try {
      const res = await usersService.create({ email, role, full_name: fullName });
      setEmail("");
      setFullName("");
      setTempPwd(res?.tempPassword ?? null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Unable to create user";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const copyPwd = async () => {
    if (!tempPwd) return;
    try {
      await navigator.clipboard.writeText(tempPwd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Sidebar>
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Inviter un utilisateur</h1>
        </header>

        <div className="card p-6 space-y-5">
          <p className="text-sm" style={{ color: "rgb(var(--muted))" }}>
            Renseigne le nom, l’email et le rôle. Un mot de passe temporaire sera généré.
          </p>

          {error && (
            <div className="form-error">
              <span className="font-medium">Erreur : </span>{error}
            </div>
          )}

          <form className="form" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nom complet */}
              <div className="form-field">
                <label className="form-label">Nom complet</label>
                <input
                  className="input w-full"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex. Jane Doe"
                  autoComplete="name"
                />
                <div className="form-hint">Nom et prénom de l’utilisateur.</div>
              </div>

              {/* Email */}
              <div className="form-field">
                <label className="form-label">Email</label>
                <input
                  className="input w-full"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                />
                <div className="form-hint">Adresse de connexion (obligatoire).</div>
              </div>
            </div>

            {/* Rôle */}
            <div className="form-field">
              <label className="form-label">Rôle</label>
              <div className="relative">
                <select
                  className="input input-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  <option value="EMPLOYEE">Employé(e)</option>
                  <option value="ACCOUNTING">Comptabilité</option>
                  <option value="MANAGER">Manager</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
              </div>
              <div className="form-hint">Détermine ses accès (Notes, Validation, Comptabilité).</div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="btn">
                {loading ? "Création..." : "Envoyer l’invitation"}
              </button>
            </div>
          </form>
        </div>

        {tempPwd && (
          <div className="card p-6">
            <div className="mb-2 text-base font-medium">Mot de passe temporaire</div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <code
                className="flex-1 overflow-x-auto rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                {tempPwd}
              </code>
              <button onClick={copyPwd} className="btn">
                {copied ? "Copié ✓" : "Copier"}
              </button>
            </div>
            <p className="mt-3 text-xs" style={{ color: "rgb(var(--muted))" }}>
              Partage ce mot de passe à l’utilisateur. Il devra le modifier lors de sa première connexion.
            </p>
          </div>
        )}
      </div>
    </Sidebar>
  );
}

export default protectedRoute(InviteUserPage);
