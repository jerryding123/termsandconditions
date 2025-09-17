// app/auth/callback/route.js

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with SERVICE ROLE key for checking subscriptions
const supabaseAdmin = createClient(
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
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const isElectron = requestUrl.searchParams.get('electron') === 'true'
  const returnUrl = requestUrl.searchParams.get('return_url')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=callback_error`)
    }

    // If this is an Electron login, redirect to the deep link
    if (isElectron && returnUrl && data.user) {
      try {
        // Get user's subscription data for plan_tier
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', data.user.id)
          .eq('status', 'active')
          .single()

        let planTier = 'free'
        if (subscription) {
          // Get plan limits to determine tier
          const { data: planLimits } = await supabaseAdmin
            .from('plan_limits')
            .select('plan_tier')
            .eq('stripe_price_id', subscription.plan_id)
            .single()
          
          planTier = planLimits?.plan_tier || 'free'
        }

        const userData = {
          id: data.user.id,
          email: data.user.email,
          plan_tier: planTier
        }
        
        const electronRedirectUrl = `${returnUrl}?user=${encodeURIComponent(JSON.stringify(userData))}`
        return NextResponse.redirect(electronRedirectUrl)
      } catch (error) {
        console.error('Error getting user plan for Electron redirect:', error)
        // Fallback to free plan
        const userData = {
          id: data.user.id,
          email: data.user.email,
          plan_tier: 'free'
        }
        
        const electronRedirectUrl = `${returnUrl}?user=${encodeURIComponent(JSON.stringify(userData))}`
        return NextResponse.redirect(electronRedirectUrl)
      }
    }
  }

  // Normal web redirect
  return NextResponse.redirect(`${requestUrl.origin}/account`)
}