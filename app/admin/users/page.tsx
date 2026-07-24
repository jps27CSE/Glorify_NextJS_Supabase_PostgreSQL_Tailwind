import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const revalidate = 0;

const UsersPage = async () => {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) redirect("/admin/login");
  if (user.email !== "admin@glorify.com") redirect("/");

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.log(error.message);
  }

  const userList = (users as any[]) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Registered users on the platform
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1fr_120px] gap-4 px-5 py-3 bg-neutral-950 border-b border-neutral-800 text-neutral-500 text-sm font-medium">
          <div>Name</div>
          <div>Email</div>
          <div>User ID</div>
        </div>

        {userList.length === 0 ? (
          <div className="px-5 py-12 text-center text-neutral-500 text-sm">
            No users found
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {userList.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px] gap-2 md:gap-4 px-5 py-3.5 hover:bg-neutral-800/50 transition"
              >
                <div>
                  <p className="text-sm font-medium text-white truncate">
                    {u.full_name || "Unnamed"}
                  </p>
                </div>
                <div className="text-sm text-neutral-400 truncate">
                  {u.id}
                </div>
                <div className="text-sm text-neutral-500 font-mono text-xs truncate">
                  {u.id?.substring(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;