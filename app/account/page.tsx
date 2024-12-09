"use client";
import { useUser } from "@/hooks/useUser";
import { FaUserCircle, FaEnvelope, FaKey } from "react-icons/fa";
import { HiHome } from "react-icons/hi";
import { useRouter } from "next/navigation";

const Page = () => {
  const { user } = useUser();
  const router = useRouter();

  return (
    <div className="p-6 bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <div className="flex md:hidden gap-x-2 items-center mb-4">
        <button
          onClick={() => router.push("/")}
          className="rounded-full p-2 bg-white flex items-center justify-center hover:opacity-75 transition"
        >
          <HiHome className="text-black" size={20} />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <FaUserCircle size={100} className="text-blue-500" />
        <h1 className="text-2xl font-semibold text-white">Account Details</h1>
        <div className="bg-gray-800 p-4 rounded-md w-full max-w-sm">
          <p className="text-gray-400 flex items-center gap-2">
            <FaEnvelope className="text-blue-500" />
            Email: <span className="text-white">{user?.email}</span>
          </p>
          <p className="text-gray-400 flex items-center gap-2 mt-2">
            <FaKey className="text-green-500" />
            User ID: <span className="text-white">{user?.id}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
