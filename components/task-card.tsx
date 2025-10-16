"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useTaskStore, type Task } from "@/lib/store"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Play, Pause, Check, Clock } from "lucide-react"
import { formatTimeMs } from "@/lib/utils"

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { startTask, pauseTask, resumeTask, finishTask } = useTaskStore()
  const [currentTimeMs, setCurrentTimeMs] = useState(task.elapsedMs)
  const [isLoading, setIsLoading] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (task.status === "active" && task.startedAt) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - task.startedAt!
        setCurrentTimeMs(task.elapsedMs + elapsed)
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setCurrentTimeMs(task.elapsedMs)
    }
  }, [task.status, task.startedAt, task.elapsedMs])

  const handleAction = useCallback(
    (action: () => void) => {
      if (isLoading) return

      setIsLoading(true)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        action()
        setIsLoading(false)
      }, 300)
    },
    [isLoading],
  )

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const isActive = task.status === "active"
  const isPaused = task.status === "paused"
  const isTodo = task.status === "todo"
  const canFinish = (isActive || isPaused) && task.elapsedMs > 0
  const canStart = task.title.trim().length > 0

  return (
    <div className="bg-secondary border border-border rounded-lg p-6" data-testid={`task-card-${task.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-foreground mb-2">{task.title}</h3>
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            <Badge variant="secondary" className="text-xs">
              Сложность: {task.difficulty}
            </Badge>
          </div>
        </div>
      </div>

      <div className="bg-background rounded-lg p-6 mb-4">
        <div className="text-center">
          <div className="text-5xl font-mono font-bold text-primary mb-2" data-testid="task-timer">
            {formatTimeMs(currentTimeMs)}
          </div>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            Ожидается: {task.expectedTime} мин
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!isActive && (
          <Button
            onClick={() => handleAction(() => (isPaused ? resumeTask(task.id) : startTask(task.id)))}
            className="flex-1"
            size="lg"
            disabled={!canStart || isLoading}
            data-testid="task-start-button"
          >
            <Play className="h-4 w-4 mr-2" />
            {isPaused ? "Продолжить" : "Старт"}
          </Button>
        )}
        {isActive && (
          <Button
            onClick={() => handleAction(() => pauseTask(task.id))}
            variant="secondary"
            className="flex-1"
            size="lg"
            disabled={isLoading}
            data-testid="task-pause-button"
          >
            <Pause className="h-4 w-4 mr-2" />
            Пауза
          </Button>
        )}
        <Button
          onClick={() => handleAction(() => finishTask(task.id))}
          variant="outline"
          size="lg"
          disabled={!canFinish || isLoading}
          data-testid="task-finish-button"
        >
          <Check className="h-4 w-4 mr-2" />
          Завершить
        </Button>
      </div>
    </div>
  )
}
