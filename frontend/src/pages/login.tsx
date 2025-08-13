// pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { authService } from "../services/auth.service";
import ThemeToggle from "../components/ui/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await authService.login({ email, password });       // crée les cookies
      const me = await authService.me();                  // lit must_set_password
      if (me?.must_set_password) router.push("/set-password");
      else router.push("/my-expenses");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Email ou mot de passe invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-svh place-items-center p-6 bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      {/* Toggle de thème en haut à droite */}
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      {/* Carte de connexion */}
      <div className="card w-full max-w-sm p-6">
        <h1 className="mb-2 text-xl font-semibold">Connexion</h1>
        <p className="mb-4 text-sm" style={{ color: "rgb(var(--muted))" }}>
          Accède à ton espace SupHerman.
        </p>

        {errorMsg && (
          <div className="form-error mb-4">
            <span className="font-medium">Erreur : </span>{errorMsg}
          </div>
        )}

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold">Mot de passe</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn w-full">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}