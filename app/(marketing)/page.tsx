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
      <Container maxW="container.2xl" pt="28" pb="12" pl="24">
        <VStack spacing="8">         
          {/* Main Analyzer Component */}
          <TermsAnalyzer />
          
          {/* Footer Info */}
          <Box textAlign="center" maxW="3xl">
            <Text fontSize="sm" color="gray.500">
              <strong>Tip:</strong> This tool helps you understand complex legal language,
              but always consult with a legal professional for important decisions.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default Home