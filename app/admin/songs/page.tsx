import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import getSongs from "@/actions/getSongs";
import getSongFileSizes from "@/actions/getSongFileSizes";
import AdminContent from "../components/AdminContent";

export const revalidate = 0;

const SongsPage = async () => {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) redirect("/admin/login");
  if (user.email !== "admin@glorify.com") redirect("/");

  const [songs, fileSizes] = await Promise.all([
    getSongs(),
    getSongFileSizes(),
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Songs</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Manage all worship songs on the platform
        </p>
      </div>
      <AdminContent songs={songs} fileSizes={fileSizes} />
    </div>
  );
};

export default SongsPage;