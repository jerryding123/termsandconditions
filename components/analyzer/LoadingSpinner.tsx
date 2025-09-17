import {
  Box,
  VStack,
  Spinner,
  Text,
} from '@chakra-ui/react'

export const LoadingSpinner: React.FC = () => {
  return (
    <Box
      minH="400px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing="4" textAlign="center">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text color="gray.600">
          Analyzing your terms and conditions...
        </Text>
        <Text fontSize="sm" color="gray.500">
          This usually takes a few seconds
        </Text>
      </VStack>
    </Box>
  )
}