// Analysis result interface
export interface AnalysisResult {
  simplified: string
  redFlags: string[]
}

// API request/response interfaces for when you implement the backend
export interface AnalyzeTermsRequest {
  text: string
}

export interface AnalyzeTermsResponse {
  success: boolean
  data?: AnalysisResult
  error?: string
}

// Component prop interfaces
export interface InputPanelProps {
  inputText: string
  onInputChange: (text: string) => void
  onAnalyze: () => void
  onClear: () => void
  isAnalyzing: boolean
}

export interface OutputPanelProps {
  analysisResult: AnalysisResult | null
  isAnalyzing: boolean
}

export interface AnalysisResultsProps {
  result: AnalysisResult
}