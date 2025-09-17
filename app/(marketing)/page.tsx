'use client'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import { TermsAnalyzer } from 'components/analyzer/TermsAnalyzer'

const Home: NextPage = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.2xl" py="8">
        <VStack spacing="8">
          {/* Header */}
          <VStack spacing="4" textAlign="center" maxW="4xl">
            <Heading
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="bold"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              Terms & Conditions Analyzer
            </Heading>
            <Text fontSize={{ base: "lg", md: "xl" }} color="gray.600" maxW="2xl">
              Paste your terms and conditions below to get a simplified explanation 
              and identify potential red flags that you should be aware of.
            </Text>
          </VStack>

          {/* Main Analyzer Component */}
          <TermsAnalyzer />

          {/* Footer Info */}
          <Box textAlign="center" maxW="3xl">
            <Text fontSize="sm" color="gray.500">
              💡 <strong>Tip:</strong> This tool helps you understand complex legal language, 
              but always consult with a legal professional for important decisions.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default Home