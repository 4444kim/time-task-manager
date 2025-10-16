"use client"

import { useState } from "react"
import { useTaskStore } from "@/lib/store"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Card } from "./ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Clock, Target, Trophy, TrendingUp, Download, Volume2, VolumeX } from "lucide-react"
import { Button } from "./ui/button"
import { downloadCSV } from "@/lib/utils"

type Period = "day" | "week" | "month"

export function Analytics() {
  const [period, setPeriod] = useState<Period>("day")
  const { getAnalytics, exportToCSV, settings, toggleAudioMute } = useTaskStore()
  const analytics = getAnalytics(period)

  const chartData = analytics.topTags.slice(0, 5).map((tag) => ({
    name: tag.tag,
    time: tag.time,
    tasks: tag.count,
  }))

  const handleExport = () => {
    const now = Date.now()
    const periodMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    }[period]

    const startDate = now - periodMs
    const csv = exportToCSV(startDate, now)
    const periodName = { day: "день", week: "неделя", month: "месяц" }[period]
    downloadCSV(csv, `задачи-${periodName}-${new Date().toISOString().split("T")[0]}.csv`)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6" data-testid="analytics-panel">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Аналитика</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAudioMute}
              title={settings.audioMuted ? "Включить звук" : "Выключить звук"}
              data-testid="audio-toggle-button"
            >
              {settings.audioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              title="Экспорт в CSV"
              data-testid="export-csv-button"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">День</TabsTrigger>
            <TabsTrigger value="week">Неделя</TabsTrigger>
            <TabsTrigger value="month">Месяц</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Время</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {analytics.totalTime}
            <span className="text-sm text-muted-foreground ml-1">мин</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="h-4 w-4" />
            <span className="text-xs">Задач</span>
          </div>
          <div className="text-2xl font-bold text-primary">{analytics.completedTasks}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Trophy className="h-4 w-4" />
            <span className="text-xs">Очки</span>
          </div>
          <div className="text-2xl font-bold text-primary">{analytics.totalPoints}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Фокус</span>
          </div>
          <div className="text-2xl font-bold text-primary">{analytics.focusCoefficient}%</div>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Топ теги по времени</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fill: "#737373", fontSize: 12 }} axisLine={{ stroke: "#262626" }} />
              <YAxis tick={{ fill: "#737373", fontSize: 12 }} axisLine={{ stroke: "#262626" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0a",
                  border: "1px solid #262626",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#ededed" }}
              />
              <Bar dataKey="time" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">Нет данных для отображения</div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Средняя длительность</h3>
        <div className="text-3xl font-bold text-foreground">
          {analytics.avgDuration}
          <span className="text-sm text-muted-foreground ml-2">мин</span>
        </div>
      </div>
    </div>
  )
}
