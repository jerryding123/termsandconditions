// app/account/page.js

'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { FiUser, FiCreditCard, FiLock, FiDownload } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { FallInPlace } from '#components/motion/fall-in-place'
import { Header } from '#components/layout/header'
import BillingTab from './billing-tab'
import DownloadTab from './download-tab'

function AccountContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('account')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const checkUser = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session error:', error)
      }
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)
      
    } catch (error) {
      console.error('Check user error:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleAuthCallback = useCallback(async () => {
    const code = searchParams.get('code')
    
    if (code) {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Error exchanging code:', error)
        }
        window.history.replaceState({}, document.title, '/account')
      } catch (error) {
        console.error('Session exchange error:', error)
      }
    }
    
    await checkUser()
  }, [searchParams, checkUser])

  useEffect(() => {
    handleAuthCallback()
  }, [handleAuthCallback])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setPasswordLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
      setShowChangePassword(false)
    }
    setPasswordLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteEmail !== user?.email) {
      setError('Email address does not match')
      return
    }

    setDeleteLoading(true)
    setError('')

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      // Account deleted successfully
      setMessage('Account deleted successfully. You will be redirected shortly.')
      
      // Sign out and redirect after a short delay
      setTimeout(() => {
        supabase.auth.signOut()
        router.push('/')
      }, 2000)

    } catch (error) {
      setError(error.message || 'Failed to delete account. Please contact support.')
    } finally {
      setDeleteLoading(false)
      onClose()
      setDeleteEmail('')
    }
  }

  if (loading) {
    return (
      <Box position="relative" minH="100vh">
        <BackgroundGradient height="100%" zIndex="-1" />
        <Header />
        <Container maxW="container.xl" pt={{ base: 24, lg: 32 }}>
          <Flex justify="center" align="center" minH="80vh">
            <VStack spacing={4}>
              <Spinner size="xl" color="white" thickness="4px" />
              <Text color="white" fontSize="lg">Loading your account...</Text>
            </VStack>
          </Flex>
        </Container>
      </Box>
    )
  }

  if (!user) {
    return (
      <Box position="relative" minH="100vh">
        <BackgroundGradient height="100%" zIndex="-1" />
        <Header />
        <Container maxW="container.xl" pt={{ base: 24, lg: 32 }}>
          <Flex justify="center" align="center" minH="80vh">
            <VStack spacing={4}>
              <Text color="white" fontSize="lg">Please sign in to access your account.</Text>
              <Button colorScheme="primary" color="black" onClick={() => router.push('/login')}>
                Go to Login
              </Button>
            </VStack>
          </Flex>
        </Container>
      </Box>
    )
  }

  return (
    <Box position="relative" minH="100vh">
      <BackgroundGradient height="100%" zIndex="-1" />
      <Header />
      
      <Container maxW="container.xl" pt={{ base: 24, lg: 32 }} pb={8}>
        <FallInPlace>
          <Flex direction={{ base: 'column', lg: 'row' }} gap={12} maxW="6xl" mx="auto">
            {/* Left Sidebar */}
            <Box w={{ base: 'full', lg: '220px' }} mr={{ lg: 8 }}>
              <VStack spacing={3} align="stretch">
                <Button
                  leftIcon={<FiUser />}
                  variant={activeTab === 'account' ? 'solid' : 'ghost'}
                  colorScheme={activeTab === 'account' ? 'gray' : 'gray'}
                  color={activeTab === 'account' ? 'white' : 'rgba(255, 255, 255, 0.7)'}
                  justifyContent="flex-start"
                  onClick={() => setActiveTab('account')}
                  bg={activeTab === 'account' ? 'rgba(255, 255, 255, 0.15)' : 'transparent'}
                  _hover={{
                    bg: activeTab === 'account' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                  size="md"
                  borderRadius="12px"
                  fontSize="md"
                  py={5}
                >
                  Account
                </Button>
                <Button
                  leftIcon={<FiDownload />}
                  variant={activeTab === 'downloads' ? 'solid' : 'ghost'}
                  colorScheme={activeTab === 'downloads' ? 'gray' : 'gray'}
                  color={activeTab === 'downloads' ? 'white' : 'rgba(255, 255, 255, 0.7)'}
                  justifyContent="flex-start"
                  onClick={() => setActiveTab('downloads')}
                  bg={activeTab === 'downloads' ? 'rgba(255, 255, 255, 0.15)' : 'transparent'}
                  _hover={{
                    bg: activeTab === 'downloads' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                  size="md"
                  borderRadius="12px"
                  fontSize="md"
                  py={5}
                >
                  Downloads
                </Button>
                <Button
                  leftIcon={<FiCreditCard />}
                  variant={activeTab === 'billing' ? 'solid' : 'ghost'}
                  colorScheme={activeTab === 'billing' ? 'gray' : 'gray'}
                  color={activeTab === 'billing' ? 'white' : 'rgba(255, 255, 255, 0.7)'}
                  justifyContent="flex-start"
                  onClick={() => setActiveTab('billing')}
                  bg={activeTab === 'billing' ? 'rgba(255, 255, 255, 0.15)' : 'transparent'}
                  _hover={{
                    bg: activeTab === 'billing' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                  size="md"
                  borderRadius="12px"
                  fontSize="md"
                  py={5}
                >
                  Billing
                </Button>
              </VStack>
            </Box>

            {/* Right Content */}
            <Box flex="1">
              {activeTab === 'account' && (
                <VStack spacing={8} align="stretch">
                  {/* Header */}
                  <Heading size="xl" color="white" textAlign="left">
                    Account Details
                  </Heading>

                  {/* Email Section */}
                  <VStack spacing={3} align="stretch">
                    <Text color="white" fontSize="lg" fontWeight="medium">
                      Email
                    </Text>
                    <Box
                      bg="rgba(255, 255, 255, 0.1)"
                      backdropFilter="blur(10px)"
                      borderRadius="12px"
                      border="1px solid rgba(255, 255, 255, 0.2)"
                      p={4}
                      w="full"
                      h="48px"
                      display="flex"
                      alignItems="center"
                    >
                      <Text color="white" fontSize="md">
                        {user?.email}
                      </Text>
                    </Box>
                  </VStack>

                  {/* Alerts */}
                  {error && (
                    <Alert status="error" borderRadius="16px" bg="rgba(254, 178, 178, 0.9)">
                      <AlertIcon />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {message && (
                    <Alert status="success" borderRadius="16px" bg="rgba(134, 239, 172, 0.9)">
                      <AlertIcon />
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}

                  {/* Change Password Button */}
                  {!showChangePassword && (
                    <Button
                      leftIcon={<FiLock />}
                      onClick={() => setShowChangePassword(true)}
                      colorScheme="primary"
                      color="black"
                      size="lg"
                      borderRadius="12px"
                      fontWeight="bold"
                      w="fit-content"
                    >
                      Change Password
                    </Button>
                  )}

                  {/* Change Password Form */}
                  {showChangePassword && (
                    <VStack spacing={6} align="stretch">
                      <Heading size="lg" color="white">Change Password</Heading>
                      <Box as="form" onSubmit={handlePasswordChange}>
                        <VStack spacing={6}>
                          <FormControl>
                            <FormLabel color="white" fontSize="md">New Password</FormLabel>
                            <Input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              borderRadius="12px"
                              bg="rgba(255, 255, 255, 0.1)"
                              border="1px solid rgba(255, 255, 255, 0.2)"
                              color="white"
                              h="48px"
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
                            <FormLabel color="white" fontSize="md">Confirm New Password</FormLabel>
                            <Input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              borderRadius="12px"
                              bg="rgba(255, 255, 255, 0.1)"
                              border="1px solid rgba(255, 255, 255, 0.2)"
                              color="white"
                              h="48px"
                              _placeholder={{ color: 'rgba(255, 255, 255, 0.6)' }}
                              _focus={{
                                borderColor: "rgba(255, 255, 255, 0.4)",
                                boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.4)",
                                bg: "rgba(255, 255, 255, 0.15)"
                              }}
                              required
                            />
                          </FormControl>

                          <HStack spacing={4}>
                            <Button
                              type="submit"
                              colorScheme="primary"
                              color="black"
                              borderRadius="12px"
                              fontWeight="bold"
                              isLoading={passwordLoading}
                              loadingText="Updating..."
                              size="lg"
                            >
                              Update Password
                            </Button>
                            <Button
                              onClick={() => {
                                setShowChangePassword(false)
                                setNewPassword('')
                                setConfirmPassword('')
                                setError('')
                              }}
                              variant="outline"
                              borderColor="rgba(255, 255, 255, 0.3)"
                              color="white"
                              _hover={{
                                bg: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                              }}
                              size="lg"
                              borderRadius="12px"
                            >
                              Cancel
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    </VStack>
                  )}

                  {/* Action Buttons */}
                  <VStack spacing={4} align="start">
                    <Text 
                      onClick={onOpen}
                      color="red.300"
                      cursor="pointer"
                      _hover={{ textDecoration: 'underline' }}
                      fontSize="md"
                    >
                      Delete Account
                    </Text>

                    <Text
                      onClick={handleSignOut}
                      color="white"
                      cursor="pointer"
                      _hover={{ textDecoration: 'underline' }}
                      fontSize="md"
                    >
                      Sign Out
                    </Text>
                  </VStack>
                </VStack>
              )}

              {/* Downloads Tab */}
              {activeTab === 'downloads' && (
                <DownloadTab user={user} />
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <BillingTab user={user} />
              )}
            </Box>
          </Flex>
        </FallInPlace>
      </Container>

      {/* Delete Account Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
        <ModalContent
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          borderRadius="16px"
          color="white"
        >
          <ModalHeader>Delete Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color="rgba(255, 255, 255, 0.8)">
                This will permanently delete your account and cancel any active subscriptions. 
                This action cannot be undone.
              </Text>
              <Text color="rgba(255, 255, 255, 0.8)">
                Please type <strong>{user?.email}</strong> to confirm.
              </Text>
              <Input
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder="Enter your email address"
                borderRadius="12px"
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid rgba(255, 255, 255, 0.2)"
                color="white"
                _placeholder={{ color: 'rgba(255, 255, 255, 0.6)' }}
                _focus={{
                  borderColor: "rgba(255, 255, 255, 0.4)",
                  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.4)",
                  bg: "rgba(255, 255, 255, 0.15)"
                }}
              />
              {error && (
                <Text color="red.300" fontSize="sm">{error}</Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                onClick={onClose}
                variant="outline"
                borderColor="rgba(255, 255, 255, 0.3)"
                color="white"
                _hover={{
                  bg: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                colorScheme="red"
                isLoading={deleteLoading}
                loadingText="Deleting..."
                isDisabled={deleteEmail !== user?.email}
              >
                Delete Account
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <Box position="relative" minH="100vh">
        <BackgroundGradient height="100%" zIndex="-1" />
        <Header />
        <Container maxW="container.xl" pt={{ base: 24, lg: 32 }}>
          <Flex justify="center" align="center" minH="80vh">
            <VStack spacing={4}>
              <Spinner size="xl" color="white" thickness="4px" />
              <Text color="white" fontSize="lg">Loading...</Text>
            </VStack>
          </Flex>
        </Container>
      </Box>
    }>
      <AccountContent />
    </Suspense>
  )
}