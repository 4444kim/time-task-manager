"use client"

import { useTaskStore } from "@/lib/store"
import { Button } from "./ui/button"
import { AlertCircle, X } from "lucide-react"

export function InactiveReminder() {
  const { dismissInactiveReminder, tasks, startTask } = useTaskStore()

  const handleStartLast = () => {
    // Find the last paused or todo task
    const lastTask = [...tasks].reverse().find((t) => t.status === "paused" || t.status === "todo")

    if (lastTask) {
      startTask(lastTask.id)
    }
    dismissInactiveReminder()
  }

  return (
    <div
      className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between"
      data-testid="inactive-reminder"
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">Вернитесь к задаче!</p>
          <p className="text-xs text-muted-foreground">Вы не работали над задачами уже 10 минут</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleStartLast} size="sm" data-testid="start-last-button">
          Начать последнюю
        </Button>
        <Button onClick={dismissInactiveReminder} variant="ghost" size="sm" data-testid="dismiss-reminder-button">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
