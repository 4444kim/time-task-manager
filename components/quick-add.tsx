"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useTaskStore } from "@/lib/store"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Plus } from "lucide-react"
import { useKeyboardShortcuts } from "@/lib/hooks"

export function QuickAdd() {
  const { addTask } = useTaskStore()
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [expectedTime, setExpectedTime] = useState("30")
  const [difficulty, setDifficulty] = useState("3")
  const titleInputRef = useRef<HTMLInputElement>(null)

  useKeyboardShortcuts({
    onNew: () => {
      titleInputRef.current?.focus()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const parsedTags = tags
      .split(/[,\s#]+/)
      .filter(Boolean)
      .map((t) => t.trim())

    addTask({
      title: title.trim(),
      tags: parsedTags,
      expectedTime: Number.parseInt(expectedTime) || 30,
      difficulty: Math.min(5, Math.max(1, Number.parseInt(difficulty) || 3)),
    })

    setTitle("")
    setTags("")
    setExpectedTime("30")
    setDifficulty("3")
    titleInputRef.current?.focus()
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6" data-testid="quick-add-form">
      <h2 className="text-lg font-medium mb-4">Быстрое добавление</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="title">Название задачи</Label>
            <Input
              ref={titleInputRef}
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              className="mt-1.5"
              data-testid="task-title-input"
            />
          </div>
          <div>
            <Label htmlFor="tags">Теги</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#работа #важное"
              className="mt-1.5"
              data-testid="task-tags-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">Время (мин)</Label>
              <Input
                id="time"
                type="number"
                value={expectedTime}
                onChange={(e) => setExpectedTime(e.target.value)}
                min="1"
                className="mt-1.5"
                data-testid="task-time-input"
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Сложность</Label>
              <Input
                id="difficulty"
                type="number"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                min="1"
                max="5"
                className="mt-1.5"
                data-testid="task-difficulty-input"
              />
            </div>
          </div>
        </div>
        <Button type="submit" className="w-full" data-testid="add-task-button">
          <Plus className="h-4 w-4 mr-2" />
          Добавить задачу (N)
        </Button>
      </form>
    </div>
  )
}
