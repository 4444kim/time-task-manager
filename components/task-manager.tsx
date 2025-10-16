"use client";

import { useKeyboardShortcuts } from "@/lib/hooks";
import { useTaskStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Analytics } from "./analytics";
import { CommandPalette } from "./command-palette";
import { InactiveReminder } from "./inactive-reminder";
import { QuickAdd } from "./quick-add";
import { TaskList } from "./task-list";

export function TaskManager() {
  const [commandOpen, setCommandOpen] = useState(false);
  const { checkInactiveTimer, recoverTimers, showInactiveReminder } =
    useTaskStore();

  useEffect(() => {
    recoverTimers();
  }, [recoverTimers]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkInactiveTimer();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkInactiveTimer]);

  useKeyboardShortcuts({
    onCommandK: () => setCommandOpen(true),
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Менеджер задач
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Фокус на времени и продуктивности
            </p>
          </div>
        </header>

        {showInactiveReminder && <InactiveReminder />}

        <section
          aria-label="Список задач и быстрые действия"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            <TaskList />
            <QuickAdd />
          </div>
          <div className="lg:col-span-1">
            <Analytics />
          </div>
        </section>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
