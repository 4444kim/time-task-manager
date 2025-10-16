"use client"

import type React from "react"

import { useState } from "react"
import { type Task, useTaskStore } from "@/lib/store"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Search, Clock, Trophy, Edit2 } from "lucide-react"
import { formatTimeMs } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"

interface DoneHistoryProps {
  tasks: Task[]
}

export function DoneHistory({ tasks }: DoneHistoryProps) {
  const [search, setSearch] = useState("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { updateTask } = useTaskStore()

  const filteredTasks = tasks.filter((task) => {
    const searchLower = search.toLowerCase()
    return (
      task.title.toLowerCase().includes(searchLower) || task.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    )
  })

  const handleEdit = (task: Task, updates: Partial<Task>) => {
    updateTask(task.id, updates)
    setEditingTask(null)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию или тегам..."
          className="pl-10"
          data-testid="done-search-input"
        />
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Нет завершённых задач</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-secondary border border-border rounded-lg p-4"
              data-testid="done-task-card"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-foreground">{task.title}</h4>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTask(task)}
                      data-testid="edit-task-button"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Редактировать задачу</DialogTitle>
                    </DialogHeader>
                    <EditTaskForm task={task} onSave={(updates) => handleEdit(task, updates)} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeMs(task.elapsedMs)}
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {task.points} очков
                </div>
                <div className="text-xs">Сложность: {task.difficulty}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EditTaskForm({
  task,
  onSave,
}: {
  task: Task
  onSave: (updates: Partial<Task>) => void
}) {
  const [title, setTitle] = useState(task.title)
  const [tags, setTags] = useState(task.tags.join(", "))
  const [difficulty, setDifficulty] = useState(task.difficulty.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedTags = tags
      .split(/[,\s]+/)
      .filter(Boolean)
      .map((t) => t.trim())

    onSave({
      title: title.trim(),
      tags: parsedTags,
      difficulty: Math.min(5, Math.max(1, Number.parseInt(difficulty) || 3)),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-title">Название</Label>
        <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="edit-tags">Теги</Label>
        <Input id="edit-tags" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="edit-difficulty">Сложность (1-5)</Label>
        <Input
          id="edit-difficulty"
          type="number"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          min="1"
          max="5"
          className="mt-1.5"
        />
      </div>
      <Button type="submit" className="w-full">
        Сохранить
      </Button>
    </form>
  )
}
