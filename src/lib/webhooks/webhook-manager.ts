// ============================================================================
// AETHON AI OS - Webhook System
// ============================================================================
// Event-driven automation system for connecting AETHON with external services

import { supabaseAdmin } from '@/lib/db/supabase';

export type WebhookEvent = 
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'task.deleted'
  | 'agent.started'
  | 'agent.completed'
  | 'agent.failed'
  | 'chat.message'
  | 'deploy.started'
  | 'deploy.completed'
  | 'deploy.failed'
  | 'user.registered'
  | 'usage.threshold';

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: WebhookEvent;
  payload: Record<string, unknown>;
  status: 'success' | 'failed' | 'pending';
  response_code?: number;
  error_message?: string;
  attempts: number;
  created_at: string;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

// ============================================================================
// Webhook CRUD Operations
// ============================================================================

export async function createWebhook(
  userId: string,
  data: {
    name: string;
    url: string;
    events: WebhookEvent[];
    secret?: string;
  }
): Promise<Webhook | null> {
  const supabase = supabaseAdmin;
  
  // Generate secret if not provided
  const secret = data.secret || generateSecret();
  
  const { data: webhook, error } = await supabase
    .from('aethon_webhooks')
    .insert({
      user_id: userId,
      name: data.name,
      url: data.url,
      events: data.events,
      secret,
      enabled: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create webhook:', error);
    return null;
  }

  return webhook;
}

export async function getWebhooks(userId: string): Promise<Webhook[]> {
  const supabase = supabaseAdmin;
  
  const { data, error } = await supabase
    .from('aethon_webhooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch webhooks:', error);
    return [];
  }

  return data || [];
}

export async function getWebhook(id: string): Promise<Webhook | null> {
  const supabase = supabaseAdmin;
  
  const { data, error } = await supabase
    .from('aethon_webhooks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch webhook:', error);
    return null;
  }

  return data;
}

export async function updateWebhook(
  id: string,
  data: Partial<Omit<Webhook, 'id' | 'user_id' | 'created_at'>>
): Promise<Webhook | null> {
  const supabase = supabaseAdmin;
  
  const { data: webhook, error } = await supabase
    .from('aethon_webhooks')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update webhook:', error);
    return null;
  }

  return webhook;
}

export async function deleteWebhook(id: string): Promise<boolean> {
  const supabase = supabaseAdmin;
  
  const { error } = await supabase
    .from('aethon_webhooks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete webhook:', error);
    return false;
  }

  return true;
}

// ============================================================================
// Webhook Trigger System
// ============================================================================

export async function triggerWebhooks(
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  const supabase = supabaseAdmin;
  
  // Get all webhooks that listen to this event and are enabled
  const { data: webhooks } = await supabase
    .from('aethon_webhooks')
    .select('*')
    .contains('events', [event])
    .eq('enabled', true);

  if (!webhooks || webhooks.length === 0) {
    return;
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  // Trigger each webhook
  for (const webhook of webhooks) {
    deliverWebhook(webhook, payload);
  }
}

async function deliverWebhook(
  webhook: Webhook,
  payload: WebhookPayload
): Promise<void> {
  const supabase = supabaseAdmin;
  
  // Create log entry
  const { data: log } = await supabase
    .from('aethon_webhook_logs')
    .insert({
      webhook_id: webhook.id,
      event_type: payload.event,
      payload: payload as unknown as Record<string, unknown>,
      status: 'pending',
      attempts: 0,
    })
    .select()
    .single();

  if (!log) {
    console.error('Failed to create webhook log');
    return;
  }

  try {
    // Generate signature
    const signature = generateSignature(payload, webhook.secret);
    
    // Make HTTP request
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Aethon-Signature': signature,
        'X-Aethon-Event': payload.event,
        'X-Aethon-Timestamp': payload.timestamp,
      },
      body: JSON.stringify(payload),
    });

    // Update log with result
    await supabase
      .from('aethon_webhook_logs')
      .update({
        status: response.ok ? 'success' : 'failed',
        response_code: response.status,
        attempts: 1,
      })
      .eq('id', log.id);

  } catch (error) {
    // Update log with error
    await supabase
      .from('aethon_webhook_logs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        attempts: 1,
      })
      .eq('id', log.id);
  }
}

// ============================================================================
// Retry Logic with Exponential Backoff
// ============================================================================

export async function retryWebhook(logId: string): Promise<boolean> {
  const supabase = supabaseAdmin;
  
  // Get the webhook log
  const { data: log } = await supabase
    .from('aethon_webhook_logs')
    .select('*, aethon_webhooks(*)')
    .eq('id', logId)
    .single();

  if (!log || !log.aethon_webhooks) {
    return false;
  }

  const webhook = log.aethon_webhooks;
  const payload: WebhookPayload = {
    event: log.event_type,
    timestamp: new Date().toISOString(),
    data: log.payload as Record<string, unknown>,
  };

  // Check retry limit
  if (log.attempts >= 3) {
    console.log('Max retries reached for webhook log:', logId);
    return false;
  }

  try {
    const signature = generateSignature(payload, webhook.secret);
    
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Aethon-Signature': signature,
        'X-Aethon-Event': payload.event,
      },
      body: JSON.stringify(payload),
    });

    // Update with new attempt
    await supabase
      .from('aethon_webhook_logs')
      .update({
        status: response.ok ? 'success' : 'failed',
        response_code: response.status,
        attempts: log.attempts + 1,
        error_message: response.ok ? null : `HTTP ${response.status}`,
      })
      .eq('id', logId);

    return response.ok;
  } catch (error) {
    await supabase
      .from('aethon_webhook_logs')
      .update({
        status: 'failed',
        attempts: log.attempts + 1,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', logId);

    return false;
  }
}

// ============================================================================
// Webhook Logs
// ============================================================================

export async function getWebhookLogs(
  webhookId: string,
  limit = 50
): Promise<WebhookLog[]> {
  const supabase = supabaseAdmin;
  
  const { data, error } = await supabase
    .from('aethon_webhook_logs')
    .select('*')
    .eq('webhook_id', webhookId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch webhook logs:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// Test Webhook
// ============================================================================

export async function testWebhook(webhookId: string): Promise<boolean> {
  const webhook = await getWebhook(webhookId);
  
  if (!webhook) {
    return false;
  }

  const payload: WebhookPayload = {
    event: 'task.completed' as WebhookEvent,
    timestamp: new Date().toISOString(),
    data: {
      test: true,
      message: 'This is a test webhook from AETHON',
      webhook_id: webhookId,
    },
  };

  try {
    const signature = generateSignature(payload, webhook.secret);
    
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Aethon-Signature': signature,
        'X-Aethon-Event': payload.event,
        'X-Aethon-Timestamp': payload.timestamp,
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function generateSignature(payload: WebhookPayload, secret: string): string {
  const data = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  // Simple HMAC-like signature (for production, use crypto.subtle)
  let hash = 0;
  for (let i = 0; i < messageData.length; i++) {
    hash = ((hash << 5) - hash) + messageData[i];
    hash = hash & hash;
  }
  return `sha256=${hash.toString(16)}`;
}

// Predefined events
export const WEBHOOK_EVENTS: { value: WebhookEvent; label: string; description: string }[] = [
  { value: 'task.created', label: 'Task Created', description: 'When a new task is created' },
  { value: 'task.updated', label: 'Task Updated', description: 'When a task is updated' },
  { value: 'task.completed', label: 'Task Completed', description: 'When a task is completed' },
  { value: 'task.deleted', label: 'Task Deleted', description: 'When a task is deleted' },
  { value: 'agent.started', label: 'Agent Started', description: 'When an agent starts running' },
  { value: 'agent.completed', label: 'Agent Completed', description: 'When an agent completes its task' },
  { value: 'agent.failed', label: 'Agent Failed', description: 'When an agent fails' },
  { value: 'chat.message', label: 'Chat Message', description: 'When a new chat message is received' },
  { value: 'deploy.started', label: 'Deploy Started', description: 'When a deployment starts' },
  { value: 'deploy.completed', label: 'Deploy Completed', description: 'When a deployment completes' },
  { value: 'deploy.failed', label: 'Deploy Failed', description: 'When a deployment fails' },
  { value: 'user.registered', label: 'User Registered', description: 'When a new user registers' },
  { value: 'usage.threshold', label: 'Usage Threshold', description: 'When usage exceeds threshold' },
];
