"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayMode, setDisplayMode] = useState("simple");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, displayMode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please log in manually.");
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F8F3E8]">
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
          <p className="text-[13px] text-[#524C44] mt-5 tracking-wide">Begin your reading.</p>
        </div>

        <div className="bg-[#F8F3E8] border border-[#E4D7BC] rounded-sm p-10">
          <h1
            className="text-[32px] leading-tight tracking-[-0.01em] text-[#1A1613] mb-8"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Create account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-sm bg-[#8B2E1F]/5 border border-[#8B2E1F]/30 text-[#8B2E1F] text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[#524C44] mb-2 tracking-[0.18em] uppercase">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] placeholder-[#A59E91] focus:outline-none focus:border-[#1A1613] transition-colors text-[14px]"
                placeholder="Your name"
              />
            </div>

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
                minLength={6}
                className="w-full px-4 py-3 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] placeholder-[#A59E91] focus:outline-none focus:border-[#1A1613] transition-colors text-[14px]"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#524C44] mb-3 tracking-[0.18em] uppercase">
                How would you like your readings?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDisplayMode("simple")}
                  className={`p-4 rounded-sm text-left transition-all cursor-pointer border ${
                    displayMode === "simple"
                      ? "border-[#1A1613] bg-[#F5EFDF]"
                      : "border-[#E4D7BC] hover:border-[#A59E91]"
                  }`}
                >
                  <div className="text-[13px] font-medium text-[#1A1613] mb-1">Simple</div>
                  <p className="text-[11px] text-[#524C44] leading-relaxed">
                    Plain language, life-focused. No jargon.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode("technical")}
                  className={`p-4 rounded-sm text-left transition-all cursor-pointer border ${
                    displayMode === "technical"
                      ? "border-[#1A1613] bg-[#F5EFDF]"
                      : "border-[#E4D7BC] hover:border-[#A59E91]"
                  }`}
                >
                  <div className="text-[13px] font-medium text-[#1A1613] mb-1">Technical</div>
                  <p className="text-[11px] text-[#524C44] leading-relaxed">
                    Full charts, Sanskrit terms, all data.
                  </p>
                </button>
              </div>
              <p className="text-[11px] text-[#A59E91] mt-2">You can change this anytime.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[13px] font-medium tracking-wide hover:bg-[#2D2520] transition-colors disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-[13px] text-[#524C44] mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#8B2E1F] hover:text-[#1A1613] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-[#A59E91] mt-6 tracking-wide">
          Ten free conversations. No card required.
        </p>
      </div>
    </div>
  );
}
