import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore,
  });

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user || user.email !== "admin@glorify.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

  let totalUsed = 0;

  for (const bucket of ["songs", "images"]) {
    const { data: files, error } = await adminClient.storage
      .from(bucket)
      .list("", { limit: 1000 });

    if (!error && files) {
      for (const f of files) {
        const size = f.metadata?.size ?? f.metadata?.contentLength ?? 0;
        totalUsed += typeof size === "number" ? size : parseInt(String(size), 10) || 0;
      }
    }
  }

  const envLimit = process.env.NEXT_PUBLIC_STORAGE_LIMIT_BYTES
    ? Number(process.env.NEXT_PUBLIC_STORAGE_LIMIT_BYTES)
    : null;

  return NextResponse.json({
    used: totalUsed,
    limit: envLimit,
    remaining: envLimit !== null ? Math.max(0, envLimit - totalUsed) : null,
    percentage:
      envLimit !== null
        ? Math.min(100, Math.round((totalUsed / envLimit) * 100))
        : null,
  });
}