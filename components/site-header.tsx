"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-[1800px] px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        <nav aria-label="Главная навигация" className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight hover:opacity-90"
          >
            Задачи
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
