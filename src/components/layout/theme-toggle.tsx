"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  function cycle() {
    if (theme === "system") return setTheme("light");
    if (theme === "light") return setTheme("dark");
    setTheme("system");
  }

  const label =
    theme === "system" ? "Auto" : resolvedTheme === "dark" ? "Dark" : "Light";

  return (
    <button
      onClick={cycle}
      className="text-xs px-2 py-1 rounded-md bg-accent text-muted-foreground hover:text-foreground transition-colors"
      aria-label={`Theme: ${label}`}
    >
      {label}
    </button>
  );
}
