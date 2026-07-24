"use client";

import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/Button";

const AdminLoginPage = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back, Admin!");
      router.push("/admin/overview");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Login</h1>
          <p className="text-neutral-400 text-sm mt-2">
            Sign in to manage your worship songs
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-y-5">
          <div>
            <label
              htmlFor="email"
              className="text-sm text-neutral-400 block mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="flex w-full rounded-md bg-neutral-700 border border-transparent px-3 py-3 text-sm text-white placeholder-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:border-neutral-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm text-neutral-400 block mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="flex w-full rounded-md bg-neutral-700 border border-transparent px-3 py-3 text-sm text-white placeholder-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:border-neutral-500"
              placeholder="Enter your password"
            />
          </div>

          <Button disabled={isLoading} type="submit">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;