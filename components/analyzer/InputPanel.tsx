import {
  VStack,
  HStack,
  Heading,
  Textarea,
  Button,
  Badge,
  Box,
  Text,
} from '@chakra-ui/react'
import { useNeumorphicTheme } from 'theme/components/neumorphic' // Adjust path as needed

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
  // Use the reusable neumorphic theme hook
  const theme = useNeumorphicTheme()

  return (
    <Box
      bg={theme.backgroundColor}
      borderRadius="8px"
      ml="30px"
      pl="8"
      pr="8"
      pt="6"
      pb="8"
      boxShadow={theme.getRaisedShadow('sm')}
      transition="all 0.3s ease"
      position="relative"
    >
      <VStack spacing="4" align="stretch">
        <HStack justify="space-between" align="center">
          <Heading size="md" color={theme.textColor} fontWeight="700">
            Input Terms & Conditions
          </Heading>
          <Badge
            bg={theme.backgroundColor}
            color={theme.textColor}
            variant="solid"
            borderRadius="8px"
            px="2.5"
            py="1.5"
            boxShadow={`inset 0.5px 0.5px 1px ${theme.darkShadowColor}, inset -0.5px -0.5px 1px ${theme.lightShadowColor}`}
            fontWeight="600"
          >
            Step 1
          </Badge>
        </HStack>

        {/* Descriptive text section */}
        <Box>
          <Text 
            color={theme.textColor} 
            fontSize="sm" 
            lineHeight="1.6"
            opacity="0.6"
            mb="2"
          >
            Paste any terms and conditions document below to get a clear, easy-to-understand analysis. 
            Our AI will identify key points, potential concerns, and important clauses you should know about.
          </Text>
        </Box>

        {/* Neumorphic Textarea Container - more subtle */}
        <Box
          borderRadius="4px"
          p="1"
          boxShadow={theme.getInsetShadow('sm')}
        >
          <Textarea
            // placeholder="Paste your terms and conditions here...&#10;For example, you can copy from any website's T&C page, app privacy policy, or service agreement."
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            size="md"
            minH="600px"
            resize="vertical"
            border="none"
            borderRadius="10px"
            p="2"
            fontSize="md"
            lineHeight="1.6"
            bg="transparent"
            color={theme.textColor}
            _placeholder={{ color: theme.placeholderColor }}
            _focus={{
              outline: "none",
              boxShadow: "none"
            }}
            _hover={{}}
            transition="all 0.2s ease"
          />
        </Box>

        <HStack spacing="4">
          <Button
            bg={theme.backgroundColor}
            color={theme.textColor}
            size="lg"
            onClick={onAnalyze}
            isLoading={isAnalyzing}
            loadingText="Analyzing..."
            isDisabled={!inputText.trim()}
            flex="1"
            borderRadius="8px"
            h="14"
            fontWeight="600"
            border="none"
            boxShadow={theme.getButtonHoverShadow()}
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: theme.getButtonHoverShadow(),
              bg: theme.backgroundColor,
            }}
            _active={{
              transform: "translateY(1px)",
              boxShadow: theme.getButtonActiveShadow(),
            }}
            _disabled={{
              opacity: 0.6,
              transform: "none",
              boxShadow: `inset 0.5px 0.5px 1px ${theme.darkShadowColor}, inset -0.5px -0.5px 1px ${theme.lightShadowColor}`,
            }}
            transition="all 0.2s ease"
          >
            Analyze Terms
          </Button>

          <Button
            bg={theme.backgroundColor}
            color={theme.textColor}
            size="lg"
            onClick={onClear}
            isDisabled={isAnalyzing}
            borderRadius="8px"
            h="14"
            fontWeight="600"
            border="none"
            boxShadow={theme.getButtonHoverShadow()}
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: theme.getButtonHoverShadow(),
              bg: theme.backgroundColor,
            }}
            _active={{
              transform: "translateY(1px)",
              boxShadow: theme.getButtonActiveShadow(),
            }}
            _disabled={{
              opacity: 0.6,
              transform: "none",
              boxShadow: `inset 0.5px 0.5px 1px ${theme.darkShadowColor}, inset -0.5px -0.5px 1px ${theme.lightShadowColor}`,
            }}
            transition="all 0.2s ease"
          >
            Clear
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}