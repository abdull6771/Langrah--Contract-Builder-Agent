"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, AlertTriangle, CheckCircle } from "lucide-react"
import { ContractUpload } from "@/components/contract-upload"
import { AnalysisResults } from "@/components/analysis-results"
import { ProcessingStatus } from "@/components/processing-status"

export interface ContractAnalysis {
  id: string
  filename: string
  status: "processing" | "completed" | "error"
  extractedClauses: Array<{
    type: string
    content: string
    riskLevel: "low" | "medium" | "high"
    analysis: string
  }>
  riskSummary: {
    overallRisk: "low" | "medium" | "high"
    criticalIssues: string[]
    recommendations: string[]
  }
  keyTerms: {
    parties: string[]
    effectiveDate: string
    terminationDate: string
    paymentTerms: string
    governingLaw: string
  }
  createdAt: string
}

export default function ContractIQDashboard() {
  const [analyses, setAnalyses] = useState<ContractAnalysis[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("contract", file)

      const response = await fetch("/api/analyze-contract", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const analysis = await response.json()
      setAnalyses((prev) => [analysis, ...prev])
    } catch (error) {
      console.error("Error analyzing contract:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const stats = {
    totalContracts: analyses.length,
    highRisk: analyses.filter((a) => a.riskSummary?.overallRisk === "high").length,
    mediumRisk: analyses.filter((a) => a.riskSummary?.overallRisk === "medium").length,
    lowRisk: analyses.filter((a) => a.riskSummary?.overallRisk === "low").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">ContractIQ Builder</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            AI-powered contract review and risk analysis system powered by LangGraph
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContracts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.mediumRisk}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.lowRisk}</div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Contract for Analysis
            </CardTitle>
            <CardDescription>
              Upload PDF or DOCX contracts for AI-powered risk analysis and clause extraction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContractUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
          </CardContent>
        </Card>

        {/* Processing Status */}
        {isProcessing && <ProcessingStatus />}

        {/* Analysis Results */}
        {analyses.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
            {analyses.map((analysis) => (
              <AnalysisResults key={analysis.id} analysis={analysis} />
            ))}
          </div>
        )}

        {analyses.length === 0 && !isProcessing && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No contracts analyzed yet</h3>
              <p className="text-slate-600">Upload your first contract to get started with AI-powered analysis</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
