// ============================================================================
// AETHON AI OS - Billing & Subscription System
// ============================================================================
// Usage tracking, quota management, and Stripe integration

import { supabaseAdmin } from '@/lib/db/supabase';

export type Plan = 'free' | 'pro' | 'team' | 'enterprise';

export interface PlanDetails {
  name: string;
  price: number;
  features: string[];
  limits: {
    messagesPerMonth: number;
    agents: number;
    projects: number;
    storage: number; // in MB
    apiCalls: number;
    teamMembers: number;
  };
}

export const PLANS: Record<Plan, PlanDetails> = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Basic AI Chat',
      '1 Agent',
      '3 Projects',
      '100 messages/month',
      'Community Support',
    ],
    limits: {
      messagesPerMonth: 100,
      agents: 1,
      projects: 3,
      storage: 100,
      apiCalls: 100,
      teamMembers: 1,
    },
  },
  pro: {
    name: 'Pro',
    price: 29,
    features: [
      'Advanced AI Chat',
      '10 Agents',
      'Unlimited Projects',
      '5,000 messages/month',
      'Priority Support',
      'Custom Tools',
      'API Access',
    ],
    limits: {
      messagesPerMonth: 5000,
      agents: 10,
      projects: -1, // unlimited
      storage: 1000,
      apiCalls: 5000,
      teamMembers: 3,
    },
  },
  team: {
    name: 'Team',
    price: 99,
    features: [
      'Everything in Pro',
      '50 Agents',
      'Unlimited Messages',
      'Team Collaboration',
      'Custom Branding',
      'Advanced Analytics',
      'Webhook Integrations',
      'SSO Authentication',
    ],
    limits: {
      messagesPerMonth: -1, // unlimited
      agents: 50,
      projects: -1,
      storage: 10000,
      apiCalls: -1,
      teamMembers: 50,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: -1, // custom
    features: [
      'Everything in Team',
      'Unlimited Agents',
      'Dedicated Support',
      'Custom Integrations',
      'SLA Guarantee',
      'On-premise Option',
      'Audit Logs',
      'Compliance Reports',
    ],
    limits: {
      messagesPerMonth: -1,
      agents: -1,
      projects: -1,
      storage: -1,
      apiCalls: -1,
      teamMembers: -1,
    },
  },
};

// ============================================================================
// Usage Tracking
// ============================================================================

export async function trackUsage(
  userId: string,
  resourceType: 'messages' | 'api_calls' | 'storage' | 'agents' | 'projects',
  count: number = 1
): Promise<boolean> {
  const supabase = supabaseAdmin;
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Check current usage
  const { data: usage } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('resource_type', resourceType)
    .gte('period_start', periodStart.toISOString())
    .lte('period_end', periodEnd.toISOString())
    .single();

  if (usage) {
    // Update existing usage
    const { error } = await supabase
      .from('user_usage')
      .update({ count: usage.count + count })
      .eq('id', usage.id);

    return !error;
  } else {
    // Create new usage record
    const { error } = await supabase
      .from('user_usage')
      .insert({
        user_id: userId,
        resource_type: resourceType,
        count,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
      });

    return !error;
  }
}

export async function getUsage(
  userId: string,
  resourceType: 'messages' | 'api_calls' | 'storage' | 'agents' | 'projects'
): Promise<{ current: number; limit: number; remaining: number }> {
  const supabase = supabaseAdmin;
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Get user plan
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('user_id', userId)
    .single();

  const plan = (profile?.plan as Plan) || 'free';
  const planDetails = PLANS[plan];

  // Get current usage
  const { data: usage } = await supabase
    .from('user_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('resource_type', resourceType)
    .gte('period_start', periodStart.toISOString())
    .lte('period_end', periodEnd.toISOString())
    .single();

  const current = usage?.count || 0;
  const limit = getLimitForResource(planDetails, resourceType);
  const remaining = limit === -1 ? -1 : Math.max(0, limit - current);

  return { current, limit, remaining };
}

function getLimitForResource(
  plan: PlanDetails,
  resourceType: 'messages' | 'api_calls' | 'storage' | 'agents' | 'projects'
): number {
  switch (resourceType) {
    case 'messages':
      return plan.limits.messagesPerMonth;
    case 'api_calls':
      return plan.limits.apiCalls;
    case 'storage':
      return plan.limits.storage;
    case 'agents':
      return plan.limits.agents;
    case 'projects':
      return plan.limits.projects;
    default:
      return -1;
  }
}

// ============================================================================
// Quota Checking
// ============================================================================

export async function checkQuota(
  userId: string,
  resourceType: 'messages' | 'api_calls' | 'storage' | 'agents' | 'projects'
): Promise<{ allowed: boolean; reason?: string }> {
  const { remaining, limit } = await getUsage(userId, resourceType);

  if (limit === -1) {
    return { allowed: true }; // Unlimited
  }

  if (remaining <= 0) {
    const planName = PLANS[(await getUserPlan(userId)) || 'free'].name;
    return {
      allowed: false,
      reason: `You've reached your ${resourceType} limit for the ${planName} plan. Upgrade to continue.`,
    };
  }

  return { allowed: true };
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const supabase = supabaseAdmin;
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('user_id', userId)
    .single();

  return (profile?.plan as Plan) || 'free';
}

// ============================================================================
// Usage Analytics
// ============================================================================

export interface UsageStats {
  totalMessages: number;
  totalApiCalls: number;
  totalStorage: number;
  activeAgents: number;
  projectsCount: number;
}

export async function getUsageStats(userId: string): Promise<UsageStats> {
  const supabase = supabaseAdmin;
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Get all usage for current period
  const { data: usage } = await supabase
    .from('user_usage')
    .select('resource_type, count')
    .eq('user_id', userId)
    .gte('period_start', periodStart.toISOString())
    .lte('period_end', periodEnd.toISOString());

  const stats: UsageStats = {
    totalMessages: 0,
    totalApiCalls: 0,
    totalStorage: 0,
    activeAgents: 0,
    projectsCount: 0,
  };

  usage?.forEach((u) => {
    switch (u.resource_type) {
      case 'messages':
        stats.totalMessages = u.count;
        break;
      case 'api_calls':
        stats.totalApiCalls = u.count;
        break;
      case 'storage':
        stats.totalStorage = u.count;
        break;
    }
  });

  // Get agent count
  const { count: agentCount } = await supabase
    .from('aethon_agents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  stats.activeAgents = agentCount || 0;

  // Get project count
  const { count: projectCount } = await supabase
    .from('aethon_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id, status', { user_id: userId, status: 'active' });
  stats.projectsCount = projectCount || 0;

  return stats;
}

// ============================================================================
// Stripe Integration (Placeholder)
// ============================================================================

export async function createCheckoutSession(
  userId: string,
  plan: Plan
): Promise<string | null> {
  // This would integrate with Stripe
  // For now, return a placeholder
  console.log(`Creating checkout session for user ${userId} with plan ${plan}`);
  return null;
}

export async function getSubscriptionStatus(
  userId: string
): Promise<{ plan: Plan; status: string; currentPeriodEnd: Date | null }> {
  const plan = await getUserPlan(userId);
  
  return {
    plan,
    status: 'active',
    currentPeriodEnd: null,
  };
}
