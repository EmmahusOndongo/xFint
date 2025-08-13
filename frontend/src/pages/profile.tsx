// pages/profile.tsx
import protectedRoute from "../lib/protectedRoute";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../hooks/useAuth";

function initials(full?: string, email?: string) {
  const src = full || email || "";
  return src
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "U";
}

function ProfilePage() {
  const { user } = useAuth();

  return (
    <Sidebar>
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-semibold">Profile</h1>

        {/* Carte identité */}
        <div className="card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
                style={{ backgroundColor: "rgb(var(--accent))" }}
              >
                {initials(user?.full_name, user?.email)}
              </div>
              <div>
                <div className="text-base font-medium">
                  {user?.full_name || user?.email}
                </div>
                <div className="text-sm" style={{ color: "rgb(var(--muted))" }}>
                  {user?.email}
                </div>
              </div>
            </div>

            <a href="/set-password" className="btn">
              Changer le mot de passe
            </a>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <div className="text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                Rôle
              </div>
              <div className="mt-1">{user?.role}</div>
            </div>

            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <div className="text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                Thème
              </div>
              <div className="mt-1">Sombre / Clair (via le switch dans la sidebar)</div>
            </div>
          </div>
        </div>

        {/* Sécurité (exemple) */}
        <div className="card p-6">
          <div className="mb-3 text-base font-medium">Sécurité</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <div className="text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                2FA
              </div>
              <div className="mt-1">Désactivée</div>
              <button className="mt-3 btn">Activer l’A2F</button>
            </div>
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <div className="text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                Sessions actives
              </div>
              <div className="mt-1">Cette session</div>
              <button className="mt-3 btn">Se déconnecter partout</button>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

export default protectedRoute(ProfilePage);
