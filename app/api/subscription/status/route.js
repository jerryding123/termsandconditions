// /app/api/subscription/status/route.js - Get Subscription Status (Updated for Copilot Use)
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const subscriptionId = searchParams.get('subscriptionId')

    if (!userId && !subscriptionId) {
      return NextResponse.json(
        { error: 'User ID or Subscription ID is required' },
        { status: 400 }
      )
    }

    let query = supabase.from('subscriptions').select('*')
    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      query = query.eq('stripe_subscription_id', subscriptionId)
    }

    const { data, error } = await query.single()

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Also get fresh data from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(data.stripe_subscription_id)

    return NextResponse.json({
      success: true,
      subscription: {
        ...data,
        stripe_status: stripeSubscription.status,
        stripe_cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        stripe_current_period_end: stripeSubscription.current_period_end,
        // Include usage information in the response
        usage: {
          copilot_use_used: data.copilot_use_used || 0,
          copilot_use_limit: data.copilot_use_limit || 0,
          interview_sessions_used: data.interview_sessions_used || 0,
          interview_sessions_limit: data.interview_sessions_limit || 999999,
          usage_period_end: data.usage_period_end,
          plan_tier: data.plan_tier
        }
      }
    })
  } catch (error) {
    console.error('Get subscription status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}