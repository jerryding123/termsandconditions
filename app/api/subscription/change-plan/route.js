// /app/api/subscription/change-plan/route.js
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

export async function POST(request) {
  try {
    const { subscriptionId, newPriceId } = await request.json()

    if (!subscriptionId || !newPriceId) {
      return NextResponse.json(
        { error: 'Subscription ID and new price ID are required' },
        { status: 400 }
      )
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    })

    // Get new price details
    const price = await stripe.prices.retrieve(newPriceId)

    // Update in database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan_id: newPriceId,
        status: updatedSubscription.status,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Database update error:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        plan_id: newPriceId,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval
      }
    })
  } catch (error) {
    console.error('Change plan error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to change plan' },
      { status: 500 }
    )
  }
}