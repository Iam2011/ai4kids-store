"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_TOKEN_STORAGE_KEY, ApiError, adminLogin } from "@/lib/api/admin";

export function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (token) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await adminLogin({ email, password });
      window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, response.token);
      router.replace("/admin/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Unable to log in right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[480px] items-center px-4 py-10">
      <div className="w-full rounded-[32px] border border-white/80 bg-white/95 p-6 shadow-[0_30px_80px_rgba(93,70,140,0.18)]">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b88bf]">
          Admin panel
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#3d3068]">
          Manage AI4Kids live catalog
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#766a96]">
          Sign in to manage products, orders, analytics, exports, and catalog uploads.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            className="min-h-12 w-full rounded-[18px] border border-[#eadff6] bg-[#fcf9ff] px-4 text-sm text-[#40346f] outline-none placeholder:text-[#a194bf]"
            placeholder="Admin email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="min-h-12 w-full rounded-[18px] border border-[#eadff6] bg-[#fcf9ff] px-4 text-sm text-[#40346f] outline-none placeholder:text-[#a194bf]"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errorMessage ? (
            <p className="rounded-[16px] bg-[#fff1f4] px-4 py-3 text-sm text-[#c04d76]">
              {errorMessage}
            </p>
          ) : null}
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff8a63] via-[#ff6f96] to-[#8f6dff] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,111,149,0.25)]"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
