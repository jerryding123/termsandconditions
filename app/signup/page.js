// app/signup/page.js

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Button,
  Container,
  FormControl,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  Flex,
  Checkbox,
  HStack,
  Spinner,
  Heading,
} from '@chakra-ui/react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { FallInPlace } from '#components/motion/fall-in-place'
import { Header } from '#components/layout/header'

function SignupContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showElectronSuccess, setShowElectronSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Detect if this is an Electron signup
  const isElectron = searchParams.get('electron') === 'true'
  const returnUrl = searchParams.get('return_url')

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // User is already logged in
          if (isElectron && returnUrl) {
            // Handle Electron redirect for already logged-in user
            await handleElectronRedirect(session.user)
          } else {
            // Regular web redirect
            router.push('/account')
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuthState()
  }, [isElectron, returnUrl, router])

  const handleElectronRedirect = async (user) => {
    if (isElectron && returnUrl) {
      // For existing users, check subscription; for new signups, default to free
      try {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        let planTier = 'free'
        if (subscription) {
          // Get plan limits to determine tier
          const { data: planLimits } = await supabase
            .from('plan_limits')
            .select('plan_tier')
            .eq('stripe_price_id', subscription.plan_id)
            .single()
          
          planTier = planLimits?.plan_tier || 'free'
        }

        const userData = {
          id: user.id,
          email: user.email,
          plan_tier: planTier
        }
        
        console.log('Redirecting to Electron with user data:', userData)
        const redirectUrl = `${returnUrl}?user=${encodeURIComponent(JSON.stringify(userData))}`
        
        // Show success message before redirect
        setShowElectronSuccess(true)
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 1500)
        
      } catch (error) {
        console.error('Error getting user plan:', error)
        // Fallback to free plan
        const userData = {
          id: user.id,
          email: user.email,
          plan_tier: 'free'
        }
        
        const redirectUrl = `${returnUrl}?user=${encodeURIComponent(JSON.stringify(userData))}`
        setShowElectronSuccess(true)
        
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 1500)
      }
    } else {
      router.push('/account')
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (!agreedToTerms) {
      setError('Please agree to the Terms and Privacy Policy')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    setError('')
    setMessage('')

    // Pass Electron parameters to email confirmation redirect
    const emailRedirectTo = isElectron 
      ? `${window.location.origin}/auth/callback?electron=true&return_url=${encodeURIComponent(returnUrl)}`
      : `${window.location.origin}/auth/callback`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo
      }
    })

    if (error) {
      setError(error.message)
    } else if (data.user && !data.user.email_confirmed_at) {
      if (isElectron) {
        setMessage('Check your email for the confirmation link! You can close this browser window and check your email. After confirming, try signing in again from the desktop app.')
      } else {
        setMessage('Check your email for the confirmation link!')
      }
    } else {
      // Auto-confirmed (rare case)
      await handleElectronRedirect(data.user)
    }
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError('')
    
    // Pass Electron parameters to OAuth flow
    const redirectTo = isElectron 
      ? `${window.location.origin}/auth/callback?electron=true&return_url=${encodeURIComponent(returnUrl)}`
      : `${window.location.origin}/auth/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    })
    
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  // Show loading while checking auth state
  if (checkingAuth) {
    return (
      <Box position="relative" minH="100vh">
        <BackgroundGradient height="100%" zIndex="-1" />
        <Header />
        <Container maxW="container.xl" pt={{ base: 16, lg: 20 }}>
          <Flex justify="center" align="center" minH="80vh">
            <VStack spacing={4}>
              <Spinner size="xl" color="white" thickness="4px" />
              <Text color="white" fontSize="lg">Checking authentication...</Text>
            </VStack>
          </Flex>
        </Container>
      </Box>
    )
  }

  // Show Electron success message
  if (showElectronSuccess) {
    return (
      <Box position="relative" minH="100vh">
        <BackgroundGradient height="100%" zIndex="-1" />
        <Header />
        <Container maxW="container.xl" pt={{ base: 16, lg: 20 }}>
          <Flex justify="center" align="center" minH="80vh">
            <VStack spacing={6} textAlign="center">
              <Box
                p={6}
                borderRadius="full"
                bg="rgba(72, 187, 120, 0.2)"
                color="green.400"
                border="2px solid"
                borderColor="green.400"
              >
                <Text fontSize="3xl">✓</Text>
              </Box>
              <Heading size="lg" color="white">Already Signed In!</Heading>
              <Text color="gray.300" fontSize="lg">
                Redirecting back to Terms & Conditions...
              </Text>
              <Spinner size="lg" color="white" thickness="4px" />
            </VStack>
          </Flex>
        </Container>
      </Box>
    )
  }

  return (
    <Box position="relative" minH="100vh">
      {/* Same background gradient as landing page */}
      <BackgroundGradient height="100%" zIndex="-1" />
      
      {/* Import your existing header component */}
      <Header />
      
      <Container maxW="container.xl" pt={{ base: 16, lg: 20 }}>
        <Flex justify="center" align="center" minH="80vh">
          <Box maxW="400px" w="full">
            <FallInPlace>
              <VStack spacing={6} align="stretch">
                {/* App Icon and Title */}
                <VStack spacing={4} textAlign="center">
                  <Image
                    src="/static/images/termsandconditionslogo.png"
                    width={64}
                    height={64}
                    alt="Terms & Conditions"
                    style={{ borderRadius: '12px' }}
                  />
                  <Text
                    fontSize="xl"
                    fontWeight="semibold"
                    color="white"
                  >
                    {isElectron ? 'Sign up for Terms & Conditions' : 'Sign up for Terms & Conditions'}
                  </Text>
                  {isElectron && (
                    <Text
                      fontSize="sm"
                      color="rgba(255, 255, 255, 0.7)"
                    >
                      You&apos;ll be redirected back to the desktop app after confirmation
                    </Text>
                  )}
                </VStack>

                {/* Error Alert */}
                {error && (
                  <Alert status="error" borderRadius="12px" bg="rgba(254, 178, 178, 0.9)">
                    <AlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Success Alert */}
                {message && (
                  <Alert status="success" borderRadius="12px" bg="rgba(134, 239, 172, 0.9)">
                    <AlertIcon />
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                {/* Google Sign Up - moved to top */}
                <Button
                  onClick={handleGoogleSignup}
                  isLoading={googleLoading}
                  loadingText="Redirecting..."
                  variant="outline"
                  w="full"
                  borderRadius="12px"
                  borderColor="rgba(255, 255, 255, 0.2)"
                  color="white"
                  bg="rgba(255, 255, 255, 0.1)"
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                  height="48px"
                  fontSize="md"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                {/* Divider */}
                <Flex align="center" w="full">
                  <Box flex="1" height="1px" bg="rgba(255, 255, 255, 0.2)" />
                  <Text
                    px={4}
                    color="rgba(255, 255, 255, 0.6)"
                    fontSize="sm"
                  >
                    or
                  </Text>
                  <Box flex="1" height="1px" bg="rgba(255, 255, 255, 0.2)" />
                </Flex>

                {/* Form */}
                <Box as="form" onSubmit={handleSignup}>
                  <VStack spacing={4}>
                    <FormControl>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        borderRadius="12px"
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid rgba(255, 255, 255, 0.2)"
                        color="white"
                        height="48px"
                        _placeholder={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        _focus={{
                          borderColor: "rgba(255, 255, 255, 0.4)",
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.4)",
                          bg: "rgba(255, 255, 255, 0.15)"
                        }}
                        required
                      />
                    </FormControl>

                    <FormControl>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        borderRadius="12px"
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid rgba(255, 255, 255, 0.2)"
                        color="white"
                        height="48px"
                        _placeholder={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        _focus={{
                          borderColor: "rgba(255, 255, 255, 0.4)",
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.4)",
                          bg: "rgba(255, 255, 255, 0.15)"
                        }}
                        required
                      />
                    </FormControl>

                    <FormControl>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        borderRadius="12px"
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid rgba(255, 255, 255, 0.2)"
                        color="white"
                        height="48px"
                        _placeholder={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        _focus={{
                          borderColor: "rgba(255, 255, 255, 0.4)",
                          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.4)",
                          bg: "rgba(255, 255, 255, 0.15)"
                        }}
                        required
                      />
                    </FormControl>

                    <HStack spacing={3} align="flex-start">
                      <Checkbox
                        isChecked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        colorScheme="primary"
                        borderColor="rgba(255, 255, 255, 0.4)"
                        sx={{
                          '.chakra-checkbox__control': {
                            bg: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                            _checked: {
                              bg: 'primary.500',
                              borderColor: 'primary.500',
                            }
                          }
                        }}
                      />
                      <Text fontSize="sm" color="rgba(255, 255, 255, 0.8)" lineHeight="1.4">
                        I agree to the{' '}
                        <Link href="/terms" target="_blank" rel="noopener noreferrer">
                          <Text as="span" color="white" fontWeight="semibold" _hover={{ textDecoration: 'underline' }}>
                            Terms of Service
                          </Text>
                        </Link>
                        {' '}and{' '}
                        <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                          <Text as="span" color="white" fontWeight="semibold" _hover={{ textDecoration: 'underline' }}>
                            Privacy Policy
                          </Text>
                        </Link>
                      </Text>
                    </HStack>

                    <Button
                      type="submit"
                      colorScheme="primary"
                      w="full"
                      borderRadius="12px"
                      fontWeight="bold"
                      isLoading={loading}
                      loadingText="Creating account..."
                      color="black"
                      height="48px"
                      fontSize="md"
                    >
                      Create Account
                    </Button>
                  </VStack>
                </Box>

                {/* Sign In Link */}
                <Text textAlign="center" color="rgba(255, 255, 255, 0.8)">
                  Already have an account?{' '}
                  <Link href={isElectron ? `/login?electron=true&return_url=${encodeURIComponent(returnUrl)}` : "/login"}>
                    <Text as="span" color="white" fontWeight="bold" _hover={{ textDecoration: 'underline' }}>
                      Sign in
                    </Text>
                  </Link>
                </Text>
              </VStack>
            </FallInPlace>
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <Box position="relative" minH="100vh">
        <BackgroundGradient height="100%" zIndex="-1" />
        <Header />
        <Container maxW="container.xl" pt={{ base: 16, lg: 20 }}>
          <Flex justify="center" align="center" minH="80vh">
            <VStack spacing={4}>
              <Spinner size="xl" color="white" thickness="4px" />
              <Text color="white" fontSize="lg">Loading...</Text>
            </VStack>
          </Flex>
        </Container>
      </Box>
    }>
      <SignupContent />
    </Suspense>
  )
}