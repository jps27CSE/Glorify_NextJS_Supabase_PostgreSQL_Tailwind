import { Artist } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

const excluded = ["una sarker", "george sarker", "sethi"];

const getLocalImagePath = (name: string): string | null => {
  const normalized = name.toLowerCase().replace(/\s+/g, "_");
  const extensions = [".jpg", ".jpeg", ".png", ".webp"];
  for (const ext of extensions) {
    const filePath = path.join(process.cwd(), "public", "images", `${normalized}${ext}`);
    if (fs.existsSync(filePath)) {
      return `/images/${normalized}${ext}`;
    }
  }
  return null;
};

const getArtists = async (): Promise<Artist[]> => {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const { data, error } = await supabase
    .from("songs")
    .select("author, image_path, created_at")
    .not("author", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error.message);
    return [];
  }

  const artistMap = new Map<string, { preferredName: string; image_path: string | null; songCount: number }>();

  for (const song of data) {
    const authors = (song as any).author?.split("|").map((a: string) => a.trim()).filter(Boolean) || [];
    if (authors.length === 0) continue;

    for (const author of authors) {
      const key = author.toLowerCase();
      if (excluded.includes(key)) continue;
      if (!artistMap.has(key)) {
        artistMap.set(key, {
          preferredName: author,
          image_path: (song as any).image_path,
          songCount: 0,
        });
      }
      artistMap.get(key)!.songCount++;
    }
  }

  return Array.from(artistMap.entries())
    .map(([, info]) => ({
      name: info.preferredName,
      image_path: info.image_path,
      localImagePath: getLocalImagePath(info.preferredName),
      songCount: info.songCount,
    }))
    .sort((a, b) => b.songCount - a.songCount);
};

export default getArtists;
