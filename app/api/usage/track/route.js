// /app/api/usage/track/route.js - UPDATED FOR COPILOT USE
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// Helper function to check if plan has unlimited copilot uses
// Pro+ users get unlimited usage but have a hidden 2000 cap stored for abuse prevention
const hasUnlimitedCopilotUse = (planTier, copilotUseLimit) => {
  return planTier === 'pro_plus' || copilotUseLimit >= 999999
}

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

export async function POST(request) {
  try {
    const { userId, type, amount = 1 } = await request.json()

    console.log('🔥 Usage tracking request:', { userId, type, amount })

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'User ID and type are required' },
        { status: 400 }
      )
    }

    // ✅ UPDATED: Accept 'copilot_use' instead of minutes/seconds
    if (!['copilot_use', 'session'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "copilot_use" or "session"' },
        { status: 400 }
      )
    }

    // Get user's active subscription or check if they're on free plan
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      console.log('👤 User on free plan, checking free usage...')
      
      // User is on free plan - track usage in user metadata
      const { data: freePlan } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('stripe_price_id', 'free_plan')
        .single()

      // Get or create free user usage record
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
      
      if (userError) {
        console.error('❌ User not found:', userError)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const currentMetadata = userData.user.user_metadata || {}
      const freeUsage = currentMetadata.free_usage || {
        copilot_use_used: 0,
        interview_sessions_used: 0,
        period_start: new Date().toISOString()
      }

      console.log('📊 Current free usage:', freeUsage)

      // Free plan doesn't reset - once used up, must upgrade
      let newUsage = { ...freeUsage }
      
      if (type === 'copilot_use') {
        newUsage.copilot_use_used += amount
        
        console.log(`📈 Adding ${amount} copilot uses, new total: ${newUsage.copilot_use_used}`)
        
        // Check free plan copilot use limit (10 uses)
        const copilotUseLimit = freePlan?.copilot_use_limit || 10
        if (newUsage.copilot_use_used > copilotUseLimit) {
          console.log(`🚫 Free plan limit exceeded: ${newUsage.copilot_use_used} > ${copilotUseLimit}`)
          return NextResponse.json(
            { error: 'Free plan copilot use limit exceeded. Please upgrade.' },
            { status: 429 }
          )
        }
      } else if (type === 'session') {
        newUsage.interview_sessions_used += 1
        
        console.log(`📈 Adding 1 session, new total: ${newUsage.interview_sessions_used}`)
        
        // Check free plan sessions limit (3 sessions)
        const sessionsLimit = freePlan?.interview_sessions_limit || 3
        if (newUsage.interview_sessions_used > sessionsLimit) {
          console.log(`🚫 Free plan session limit exceeded: ${newUsage.interview_sessions_used} > ${sessionsLimit}`)
          return NextResponse.json(
            { error: 'Free plan session limit exceeded. Please upgrade.' },
            { status: 429 }
          )
        }
      }

      // Update user metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...currentMetadata,
          free_usage: newUsage
        }
      })

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError)
        return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 })
      }

      console.log('✅ Free plan usage updated successfully:', newUsage)

      return NextResponse.json({
        success: true,
        usage: {
          plan_tier: 'free',
          copilot_use_used: newUsage.copilot_use_used,
          copilot_use_limit: freePlan?.copilot_use_limit || 10,
          interview_sessions_used: newUsage.interview_sessions_used,
          interview_sessions_limit: freePlan?.interview_sessions_limit || 3,
          usage_period_end: null // Free plan doesn't reset
        }
      })
    }

    console.log('💳 User has paid subscription:', subscription.plan_tier)

    // User has paid subscription
    // Check if usage period has expired and reset if needed (weekly reset for all paid plans)
    const now = new Date()
    const periodEnd = new Date(subscription.usage_period_end)
    
    let updateData = {}
    
    if (now > periodEnd) {
      console.log('🔄 Usage period expired, resetting usage...')
      
      // Reset usage and set new weekly period
      const { data: planLimitsData } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('stripe_price_id', subscription.plan_id)
        .single()

      if (planLimitsData) {
        // Always weekly reset for copilot use
        const weeklyInterval = 7 * 24 * 60 * 60 * 1000
        
        updateData = {
          copilot_use_used: 0,
          interview_sessions_used: 0,
          copilot_use_limit: planLimitsData.copilot_use_limit || getCopilotUseLimits(planLimitsData.plan_tier),
          interview_sessions_limit: planLimitsData.interview_sessions_limit,
          plan_tier: planLimitsData.plan_tier,
          usage_period_start: now.toISOString(),
          usage_period_end: new Date(now.getTime() + weeklyInterval).toISOString()
        }
      }
    }

    // Add the new usage
    if (type === 'copilot_use') {
      const currentCopilotUseUsed = updateData.copilot_use_used ?? subscription.copilot_use_used
      updateData.copilot_use_used = currentCopilotUseUsed + amount
      console.log(`📈 Adding ${amount} copilot uses to ${currentCopilotUseUsed}, new total: ${updateData.copilot_use_used}`)
    } else if (type === 'session') {
      updateData.interview_sessions_used = (updateData.interview_sessions_used ?? subscription.interview_sessions_used) + 1
      console.log(`📈 Adding 1 session, new total: ${updateData.interview_sessions_used}`)
    }

    // Check limits before updating
    const newCopilotUseUsed = updateData.copilot_use_used ?? subscription.copilot_use_used
    const copilotUseLimit = updateData.copilot_use_limit ?? subscription.copilot_use_limit
    const planTier = updateData.plan_tier ?? subscription.plan_tier

    // Only check copilot use limits if not unlimited (Pro+ or 999999+ limit)
    // Pro+ users bypass this check entirely (unlimited usage with hidden 2000 cap for abuse prevention)
    if (type === 'copilot_use' && !hasUnlimitedCopilotUse(planTier, copilotUseLimit)) {
      if (newCopilotUseUsed > copilotUseLimit) {
        console.log(`🚫 Paid plan limit exceeded: ${newCopilotUseUsed} > ${copilotUseLimit}`)
        return NextResponse.json(
          { error: 'Copilot use limit exceeded' },
          { status: 429 }
        )
      }
    }

    // Sessions are unlimited for all paid plans, so no limit check needed

    // Update subscription with new usage
    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscription.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating subscription usage:', updateError)
      return NextResponse.json(
        { error: 'Failed to update usage' },
        { status: 500 }
      )
    }

    console.log('✅ Paid plan usage updated successfully:', updatedSub)

    return NextResponse.json({
      success: true,
      usage: {
        plan_tier: updatedSub.plan_tier,
        copilot_use_used: updatedSub.copilot_use_used,
        copilot_use_limit: updatedSub.copilot_use_limit,
        interview_sessions_used: updatedSub.interview_sessions_used,
        interview_sessions_limit: updatedSub.interview_sessions_limit,
        usage_period_end: updatedSub.usage_period_end
      }
    })

  } catch (error) {
    console.error('💥 Usage tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    )
  }
}

// GET endpoint for checking usage (updated for copilot use)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user has active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error || !subscription) {
      // User is on free plan
      const { data: freePlan } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('stripe_price_id', 'free_plan')
        .single()

      // Get free user usage from metadata
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      const freeUsage = userData?.user?.user_metadata?.free_usage || {
        copilot_use_used: 0,
        interview_sessions_used: 0
      }

      return NextResponse.json({
        success: true,
        usage: {
          plan_tier: 'free',
          copilot_use_used: freeUsage.copilot_use_used || 0,
          copilot_use_limit: freePlan?.copilot_use_limit || 10,
          interview_sessions_used: freeUsage.interview_sessions_used || 0,
          interview_sessions_limit: freePlan?.interview_sessions_limit || 3,
          usage_period_end: null, // Free plan doesn't reset
          period_expired: false
        }
      })
    }

    // Check if usage period has expired (weekly reset)
    const now = new Date()
    const periodEnd = new Date(subscription.usage_period_end)
    
    if (now > periodEnd) {
      // Usage period expired, return reset values
      const { data: planLimits } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('stripe_price_id', subscription.plan_id)
        .single()

      return NextResponse.json({
        success: true,
        usage: {
          plan_tier: planLimits?.plan_tier || subscription.plan_tier || 'unknown',
          copilot_use_used: 0,
          copilot_use_limit: planLimits?.copilot_use_limit || getCopilotUseLimits(planLimits?.plan_tier),
          interview_sessions_used: 0,
          interview_sessions_limit: planLimits?.interview_sessions_limit || 0,
          usage_period_end: subscription.usage_period_end,
          period_expired: true
        }
      })
    }

    // Get plan info
    const { data: planLimits } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('stripe_price_id', subscription.plan_id)
      .single()

    return NextResponse.json({
      success: true,
      usage: {
        plan_tier: planLimits?.plan_tier || subscription.plan_tier || 'unknown',
        copilot_use_used: subscription.copilot_use_used || 0,
        copilot_use_limit: subscription.copilot_use_limit || getCopilotUseLimits(planLimits?.plan_tier),
        interview_sessions_used: subscription.interview_sessions_used || 0,
        interview_sessions_limit: subscription.interview_sessions_limit || 0,
        usage_period_end: subscription.usage_period_end,
        period_expired: false
      }
    })

  } catch (error) {
    console.error('Usage check error:', error)
    return NextResponse.json(
      { error: 'Failed to check usage' },
      { status: 500 }
    )
  }
}