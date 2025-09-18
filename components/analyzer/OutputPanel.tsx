import {
  VStack,
  HStack,
  Heading,
  Badge,
  Box,
} from '@chakra-ui/react'
import { useNeumorphicTheme } from 'theme/components/neumorphic' // Adjust path as needed
import { AnalysisResults } from './AnalysisResults'
import { LoadingSpinner } from './LoadingSpinner'
import { EmptyState } from './EmptyState'

export interface AnalysisResult {
  simplified: string
  redFlags: string[]
}

interface OutputPanelProps {
  analysisResult: AnalysisResult | null
  isAnalyzing: boolean
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  analysisResult,
  isAnalyzing,
}) => {
  // Use the reusable neumorphic theme hook
  const theme = useNeumorphicTheme()

  const renderContent = () => {
    if (isAnalyzing) {
      return <LoadingSpinner />
    }
    if (analysisResult) {
      return <AnalysisResults result={analysisResult} />
    }
    return <EmptyState />
  }

  return (
    <Box
      bg={theme.backgroundColor}
      borderRadius="16px"
      mr="120px"
      p="6"
      boxShadow={theme.getInsetShadow('md')}
      transition="all 0.3s ease"
      position="relative"
    >
      <VStack spacing="6" align="stretch">
        <HStack justify="space-between" align="center">
          <Heading size="md" color={theme.textColor} fontWeight="600">
            Analysis Results
          </Heading>
          <Badge
            bg={theme.backgroundColor}
            color={theme.textColor}
            variant="solid"
            borderRadius="12px"
            px="4"
            py="2"
            boxShadow={`inset 0.5px 0.5px 1px ${theme.darkShadowColor}, inset -0.5px -0.5px 1px ${theme.lightShadowColor}`}
            fontWeight="600"
          >
            Step 2
          </Badge>
        </HStack>

        {/* Simple Content Container */}
        <Box
          borderRadius="12px"
          p="4"
          minH="500px"
          bg="transparent"
          transition="all 0.2s ease"
        >
          {renderContent()}
        </Box>
      </VStack>
    </Box>
  )
}