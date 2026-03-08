// ============================================================================
// AETHON AI OS - Notification System
// ============================================================================
// Real-time notifications for events, alerts, and updates

import { supabaseAdmin } from '@/lib/db/supabase';

export type NotificationType = 
  | 'task_completed'
  | 'task_failed'
  | 'agent_completed'
  | 'agent_failed'
  | 'deploy_completed'
  | 'deploy_failed'
  | 'usage_alert'
  | 'security_alert'
  | 'team_invite'
  | 'system_announcement';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  slack: boolean;
  discord: boolean;
  types: Record<NotificationType, boolean>;
}

// ============================================================================
// Create Notification
// ============================================================================

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<Notification | null> {
  const supabase = supabaseAdmin;

  const { data: notification, error } = await supabase
    .from('aethon_notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data: data || {},
      read: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create notification:', error);
    return null;
  }

  return notification;
}

// ============================================================================
// Get Notifications
// ============================================================================

export async function getNotifications(
  userId: string,
  limit = 20,
  includeRead = false
): Promise<Notification[]> {
  const supabase = supabaseAdmin;

  let query = supabase
    .from('aethon_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!includeRead) {
    query = query.eq('read', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }

  return data || [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = supabaseAdmin;

  const { count, error } = await supabase
    .from('aethon_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  return error ? 0 : (count || 0);
}

// ============================================================================
// Mark as Read
// ============================================================================

export async function markAsRead(notificationId: string): Promise<boolean> {
  const supabase = supabaseAdmin;

  const { error } = await supabase
    .from('aethon_notifications')
    .update({ read: true })
    .eq('id', notificationId);

  return !error;
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  const supabase = supabaseAdmin;

  const { error } = await supabase
    .from('aethon_notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  return !error;
}

// ============================================================================
// Delete Notification
// ============================================================================

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const supabase = supabaseAdmin;

  const { error } = await supabase
    .from('aethon_notifications')
    .delete()
    .eq('id', notificationId);

  return !error;
}

export async function clearOldNotifications(userId: string, daysOld = 30): Promise<boolean> {
  const supabase = supabaseAdmin;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { error } = await supabase
    .from('aethon_notifications')
    .delete()
    .eq('user_id', userId)
    .eq('read', true)
    .lt('created_at', cutoffDate.toISOString());

  return !error;
}

// ============================================================================
// Notification Templates
// ============================================================================

export async function notifyTaskCompleted(
  userId: string,
  taskName: string,
  taskId: string
): Promise<void> {
  await createNotification(
    userId,
    'task_completed',
    'Task Completed',
    `Your task "${taskName}" has been completed.`,
    { taskId, taskName }
  );
}

export async function notifyTaskFailed(
  userId: string,
  taskName: string,
  taskId: string,
  error?: string
): Promise<void> {
  await createNotification(
    userId,
    'task_failed',
    'Task Failed',
    `Your task "${taskName}" has failed${error ? `: ${error}` : '.'}`,
    { taskId, taskName, error }
  );
}

export async function notifyAgentCompleted(
  userId: string,
  agentName: string,
  agentId: string,
  result?: string
): Promise<void> {
  await createNotification(
    userId,
    'agent_completed',
    'Agent Completed',
    `Agent "${agentName}" has finished its task${result ? `: ${result}` : '.'}`,
    { agentId, agentName, result }
  );
}

export async function notifyDeployCompleted(
  userId: string,
  projectName: string,
  deployId: string,
  url?: string
): Promise<void> {
  await createNotification(
    userId,
    'deploy_completed',
    'Deployment Complete',
    `Your project "${projectName}" has been deployed${url ? ` to ${url}` : '.'}.`,
    { deployId, projectName, url }
  );
}

export async function notifyUsageAlert(
  userId: string,
  resourceType: string,
  percentage: number,
  current: number,
  limit: number
): Promise<void> {
  await createNotification(
    userId,
    'usage_alert',
    'Usage Alert',
    `You've used ${percentage}% of your ${resourceType} limit (${current}/${limit}).`,
    { resourceType, percentage, current, limit }
  );
}

export async function notifySecurityAlert(
  userId: string,
  alertType: string,
  description: string,
  details?: Record<string, unknown>
): Promise<void> {
  await createNotification(
    userId,
    'security_alert',
    `Security Alert: ${alertType}`,
    description,
    { alertType, ...details }
  );
}

// ============================================================================
// Notification Icons (for UI)
// ============================================================================

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  task_completed: '✅',
  task_failed: '❌',
  agent_completed: '🤖',
  agent_failed: '⚠️',
  deploy_completed: '🚀',
  deploy_failed: '💥',
  usage_alert: '📊',
  security_alert: '🔒',
  team_invite: '👥',
  system_announcement: '📢',
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  task_completed: 'green',
  task_failed: 'red',
  agent_completed: 'cyan',
  agent_failed: 'orange',
  deploy_completed: 'green',
  deploy_failed: 'red',
  usage_alert: 'yellow',
  security_alert: 'red',
  team_invite: 'violet',
  system_announcement: 'blue',
};
