import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme(); // ⬅️ utiliser resolvedTheme
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="btn"
      aria-label="Toggle theme"
      title={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
    >
      {isDark ? "☀️ Clair" : "🌙 Sombre"}
    </button>
  );
}
