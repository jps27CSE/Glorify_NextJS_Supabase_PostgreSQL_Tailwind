import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BackupClient from "./BackupClient";
import getStorageStats from "@/actions/getStorageStats";

export const revalidate = 0;

const BackupPage = async () => {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) redirect("/admin/login");
  if (user.email !== "admin@glorify.com") redirect("/");

  const storageStats = await getStorageStats();

  const { count: songCount } = await supabase
    .from("songs")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { count: likeCount } = await supabase
    .from("liked_songs")
    .select("*", { count: "exact", head: true });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Backup</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Download a complete snapshot of your platform for migration or safekeeping
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-3xl font-bold text-white">{songCount ?? 0}</p>
          <p className="text-sm text-neutral-500 mt-1">Songs</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-3xl font-bold text-white">{userCount ?? 0}</p>
          <p className="text-sm text-neutral-500 mt-1">Users</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-3xl font-bold text-white">{likeCount ?? 0}</p>
          <p className="text-sm text-neutral-500 mt-1">Liked Songs</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">
          Full Platform Backup
        </h2>
        <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
          This will generate a ZIP file containing all database records
          (songs, users, likes, subscriptions, etc.) and all uploaded files
          (audio + thumbnails). Use this to migrate to a new project or
          keep a safe copy of everything.
        </p>

        <div className="bg-neutral-800/50 rounded-lg p-4 mb-6 text-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span>Database tables</span>
            <span className="text-white font-mono">7 tables</span>
          </div>
          <div className="flex items-center justify-between text-neutral-400">
            <span>Storage buckets</span>
            <span className="text-white font-mono">2 buckets</span>
          </div>
          <div className="flex items-center justify-between text-neutral-400">
            <span>Storage used</span>
            <span className="text-white font-mono">
              {storageStats.used > 0
                ? `${(storageStats.used / 1024 / 1024).toFixed(1)} MB`
                : "calculating..."}
            </span>
          </div>
          <div className="border-t border-neutral-700 pt-2 flex items-center justify-between text-neutral-400">
            <span>Estimated export size</span>
            <span className="text-neutral-300 font-mono">
              {storageStats.used > 0
                ? `${(storageStats.used / 1024 / 1024).toFixed(1)} MB`
                : "calculating..."}
            </span>
          </div>
        </div>

        <BackupClient />
      </div>
    </div>
  );
};

export default BackupPage;
