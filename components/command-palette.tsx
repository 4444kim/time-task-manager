"use client"
import { useTaskStore } from "@/lib/store"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { Plus, Play, Pause, Check } from "lucide-react"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { tasks, startTask, pauseTask, resumeTask, finishTask } = useTaskStore()
  const activeTasks = tasks.filter((t) => t.status !== "done")

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Поиск команд..." />
      <CommandList>
        <CommandEmpty>Команды не найдены</CommandEmpty>
        <CommandGroup heading="Действия">
          <CommandItem onSelect={() => onOpenChange(false)}>
            <Plus className="mr-2 h-4 w-4" />
            Новая задача (N)
          </CommandItem>
        </CommandGroup>
        {activeTasks.length > 0 && (
          <CommandGroup heading="Задачи">
            {activeTasks.map((task) => (
              <CommandItem
                key={task.id}
                onSelect={() => {
                  if (task.status === "active") {
                    pauseTask(task.id)
                  } else if (task.status === "paused") {
                    resumeTask(task.id)
                  } else {
                    startTask(task.id)
                  }
                  onOpenChange(false)
                }}
              >
                {task.status === "active" ? (
                  <Pause className="mr-2 h-4 w-4" />
                ) : task.status === "paused" ? (
                  <Play className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {task.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {activeTasks.some((t) => t.status === "active" || t.status === "paused") && (
          <CommandGroup heading="Завершить">
            {activeTasks
              .filter((t) => (t.status === "active" || t.status === "paused") && t.elapsedMs > 0)
              .map((task) => (
                <CommandItem
                  key={`finish-${task.id}`}
                  onSelect={() => {
                    finishTask(task.id)
                    onOpenChange(false)
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Завершить: {task.title}
                </CommandItem>
              ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
