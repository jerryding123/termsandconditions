// utils/subscription.js
// Utility functions for handling subscription checks

/**
 * Check if a user has an active subscription
 * @param {string} userId - The user's ID
 * @returns {Promise<Object|null>} - Returns subscription object if found, null otherwise
 */
export const checkUserSubscription = async (userId) => {
    try {
      const response = await fetch(`/api/subscription/status?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok && data.subscription && data.subscription.status === 'active') {
        return data.subscription
      }
      return null
    } catch (error) {
      console.error('Error checking subscription:', error)
      return null
    }
  }
  
  /**
   * Check if user is subscribed to a specific plan
   * @param {string} userId - The user's ID
   * @param {string} priceId - The Stripe price ID to check
   * @returns {Promise<boolean>} - Returns true if user is subscribed to this plan
   */
  export const isUserSubscribedToPlan = async (userId, priceId) => {
    const subscription = await checkUserSubscription(userId)
    return subscription && subscription.plan_id === priceId
  }
  
  /**
   * Get subscription status for UI display
   * @param {Object} subscription - The subscription object
   * @returns {Object} - Returns status info for UI
   */
  export const getSubscriptionDisplayInfo = (subscription) => {
    if (!subscription) {
      return {
        planName: 'Free Plan',
        status: 'free',
        statusColor: 'gray',
        isActive: false
      }
    }
  
    const planNames = {
      'free': 'Free Plan',
      'plus': 'Plus Plan', 
      'pro': 'Pro Plan',
      'pro_plus': 'Pro+ Plan'
    }
  
    const statusColors = {
      'active': 'green',
      'canceled': 'red',
      'past_due': 'yellow',
      'incomplete': 'orange',
      'free': 'gray'
    }
  
    return {
      planName: planNames[subscription.plan_tier] || 'Unknown Plan',
      status: subscription.status,
      statusColor: statusColors[subscription.status] || 'gray',
      isActive: subscription.status === 'active'
    }
  }
  
  /**
   * Format subscription price for display
   * @param {Object} subscription - The subscription object
   * @returns {string} - Formatted price string
   */
  export const formatSubscriptionPrice = (subscription) => {
    if (!subscription || !subscription.amount) {
      return '$0.00'
    }
  
    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (subscription.currency || 'usd').toUpperCase()
    })
  
    const { amount, currency, interval, interval_count = 1 } = subscription
  
    // Calculate display amount and text based on interval
    if (interval === 'month' && interval_count === 3) {
      // Quarterly plan: show monthly equivalent
      const monthlyAmount = amount / 3
      return currencyFormatter.format(monthlyAmount / 100) + ' / month'
    } else if (interval === 'month' && interval_count === 6) {
      // Semi-annual plan: show monthly equivalent  
      const monthlyAmount = amount / 6
      return currencyFormatter.format(monthlyAmount / 100) + ' / month'
    } else if (interval === 'month' && interval_count === 1) {
      return currencyFormatter.format(amount / 100) + ' / month'
    } else if (interval === 'week') {
      return currencyFormatter.format(amount / 100) + ' / week'
    } else if (interval === 'year') {
      return currencyFormatter.format(amount / 100) + ' / year'
    } else {
      return currencyFormatter.format(amount / 100) + ' / ' + interval
    }
  }
  
  /**
   * Check if user should be redirected to account page instead of checkout
   * @param {string} userId - The user's ID
   * @param {string} targetPriceId - The price ID they're trying to subscribe to
   * @returns {Promise<Object>} - Returns redirect info
   */
  export const shouldRedirectToAccount = async (userId, targetPriceId) => {
    const subscription = await checkUserSubscription(userId)
    
    if (!subscription) {
      return { shouldRedirect: false }
    }
  
    if (subscription.plan_id === targetPriceId) {
      return {
        shouldRedirect: true,
        reason: 'already_subscribed',
        message: 'You are already subscribed to this plan.',
        redirectUrl: '/account?tab=billing'
      }
    }
  
    return {
      shouldRedirect: true,
      reason: 'existing_subscription',
      message: 'You already have an active subscription. You can change your plan from your account page.',
      redirectUrl: '/account?tab=billing'
    }
  }