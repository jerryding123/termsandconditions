// app/account/download-tab.js

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  Icon,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react'
import {
  FiDownload,
  FiMonitor,
  FiSmartphone,
} from 'react-icons/fi'

const DownloadTab = ({ user }) => {
  const [downloading, setDownloading] = useState({})

  const downloads = [
    {
      id: 'macos-arm',
      platform: 'macOS',
      architecture: 'Apple Silicon (M1/M2/M3/M4)',
      icon: FiMonitor,
      available: true,
      version: '4.1.2',
      size: '316.2 MB',
      downloadUrl: 'https://github.com/jerryding123/interview-pilot-desktop-releases/releases/download/v1.0.0/Interview.Pilot-1.0.0-arm64.dmg', // Replace with actual download URL
      requirements: 'macOS 14.0 or later',
      description: 'Optimized for Apple Silicon Macs'
    },
    {
      id: 'windows',
      platform: 'Windows',
      architecture: 'x64',
      icon: FiMonitor,
      available: false,
      version: 'Coming Soon',
      size: 'Coming Soon',
      downloadUrl: null,
      requirements: 'Windows 10/11',
      description: 'Native Windows application'
    }
  ]

  const handleDownload = async (download) => {
    if (!download.available || downloading[download.id]) return

    setDownloading(prev => ({ ...prev, [download.id]: true }))

    try {
      // Add your download logic here
      // For now, just simulate a download
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Replace this with actual download logic
      if (download.downloadUrl && download.downloadUrl !== '#') {
        window.location.href = download.downloadUrl
      } else {
        // Placeholder - replace with actual file serving logic
        console.log(`Downloading ${download.platform}...`)
      }
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloading(prev => ({ ...prev, [download.id]: false }))
    }
  }

  return (
    <VStack spacing={8} align="stretch">
      <Heading size="xl" color="white" textAlign="left">
        Downloads
      </Heading>
{/*
      <Alert status="info" borderRadius="16px" bg="rgba(59, 130, 246, 0.2)">
        <AlertIcon />
        <AlertDescription>
          Download the desktop application to use Terms & Conditions and get the best performance.
        </AlertDescription>
      </Alert>
*/}
      {/* Downloads Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {downloads.map((download) => (
          <Card
            key={download.id}
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(10px)"
            border="1px solid rgba(255, 255, 255, 0.2)"
            borderRadius="16px"
            opacity={download.available ? 1 : 0.7}
          >
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                {/* Header */}
                <HStack justify="space-between" align="start">
                  <HStack spacing={4}>
                    <Box
                      p={3}
                      borderRadius="12px"
                      bg="rgba(255, 255, 255, 0.1)"
                      border="1px solid rgba(255, 255, 255, 0.2)"
                    >
                      <Icon as={download.icon} boxSize={6} color="primary.400" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color="white">
                        {download.platform}
                      </Heading>
                      <Text color="gray.400" fontSize="sm">
                        {download.architecture}
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge
                    colorScheme={download.available ? 'green' : 'gray'}
                    fontSize="xs"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {download.available ? 'AVAILABLE' : 'COMING SOON'}
                  </Badge>
                </HStack>

                {/* Details */}
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text color="gray.400" fontSize="sm">Version</Text>
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      {download.version}
                    </Text>
                  </HStack>
                  
                  {download.available && (
                    <HStack justify="space-between">
                      <Text color="gray.400" fontSize="sm">Size</Text>
                      <Text color="white" fontSize="sm" fontWeight="medium">
                        {download.size}
                      </Text>
                    </HStack>
                  )}
                  
                  <HStack justify="space-between">
                    <Text color="gray.400" fontSize="sm">Requirements</Text>
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      {download.requirements}
                    </Text>
                  </HStack>
                </VStack>

                {/* Description */}
                <Text color="gray.300" fontSize="sm">
                  {download.description}
                </Text>

                {/* Download Button */}
                <Button
                  leftIcon={<FiDownload />}
                  colorScheme={download.available ? 'primary' : 'gray'}
                  color={download.available ? 'black' : 'gray.400'}
                  size="lg"
                  borderRadius="12px"
                  fontWeight="bold"
                  isDisabled={!download.available}
                  isLoading={downloading[download.id]}
                  loadingText="Downloading..."
                  onClick={() => handleDownload(download)}
                  w="full"
                >
                  {download.available ? 'Download' : 'Coming Soon'}
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* System Requirements */}
      <Card
        bg="rgba(255, 255, 255, 0.1)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.2)"
        borderRadius="16px"
      >
        <CardBody p={8}>
          <VStack spacing={6} align="stretch">
            <Heading size="lg" color="white">
              System Requirements
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* macOS Requirements */}
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="white">
                  macOS
                </Heading>
                <VStack spacing={2} align="stretch">
                  <Text color="gray.300" fontSize="sm">
                    • macOS 14.0 (Sonoma) or later
                  </Text>
                  <Text color="gray.300" fontSize="sm">
                    • Apple Silicon (M1/M2/M3/M4)
                  </Text>
                  <Text color="gray.300" fontSize="sm">
                    • 4 GB RAM minimum, 8 GB recommended
                  </Text>
                  <Text color="gray.300" fontSize="sm">
                    • At least 1.5 GB available storage space
                  </Text>
                </VStack>
              </VStack>

              {/* Windows Requirements */}
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="white">
                  Windows (Coming Soon)
                </Heading>
                <VStack spacing={2} align="stretch">
                  <Text color="gray.300" fontSize="sm">
                    • Windows 10 version 1903 or later
                  </Text>
                  <Text color="gray.300" fontSize="sm">
                    • Windows 11 (recommended)
                  </Text>
                  <Text color="gray.300" fontSize="sm">
                    • x64 processor architecture
                  </Text>
                  <Text color="gray.300" fontSize="sm">
                    • 4 GB RAM minimum, 8 GB recommended
                  </Text>
                  <Text color="gray.300" fontSize="sm">
                    • At least 1.5 GB available storage space
                  </Text>
                </VStack>
              </VStack>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Installation Instructions */}
      <Card
        bg="rgba(255, 255, 255, 0.1)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.2)"
        borderRadius="16px"
      >
        <CardBody p={8}>
          <VStack spacing={6} align="stretch">
            <Heading size="lg" color="white">
              Installation Instructions
            </Heading>
            
            <VStack spacing={4} align="stretch">
              <Box>
                <Heading size="sm" color="white" mb={2}>
                  macOS Installation
                </Heading>
                <VStack spacing={2} align="stretch">
                  <Text color="gray.300" fontSize="sm">
                    1. Download the .dmg file for your Mac
                  </Text>
                  <Text color="gray.300" fontSize="sm">
                    2. Open the downloaded file and drag Terms & Conditions to Applications
                  </Text>
                  <Text color="gray.300" fontSize="sm">
                    3. Launch Terms & Conditions from Applications folder
                  </Text>
                  <Text color="gray.300" fontSize="sm">
                    4. Sign in with your Terms & Conditions account
                  </Text>
                </VStack>
              </Box>
              
              <Text color="gray.400" fontSize="xs" fontStyle="italic">
                Note: You may need to allow the app in System Preferences → Security & Privacy if you see a security warning.
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}

export default DownloadTab