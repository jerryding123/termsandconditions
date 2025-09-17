// app/webhooks/stripe/route.js - UPDATED FOR COPILOT USE

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Create Supabase client with SERVICE ROLE key - this bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper function to get copilot use limits by plan
const getCopilotUseLimits = (planTier) => {
  switch (planTier) {
    case 'plus':
      return 400
    case 'pro':
      return 1000
    case 'pro_plus':
      return 2000 // Hidden cap for abuse prevention, but treated as unlimited
    case 'free':
    default:
      return 10 // Free plan gets 10 copilot uses
  }
}

// FIXED: Better timestamp handling with fallbacks
function safeTimestampToISO(timestamp, fallbackToNow = false) {
  if (!timestamp || timestamp === 0) {
    if (fallbackToNow) {
      console.warn('Missing timestamp, using current time as fallback')
      return new Date().toISOString()
    }
    return null
  }
  
  try {
    const date = new Date(timestamp * 1000)
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp received:', timestamp)
      if (fallbackToNow) {
        return new Date().toISOString()
      }
      return null
    }
    return date.toISOString()
  } catch (error) {
    console.warn('Error converting timestamp:', timestamp, error)
    if (fallbackToNow) {
      return new Date().toISOString()
    }
    return null
  }
}

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    console.log('Webhook event received:', event.type)
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handling error:', error)
    return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 })
  }
}

// Simplified checkout completed - just log completion
async function handleCheckoutCompleted(session) {
  console.log('Checkout completed for session:', session.id)
  console.log('Subscription will be handled by subscription.created event')
}

// UPDATED: Main subscription creation handler with copilot use limits
async function handleSubscriptionCreated(subscription) {
  console.log('Processing subscription created:', subscription.id)
  
  try {
    // ADDED: More detailed logging of the subscription object
    console.log('Subscription data received:', {
      id: subscription.id,
      status: subscription.status,
      customer: subscription.customer,
      metadata: subscription.metadata,
      subscription_item_periods: subscription.items?.data?.[0] ? {
        current_period_start: subscription.items.data[0].current_period_start,
        current_period_end: subscription.items.data[0].current_period_end
      } : 'No subscription items found'
    })

    const priceInfo = subscription.items.data[0].price
    const planId = priceInfo.id

    // Get user ID from subscription metadata
    const userId = subscription.metadata?.user_id
    if (!userId) {
      console.error('No user_id found in subscription metadata')
      return
    }

    // Get plan limits from database
    const { data: planLimits } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('stripe_price_id', planId)
      .single()

    console.log('Plan limits found:', planLimits)

    // Calculate usage period - always weekly for copilot use
    const now = new Date()
    const weeklyInterval = 7 * 24 * 60 * 60 * 1000
    const usagePeriodEnd = new Date(now.getTime() + weeklyInterval)

    // FIXED: Get timestamps from subscription item, not subscription object
    const subscriptionItem = subscription.items.data[0]
    const periodStart = safeTimestampToISO(subscriptionItem.current_period_start, true)
    const periodEnd = safeTimestampToISO(subscriptionItem.current_period_end, false)
    
    // ADDED: Extra validation
    if (!periodStart) {
      console.error('Failed to get valid current_period_start timestamp from subscription item')
      throw new Error('Invalid current_period_start timestamp')
    }

    // FIXED: Determine plan tier - use planLimits.plan_tier, not planLimitsData.plan_tier
    const planTier = planLimits?.plan_tier || 'unknown'
    console.log('Plan tier determined:', planTier)

    // UPDATED: Store subscription with copilot use limits instead of interview minutes
    const subscriptionData = {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      current_period_start: periodStart, // Now guaranteed to be non-null
      current_period_end: periodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Fallback to 30 days from now
      plan_id: planId,
      amount: priceInfo.unit_amount,
      currency: priceInfo.currency,
      // Use Stripe's actual interval data - no custom mapping
      interval: priceInfo.recurring?.interval || 'month',
      interval_count: priceInfo.recurring?.interval_count || 1,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      
      // FIXED: Use planLimits and planTier correctly
      plan_tier: planTier,
      copilot_use_limit: planLimits?.copilot_use_limit || getCopilotUseLimits(planTier),
      interview_sessions_limit: planLimits?.interview_sessions_limit || 999999,
      copilot_use_used: 0,
      interview_sessions_used: 0,
      usage_period_start: now.toISOString(),
      usage_period_end: usagePeriodEnd.toISOString()
    }

    console.log('Storing subscription with data:', subscriptionData)

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'stripe_subscription_id',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('Error storing subscription:', error)
      throw error
    }

    console.log('Successfully stored subscription:', data)

  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
    throw error
  }
}

// FIXED: Updated subscription handler with better timestamp handling
async function handleSubscriptionUpdated(subscription) {
  console.log('Processing subscription updated:', subscription.id)
  
  try {
    // Use data directly from Stripe webhook - no manual fetching
    const updateData = {
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end || false
    }

    // FIXED: Get timestamps from subscription item when available
    let periodStart = null
    let periodEnd = null
    
    if (subscription.items && subscription.items.data && subscription.items.data[0]) {
      const subscriptionItem = subscription.items.data[0]
      periodStart = safeTimestampToISO(subscriptionItem.current_period_start, false)
      periodEnd = safeTimestampToISO(subscriptionItem.current_period_end, false)
    } else {
      // Fallback: try to get from subscription object (though these usually don't exist)
      periodStart = safeTimestampToISO(subscription.current_period_start, false)
      periodEnd = safeTimestampToISO(subscription.current_period_end, false)
    }
    
    // Only update timestamps if they are valid
    if (periodStart) {
      updateData.current_period_start = periodStart
    } else {
      console.warn('Missing current_period_start in subscription update')
    }
    
    if (periodEnd) {
      updateData.current_period_end = periodEnd
    } else {
      console.warn('Missing current_period_end in subscription update')
    }

    // Update plan details if available
    if (subscription.items && subscription.items.data && subscription.items.data[0]) {
      const item = subscription.items.data[0]
      if (item.price) {
        const newPlanId = item.price.id
        updateData.plan_id = newPlanId
        updateData.amount = item.price.unit_amount
        updateData.currency = item.price.currency
        
        // Use Stripe's actual interval data - no custom mapping
        if (item.price.recurring) {
          updateData.interval = item.price.recurring.interval
          updateData.interval_count = item.price.recurring.interval_count
        }

        // ADDED: Update plan_tier when plan changes
        const { data: planLimits } = await supabase
          .from('plan_limits')
          .select('*')
          .eq('stripe_price_id', newPlanId)
          .single()

        if (planLimits) {
          updateData.plan_tier = planLimits.plan_tier
          updateData.copilot_use_limit = planLimits.copilot_use_limit || getCopilotUseLimits(planLimits.plan_tier)
          updateData.interview_sessions_limit = planLimits.interview_sessions_limit || 999999
          console.log('Updated plan tier to:', planLimits.plan_tier)
        }
      }
    }

    console.log('Update data:', updateData)

    const { error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription:', error)
      throw error
    }

    console.log('Successfully updated subscription')
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Processing subscription deleted:', subscription.id)
  
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        cancel_at_period_end: false
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }

    console.log('Successfully canceled subscription')
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error)
    throw error
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Processing invoice payment succeeded:', invoice.id)
  
  if (invoice.subscription) {
    try {
      // Simple status update - let subscription.updated handle the rest
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('stripe_subscription_id', invoice.subscription)

      if (error) {
        console.error('Error updating subscription after payment:', error)
        throw error
      }

      console.log('Successfully updated subscription status after payment')
    } catch (error) {
      console.error('Error in handleInvoicePaymentSucceeded:', error)
    }
  }
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('Processing invoice payment failed:', invoice.id)
  
  if (invoice.subscription) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', invoice.subscription)

      if (error) {
        console.error('Error updating subscription after failed payment:', error)
        throw error
      }

      console.log('Successfully updated subscription status to past_due')
    } catch (error) {
      console.error('Error in handleInvoicePaymentFailed:', error)
    }
  }
}