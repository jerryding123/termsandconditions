import {
  VStack,
  HStack,
  Heading,
  Textarea,
  Button,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'

interface InputPanelProps {
  inputText: string
  onInputChange: (text: string) => void
  onAnalyze: () => void
  onClear: () => void
  isAnalyzing: boolean
}

export const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  onInputChange,
  onAnalyze,
  onClear,
  isAnalyzing,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0.3)')

  return (
    <Card 
      bg={cardBg} 
      borderRadius="20px"
      border="none"
      boxShadow={useColorModeValue(
        '0 10px 40px -10px rgba(0, 0, 0, 0.12)', 
        '0 10px 40px -10px rgba(0, 0, 0, 0.4)'
      )}
      overflow="hidden"
    >
      <CardBody p="5">
        <VStack spacing="6" align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size="md" color={useColorModeValue('black', 'white')}>
              Input Terms & Conditions
            </Heading>
            <Badge 
              colorScheme="gray" 
              variant="subtle"
              borderRadius="12px"
              px="3"
              py="1"
            >
              Step 1
            </Badge>
          </HStack>
          
          <Textarea
            placeholder="Paste your terms and conditions here...&#10;For example, you can copy from any website's T&C page, app privacy policy, or service agreement."
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            size="md"
            minH="400px"
            resize="vertical"
            borderColor={borderColor}
            borderRadius="16px"
            p="4"
            fontSize="md"
            lineHeight="1.6"
            _focus={{
              borderColor: useColorModeValue('black', 'white'),
              boxShadow: `0 0 0 3px ${useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)')}`,
              outline: "none"
            }}
            _hover={{
              borderColor: useColorModeValue('gray.400', 'gray.500')
            }}
            transition="all 0.2s ease"
          />
          
          <HStack spacing="4">
            <Button
              bg={useColorModeValue('black', 'white')}
              color={useColorModeValue('white', 'black')}
              size="lg"
              onClick={onAnalyze}
              isLoading={isAnalyzing}
              loadingText="Analyzing..."
              isDisabled={!inputText.trim()}
              flex="1"
              borderRadius="8px"
              h="12"
              fontWeight="600"
              _hover={{
                transform: "translateY(-1px)",
                shadow: "lg",
                bg: useColorModeValue('gray.800', 'gray.200')
              }}
              transition="all 0.2s ease"
            >
              Analyze Terms
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={onClear}
              isDisabled={isAnalyzing}
              borderRadius="8px"
              h="12"
              borderWidth="2px"
              borderColor={useColorModeValue('black', 'white')}
              color={useColorModeValue('black', 'white')}
              fontWeight="600"
              _hover={{
                transform: "translateY(-1px)",
                shadow: "md",
                bg: useColorModeValue('gray.50', 'gray.700')
              }}
              transition="all 0.2s ease"
            >
              Clear
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}