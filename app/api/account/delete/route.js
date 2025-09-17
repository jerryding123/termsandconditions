// /app/api/account/delete/route.js
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

export async function DELETE(request) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // Step 1: Get user's subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', userId)

    // Step 2: Cancel all active subscriptions in Stripe
    if (subscriptions && subscriptions.length > 0) {
      for (const subscription of subscriptions) {
        try {
          if (subscription.stripe_subscription_id) {
            await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
            console.log(`Canceled subscription: ${subscription.stripe_subscription_id}`)
          }
        } catch (stripeError) {
          console.error('Error canceling subscription:', stripeError)
          // Continue with deletion even if subscription cancellation fails
        }
      }
    }

    // Step 3: Delete subscription records from database
    if (subscriptions && subscriptions.length > 0) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId)

      if (subError) {
        console.error('Error deleting subscription records:', subError)
      }
    }

    // Step 4: Delete user account using Supabase Admin API
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    )
  }
}