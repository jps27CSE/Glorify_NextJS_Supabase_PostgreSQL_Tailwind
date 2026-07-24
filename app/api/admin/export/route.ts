import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import archiver from "archiver";

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

  const tables = [
    "songs",
    "users",
    "liked_songs",
    "customers",
    "subscriptions",
    "prices",
    "products",
  ];

  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `glorify-backup-${dateStr}.zip`;

  const stream = new ReadableStream({
    async start(controller) {
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.on("data", (chunk: Buffer) => {
        controller.enqueue(chunk);
      });

      archive.on("end", () => {
        controller.close();
      });

      archive.on("warning", () => {});

      archive.on("error", (err: Error) => {
        controller.error(err);
      });

      try {
        for (const table of tables) {
          const { data, error } = await adminClient
            .from(table)
            .select("*");

          if (!error && data) {
            archive.append(JSON.stringify(data, null, 2), {
              name: `database/${table}.json`,
            });
          }
        }

        for (const bucket of ["songs", "images"]) {
          let offset = 0;
          const limit = 100;
          let hasMore = true;

          while (hasMore) {
            const { data: files, error } = await adminClient.storage
              .from(bucket)
              .list("", { limit, offset });

            if (error || !files) break;

            if (files.length < limit) hasMore = false;
            offset += files.length;

            for (const file of files) {
              if (file.id === null) continue;

              const { data: blob, error: dlError } =
                await adminClient.storage
                  .from(bucket)
                  .download(file.name);

              if (!dlError && blob) {
                const buffer = Buffer.from(await blob.arrayBuffer());
                archive.append(buffer, {
                  name: `storage/${bucket}/${file.name}`,
                });
              }
            }
          }
        }

        const instructions = `Glorify Backup - ${dateStr}
=====================================

This ZIP contains a full snapshot of your Glorify platform.

STRUCTURE:
  database/   - All database tables as JSON files
  storage/    - All uploaded audio (songs/) and image (images/) files

RESTORE INSTRUCTIONS:

1. Upload storage files:
   - Go to your Supabase project Storage dashboard
   - Upload files from storage/songs/ to the "songs" bucket
   - Upload files from storage/images/ to the "images" bucket

2. Import database tables:
   - Go to Supabase SQL Editor
   - For each JSON file in database/, use the Supabase dashboard
     or API to re-insert the records
   - Note: songs.song_path and songs.image_path reference the
     storage file paths (e.g. "song-title-abc123.mp3")

3. Import users:
   - Users must exist before restoring liked_songs (foreign key)
   - Import order: users -> songs -> liked_songs -> customers
                  -> prices -> products -> subscriptions
`;

        archive.append(instructions, {
          name: "import-instructions.txt",
        });
      } catch (err) {
        controller.error(err);
        return;
      }

      archive.finalize();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-cache",
    },
  });
}
