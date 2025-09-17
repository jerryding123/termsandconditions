// app/payment/success/page.js

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Box, 
  Container, 
  VStack, 
  HStack,
  Heading, 
  Text, 
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Icon,
  Divider,
  Spinner,
  Badge
} from '@chakra-ui/react'
import { FiCheck, FiDownload, FiExternalLink, FiMail, FiArrowRight, FiClock } from 'react-icons/fi'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { supabase } from '../../../lib/supabase'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const isElectron = searchParams.get('electron') === 'true'
  const returnUrl = searchParams.get('return_url')
  const [countdown, setCountdown] = useState(10)
  const [userOS, setUserOS] = useState('')
  const [redirecting, setRedirecting] = useState(false)

  // Detect user's operating system
  useEffect(() => {
    const detectOS = () => {
      const userAgent = window.navigator.userAgent
      if (userAgent.includes('Mac')) return 'Mac'
      if (userAgent.includes('Windows')) return 'Windows'
      if (userAgent.includes('Linux')) return 'Linux'
      return 'Unknown'
    }
    setUserOS(detectOS())
  }, [])

  // Function to get fresh user data and redirect to Electron
  const handleElectronRedirectWithUserData = async () => {
    if (redirecting) return // Prevent multiple redirects
    setRedirecting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('No user found for Electron redirect')
        window.location.href = returnUrl
        return
      }

      // Get fresh subscription data after payment
      const response = await fetch(`/api/subscription/status?userId=${user.id}`)
      const subData = await response.json()
      
      let planTier = 'free'
      if (subData.success && subData.subscription) {
        // Get plan tier from usage API which includes plan limits lookup
        try {
          const usageResponse = await fetch(`/api/usage/track?userId=${user.id}`)
          const usageData = await usageResponse.json()
          planTier = usageData.usage?.plan_tier || 'free'
        } catch (error) {
          console.error('Error getting usage data:', error)
          // Fallback: try to determine from subscription plan_id
          if (subData.subscription.plan_id) {
            // Simple mapping based on common price IDs - adjust based on your actual price IDs
            if (subData.subscription.plan_id.includes('plus')) planTier = 'plus'
            else if (subData.subscription.plan_id.includes('pro_plus')) planTier = 'pro_plus'
            else if (subData.subscription.plan_id.includes('pro')) planTier = 'pro'
          }
        }
      }

      const userData = {
        id: user.id,
        email: user.email,
        plan_tier: planTier
      }
      
      console.log('Redirecting to Electron with user data:', userData)
      const redirectUrl = `${returnUrl}?user=${encodeURIComponent(JSON.stringify(userData))}`
      window.location.href = redirectUrl
    } catch (error) {
      console.error('Error getting user data for Electron redirect:', error)
      // Fallback redirect without user data
      window.location.href = returnUrl
    }
  }

  // Auto-redirect for app users
  useEffect(() => {
    if (isElectron && returnUrl) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleElectronRedirectWithUserData()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isElectron, returnUrl])

  const handleDownloadMac = () => {
    const macDownloadUrl = 'https://apps.apple.com/us/app/interview-pilot-ai-copilot/id6743263009'
    window.open(macDownloadUrl, '_blank')
  }

  const handleOpenApp = () => {
    // Try to open the app using custom protocol
    const appUrl = 'interviewpilot://open'
    window.location.href = appUrl
    
    // Fallback: show download modal after a delay if app doesn't open
    setTimeout(() => {
      onOpen()
    }, 2000)
  }

  const handleReturnToApp = () => {
    if (isElectron && returnUrl) {
      handleElectronRedirectWithUserData()
    }
  }

  return (
    <Box position="relative" minH="100vh">
      <BackgroundGradient height="100%" zIndex="-1" />
      
      {/* Reduced top padding */}
      <Container maxW="container.lg" pt={{ base: 24, md: 28, lg: 32 }} pb={20}>
        <VStack spacing={10} textAlign="center">
          {/* Success Icon */}
          <Box
            p={8}
            borderRadius="full"
            bg="rgba(72, 187, 120, 0.2)"
            color="green.400"
            border="3px solid"
            borderColor="green.400"
            position="relative"
          >
            <Icon as={FiCheck} boxSize={16} />
            
            {/* Animated rings */}
            <Box
              position="absolute"
              top="-3px"
              left="-3px"
              right="-3px"
              bottom="-3px"
              borderRadius="full"
              border="3px solid"
              borderColor="green.400"
              opacity={0.6}
              animation="ping 2s cubic-bezier(0, 0, 0.2, 1) infinite"
              sx={{
                '@keyframes ping': {
                  '75%, 100%': {
                    transform: 'scale(1.1)',
                    opacity: 0,
                  },
                },
              }}
            />
          </Box>
          
          {/* Main Content */}
          <VStack spacing={6} maxW="2xl">
            <Heading 
              size={{ base: "xl", md: "2xl" }} 
              color="white" 
              fontWeight="bold"
              fontSize={{ base: "28px", md: "36px", lg: "42px" }}
            >
              Success! 🎉
            </Heading>
            
            <Text fontSize="xl" color="gray.300" lineHeight="1.6">
              Welcome to Terms & Conditions Pro! You now have access to all premium features. Get started or continue with the desktop app. Note: It may take a few minutes to open on first launch.
            </Text>

            {/* Different content based on user source */}
            {isElectron && returnUrl ? (
              // User came from the app
              <VStack spacing={4} p={6} bg="rgba(255, 255, 255, 0.1)" borderRadius="xl" backdropFilter="blur(10px)">
                <Text color="yellow.300" fontWeight="semibold">
                  {redirecting ? 'Redirecting to Terms & Conditions...' : `Redirecting back to Terms & Conditions in ${countdown} seconds...`}
                </Text>
                <Button
                  leftIcon={redirecting ? <Spinner size="sm" /> : <FiArrowRight />}
                  colorScheme="primary"
                  color="black"
                  size="lg"
                  onClick={handleReturnToApp}
                  fontWeight="bold"
                  isLoading={redirecting}
                  loadingText="Getting your account ready..."
                >
                  Return to App Now
                </Button>
              </VStack>
            ) : (
              // User came from web or new user
              <VStack spacing={6} w="full">
                <Text color="gray.400" fontSize="lg">
                  Ready to ace your next interview?
                </Text>
                
                {/* Action Buttons */}
                {userOS === 'Mac' ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full" maxW="md">
                    <Button
                      leftIcon={<FiExternalLink />}
                      colorScheme="primary"
                      color="black"
                      size="lg"
                      onClick={handleOpenApp}
                      fontWeight="bold"
                    >
                      Open Terms & Conditions
                    </Button>
                    
                    <Button
                      leftIcon={<FiDownload />}
                      variant="outline"
                      borderColor="rgba(255, 255, 255, 0.3)"
                      color="white"
                      _hover={{ 
                        bg: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.5)'
                      }}
                      size="lg"
                      onClick={handleDownloadMac}
                    >
                      Download for Mac
                    </Button>
                  </SimpleGrid>
                ) : userOS === 'Windows' ? (
                  <VStack spacing={4} w="full" maxW="md">
                    <Button
                      leftIcon={<FiExternalLink />}
                      colorScheme="primary"
                      color="black"
                      size="lg"
                      onClick={handleOpenApp}
                      fontWeight="bold"
                    >
                      Open Terms & Conditions
                    </Button>
                    
                    <VStack spacing={2} p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="xl" w="full">
                      <HStack>
                        <Icon as={FiClock} color="yellow.400" />
                        <Text color="yellow.400" fontWeight="semibold">
                          Windows Coming Soon
                        </Text>
                        <Badge colorScheme="yellow" fontSize="xs">
                          In Development
                        </Badge>
                      </HStack>
                      <Text color="gray.400" fontSize="sm" textAlign="center">
                        We&apos;re working hard to bring Terms & Conditions to Windows. In the meantime, you can access it on Mac or iOS appstore.
                      </Text>
                    </VStack>
                  </VStack>
                ) : (
                  <VStack spacing={4} w="full" maxW="md">
                    <Button
                      leftIcon={<FiExternalLink />}
                      colorScheme="primary"
                      color="black"
                      size="lg"
                      onClick={handleOpenApp}
                      fontWeight="bold"
                    >
                      Open Terms & Conditions
                    </Button>
                    
                    <VStack spacing={2} p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="xl" w="full">
                      <Text color="gray.300" fontWeight="semibold">
                        Desktop App Available for Mac
                      </Text>
                      <Text color="gray.400" fontSize="sm" textAlign="center">
                        Download the desktop app on Mac.
                      </Text>
                      <Button
                        leftIcon={<FiDownload />}
                        variant="outline"
                        borderColor="rgba(255, 255, 255, 0.3)"
                        color="white"
                        _hover={{ 
                          bg: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        }}
                        size="md"
                        onClick={handleDownloadMac}
                      >
                        Download for Mac
                      </Button>
                    </VStack>
                  </VStack>
                )}

                <Divider borderColor="rgba(255, 255, 255, 0.2)" />

                {/* Additional Actions */}
                <HStack spacing={4} flexWrap="wrap" justify="center">
                  <Button
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'white' }}
                    onClick={() => router.push('/account')}
                  >
                    Manage Account
                  </Button>
                  
                  <Button
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'white' }}
                    leftIcon={<FiMail />}
                    onClick={() => window.open('mailto:liberaceai@gmail.com?subject=Terms & Conditions Desktop Support')}
                  >
                    Get Support
                  </Button>
                  
                  <Button
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'white' }}
                    onClick={() => router.push('/')}
                  >
                    Back to Home
                  </Button>
                </HStack>
              </VStack>
            )}
          </VStack>

          {/* Next Steps */}
          <Box 
            p={6} 
            bg="rgba(255, 255, 255, 0.05)" 
            borderRadius="xl" 
            border="1px solid rgba(255, 255, 255, 0.1)"
            maxW="2xl"
            w="full"
          >
            <VStack spacing={4} textAlign="left">
              <Heading size="md" color="white" textAlign="center">
                What&apos;s Next?
              </Heading>
              
              <VStack spacing={3} align="stretch">
                <HStack>
                  <Box w={2} h={2} bg="primary.400" borderRadius="full" mt={2} />
                  <Text color="gray.300">
                    <Text as="span" color="white" fontWeight="semibold">Upload your resume</Text> and personal details to get personalized responses
                  </Text>
                </HStack>
                
                <HStack>
                  <Box w={2} h={2} bg="primary.400" borderRadius="full" mt={2} />
                  <Text color="gray.300">
                    <Text as="span" color="white" fontWeight="semibold">Add job descriptions</Text> and company information for tailored answers
                  </Text>
                </HStack>
                
                <HStack>
                  <Box w={2} h={2} bg="primary.400" borderRadius="full" mt={2} />
                  <Text color="gray.300">
                    <Text as="span" color="white" fontWeight="semibold">Practice trial interviews</Text> before your big day. We&apos;re rooting for you!
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Container>

      {/* Download Modal (if app doesn't open) - Mac Only */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
        <ModalContent
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          borderRadius="xl"
          color="white"
          mx={4}
        >
          <ModalCloseButton />
          <ModalBody p={8}>
            <VStack spacing={6}>
              <Icon as={FiDownload} boxSize={12} color="primary.400" />
              <Heading size="lg">Download Terms & Conditions</Heading>
              <Text textAlign="center" color="gray.300">
                It looks like you don&apos;t have Terms & Conditions installed yet. 
                Download it now to access your premium features!
              </Text>
              
              <VStack spacing={3} w="full">
                <Button
                  leftIcon={<FiDownload />}
                  colorScheme="primary"
                  color="black"
                  size="lg"
                  w="full"
                  onClick={handleDownloadMac}
                >
                  Download for Mac (ARM)
                </Button>
                
                {userOS === 'Windows' && (
                  <Box p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="lg" w="full">
                    <VStack spacing={2}>
                      <HStack>
                        <Icon as={FiClock} color="yellow.400" />
                        <Text color="yellow.400" fontWeight="semibold" fontSize="sm">
                          Windows Coming Soon
                        </Text>
                      </HStack>
                      <Text color="gray.400" fontSize="xs" textAlign="center">
                        We&apos;re working on a Windows version. For now, you can use the mac version if you have a mac.
                      </Text>
                    </VStack>
                  </Box>
                )}
              </VStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <Box position="relative" minH="100vh">
        <BackgroundGradient height="100%" zIndex="-1" />
        <Container maxW="container.lg" pt={{ base: 24, md: 28, lg: 32 }} pb={20}>
          <VStack spacing={8} align="center" justify="center" minH="400px">
            <Spinner size="xl" color="white" thickness="4px" />
            <Text color="white" fontSize="lg">Loading...</Text>
          </VStack>
        </Container>
      </Box>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}