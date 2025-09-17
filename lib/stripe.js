import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Client-side function to create checkout session
export async function createCheckoutSession(priceId, returnUrl = null) {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      priceId,
      returnUrl 
    }),
  })
  
  return response.json()
}

// Function to check subscription status
export async function getSubscriptionStatus(userId) {
  const response = await fetch(`/api/subscription/status?userId=${userId}`)
  return response.json()
}