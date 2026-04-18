"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  totalMessages: number;
  messagesToday: number;
  messagesLast7d: number;
  usersLast7d: number;
  revenueLast7d: number;
}

interface RecentMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  user: { email: string; name: string | null; tier: string };
}

interface TopUser {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  messageCount: number;
  createdAt: string;
  birthPlace: string | null;
  telegramId: string | null;
  _count: { messages: number; relations: number };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/admin/reports")
      .then(async (r) => {
        if (r.status === 403) {
          setForbidden(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setStats(data.stats);
        setRecentMessages(data.recentMessages);
        setTopUsers(data.topUsers);
      })
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F3E8]">
        <div className="text-[#524C44] text-sm tracking-wide">Loading...</div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F3E8] px-6">
        <h1 className="text-[40px] text-[#1A1613] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Not authorized.
        </h1>
        <p className="text-[14px] text-[#524C44] mb-6">This page is for administrators only.</p>
        <Link href="/dashboard" className="text-[13px] text-[#8B2E1F] hover:text-[#1A1613]">Back to dashboard</Link>
      </div>
    );
  }

  if (!stats) return null;

  const exportCsv = () => {
    const header = "date,role,user,tier,content\n";
    const rows = recentMessages
      .map(
        (m) =>
          `"${m.createdAt}","${m.role}","${m.user.email}","${m.user.tier}","${m.content.replace(/"/g, '""').replace(/\n/g, " ")}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jyotish-messages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8F3E8] text-[#1A1613]" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
      {/* Nav */}
      <nav className="border-b border-[#E4D7BC] px-6 py-4 flex items-center justify-between bg-[#F8F3E8]">
        <Link href="/" className="flex items-baseline gap-2">
          <svg viewBox="0 0 28 28" className="w-5 h-5 text-[#1A1613]" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="14" cy="14" r="13" />
            <circle cx="14" cy="14" r="8" />
            <circle cx="14" cy="14" r="3" />
          </svg>
          <span className="text-[16px] leading-none tracking-tight text-[#1A1613]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Jyotish Guru
          </span>
          <span className="ml-3 text-[10px] tracking-[0.22em] uppercase text-[#8B2E1F]">Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#A59E91] tracking-wide">{session?.user?.email}</span>
          <Link href="/dashboard" className="text-[12px] text-[#524C44] hover:text-[#1A1613] tracking-wide">
            My dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-2">
              <span className="text-[#8B2E1F]">§</span> Reports
            </div>
            <h1 className="text-[40px] leading-tight tracking-[-0.01em] text-[#1A1613]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Business overview
            </h1>
          </div>
          <button
            onClick={exportCsv}
            className="text-[12px] font-medium px-4 py-2 rounded-full border border-[#1A1613] text-[#1A1613] hover:bg-[#1A1613] hover:text-[#F8F3E8] transition-colors tracking-wide"
          >
            Export messages CSV
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total users", value: stats.totalUsers, accent: false },
            { label: "Paid users", value: stats.paidUsers, accent: true },
            { label: "Free users", value: stats.freeUsers, accent: false },
            { label: "New users (7d)", value: stats.usersLast7d, accent: false },
            { label: "Messages today", value: stats.messagesToday, accent: false },
            { label: "Messages (7d)", value: stats.messagesLast7d, accent: false },
            { label: "Total messages", value: stats.totalMessages, accent: false },
            { label: "Revenue 7d (₹)", value: Math.round(stats.revenueLast7d), accent: true },
          ].map((s) => (
            <div
              key={s.label}
              className={`border rounded-sm p-5 ${
                s.accent
                  ? "border-[#1A1613] bg-[#F5EFDF]"
                  : "border-[#E4D7BC] bg-[#F8F3E8]"
              }`}
            >
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#524C44] mb-2">{s.label}</div>
              <div className="text-[36px] leading-none text-[#1A1613] tabular-nums" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                {s.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Top users */}
        <section className="mb-12">
          <h2 className="text-[22px] text-[#1A1613] mb-5" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Most active users
          </h2>
          <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#A59E91] border-b border-[#E4D7BC]">
                  <th className="text-left py-3 px-4 font-medium tracking-wide">Email</th>
                  <th className="text-left py-3 px-4 font-medium tracking-wide">Name</th>
                  <th className="text-left py-3 px-4 font-medium tracking-wide">Place</th>
                  <th className="text-center py-3 px-4 font-medium tracking-wide">Tier</th>
                  <th className="text-right py-3 px-4 font-medium tracking-wide">Messages</th>
                  <th className="text-right py-3 px-4 font-medium tracking-wide">People</th>
                  <th className="text-right py-3 px-4 font-medium tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u) => (
                  <tr key={u.id} className="border-b border-[#E4D7BC] last:border-0 hover:bg-[#F5EFDF]/50">
                    <td className="py-3 px-4 text-[#1A1613]">{u.email}{u.telegramId ? " (TG)" : ""}</td>
                    <td className="py-3 px-4 text-[#524C44]">{u.name || "—"}</td>
                    <td className="py-3 px-4 text-[#524C44]">{u.birthPlace || "—"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-[0.15em] uppercase ${
                        u.tier !== "free"
                          ? "bg-[#B5893C]/10 border border-[#B5893C]/40 text-[#8B2E1F]"
                          : "bg-[#F5EFDF] border border-[#E4D7BC] text-[#524C44]"
                      }`}>{u.tier}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#1A1613] tabular-nums">{u._count.messages}</td>
                    <td className="py-3 px-4 text-right text-[#524C44] tabular-nums">{u._count.relations}</td>
                    <td className="py-3 px-4 text-right text-[#A59E91] tabular-nums text-[12px]">
                      {new Date(u.createdAt).toISOString().slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent messages */}
        <section>
          <h2 className="text-[22px] text-[#1A1613] mb-5" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Recent conversations
          </h2>
          <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] divide-y divide-[#E4D7BC]">
            {recentMessages.map((m) => (
              <div key={m.id} className="p-4 hover:bg-[#F5EFDF]/50">
                <div className="flex items-baseline gap-3 mb-2 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-full font-medium tracking-[0.15em] uppercase ${
                    m.role === "user"
                      ? "bg-[#1A1613] text-[#F8F3E8]"
                      : "bg-[#F5EFDF] border border-[#E4D7BC] text-[#524C44]"
                  }`}>
                    {m.role}
                  </span>
                  <span className="text-[#524C44]">{m.user.email}</span>
                  <span className="text-[#A59E91] tabular-nums ml-auto">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-[13px] text-[#1A1613] leading-[1.55] whitespace-pre-wrap">
                  {m.content.length > 500 ? m.content.slice(0, 500) + "..." : m.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
