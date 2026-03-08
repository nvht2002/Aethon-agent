/**
 * AETHON API Keys Management
 * 
 * REST API for managing API keys for external integrations.
 * Supports CRUD operations with proper authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  generateApiKey, 
  hashApiKey, 
  validateApiKeyFormat,
  type ApiKeyPermission,
  type CreateApiKeyRequest,
  type ApiKeyResponse,
  type ApiKeyWithSecret
} from '@/lib/api/keys';

// In-memory store (replace with Supabase in production)
interface StoredKey extends ApiKeyResponse {
  key: string; // Hashed key for storage
  secret?: string; // Only set when created
}

const apiKeysStore = new Map<string, StoredKey>();

/**
 * GET /api/keys - List all API keys for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // In production: Get userId from Clerk auth
    // const { userId } = auth();
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
    // Filter keys by user
    const userKeys: ApiKeyResponse[] = [];
    for (const [id, key] of apiKeysStore.entries()) {
      if (key.id.startsWith(userId)) {
        // Don't return secret
        const { secret, ...keyWithoutSecret } = key;
        userKeys.push(keyWithoutSecret);
      }
    }
    
    return NextResponse.json({
      success: true,
      keys: userKeys,
      count: userKeys.length
    });
  } catch (error) {
    console.error('[API Keys] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/keys - Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateApiKeyRequest;
    
    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'API key name is required' },
        { status: 400 }
      );
    }
    
    if (!body.permissions || body.permissions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one permission is required' },
        { status: 400 }
      );
    }
    
    // Validate permissions
    const validPermissions: ApiKeyPermission[] = [
      'chat:send', 'chat:stream', 'agents:read', 'agents:write',
      'tasks:read', 'tasks:write', 'webhooks:read', 'webhooks:write',
      'memory:read', 'memory:write', 'admin'
    ];
    
    const invalidPerms = body.permissions.filter(p => !validPermissions.includes(p));
    if (invalidPerms.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid permissions: ${invalidPerms.join(', ')}` },
        { status: 400 }
      );
    }
    
    // In production: Get userId from Clerk auth
    const userId = request.headers.get('x-user-id') || 'demo-user';
    
    // Check key limit
    let userKeyCount = 0;
    for (const [, key] of apiKeysStore.entries()) {
      if (key.id.startsWith(userId)) {
        userKeyCount++;
      }
    }
    
    if (userKeyCount >= 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum API keys limit (10) reached' },
        { status: 429 }
      );
    }
    
    // Generate the key
    const { secret, hash, prefix } = generateApiKey();
    const keyId = `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Calculate expiration if provided
    let expiresAt: Date | undefined;
    if (body.expiresInDays && body.expiresInDays > 0) {
      expiresAt = new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000);
    }
    
    const newKey: ApiKeyResponse & { secret: string } = {
      id: keyId,
      name: body.name.trim(),
      prefix,
      permissions: body.permissions,
      rateLimit: body.rateLimit || 60,
      expiresAt: expiresAt?.toISOString(),
      createdAt: new Date().toISOString(),
      usageCount: 0,
      isActive: true,
      secret // Only returned once!
    };
    
    // Store the key (hash for security in production)
    apiKeysStore.set(keyId, {
      ...newKey,
      key: hash // In production, store only the hash
    });
    
    // Return the key with secret (only once)
    return NextResponse.json({
      success: true,
      key: newKey,
      message: 'Store this secret securely - it will not be shown again'
    });
  } catch (error) {
    console.error('[API Keys] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/keys - Delete an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');
    
    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'API key ID is required' },
        { status: 400 }
      );
    }
    
    // In production: Verify key belongs to user
    const existingKey = apiKeysStore.get(keyId);
    if (!existingKey) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      );
    }
    
    // Soft delete (deactivate)
    apiKeysStore.set(keyId, {
      ...existingKey,
      isActive: false,
      expiresAt: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    console.error('[API Keys] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
