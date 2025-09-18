import {
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { useState } from 'react'
import { InputPanel } from './InputPanel'
import { OutputPanel, AnalysisResult } from './OutputPanel'

// Helper function to safely extract error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

// Helper function to check if error message contains specific text
const errorMessageIncludes = (error: unknown, searchText: string): boolean => {
  const message = getErrorMessage(error)
  return message.toLowerCase().includes(searchText.toLowerCase())
}

export const TermsAnalyzer: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async () => {
    if (!inputText.trim()) return
    
    setIsAnalyzing(true)
    setAnalysisResult(null) // Clear previous results
    
    try {
      // Get API URL from environment variables
      const apiUrl = process.env.REACT_APP_API_URL
      
      if (!apiUrl) {
        throw new Error('API URL not configured. Please set REACT_APP_API_URL in your .env file.')
      }
      
      console.log('Sending analysis request to:', `${apiUrl}/api/analyze/terms`)
      
      const response = await fetch(`${apiUrl}/api/analyze/terms`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText })
      })
      
      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }))
        throw new Error(errorData.error || errorData.details || `Server error: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Validate response structure
      if (result.success && result.data) {
        setAnalysisResult(result.data)
        
        // Optional: Log usage information for debugging (remove in production)
        if (result.metadata?.usage && process.env.NODE_ENV === 'development') {
          console.log('Analysis completed successfully:', {
            tokensUsed: result.metadata.usage.totalTokens,
            estimatedCost: `$${result.metadata.usage.estimatedCost}`,
            processingTime: `${result.metadata.processingTime}ms`,
            reasoningEffort: result.metadata.reasoningEffort
          })
        }
      } else {
        throw new Error('Invalid response format from server')
      }
      
    } catch (error: unknown) {
      console.error('Analysis failed:', error)
      
      // Safely extract error message
      const errorMessage = getErrorMessage(error)
      
      // Provide user-friendly error messages
      let userMessage = 'Sorry, we couldn\'t analyze your terms right now.'
      let errorDetails = errorMessage
      
      // Handle specific error types using our safe helper function
      if (errorMessageIncludes(error, 'Failed to fetch') || errorMessageIncludes(error, 'NetworkError')) {
        userMessage = 'Unable to connect to the analysis service.'
        errorDetails = 'Please check your internet connection and try again.'
      } else if (errorMessageIncludes(error, '429')) {
        userMessage = 'Service is temporarily busy.'
        errorDetails = 'Please wait a moment and try again.'
      } else if (errorMessageIncludes(error, '500')) {
        userMessage = 'Analysis service is temporarily unavailable.'
        errorDetails = 'Please try again in a few minutes.'
      } else if (errorMessageIncludes(error, 'API URL not configured')) {
        userMessage = 'Configuration error.'
        errorDetails = 'Please contact support if this issue persists.'
      }
      
      // Set error state for user feedback
      setAnalysisResult({
        simplified: userMessage,
        redFlags: [`Error: ${errorDetails}`]
      })
      
      // Optional: You can add toast notifications here if you have a toast library
      // toast.error(`Analysis failed: ${userMessage}`)
      
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setInputText('')
    setAnalysisResult(null)
  }

  const handleInputChange = (text: string) => {
    setInputText(text)
    // Clear results when input changes
    if (analysisResult) {
      setAnalysisResult(null)
    }
  }

  return (
    <Grid
      templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
      gap="8"
      w="full"
      maxW="7xl"
    >
      <GridItem>
        <InputPanel
          inputText={inputText}
          onInputChange={handleInputChange}
          onAnalyze={handleAnalyze}
          onClear={handleClear}
          isAnalyzing={isAnalyzing}
        />
      </GridItem>
      <GridItem>
        <OutputPanel
          analysisResult={analysisResult}
          isAnalyzing={isAnalyzing}
        />
      </GridItem>
    </Grid>
  )
}