"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Task {
  id: string
  title: string
  tags: string[]
  expectedTime: number // minutes
  difficulty: number // 1-5
  elapsedMs: number // milliseconds
  points: number
  status: "todo" | "active" | "paused" | "done"
  startedAt: number | null // timestamp
  finishedAt: number | null // timestamp
  createdAt: number
}

interface Settings {
  audioMuted: boolean
  schemaVersion: number
}

interface TaskStore {
  tasks: Task[]
  settings: Settings
  lastActivityAt: number | null
  showInactiveReminder: boolean
  addTask: (
    task: Omit<Task, "id" | "elapsedMs" | "points" | "status" | "startedAt" | "finishedAt" | "createdAt">,
  ) => void
  startTask: (id: string) => void
  pauseTask: (id: string) => void
  resumeTask: (id: string) => void
  finishTask: (id: string) => void
  updateTask: (id: string, updates: Partial<Pick<Task, "title" | "tags" | "difficulty">>) => void
  deleteTask: (id: string) => void
  toggleAudioMute: () => void
  dismissInactiveReminder: () => void
  checkInactiveTimer: () => void
  exportToCSV: (startDate: number, endDate: number) => string
  getAnalytics: (period: "day" | "week" | "month") => Analytics
  recoverTimers: () => void
}

interface Analytics {
  totalTime: number // minutes
  completedTasks: number
  totalPoints: number
  avgDuration: number // minutes
  focusCoefficient: number
  topTags: Array<{ tag: string; time: number; count: number }>
}

const CURRENT_SCHEMA_VERSION = 1

function migrateStore(persistedState: any): any {
  if (!persistedState) return persistedState

  const version = persistedState.settings?.schemaVersion || 0

  if (version < CURRENT_SCHEMA_VERSION) {
    // Migrate from version 0 to 1: convert actualTime to elapsedMs, status names
    if (version === 0) {
      persistedState.tasks = persistedState.tasks?.map((task: any) => ({
        ...task,
        elapsedMs: (task.actualTime || 0) * 60 * 1000,
        status:
          task.status === "idle"
            ? "todo"
            : task.status === "running"
              ? "active"
              : task.status === "paused"
                ? "paused"
                : "done",
        finishedAt: task.completedAt || null,
      }))
      persistedState.settings = {
        ...persistedState.settings,
        schemaVersion: 1,
      }
    }
  }

  return persistedState
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      settings: {
        audioMuted: false,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      lastActivityAt: null,
      showInactiveReminder: false,

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          elapsedMs: 0,
          points: 0,
          status: "todo",
          startedAt: null,
          finishedAt: null,
          createdAt: Date.now(),
        }
        set((state) => ({ tasks: [...state.tasks, task] }))
      },

      startTask: (id) => {
        set((state) => {
          const targetTask = state.tasks.find((t) => t.id === id)
          if (!targetTask) return state
          if (targetTask.status === "done") return state // Can't start done tasks
          if (!targetTask.title.trim()) return state // Can't start empty title

          const now = Date.now()
          const tasks = state.tasks.map((task) => {
            if (task.id === id) {
              return {
                ...task,
                status: "active" as const,
                startedAt: now,
              }
            }
            if (task.status === "active" && task.startedAt) {
              const elapsed = now - task.startedAt
              return {
                ...task,
                status: "paused" as const,
                elapsedMs: task.elapsedMs + elapsed,
                startedAt: null,
              }
            }
            return task
          })
          return { tasks, lastActivityAt: now, showInactiveReminder: false }
        })
      },

      pauseTask: (id) => {
        set((state) => {
          const now = Date.now()
          const tasks = state.tasks.map((task) => {
            if (task.id === id && task.status === "active" && task.startedAt) {
              const elapsed = now - task.startedAt
              return {
                ...task,
                status: "paused" as const,
                elapsedMs: task.elapsedMs + elapsed,
                startedAt: null,
              }
            }
            return task
          })
          return { tasks, lastActivityAt: now }
        })
      },

      resumeTask: (id) => {
        set((state) => {
          const targetTask = state.tasks.find((t) => t.id === id)
          if (!targetTask || targetTask.status !== "paused") return state

          const now = Date.now()
          const tasks = state.tasks.map((task) => {
            if (task.id === id) {
              return {
                ...task,
                status: "active" as const,
                startedAt: now,
              }
            }
            if (task.status === "active" && task.startedAt) {
              const elapsed = now - task.startedAt
              return {
                ...task,
                status: "paused" as const,
                elapsedMs: task.elapsedMs + elapsed,
                startedAt: null,
              }
            }
            return task
          })
          return { tasks, lastActivityAt: now, showInactiveReminder: false }
        })
      },

      finishTask: (id) => {
        set((state) => {
          const now = Date.now()
          const tasks = state.tasks.map((task) => {
            if (task.id === id && (task.status === "active" || task.status === "paused")) {
              let finalElapsedMs = task.elapsedMs
              if (task.status === "active" && task.startedAt) {
                finalElapsedMs += now - task.startedAt
              }

              // Can't finish if no time elapsed
              if (finalElapsedMs === 0) return task

              const finalMinutes = Math.ceil(finalElapsedMs / 1000 / 60)
              const points = finalMinutes * task.difficulty

              if (!state.settings.audioMuted) {
                playFinishSound()
              }

              return {
                ...task,
                status: "done" as const,
                elapsedMs: finalElapsedMs,
                points,
                finishedAt: now,
                startedAt: null,
              }
            }
            return task
          })
          return { tasks, lastActivityAt: now }
        })
      },

      updateTask: (id, updates) => {
        set((state) => {
          const tasks = state.tasks.map((task) => {
            if (task.id === id && task.status === "done") {
              const newDifficulty = updates.difficulty ?? task.difficulty
              const finalMinutes = Math.ceil(task.elapsedMs / 1000 / 60)
              const newPoints = finalMinutes * newDifficulty
              return {
                ...task,
                ...updates,
                points: newPoints,
              }
            }
            return task
          })
          return { tasks }
        })
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }))
      },

      toggleAudioMute: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            audioMuted: !state.settings.audioMuted,
          },
        }))
      },

      dismissInactiveReminder: () => {
        set({ showInactiveReminder: false, lastActivityAt: Date.now() })
      },

      checkInactiveTimer: () => {
        const state = get()
        const hasActiveTask = state.tasks.some((t) => t.status === "active")

        if (!hasActiveTask && state.lastActivityAt) {
          const inactiveMinutes = Math.floor((Date.now() - state.lastActivityAt) / 1000 / 60)

          if (inactiveMinutes >= 10 && !state.showInactiveReminder) {
            set({ showInactiveReminder: true })

            // Request notification permission and send notification
            if (typeof window !== "undefined" && "Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification("Вернитесь к задаче!", {
                  body: "Вы не работали над задачами уже 10 минут",
                  icon: "/icon-192.png",
                })
              } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then((permission) => {
                  if (permission === "granted") {
                    new Notification("Вернитесь к задаче!", {
                      body: "Вы не работали над задачами уже 10 минут",
                      icon: "/icon-192.png",
                    })
                  }
                })
              }
            }
          }
        }
      },

      recoverTimers: () => {
        set((state) => {
          const now = Date.now()
          const tasks = state.tasks.map((task) => {
            if (task.status === "active" && task.startedAt) {
              // Recover elapsed time from timestamp
              const elapsed = now - task.startedAt
              return {
                ...task,
                elapsedMs: task.elapsedMs + elapsed,
                startedAt: now, // Reset startedAt to current time
              }
            }
            return task
          })
          return { tasks }
        })
      },

      exportToCSV: (startDate, endDate) => {
        const state = get()
        const filteredTasks = state.tasks.filter(
          (t) => t.status === "done" && t.finishedAt && t.finishedAt >= startDate && t.finishedAt <= endDate,
        )

        const headers = ["Название", "Теги", "Время (мин)", "Очки", "Дата завершения"]
        const rows = filteredTasks.map((task) => [
          task.title,
          task.tags.join(", "),
          Math.ceil(task.elapsedMs / 1000 / 60).toString(),
          task.points.toString(),
          new Date(task.finishedAt!).toLocaleDateString("ru-RU"),
        ])

        const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

        return csvContent
      },

      getAnalytics: (period) => {
        const state = get()
        const now = Date.now()
        const periodMs = {
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
        }[period]

        const relevantTasks = state.tasks.filter(
          (t) => t.status === "done" && t.finishedAt && now - t.finishedAt < periodMs,
        )

        const totalTimeMinutes = relevantTasks.reduce((sum, t) => sum + Math.ceil(t.elapsedMs / 1000 / 60), 0)
        const totalPoints = relevantTasks.reduce((sum, t) => sum + t.points, 0)
        const completedTasks = relevantTasks.length

        const avgDuration = completedTasks > 0 ? Math.round(totalTimeMinutes / completedTasks) : 0

        // Calculate focus coefficient: ratio of actual time to expected time
        const totalExpected = relevantTasks.reduce((sum, t) => sum + t.expectedTime, 0)
        const focusCoefficient =
          totalExpected > 0 ? Math.min(100, Math.round((totalTimeMinutes / totalExpected) * 100)) : 0

        // Top tags
        const tagMap = new Map<string, { time: number; count: number }>()
        relevantTasks.forEach((task) => {
          const taskMinutes = Math.ceil(task.elapsedMs / 1000 / 60)
          task.tags.forEach((tag) => {
            const current = tagMap.get(tag) || { time: 0, count: 0 }
            tagMap.set(tag, {
              time: current.time + taskMinutes,
              count: current.count + 1,
            })
          })
        })

        const topTags = Array.from(tagMap.entries())
          .map(([tag, data]) => ({ tag, ...data }))
          .sort((a, b) => b.time - a.time)

        return {
          totalTime: totalTimeMinutes,
          completedTasks,
          totalPoints,
          avgDuration,
          focusCoefficient,
          topTags,
        }
      },
    }),
    {
      name: "task-manager-storage",
      version: CURRENT_SCHEMA_VERSION,
      migrate: migrateStore,
    },
  ),
)

function playFinishSound() {
  if (typeof window === "undefined") return

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 800
  oscillator.type = "sine"

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.5)
}
