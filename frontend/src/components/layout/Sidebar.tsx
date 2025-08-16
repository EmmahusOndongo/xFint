// components/layout/Sidebar.tsx
import { useState, useMemo, useEffect } from "react";
import { Menu, X, LayoutDashboard, FileText, UserPlus, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../ui/ThemeToggle";
import { usersService } from "@/services/users.service";

type Role = "EMPLOYEE" | "MANAGER" | "ACCOUNTING";
type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
};

const NAV: Item[] = [
  { href: "/my-expenses", label: "Mes notes", icon: LayoutDashboard, roles: ["EMPLOYEE", "MANAGER", "ACCOUNTING"] },
  { href: "/expenses", label: "Toutes les notes", icon: FileText, roles: ["MANAGER", "ACCOUNTING"] },
  { href: "/users/new", label: "Inviter un utilisateur", icon: UserPlus, roles: ["MANAGER"] },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { url } = await usersService.getAvatarSignedUrl();
        if (mounted) setAvatarUrl(url);
      } catch {
        if (mounted) setAvatarUrl(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const items = useMemo(() => {
    if (!user?.role) return NAV;
    return NAV.filter(i => i.roles.includes(user.role as Role));
  }, [user?.role]);

  const isActive = (href: string) =>
    router.pathname === href || router.asPath === href || router.asPath.startsWith(`${href}/`);

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      {items.map((n) => {
        const Icon = n.icon;
        const active = isActive(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={`nav-item ${active ? "nav-item-active" : ""}`}
          >
            <Icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  const UserProfile = () => (
    <Link
      href="/profile"
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[rgb(var(--accent))] cursor-pointer"
    >
      <img
        src={avatarUrl || "/default-avatar.png"}
        alt={user?.email || "User"}
        className="h-10 w-10 rounded-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/default-avatar.png"; }}
      />
      <div>
        <p className="text-sm font-semibold">{user?.full_name || "Utilisateur"}</p>
        <p className="text-xs text-gray-500">{user?.role}</p>
      </div>
    </Link>
  );

  return (
    <div className="min-h-svh w-full bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      {/* Topbar (mobile) */}
      <div className="topbar md:hidden">
        <button onClick={() => setOpen(true)} className="rounded-xl p-2 hover:bg-[rgb(var(--accent))]">
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">SupHerman</span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[280px_1fr]">
        {/* Sidebar (desktop) — HIDE ON MOBILE */}
        <aside className="sidebar hidden md:flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-extrabold tracking-tight">SupHerman</div>
            <ThemeToggle />
          </div>
          <NavList />
          <div className="mt-auto space-y-4">
            <UserProfile />
            <button
              onClick={() => logout.mutate()}
              className="nav-item w-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Drawer (mobile) */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[rgb(var(--card))] p-4">
              <div className="mb-4 flex items-center justify-between">
                <button className="rounded-xl p-2 hover:bg-[rgb(var(--accent))]" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
                <ThemeToggle />
              </div>
              <NavList onNavigate={() => setOpen(false)} />
              <div className="mt-auto space-y-4">
                <UserProfile />
                <button
                  onClick={() => { setOpen(false); logout.mutate(); }}
                  className="nav-item w-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
