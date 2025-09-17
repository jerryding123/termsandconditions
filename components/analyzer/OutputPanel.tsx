import {
  VStack,
  HStack,
  Heading,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
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
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

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
    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
      <CardBody>
        <VStack spacing="4" align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size="md" color="green.500">
              ✨ Analysis Results
            </Heading>
            <Badge colorScheme="green" variant="subtle">
              Step 2
            </Badge>
          </HStack>

          {renderContent()}
        </VStack>
      </CardBody>
    </Card>
  )
}