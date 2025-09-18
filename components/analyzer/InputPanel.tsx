import {
  VStack,
  HStack,
  Heading,
  Textarea,
  Button,
  Badge,
  Box,
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
      borderRadius="16px"
      ml="30px"
      p="8"
      boxShadow={theme.getRaisedShadow('sm')}
      transition="all 0.3s ease"
      position="relative"
    >
      <VStack spacing="6" align="stretch">
        <HStack justify="space-between" align="center">
          <Heading size="md" color={theme.textColor} fontWeight="600">
            Input Terms & Conditions
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
            Step 1
          </Badge>
        </HStack>

        {/* Neumorphic Textarea Container - more subtle */}
        <Box
          borderRadius="12px"
          p="1"
          boxShadow={theme.getInsetShadow('sm')}
        >
          <Textarea
            placeholder="Paste your terms and conditions here...&#10;For example, you can copy from any website's T&C page, app privacy policy, or service agreement."
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            size="md"
            minH="480px"
            resize="vertical"
            border="none"
            borderRadius="10px"
            p="6"
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
            borderRadius="12px"
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
            borderRadius="12px"
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