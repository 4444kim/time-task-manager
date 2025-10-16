"use client"

import { useState, useEffect } from "react"
import { TaskList } from "./task-list"
import { Analytics } from "./analytics"
import { QuickAdd } from "./quick-add"
import { CommandPalette } from "./command-palette"
import { InactiveReminder } from "./inactive-reminder"
import { useTaskStore } from "@/lib/store"
import { useKeyboardShortcuts } from "@/lib/hooks"

export function TaskManager() {
  const [commandOpen, setCommandOpen] = useState(false)
  const { checkInactiveTimer, recoverTimers, showInactiveReminder } = useTaskStore()

  useEffect(() => {
    recoverTimers()
  }, [recoverTimers])

  useEffect(() => {
    const interval = setInterval(() => {
      checkInactiveTimer()
    }, 60000)

    return () => clearInterval(interval)
  }, [checkInactiveTimer])

  useKeyboardShortcuts({
    onCommandK: () => setCommandOpen(true),
  })

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Менеджер задач</h1>
          <p className="text-sm text-muted-foreground mt-1">Фокус на времени и продуктивности</p>
        </header>

        {showInactiveReminder && <InactiveReminder />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TaskList />
            <QuickAdd />
          </div>
          <div className="lg:col-span-1">
            <Analytics />
          </div>
        </div>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
