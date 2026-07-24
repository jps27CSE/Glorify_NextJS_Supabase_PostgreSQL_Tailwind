"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import { Song } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  songs: Song[];
}

const AppShell: React.FC<AppShellProps> = ({ children, songs }) => {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar songs={songs}>{children}</Sidebar>
      <Player />
    </>
  );
};

export default AppShell;