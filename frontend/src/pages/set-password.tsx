import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { authService } from "../services/auth.service";

export default function SetPasswordPage() {
  const router = useRouter();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Redirections logiques
    authService.me().then((me) => {
      if (!me) {
        router.replace("/login");              // pas connecté
        return;
      }
      if (!me.must_set_password) {
        router.replace("/my-expenses");       // déjà à jour
      }
    });
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (pw1.length < 8) return setErrorMsg("Password must be at least 8 characters.");
    if (pw1 !== pw2) return setErrorMsg("Passwords do not match.");

    try {
      setLoading(true);
      await authService.setPassword({ newPassword: pw1 }); // ✅ correspond au backend
      router.push("/my-expenses");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-4 text-lg font-semibold">Set your password</h1>

        {errorMsg && (
          <div className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">{errorMsg}</div>
        )}

        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-xs font-medium">New password</label>
            <Input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Confirm password</label>
            <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </div>
    </div>
  );
}