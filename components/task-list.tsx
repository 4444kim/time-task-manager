"use client"

import { useState } from "react"
import { useTaskStore } from "@/lib/store"
import { TaskCard } from "./task-card"
import { DoneHistory } from "./done-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

export function TaskList() {
  const { tasks } = useTaskStore()
  const [activeTab, setActiveTab] = useState("active")

  const activeTasks = tasks.filter((t) => t.status !== "done")
  const doneTasks = tasks.filter((t) => t.status === "done")

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">Активные ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="done">Завершённые ({doneTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Нет активных задач</p>
              <p className="text-sm mt-2">Нажмите N для создания новой</p>
            </div>
          ) : (
            activeTasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </TabsContent>

        <TabsContent value="done">
          <DoneHistory tasks={doneTasks} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
