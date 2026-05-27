"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const labels: Record<keyof typeof icons, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
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

  const current = (theme as keyof typeof icons) ?? "system";
  const Icon = icons[current];
  const label = labels[current];

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-1 rounded-md bg-muted hover:bg-accent transition-colors text-muted-foreground hover:text-foreground text-sm px-2 py-1"
      aria-label={`Theme: ${label}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
