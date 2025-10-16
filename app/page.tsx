"use client"

import { TaskManager } from "@/components/task-manager"
import { PWARegister } from "@/components/pwa-register"

export default function Home() {
  return (
    <>
      <PWARegister />
      <TaskManager />
    </>
  )
}
