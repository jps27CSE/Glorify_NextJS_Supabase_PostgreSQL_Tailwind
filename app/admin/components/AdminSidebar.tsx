"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  FiGrid,
  FiMusic,
  FiUsers,
  FiUpload,
  FiLogOut,
  FiExternalLink,
} from "react-icons/fi";
import StorageBadge from "./StorageBadge";

const navItems = [
  { icon: FiGrid, label: "Overview", href: "/admin/overview" },
  { icon: FiMusic, label: "Songs", href: "/admin/songs" },
  { icon: FiUsers, label: "Users", href: "/admin/users" },
  { icon: FiUpload, label: "Upload", href: "/admin/upload" },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-neutral-800">
        <Link href="/admin/overview" className="flex items-center gap-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-black font-bold text-sm">
            G
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              Glorify
            </h1>
            <p className="text-[11px] text-neutral-500 tracking-wider uppercase">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-green-500/10 text-green-400 border-l-2 border-green-500"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 border-l-2 border-transparent"
              }`}
            >
              <item.icon
                size={18}
                className={isActive ? "text-green-400" : "text-neutral-500"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <StorageBadge />
      <div className="p-3 border-t border-neutral-800 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-all duration-200 border-l-2 border-transparent"
        >
          <FiExternalLink size={18} className="text-neutral-500" />
          View Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border-l-2 border-transparent w-full"
        >
          <FiLogOut size={18} className="text-neutral-500" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;