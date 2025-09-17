import {
  VStack,
  Box,
  Heading,
  Text,
  Divider,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react'
import { AnalysisResult } from './OutputPanel'

interface AnalysisResultsProps {
  result: AnalysisResult
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  return (
    <VStack spacing="6" align="stretch">
      {/* Simplified Version */}
      <Box>
        <Heading size="sm" mb="3" color="green.600">
          📝 Simplified Explanation
        </Heading>
        <Box
          p="4"
          bg={useColorModeValue('green.50', 'green.900')}
          borderRadius="md"
          borderLeft="4px solid"
          borderLeftColor="green.400"
        >
          <Text lineHeight="tall">
            {result.simplified}
          </Text>
        </Box>
      </Box>

      <Divider />

      {/* Red Flags */}
      <Box>
        <Heading size="sm" mb="3" color="red.600">
          🚩 Potential Red Flags
        </Heading>
        {result.redFlags.length > 0 ? (
          <VStack spacing="2" align="stretch">
            {result.redFlags.map((flag, index) => (
              <Alert key={index} status="warning" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">{flag}</Text>
              </Alert>
            ))}
          </VStack>
        ) : (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              No major red flags detected in these terms.
            </Text>
          </Alert>
        )}
      </Box>
    </VStack>
  )
}