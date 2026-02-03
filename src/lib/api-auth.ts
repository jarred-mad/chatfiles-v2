import { NextRequest, NextResponse } from 'next/server';

export type ApiTier = 'free' | 'pro' | 'institutional';

export interface ApiKeyData {
  key: string;
  tier: ApiTier;
  userId: string;
  email: string;
  dailyLimit: number;
  dailyUsage: number;
  createdAt: Date;
  expiresAt: Date | null;
}

// Rate limits by tier
export const RATE_LIMITS: Record<ApiTier, { daily: number; perMinute: number }> = {
  free: { daily: 100, perMinute: 10 },
  pro: { daily: 1000, perMinute: 60 },
  institutional: { daily: -1, perMinute: 300 }, // -1 = unlimited
};

// In-memory rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Validate API key and check rate limits
 */
export async function validateApiKey(
  request: NextRequest
): Promise<{ valid: boolean; data?: ApiKeyData; error?: string }> {
  const apiKey = request.headers.get('X-API-Key');

  // No API key = free tier (very limited)
  if (!apiKey) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const limited = checkRateLimit(`free:${ip}`, RATE_LIMITS.free);
    if (!limited.allowed) {
      return { valid: false, error: 'Rate limit exceeded. Get an API key for higher limits.' };
    }
    return {
      valid: true,
      data: {
        key: '',
        tier: 'free',
        userId: ip,
        email: '',
        dailyLimit: RATE_LIMITS.free.daily,
        dailyUsage: limited.count,
        createdAt: new Date(),
        expiresAt: null,
      },
    };
  }

  // Validate API key format
  if (!apiKey.startsWith('cf_') || apiKey.length !== 35) {
    return { valid: false, error: 'Invalid API key format' };
  }

  // In production, look up key in database
  // For now, mock validation
  const mockKeyData = getMockApiKey(apiKey);
  if (!mockKeyData) {
    return { valid: false, error: 'Invalid API key' };
  }

  // Check expiration
  if (mockKeyData.expiresAt && mockKeyData.expiresAt < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  // Check rate limits
  const limits = RATE_LIMITS[mockKeyData.tier];
  const limited = checkRateLimit(`${mockKeyData.tier}:${mockKeyData.userId}`, limits);

  if (!limited.allowed) {
    return {
      valid: false,
      error: `Rate limit exceeded. ${mockKeyData.tier} tier allows ${limits.daily} requests/day.`,
    };
  }

  return {
    valid: true,
    data: {
      ...mockKeyData,
      dailyUsage: limited.count,
    },
  };
}

/**
 * Simple in-memory rate limiting
 */
function checkRateLimit(
  key: string,
  limits: { daily: number; perMinute: number }
): { allowed: boolean; count: number } {
  const dayStart = new Date().setHours(0, 0, 0, 0);

  const existing = rateLimitStore.get(key);

  // Reset if new day
  if (!existing || existing.resetAt < dayStart) {
    rateLimitStore.set(key, { count: 1, resetAt: dayStart + 86400000 });
    return { allowed: true, count: 1 };
  }

  // Check if under limit (-1 = unlimited)
  if (limits.daily === -1 || existing.count < limits.daily) {
    existing.count++;
    return { allowed: true, count: existing.count };
  }

  return { allowed: false, count: existing.count };
}

/**
 * Mock API key lookup (replace with database in production)
 */
function getMockApiKey(key: string): ApiKeyData | null {
  // Demo keys for testing
  const mockKeys: Record<string, ApiKeyData> = {
    'cf_test_pro_key_1234567890abcdefgh': {
      key: 'cf_test_pro_key_1234567890abcdefgh',
      tier: 'pro',
      userId: 'user_123',
      email: 'pro@example.com',
      dailyLimit: 1000,
      dailyUsage: 0,
      createdAt: new Date('2024-01-01'),
      expiresAt: new Date('2025-01-01'),
    },
    'cf_test_inst_key_1234567890abcdefg': {
      key: 'cf_test_inst_key_1234567890abcdefg',
      tier: 'institutional',
      userId: 'org_456',
      email: 'research@university.edu',
      dailyLimit: -1,
      dailyUsage: 0,
      createdAt: new Date('2024-01-01'),
      expiresAt: null,
    },
  };

  return mockKeys[key] || null;
}

/**
 * Generate a new API key
 */
export function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'cf_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * Middleware wrapper for API routes requiring authentication
 */
export function withApiAuth(
  handler: (
    request: NextRequest,
    context: { apiKey: ApiKeyData }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const auth = await validateApiKey(request);

    if (!auth.valid || !auth.data) {
      return NextResponse.json(
        {
          error: auth.error || 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
        {
          status: 401,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMITS.free.daily),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const response = await handler(request, { apiKey: auth.data });

    // Add rate limit headers
    const limits = RATE_LIMITS[auth.data.tier];
    response.headers.set('X-RateLimit-Limit', String(limits.daily));
    response.headers.set(
      'X-RateLimit-Remaining',
      String(Math.max(0, limits.daily - auth.data.dailyUsage))
    );
    response.headers.set('X-API-Tier', auth.data.tier);

    return response;
  };
}
