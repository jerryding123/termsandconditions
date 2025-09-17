import {
  Box,
  VStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'

export const EmptyState: React.FC = () => {
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      minH="400px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="md"
      bg={useColorModeValue('gray.50', 'gray.700')}
      borderWidth="2px"
      borderStyle="dashed"
      borderColor={borderColor}
    >
      <VStack spacing="3" textAlign="center" color="gray.500">
        <Text fontSize="lg">🤖</Text>
        <Text>Your analysis will appear here</Text>
        <Text fontSize="sm">
          Paste some terms and conditions on the left to get started
        </Text>
      </VStack>
    </Box>
  )
}