"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const effective = (resolvedTheme ?? theme ?? systemTheme) as
    | string
    | undefined;
  const isDark = effective === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {!mounted ? (
        <Sun className="size-5" />
      ) : isDark ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </Button>
  );
}
