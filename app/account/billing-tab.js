// app/account/billing-tab.js

import { useState, useEffect, useCallback } from 'react'
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
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  Icon,
  Progress,
  SimpleGrid,
} from '@chakra-ui/react'
import {
  FiCreditCard,
  FiVideo,
  FiCpu,
} from 'react-icons/fi'

const BillingTab = ({ user }) => {
  const [subscription, setSubscription] = useState(null)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchSubscriptionData = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      // Fetch subscription
      const subResponse = await fetch(`/api/subscription/status?userId=${user.id}`)
      const subData = await subResponse.json()

      if (subData.subscription) {
        setSubscription(subData.subscription)
      }

      // Fetch usage data
      const usageResponse = await fetch(`/api/usage/track?userId=${user.id}`)
      const usageData = await usageResponse.json()

      if (usageData.usage) {
        setUsage(usageData.usage)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
      setError('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchSubscriptionData()
  }, [fetchSubscriptionData])

  const openStripePortal = async () => {
    try {
      setPortalLoading(true)
      setError('')

      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: subscription?.stripe_customer_id,
          returnUrl: window.location.href
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session')
      }

      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        throw new Error('No portal URL received')
      }
    } catch (error) {
      console.error('Portal error:', error)
      setError('Unable to open billing portal. Please try again or contact support.')
    } finally {
      setPortalLoading(false)
    }
  }

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  // UPDATED: Format prices using Stripe's native interval + interval_count
  const formatSubscriptionPrice = (amount, currency, interval, intervalCount = 1) => {
    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    })

    // Calculate monthly equivalent for multi-month plans
    let displayAmount = amount
    let displayText = ''

    if (interval === 'month' && intervalCount === 3) {
      // Quarterly plan: divide by 3 to get monthly equivalent
      displayAmount = amount / 3
      displayText = currencyFormatter.format(displayAmount / 100) + ' / month'
    } else if (interval === 'month' && intervalCount === 6) {
      // Semi-annual plan: divide by 6 to get monthly equivalent
      displayAmount = amount / 6
      displayText = currencyFormatter.format(displayAmount / 100) + ' / month'
    } else if (interval === 'month' && intervalCount === 1) {
      displayText = currencyFormatter.format(amount / 100) + ' / month'
    } else if (interval === 'week') {
      displayText = currencyFormatter.format(amount / 100) + ' / week'
    } else if (interval === 'year') {
      displayText = currencyFormatter.format(amount / 100) + ' / year'
    } else {
      displayText = currencyFormatter.format(amount / 100) + ' / ' + interval
    }

    return displayText
  }

  // UPDATED: Get billing period text using Stripe's native format
  const getBillingPeriodText = (interval, intervalCount = 1) => {
    if (interval === 'month' && intervalCount === 3) {
      return 'billed quarterly'
    } else if (interval === 'month' && intervalCount === 6) {
      return 'billed semi-annually'
    } else if (interval === 'month' && intervalCount === 1) {
      return 'billed monthly'
    } else if (interval === 'week') {
      return 'billed weekly'
    } else if (interval === 'year') {
      return 'billed yearly'
    } else {
      return `billed every ${intervalCount} ${interval}${intervalCount > 1 ? 's' : ''}`
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green'
      case 'canceled': return 'red'
      case 'past_due': return 'yellow'
      case 'incomplete': return 'orange'
      default: return 'gray'
    }
  }

  const getPlanTierColor = (tier) => {
    switch (tier) {
      case 'free': return 'gray'
      case 'plus': return 'blue'
      case 'pro': return 'purple'
      case 'pro_plus': return 'gold'
      default: return 'gray'
    }
  }

  const getPlanDisplayName = (tier) => {
    switch (tier) {
      case 'free': return 'Free Plan'
      case 'plus': return 'Plus Plan'
      case 'pro': return 'Pro Plan'
      case 'pro_plus': return 'Pro+ Plan'
      default: return 'Unknown Plan'
    }
  }

  // UPDATED: Calculate remaining percentage instead of used percentage
  const getRemainingPercentage = (used, limit) => {
    if (limit === 0) return 0
    const remaining = Math.max(0, limit - used)
    return Math.min((remaining / limit) * 100, 100)
  }

  // UPDATED: Get color based on remaining amount (green when high, red when low)
  const getRemainingColor = (used, limit) => {
    const remainingPercentage = getRemainingPercentage(used, limit)
    if (remainingPercentage <= 10) return 'red'
    if (remainingPercentage <= 25) return 'yellow'
    return 'green'
  }

  const formatTimeRemaining = (endDate) => {
    if (!endDate) return 'No expiration'

    const now = new Date()
    const end = new Date(endDate)
    const diffMs = end - now

    if (diffMs <= 0) return 'Expired'

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  // UPDATED: Helper function to calculate remaining copilot uses
  const getRemainingCopilotUses = (used, limit) => {
    return Math.max(0, limit - used)
  }

  // Helper function to calculate remaining sessions
  const getRemainingSessions = (used, limit) => {
    return Math.max(0, limit - used)
  }

  // UPDATED: Helper function to check if copilot uses are unlimited
  const hasUnlimitedCopilotUses = (planTier, copilotUseLimit) => {
    return planTier === 'pro_plus' || copilotUseLimit >= 999999
  }

  // UPDATED: Helper function to format personalized reset time
  const getPersonalizedResetText = (endDate, isFreePlan = false) => {
    if (isFreePlan) {
      return 'Free plan limits do not reset - upgrade for unlimited access'
    }

    if (!endDate) return 'Copilot uses reset weekly'

    const resetDate = new Date(endDate)
    const dayOfWeek = resetDate.toLocaleDateString('en-US', { weekday: 'long' })
    const timeString = resetDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    })

    return `Copilot uses reset every ${dayOfWeek} at ${timeString} UTC`
  }

  if (loading) {
    return (
      <VStack spacing={8} align="center" justify="center" minH="400px">
        <Spinner size="xl" color="white" thickness="4px" />
        <Text color="white" fontSize="lg">Loading billing information...</Text>
      </VStack>
    )
  }

  // Free plan or no subscription
  if (!subscription && usage?.plan_tier === 'free') {
    return (
      <VStack spacing={8} align="stretch">
        <Heading size="xl" color="white" textAlign="left">
          Billing & Subscription
        </Heading>

        {/* Free Plan Card */}
        <Card
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          borderRadius="16px"
        >
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Heading size="lg" color="white">
                      {getPlanDisplayName(usage.plan_tier)}
                    </Heading>
                    <Badge
                      colorScheme={getPlanTierColor(usage.plan_tier)}
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      FREE
                    </Badge>
                  </HStack>
                  <Text fontSize="2xl" color="white" fontWeight="bold">
                    $0.00
                  </Text>
                </VStack>
              </HStack>

              <Divider borderColor="rgba(255, 255, 255, 0.2)" />

              <VStack spacing={3} align="start">
                <Button
                  colorScheme="primary"
                  color="black"
                  size="lg"
                  onClick={() => window.location.href = '/#pricing'}
                  w="fit-content"
                >
                  Upgrade Plan
                </Button>
                <Text color="gray.400" fontSize="sm">
                  Get 400 copilot uses weekly with Plus, 1,000 with Pro, or unlimited with Pro+
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Free Plan Usage */}
        {usage && (
          <Card
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(10px)"
            border="1px solid rgba(255, 255, 255, 0.2)"
            borderRadius="16px"
          >
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color="white">
                  Usage
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {/* UPDATED: Copilot Uses for Free Plan */}
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <Icon as={FiCpu} color="primary.400" />
                      <Text color="white" fontWeight="semibold">Copilot Uses</Text>
                    </HStack>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text color="gray.400" fontSize="sm">
                          {getRemainingCopilotUses(usage.copilot_use_used, usage.copilot_use_limit)} uses remaining
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                          {Math.round(getRemainingPercentage(usage.copilot_use_used, usage.copilot_use_limit))}%
                        </Text>
                      </HStack>
                      <Progress
                        value={getRemainingPercentage(usage.copilot_use_used, usage.copilot_use_limit)}
                        colorScheme={getRemainingColor(usage.copilot_use_used, usage.copilot_use_limit)}
                        bg="rgba(255, 255, 255, 0.1)"
                        borderRadius="full"
                        size="lg"
                      />
                    </VStack>
                  </VStack>

                  {/* Interview Sessions for Free Plan */}
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <Icon as={FiVideo} color="primary.400" />
                      <Text color="white" fontWeight="semibold">Interview Sessions</Text>
                    </HStack>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text color="gray.400" fontSize="sm">
                          {getRemainingSessions(usage.interview_sessions_used, usage.interview_sessions_limit)} sessions remaining
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                          {Math.round(getRemainingPercentage(usage.interview_sessions_used, usage.interview_sessions_limit))}%
                        </Text>
                      </HStack>
                      <Progress
                        value={getRemainingPercentage(usage.interview_sessions_used, usage.interview_sessions_limit)}
                        colorScheme={getRemainingColor(usage.interview_sessions_used, usage.interview_sessions_limit)}
                        bg="rgba(255, 255, 255, 0.1)"
                        borderRadius="full"
                        size="lg"
                      />
                    </VStack>
                  </VStack>
                </SimpleGrid>

                {/* UPDATED: Alert conditions */}
                {(usage.interview_sessions_used >= usage.interview_sessions_limit || usage.copilot_use_used >= usage.copilot_use_limit) && (
                  <Alert status="warning" borderRadius="12px" bg="rgba(245, 158, 11, 0.2)">
                    <AlertIcon />
                    <AlertDescription>
                      {usage.interview_sessions_used >= usage.interview_sessions_limit
                        ? "You've reached your free plan session limit. Upgrade to continue using Terms & Conditions."
                        : "You've used all your copilot uses. Upgrade for unlimited access."
                      }
                    </AlertDescription>
                  </Alert>
                )}

                {/* Usage Reset Info */}
                <Box
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="12px"
                  p={4}
                  border="1px solid rgba(255, 255, 255, 0.1)"
                >
                  <Text color="gray.400" fontSize="sm" textAlign="center">
                    {getPersonalizedResetText(usage.usage_period_end, true)}
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    )
  }

  if (!subscription) {
    return (
      <VStack spacing={8} align="center" justify="center" minH="400px">
        <Icon as={FiCreditCard} boxSize={16} color="rgba(255, 255, 255, 0.5)" />
        <VStack spacing={3} textAlign="center">
          <Heading size="xl" color="white">No Active Subscription</Heading>
          <Text color="rgba(255, 255, 255, 0.7)" fontSize="lg">
            You don&apos;t have an active subscription yet.
          </Text>
          <Button
            colorScheme="primary"
            color="black"
            size="lg"
            onClick={() => window.location.href = '/#pricing'}
          >
            View Plans
          </Button>
        </VStack>
      </VStack>
    )
  }

  return (
    <VStack spacing={8} align="stretch">
      <Heading size="xl" color="white" textAlign="left">
        Billing & Subscription
      </Heading>

      {error && (
        <Alert status="error" borderRadius="16px" bg="rgba(254, 178, 178, 0.9)">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Subscription Card */}
      <Card
        bg="rgba(255, 255, 255, 0.1)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.2)"
        borderRadius="16px"
      >
        <CardBody p={8}>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={2}>
                <HStack>
                  <Heading size="lg" color="white">
                    {getPlanDisplayName(usage?.plan_tier)}
                  </Heading>
                  <Badge
                    colorScheme={getStatusColor(subscription.status)}
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {subscription.status.toUpperCase()}
                  </Badge>
                </HStack>
                {/* UPDATED: Use interval and interval_count */}
                <Text fontSize="2xl" color="white" fontWeight="bold">
                  {formatSubscriptionPrice(
                    subscription.amount,
                    subscription.currency,
                    subscription.interval,
                    subscription.interval_count
                  )}
                  {/* Show billing period for multi-month plans */}
                  {((subscription.interval === 'month' && subscription.interval_count > 1) ||
                    subscription.interval === 'year') && (
                      <Text as="span" fontSize="sm" color="gray.400" fontWeight="normal" display="block">
                        ({getBillingPeriodText(subscription.interval, subscription.interval_count)})
                      </Text>
                    )}
                </Text>
              </VStack>
              <VStack align="end" spacing={2}>
                <Text color="gray.400" fontSize="sm">Next billing date</Text>
                <Text color="white" fontSize="lg" fontWeight="semibold">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </Text>
              </VStack>
            </HStack>

            {subscription.cancel_at_period_end && (
              <Alert status="warning" borderRadius="12px" bg="rgba(245, 158, 11, 0.2)">
                <AlertIcon />
                <AlertDescription>
                  Your subscription will cancel on {new Date(subscription.current_period_end).toLocaleDateString()}.
                  You can reactivate anytime before then.
                </AlertDescription>
              </Alert>
            )}

            <Divider borderColor="rgba(255, 255, 255, 0.2)" />

            <VStack spacing={3} align="start">
              <Button
                variant="outline"
                borderColor="rgba(255, 255, 255, 0.3)"
                color="white"
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                onClick={openStripePortal}
                isLoading={portalLoading}
                loadingText="Opening portal..."
                w="fit-content"
              >
                Manage Subscription
              </Button>
              <Text color="gray.400" fontSize="sm">
                Change plans, update payment methods, view invoices, and cancel subscription
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Usage Card */}
      {usage && (
        <Card
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          borderRadius="16px"
        >
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between" align="center">
                <Heading size="lg" color="white">
                  Usage (Resets Weekly)
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  {formatTimeRemaining(usage.usage_period_end)}
                </Text>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* UPDATED: Copilot Uses */}
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Icon as={FiCpu} color="primary.400" />
                    <Text color="white" fontWeight="semibold">Copilot Uses</Text>
                  </HStack>
                  <VStack spacing={2} align="stretch">
                    {hasUnlimitedCopilotUses(usage?.plan_tier, usage.copilot_use_limit) ? (
                      <>
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">
                            {usage.copilot_use_used} uses used
                          </Text>
                          <Text color="green.400" fontSize="sm" fontWeight="bold">
                            UNLIMITED
                          </Text>
                        </HStack>
                        <Progress
                          value={100}
                          colorScheme="green"
                          bg="rgba(72, 187, 120, 0.3)"
                          borderRadius="full"
                          size="lg"
                        />
                      </>
                    ) : (
                      <>
                        <HStack justify="space-between">
                          <Text color="gray.400" fontSize="sm">
                            {getRemainingCopilotUses(usage.copilot_use_used, usage.copilot_use_limit)} uses remaining
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            {Math.round(getRemainingPercentage(usage.copilot_use_used, usage.copilot_use_limit))}%
                          </Text>
                        </HStack>
                        <Progress
                          value={getRemainingPercentage(usage.copilot_use_used, usage.copilot_use_limit)}
                          colorScheme={getRemainingColor(usage.copilot_use_used, usage.copilot_use_limit)}
                          bg="rgba(255, 255, 255, 0.1)"
                          borderRadius="full"
                          size="lg"
                        />
                      </>
                    )}
                  </VStack>
                </VStack>

                {/* Interview Sessions */}
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Icon as={FiVideo} color="primary.400" />
                    <Text color="white" fontWeight="semibold">Interview Sessions</Text>
                  </HStack>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text color="gray.400" fontSize="sm">
                        {usage.interview_sessions_used} sessions used
                      </Text>
                      <Text color="green.400" fontSize="sm" fontWeight="bold">
                        UNLIMITED
                      </Text>
                    </HStack>
                    <Progress
                      value={100}
                      colorScheme="green"
                      bg="rgba(72, 187, 120, 0.3)"
                      borderRadius="full"
                      size="lg"
                    />
                  </VStack>
                </VStack>
              </SimpleGrid>

              {/* UPDATED: Alert conditions */}
              {(usage.copilot_use_used >= usage.copilot_use_limit && !hasUnlimitedCopilotUses(usage?.plan_tier, usage.copilot_use_limit)) && (
                <Alert status="warning" borderRadius="12px" bg="rgba(245, 158, 11, 0.2)">
                  <AlertIcon />
                  <AlertDescription>
                    You&apos;ve used all your copilot uses for this week.
                    Your uses will reset in {formatTimeRemaining(usage.usage_period_end)}.
                  </AlertDescription>
                </Alert>
              )}

              {/* Usage Reset Info */}
              <Box
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="12px"
                p={4}
                border="1px solid rgba(255, 255, 255, 0.1)"
              >
                <Text color="gray.400" fontSize="sm" textAlign="center">
                  {getPersonalizedResetText(usage.usage_period_end, false)}
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  )
}

export default BillingTab