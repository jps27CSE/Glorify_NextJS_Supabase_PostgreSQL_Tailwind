import { createClient } from "@supabase/supabase-js";

const getSongFileSizes = async (): Promise<Record<string, number>> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

  const sizes: Record<string, number> = {};

  for (const bucket of ["songs", "images"]) {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list("", { limit: 1000 });

    if (!error && files) {
      for (const f of files) {
        const size = f.metadata?.size ?? f.metadata?.contentLength ?? 0;
        sizes[`${bucket}/${f.name}`] =
          typeof size === "number" ? size : parseInt(String(size), 10) || 0;
      }
    }
  }

  return sizes;
};

export default getSongFileSizes;