import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { priceId, returnUrl } = await request.json()
    
    // Add debugging
    console.log('Received priceId:', priceId)
    console.log('Stripe secret key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 12) + '...')
    
    // Validate priceId format
    if (!priceId || !priceId.startsWith('price_')) {
      console.error('Invalid price ID format:', priceId)
      return NextResponse.json({ error: 'Invalid price ID format' }, { status: 400 })
    }
    
    // Get the current user from the request headers
    const authHeader = request.headers.get('authorization')
    let user = null
    
    if (authHeader) {
      // Extract token from "Bearer <token>"
      const token = authHeader.replace('Bearer ', '')
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token)
      
      if (userError) {
        console.error('Auth error:', userError)
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      user = authUser
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // NEW: Check if user already has an active subscription
    const { data: existingSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingSubscription && !subError) {
      console.log('User already has active subscription:', existingSubscription.id)
      
      // Check if they're trying to subscribe to the same plan
      if (existingSubscription.plan_id === priceId) {
        return NextResponse.json({ 
          error: 'You are already subscribed to this plan',
          redirectTo: '/account?tab=billing',
          type: 'ALREADY_SUBSCRIBED'
        }, { status: 409 })
      } else {
        return NextResponse.json({ 
          error: 'You already have an active subscription. Please manage your subscription from your account page.',
          redirectTo: '/account?tab=billing',
          type: 'EXISTING_SUBSCRIPTION'
        }, { status: 409 })
      }
    }
    
    // Test if price exists in Stripe
    try {
      const price = await stripe.prices.retrieve(priceId)
      console.log('Price found:', price.id, 'Amount:', price.unit_amount, 'Currency:', price.currency)
    } catch (priceError) {
      console.error('Price retrieval error:', priceError)
      return NextResponse.json({ error: 'Price not found in Stripe' }, { status: 400 })
    }
    
    // Determine success URL based on source
    const isElectronApp = returnUrl?.includes('electron://') || returnUrl?.includes('app://')
    const successUrl = isElectronApp
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?electron=true&return_url=${encodeURIComponent(returnUrl)}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`
    const cancelUrl = isElectronApp
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing?electron=true&return_url=${encodeURIComponent(returnUrl)}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/#pricing`
    
    console.log('Creating checkout session for user:', user.email)
    
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        source: isElectronApp ? 'electron' : 'web'
      },
      subscription_data: { // Add this to pass user_id to subscription
        metadata: {
          user_id: user.id
        }
      }
    })
    
    console.log('Checkout session created:', session.id)
    return NextResponse.json({ sessionId: session.id, url: session.url })
    
  } catch (error) {
    console.error('Detailed checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}