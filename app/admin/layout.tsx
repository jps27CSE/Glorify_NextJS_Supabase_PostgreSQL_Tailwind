"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="bg-neutral-950 min-h-screen">{children}</div>
    );
  }

  return (
    <div className="bg-neutral-950 min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;