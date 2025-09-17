import {
  Box,
  HStack,
  Heading,
  Icon,
  SimpleGrid,
  StackProps,
  Text,
  VStack,
  Button,
  useToast,
} from '@chakra-ui/react'
import { FiCheck } from 'react-icons/fi'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ButtonLink,
  ButtonLinkProps,
} from '#components/button-link/button-link'
import { BackgroundGradient } from '#components/gradients/background-gradient'
import { Section, SectionProps, SectionTitle } from '#components/section'
import { supabase } from '../../lib/supabase'

export interface PricingPlan {
  id: string
  title: React.ReactNode
  description: React.ReactNode
  price: React.ReactNode
  features: Array<PricingFeatureProps | null>
  action: {
    href?: string
    label?: string
    stripePriceId?: string // Add Stripe price ID
    requiresAuth?: boolean // Whether this plan requires authentication
    size?: string
    variant?: string
    [key: string]: any // Allow additional props
  }
  isRecommended?: boolean
}

export interface PricingProps extends SectionProps {
  description: React.ReactNode
  plans: Array<PricingPlan>
}

export const Pricing: React.FC<PricingProps> = (props) => {
  const { children, plans, title, description, ...rest } = props
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const router = useRouter()
  const toast = useToast()

  // NEW: Function to check if user has an active subscription
  const checkExistingSubscription = async (userId: string) => {
    try {
      const response = await fetch(`/api/subscription/status?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok && data.subscription) {
        // User has an active subscription
        return data.subscription
      }
      return null
    } catch (error) {
      console.log('No existing subscription found')
      return null
    }
  }

  // Function to create Stripe checkout session
  const createCheckoutSession = async (priceId: string) => {
    try {
      // Get the current session to include auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Please sign in to continue')
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // Include auth token
        },
        body: JSON.stringify({ 
          priceId,
          returnUrl: null // Set to null for web users
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle specific subscription conflict errors
        if (response.status === 409 && errorData.redirectTo) {
          let toastStatus: 'info' | 'warning' | 'success' | 'error' = 'info'
          let toastTitle = 'Subscription found'
          
          if (errorData.type === 'ALREADY_SUBSCRIBED') {
            toastTitle = 'Already subscribed'
          } else if (errorData.type === 'EXISTING_SUBSCRIPTION') {
            toastTitle = 'Existing subscription'
          }
          
          toast({
            title: toastTitle,
            description: errorData.error,
            status: toastStatus,
            duration: 5000,
            isClosable: true,
          })
          
          // Redirect to account page
          router.push(errorData.redirectTo)
          return
        }
        
        throw new Error(errorData.error || 'Failed to create checkout session')
      }
      
      const data = await response.json()
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      toast({
        title: 'Error',
        description: error?.message || 'Failed to start checkout process. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // UPDATED: Handle plan selection with subscription check
  const handlePlanSelect = async (plan: PricingPlan) => {
    // If it's a free plan or doesn't have a Stripe price ID, handle as before
    if (!plan.action.stripePriceId) {
      if (plan.action.href) {
        if (plan.action.href.startsWith('http')) {
          // External link - open in new tab
          window.open(plan.action.href, '_blank')
        } else {
          // Internal link
          router.push(plan.action.href)
        }
      }
      return
    }

    // For paid plans, check if user is authenticated
    if (plan.action.requiresAuth) {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to subscribe to a paid plan.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
        router.push('/login')
        return
      }

      // NEW: Check if user already has an active subscription
      setLoadingPlan(plan.id)
      
      const existingSubscription = await checkExistingSubscription(session.user.id)
      
      if (existingSubscription) {
        setLoadingPlan(null)
        
        // Check if they're trying to subscribe to the same plan
        if (existingSubscription.plan_id === plan.action.stripePriceId) {
          toast({
            title: 'Already subscribed',
            description: `You're already subscribed to the ${plan.title} plan. Redirecting to your account.`,
            status: 'info',
            duration: 5000,
            isClosable: true,
          })
        } else {
          toast({
            title: 'Existing subscription found',
            description: 'You already have an active subscription. You can change your plan from your account page.',
            status: 'info',
            duration: 5000,
            isClosable: true,
          })
        }
        
        // Redirect to account page
        router.push('/account?tab=billing')
        return
      }
    }

    // Start checkout process for paid plans (no existing subscription)
    if (!loadingPlan) setLoadingPlan(plan.id) // Only set if not already set
    await createCheckoutSession(plan.action.stripePriceId)
    setLoadingPlan(null)
  }

  return (
    <Section id="pricing" pos="relative" {...rest}>
      <BackgroundGradient height="100%" />
      <Box zIndex="2" pos="relative">
        <SectionTitle title={title} description={description}></SectionTitle>
        <SimpleGrid columns={[1, null, 4]} spacing={4}>
          {plans?.map((plan) => (
            <PricingBox
              key={plan.id}
              title={plan.title}
              description={plan.description}
              price={plan.price}
              sx={
                plan.isRecommended
                  ? {
                      borderColor: 'primary.500',
                      _dark: {
                        borderColor: 'primary.500',
                        bg: 'blackAlpha.300',
                      },
                    }
                  : {}
              }
            >
              <PricingFeatures>
                {plan.features.map((feature, i) =>
                  feature ? (
                    <PricingFeature key={i} {...feature} />
                  ) : (
                    <br key={i} />
                  ),
                )}
              </PricingFeatures>
              
              {/* Updated button styling for different plans */}
              {plan.action.stripePriceId ? (
                <Button
                  colorScheme={plan.id !== 'free' ? 'primary' : undefined}
                  color={plan.id !== 'free' ? 'black' : 'white'}
                  bg={plan.id !== 'free' ? undefined : 'transparent'}
                  borderColor={plan.id !== 'free' ? undefined : 'rgba(255, 255, 255, 0.3)'}
                  borderWidth={plan.id !== 'free' ? undefined : '0.5px'}
                  variant={plan.id !== 'free' ? 'solid' : 'outline'}
                  size="md"
                  isLoading={loadingPlan === plan.id}
                  loadingText="Processing..."
                  onClick={() => handlePlanSelect(plan)}
                  w="full"
                  _hover={{}}
                >
                  {plan.action.label || 'Subscribe'}
                </Button>
              ) : (
                <Button
                  color="white"
                  bg="transparent"
                  borderColor="rgba(255, 255, 255, 0.3)"
                  borderWidth="0.5px"
                  variant="outline"
                  size="md"
                  onClick={() => handlePlanSelect(plan)}
                  w="full"
                  _hover={{}}
                >
                  {plan.action.label || 'Continue'}
                </Button>
              )}
            </PricingBox>
          ))}
        </SimpleGrid>
        {children}
      </Box>
    </Section>
  )
}

const PricingFeatures: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <VStack
      align="stretch"
      justifyContent="stretch"
      spacing="4"
      mb="8"
      flex="1"
    >
      {children}
    </VStack>
  )
}

export interface PricingFeatureProps {
  title: React.ReactNode
  iconColor?: string
}

const PricingFeature: React.FC<PricingFeatureProps> = (props) => {
  const { title, iconColor = 'primary.500' } = props
  return (
    <HStack>
      <Icon as={FiCheck} color={iconColor} />
      <Text flex="1" fontSize="sm">
        {title}
      </Text>
    </HStack>
  )
}

export interface PricingBoxProps extends Omit<StackProps, 'title'> {
  title: React.ReactNode
  description: React.ReactNode
  price: React.ReactNode
}

const PricingBox: React.FC<PricingBoxProps> = (props) => {
  const { title, description, price, children, ...rest } = props
  
  return (
    <VStack
      zIndex="2"
      bg="whiteAlpha.600"
      borderRadius="md"
      p="8"
      flex="1 0"
      alignItems="stretch"
      border="1px solid"
      borderColor="gray.400"
      _dark={{
        bg: 'blackAlpha.300',
        borderColor: 'gray.800',
      }}
      {...rest}
    >
      <Heading as="h3" size="md" fontWeight="bold" fontSize="lg" mb="2">
        {title}
      </Heading>
      <Box color="muted">{description}</Box>
      <Box fontSize="2xl" fontWeight="bold" py="4">
        {price}
      </Box>
      <VStack align="stretch" justifyContent="stretch" spacing="4" flex="1">
        {children}
      </VStack>
    </VStack>
  )
}