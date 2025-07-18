"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, FileText, Search, AlertTriangle, FileCheck } from "lucide-react"

export function ProcessingStatus() {
  const steps = [
    { id: 1, name: "Document Processing", icon: FileText, status: "completed" },
    { id: 2, name: "Text Extraction", icon: Search, status: "completed" },
    { id: 3, name: "Clause Analysis", icon: AlertTriangle, status: "processing" },
    { id: 4, name: "Risk Assessment", icon: FileCheck, status: "pending" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Processing Contract
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={60} className="w-full" />

        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    step.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : step.status === "processing"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{step.name}</p>
                  <p className="text-xs text-slate-600">
                    {step.status === "completed"
                      ? "Completed"
                      : step.status === "processing"
                        ? "In progress..."
                        : "Pending"}
                  </p>
                </div>
                {step.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
