import { StateGraph, END } from "@langchain/langgraph"
import type { BaseMessage } from "@langchain/core/messages"
import { DocumentProcessor } from "./agents/document-processor"
import { ClauseExtractor } from "./agents/clause-extractor"
import { RiskAnalyzer } from "./agents/risk-analyzer"
import { ReportGenerator } from "./agents/report-generator"

export interface ContractState {
  document: string
  filename: string
  extractedText: string
  sections: Array<{
    title: string
    content: string
    type: string
  }>
  clauses: Array<{
    type: string
    content: string
    riskLevel: "low" | "medium" | "high"
    analysis: string
  }>
  riskAssessment: {
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
  report: string
  messages: BaseMessage[]
}

export class ContractAnalysisWorkflow {
  private workflow: StateGraph<ContractState>
  private documentProcessor: DocumentProcessor
  private clauseExtractor: ClauseExtractor
  private riskAnalyzer: RiskAnalyzer
  private reportGenerator: ReportGenerator

  constructor() {
    this.documentProcessor = new DocumentProcessor()
    this.clauseExtractor = new ClauseExtractor()
    this.riskAnalyzer = new RiskAnalyzer()
    this.reportGenerator = new ReportGenerator()

    this.workflow = this.buildWorkflow()
  }

  private buildWorkflow(): StateGraph<ContractState> {
    const workflow = new StateGraph<ContractState>({
      channels: {
        document: null,
        filename: null,
        extractedText: null,
        sections: null,
        clauses: null,
        riskAssessment: null,
        keyTerms: null,
        report: null,
        messages: null,
      },
    })

    // Add nodes
    workflow.addNode("process_document", this.processDocument.bind(this))
    workflow.addNode("extract_clauses", this.extractClauses.bind(this))
    workflow.addNode("analyze_risk", this.analyzeRisk.bind(this))
    workflow.addNode("generate_report", this.generateReport.bind(this))

    // Define edges
    workflow.addEdge("__start__", "process_document")
    workflow.addEdge("process_document", "extract_clauses")
    workflow.addEdge("extract_clauses", "analyze_risk")
    workflow.addEdge("analyze_risk", "generate_report")
    workflow.addEdge("generate_report", END)

    return workflow.compile()
  }

  private async processDocument(state: ContractState): Promise<Partial<ContractState>> {
    console.log("Processing document:", state.filename)

    const result = await this.documentProcessor.process(state.document, state.filename)

    return {
      extractedText: result.text,
      sections: result.sections,
      keyTerms: result.keyTerms,
    }
  }

  private async extractClauses(state: ContractState): Promise<Partial<ContractState>> {
    console.log("Extracting clauses from document")

    const clauses = await this.clauseExtractor.extract(state.extractedText, state.sections)

    return {
      clauses,
    }
  }

  private async analyzeRisk(state: ContractState): Promise<Partial<ContractState>> {
    console.log("Analyzing contract risks")

    const riskAssessment = await this.riskAnalyzer.analyze(state.clauses, state.keyTerms)

    return {
      riskAssessment,
    }
  }

  private async generateReport(state: ContractState): Promise<Partial<ContractState>> {
    console.log("Generating analysis report")

    const report = await this.reportGenerator.generate({
      filename: state.filename,
      clauses: state.clauses,
      riskAssessment: state.riskAssessment,
      keyTerms: state.keyTerms,
    })

    return {
      report,
    }
  }

  async analyze(document: string, filename: string): Promise<ContractState> {
    const initialState: ContractState = {
      document,
      filename,
      extractedText: "",
      sections: [],
      clauses: [],
      riskAssessment: {
        overallRisk: "low",
        criticalIssues: [],
        recommendations: [],
      },
      keyTerms: {
        parties: [],
        effectiveDate: "",
        terminationDate: "",
        paymentTerms: "",
        governingLaw: "",
      },
      report: "",
      messages: [],
    }

    const result = await this.workflow.invoke(initialState)
    return result as ContractState
  }
}
