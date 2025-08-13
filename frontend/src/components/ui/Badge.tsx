import { clsx } from "clsx";

export default function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: "gray" | "green" | "red" | "yellow" }) {
  const map: Record<string, string> = {
    gray: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
    green: "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    red: "bg-rose-200 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
    yellow: "bg-amber-200 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100",
  };
  return <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", map[color])}>{children}</span>;
}