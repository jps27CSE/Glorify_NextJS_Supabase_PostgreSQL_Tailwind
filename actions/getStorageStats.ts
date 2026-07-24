import { createClient } from "@supabase/supabase-js";

export interface StorageStats {
  used: number;
  limit: number | null;
  remaining: number | null;
  percentage: number | null;
}

const getStorageStats = async (): Promise<StorageStats> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

  let totalUsed = 0;

  for (const bucket of ["songs", "images"]) {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list("", { limit: 1000 });

    if (!error && files) {
      for (const f of files) {
        const size = f.metadata?.size ?? f.metadata?.contentLength ?? 0;
        totalUsed += typeof size === "number" ? size : parseInt(String(size), 10) || 0;
      }
    } else if (error) {
      console.error(`Error listing ${bucket}:`, error.message);
    }
  }

  const envLimit = process.env.NEXT_PUBLIC_STORAGE_LIMIT_BYTES
    ? Number(process.env.NEXT_PUBLIC_STORAGE_LIMIT_BYTES)
    : null;

  return {
    used: totalUsed,
    limit: envLimit,
    remaining: envLimit !== null ? Math.max(0, envLimit - totalUsed) : null,
    percentage:
      envLimit !== null
        ? Math.min(100, Math.round((totalUsed / envLimit) * 100))
        : null,
  };
};

export default getStorageStats;