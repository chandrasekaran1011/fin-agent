"use client";

import useSWR from "swr";

interface DashboardResponse<T> {
  data: T;
  cachedAt: number | null;
  cacheHit: boolean;
}

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
};

export function useDashboardData<T>(endpoint: string) {
  const { data, error, isLoading, mutate } = useSWR<DashboardResponse<T>>(
    endpoint,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const refresh = async () => {
    await mutate();
  };

  return {
    data: data?.data ?? null,
    cachedAt: data?.cachedAt ?? null,
    cacheHit: data?.cacheHit ?? false,
    isLoading,
    error: error as Error | null,
    refresh,
  };
}
