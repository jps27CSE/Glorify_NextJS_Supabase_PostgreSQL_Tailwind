import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import getSongs from "@/actions/getSongs";
import getStorageStats from "@/actions/getStorageStats";
import { FiMusic, FiUsers, FiUserCheck, FiHardDrive } from "react-icons/fi";
import Link from "next/link";

export const revalidate = 0;

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  href: string;
  accent: string;
}

const StatCard = ({ icon, label, value, href, accent }: StatCardProps) => (
  <Link
    href={href}
    className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-all duration-200 group"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        {icon}
      </div>
    </div>
    <p className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">
      {value}
    </p>
    <p className="text-sm text-neutral-500 mt-1">{label}</p>
  </Link>
);

const OverviewPage = async () => {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) redirect("/admin/login");
  if (user.email !== "admin@glorify.com") redirect("/");

  const songs = await getSongs();
  const { count: userCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const uniqueArtists = new Set(
    songs
      .map((s) => s.author)
      .filter(Boolean)
      .flatMap((a) => a!.split("|").map((n) => n.trim()))
  );

  const totalSongs = songs.length;
  const totalUsers = userCount || 0;
  const totalArtists = uniqueArtists.size;
  const storageStats = await getStorageStats();

  const recentSongs = songs.slice(0, 5);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Welcome back, Admin. Here&apos;s what&apos;s happening.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={<FiMusic size={18} className="text-green-400" />}
          label="Total Songs"
          value={totalSongs}
          href="/admin/songs"
          accent="bg-green-500/10"
        />
        <StatCard
          icon={<FiUserCheck size={18} className="text-blue-400" />}
          label="Artists"
          value={totalArtists}
          href="/admin/songs"
          accent="bg-blue-500/10"
        />
        <StatCard
          icon={<FiUsers size={18} className="text-purple-400" />}
          label="Users"
          value={totalUsers}
          href="/admin/users"
          accent="bg-purple-500/10"
        />
        {storageStats.limit !== null ? (
          <Link
            href="/admin/songs"
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-all duration-200 group block"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FiHardDrive size={18} className="text-amber-400" />
              </div>
            </div>
            <p className="text-xl font-bold text-white leading-tight">
              {formatBytes(storageStats.remaining!)}
            </p>
            <p className="text-sm text-neutral-500 mt-1">Storage Remaining</p>
            <div className="mt-3 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  storageStats.percentage! > 80
                    ? "bg-red-500"
                    : storageStats.percentage! > 60
                    ? "bg-amber-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${storageStats.percentage}%` }}
              />
            </div>
            <p className="text-xs text-neutral-600 mt-1.5">
              {formatBytes(storageStats.used)} of {formatBytes(storageStats.limit)}
              {storageStats.percentage! > 0 && ` (${storageStats.percentage}%)`}
            </p>
          </Link>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FiHardDrive size={18} className="text-amber-400" />
              </div>
            </div>
            <p className="text-xl font-bold text-white leading-tight">
              {formatBytes(storageStats.used)}
            </p>
            <p className="text-sm text-neutral-500 mt-1">Storage Used</p>
            <p className="text-xs text-neutral-600 mt-1.5">
              Set NEXT_PUBLIC_STORAGE_LIMIT_BYTES in your env to see remaining space
            </p>
          </div>
        )}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h2 className="text-white font-semibold">Recent Songs</h2>
          <Link
            href="/admin/songs"
            className="text-sm text-green-500 hover:text-green-400 transition"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-neutral-800">
          {recentSongs.length === 0 ? (
            <div className="px-5 py-8 text-center text-neutral-500 text-sm">
              No songs uploaded yet
            </div>
          ) : (
            recentSongs.map((song) => {
              const { data: imageData } = supabase.storage
                .from("images")
                .getPublicUrl(song.image_path || "");
              const imageUrl = song.image_path
                ? imageData.publicUrl
                : null;

              return (
                <div
                  key={song.id}
                  className="flex items-center gap-x-3 px-5 py-3 hover:bg-neutral-800/50 transition"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={song.title}
                      className="w-9 h-9 rounded object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs">
                      ♪
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {song.author}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;