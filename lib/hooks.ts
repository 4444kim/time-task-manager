"use client"

import { useEffect } from "react"

interface KeyboardShortcuts {
  onCommandK?: () => void
  onNew?: () => void
  onStart?: () => void
  onFinish?: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        shortcuts.onCommandK?.()
      }

      // N for new task
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !isInputFocused()) {
        e.preventDefault()
        shortcuts.onNew?.()
      }

      // S for start/pause
      if (e.key === "s" && !e.metaKey && !e.ctrlKey && !isInputFocused()) {
        e.preventDefault()
        shortcuts.onStart?.()
      }

      // F for finish
      if (e.key === "f" && !e.metaKey && !e.ctrlKey && !isInputFocused()) {
        e.preventDefault()
        shortcuts.onFinish?.()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}

function isInputFocused() {
  const activeElement = document.activeElement
  return (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    activeElement?.getAttribute("contenteditable") === "true"
  )
}
