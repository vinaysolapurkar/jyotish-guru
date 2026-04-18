"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8F3E8]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-baseline gap-2.5">
            <svg viewBox="0 0 28 28" className="w-6 h-6 text-[#1A1613]" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="14" cy="14" r="13" />
              <circle cx="14" cy="14" r="8" />
              <circle cx="14" cy="14" r="3" />
            </svg>
            <span
              className="text-[22px] leading-none tracking-tight text-[#1A1613]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Jyotish Guru
            </span>
          </Link>
          <p className="text-[13px] text-[#524C44] mt-5 tracking-wide">Welcome back.</p>
        </div>

        <div className="bg-[#F8F3E8] border border-[#E4D7BC] rounded-sm p-10">
          <h1
            className="text-[32px] leading-tight tracking-[-0.01em] text-[#1A1613] mb-8"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Sign in
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-sm bg-[#8B2E1F]/5 border border-[#8B2E1F]/30 text-[#8B2E1F] text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[#524C44] mb-2 tracking-[0.18em] uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] placeholder-[#A59E91] focus:outline-none focus:border-[#1A1613] transition-colors text-[14px]"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#524C44] mb-2 tracking-[0.18em] uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] placeholder-[#A59E91] focus:outline-none focus:border-[#1A1613] transition-colors text-[14px]"
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[13px] font-medium tracking-wide hover:bg-[#2D2520] transition-colors disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-[13px] text-[#524C44] mt-8">
            New to Jyotish Guru?{" "}
            <Link href="/signup" className="text-[#8B2E1F] hover:text-[#1A1613] font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
