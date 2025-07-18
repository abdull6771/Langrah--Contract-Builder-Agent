"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Download, FileText, Calendar, Users, DollarSign } from "lucide-react"
import type { ContractAnalysis } from "@/app/page"

interface AnalysisResultsProps {
  analysis: ContractAnalysis
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <AlertTriangle className="h-4 w-4" />
      case "low":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/generate-report/${analysis.id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${analysis.filename}-analysis-report.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading report:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {analysis.filename}
            </CardTitle>
            <CardDescription>Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getRiskColor(analysis.riskSummary?.overallRisk || "low")}>
              {getRiskIcon(analysis.riskSummary?.overallRisk || "low")}
              {analysis.riskSummary?.overallRisk?.toUpperCase() || "LOW"} RISK
            </Badge>
            <Button onClick={downloadReport} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clauses">Clauses</TabsTrigger>
            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
            <TabsTrigger value="terms">Key Terms</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Critical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.riskSummary?.criticalIssues?.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.riskSummary.criticalIssues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-600">No critical issues identified</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.riskSummary?.recommendations?.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.riskSummary.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-600">No specific recommendations</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clauses" className="space-y-4">
            {analysis.extractedClauses?.map((clause, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm capitalize">{clause.type} Clause</CardTitle>
                    <Badge className={getRiskColor(clause.riskLevel)}>{clause.riskLevel.toUpperCase()}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Content:</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{clause.content}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Analysis:</h4>
                    <p className="text-sm text-slate-600">{clause.analysis}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Overall Risk Level:</span>
                  <Badge className={getRiskColor(analysis.riskSummary?.overallRisk || "low")}>
                    {analysis.riskSummary?.overallRisk?.toUpperCase() || "LOW"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Risk Factors:</h4>
                  {analysis.extractedClauses
                    ?.filter((c) => c.riskLevel !== "low")
                    .map((clause, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded">
                        {getRiskIcon(clause.riskLevel)}
                        <div>
                          <p className="font-medium text-sm capitalize">{clause.type}</p>
                          <p className="text-sm text-slate-600">{clause.analysis}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    Parties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {analysis.keyTerms?.parties?.map((party, index) => (
                      <li key={index} className="text-sm">
                        {party}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Effective Date:</span>{" "}
                    {analysis.keyTerms?.effectiveDate || "Not specified"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Termination Date:</span>{" "}
                    {analysis.keyTerms?.terminationDate || "Not specified"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4" />
                    Payment Terms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.keyTerms?.paymentTerms || "Not specified"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    Governing Law
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.keyTerms?.governingLaw || "Not specified"}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
