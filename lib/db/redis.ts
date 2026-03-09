import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  client.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Cache key patterns
export const CACHE_KEYS = {
  dashboardAR: "dashboard:ar:summary",
  dashboardCashflow: "dashboard:cashflow:summary",
  dashboardVendor: "dashboard:vendor:summary",
  dashboardCopilot: "dashboard:copilot:stats",
  dashboardMaster: "dashboard:master:kpis",
  agentSession: (sessionId: string) => `agent:session:${sessionId}:state`,
  agentTrace: (sessionId: string) => `agent:session:${sessionId}:trace`,
} as const;

export const CACHE_TTL = {
  dashboard: 300,    // 5 minutes
  agentSession: 3600, // 1 hour
} as const;

export async function cacheGet(key: string): Promise<string | null> {
  try {
    return await redis.get(key);
  } catch {
    console.error(`[Redis] Failed to get key: ${key}`);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  try {
    await redis.set(key, value, "EX", ttlSeconds);
  } catch {
    console.error(`[Redis] Failed to set key: ${key}`);
  }
}

export async function cacheInvalidate(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    console.error(`[Redis] Failed to invalidate pattern: ${pattern}`);
  }
}
