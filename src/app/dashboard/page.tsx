"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BirthChartSVG from "@/components/BirthChartSVG";
import UpgradeModal from "@/components/UpgradeModal";
import { BirthChartData, RASHI_NAMES } from "@/lib/astrology";

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
}

interface UserData {
  id: string;
  name: string | null;
  email: string;
  birthDate: string | null;
  birthTime: string | null;
  birthPlace: string | null;
  latitude: number | null;
  longitude: number | null;
  messageCount: number;
  todayMessageCount: number;
  tier: string;
  displayMode: string;
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [chart, setChart] = useState<BirthChartData | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showChartForm, setShowChartForm] = useState(false);
  const [chartForm, setChartForm] = useState({
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    latitude: "",
    longitude: "",
  });
  const [chartTab, setChartTab] = useState("overview");
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState("");
  const [placeResults, setPlaceResults] = useState<GeoResult[]>([]);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Relations (family / partner / etc.)
  const [relations, setRelations] = useState<Array<{ id: string; name: string; relation: string; birthDate: string; birthTime: string; birthPlace: string }>>([]);
  const [showRelationForm, setShowRelationForm] = useState(false);
  const [relationForm, setRelationForm] = useState({
    name: "",
    relation: "partner",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    latitude: "",
    longitude: "",
  });
  const [relationPlaceResults, setRelationPlaceResults] = useState<GeoResult[]>([]);
  const [relationShowDropdown, setRelationShowDropdown] = useState(false);
  const [relationGeocoding, setRelationGeocoding] = useState(false);
  const [relationError, setRelationError] = useState("");
  const [relationLoading, setRelationLoading] = useState(false);
  const relationDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const relationDropdownRef = useRef<HTMLDivElement>(null);

  const geocodePlace = useCallback(async (place: string) => {
    if (place.trim().length < 3) {
      setPlaceResults([]);
      setShowPlaceDropdown(false);
      return;
    }
    setGeocoding(true);
    try {
      const res = await fetch(`/api/geocode?place=${encodeURIComponent(place)}`);
      const data = await res.json();
      setPlaceResults(data.results || []);
      setShowPlaceDropdown((data.results || []).length > 0);
    } catch {
      setPlaceResults([]);
    } finally {
      setGeocoding(false);
    }
  }, []);

  const handlePlaceChange = (value: string) => {
    setChartForm((prev) => ({ ...prev, birthPlace: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => geocodePlace(value), 400);
  };

  const selectPlace = (result: GeoResult) => {
    const shortName = result.name.split(",").slice(0, 3).join(",").trim();
    setChartForm((prev) => ({
      ...prev,
      birthPlace: shortName,
      latitude: result.latitude.toFixed(4),
      longitude: result.longitude.toFixed(4),
    }));
    setShowPlaceDropdown(false);
    setPlaceResults([]);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPlaceDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user")
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            if (data.user.birthDate) {
              setChartForm({
                birthDate: data.user.birthDate,
                birthTime: data.user.birthTime || "",
                birthPlace: data.user.birthPlace || "",
                latitude: data.user.latitude?.toString() || "",
                longitude: data.user.longitude?.toString() || "",
              });
            }
          }
        });

      fetch("/api/chart")
        .then((r) => r.json())
        .then((data) => {
          if (data.chart) setChart(data.chart);
        })
        .catch(() => {});

      fetch("/api/relations")
        .then((r) => r.json())
        .then((data) => {
          if (data.relations) setRelations(data.relations);
        })
        .catch(() => {});
    }
  }, [status]);

  const handleGenerateChart = async (e: React.FormEvent) => {
    e.preventDefault();
    setChartError("");

    if (!chartForm.latitude || !chartForm.longitude) {
      setChartError("Please select a place from the dropdown to set your birth location.");
      return;
    }

    setChartLoading(true);

    try {
      const res = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chartForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setChartError(data.error);
        return;
      }

      setChart(data.chart);
      setShowChartForm(false);

      // Refresh user data
      const userRes = await fetch("/api/user");
      const userData = await userRes.json();
      if (userData.user) setUser(userData.user);
    } catch {
      setChartError("Failed to generate chart. Please try again.");
    } finally {
      setChartLoading(false);
    }
  };

  // ===== Relation handlers =====
  const relationGeocode = useCallback(async (place: string) => {
    if (place.trim().length < 3) { setRelationPlaceResults([]); setRelationShowDropdown(false); return; }
    setRelationGeocoding(true);
    try {
      const res = await fetch(`/api/geocode?place=${encodeURIComponent(place)}`);
      const data = await res.json();
      setRelationPlaceResults(data.results || []);
      setRelationShowDropdown((data.results || []).length > 0);
    } catch { setRelationPlaceResults([]); }
    finally { setRelationGeocoding(false); }
  }, []);

  const handleRelationPlaceChange = (value: string) => {
    setRelationForm((prev) => ({ ...prev, birthPlace: value }));
    if (relationDebounce.current) clearTimeout(relationDebounce.current);
    relationDebounce.current = setTimeout(() => relationGeocode(value), 400);
  };

  const selectRelationPlace = (result: GeoResult) => {
    const shortName = result.name.split(",").slice(0, 3).join(",").trim();
    setRelationForm((prev) => ({
      ...prev,
      birthPlace: shortName,
      latitude: result.latitude.toFixed(4),
      longitude: result.longitude.toFixed(4),
    }));
    setRelationShowDropdown(false);
    setRelationPlaceResults([]);
  };

  const handleAddRelation = async (e: React.FormEvent) => {
    e.preventDefault();
    setRelationError("");
    if (!relationForm.latitude || !relationForm.longitude) {
      setRelationError("Please select a place from the dropdown.");
      return;
    }
    setRelationLoading(true);
    try {
      const res = await fetch("/api/relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(relationForm),
      });
      const data = await res.json();
      if (res.status === 403 && data.error === "UPGRADE_REQUIRED") {
        setShowRelationForm(false);
        setShowUpgrade(true);
        return;
      }
      if (!res.ok) {
        setRelationError(data.error || "Could not add.");
        return;
      }
      setRelations((prev) => [...prev, data.relation]);
      setShowRelationForm(false);
      setRelationForm({ name: "", relation: "partner", birthDate: "", birthTime: "", birthPlace: "", latitude: "", longitude: "" });
    } catch {
      setRelationError("Something went wrong. Please try again.");
    } finally {
      setRelationLoading(false);
    }
  };

  const handleDeleteRelation = async (id: string) => {
    if (!confirm("Remove this person?")) return;
    await fetch("/api/relations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setRelations((prev) => prev.filter((r) => r.id !== id));
  };

  if (status === "loading" || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F3E8]">
        <div className="text-[#524C44] text-sm tracking-wide">Loading...</div>
      </div>
    );
  }

  const freeRemaining = Math.max(0, 5 - (user.todayMessageCount ?? 0));
  const isSimple = user.displayMode !== "technical";

  return (
    <div className="min-h-screen bg-[#F8F3E8]">
      {/* Navigation */}
      <nav className="border-b border-[#E4D7BC] px-6 py-4 flex items-center justify-between bg-[#F8F3E8]">
        <Link href="/" className="flex items-baseline gap-2">
          <svg viewBox="0 0 28 28" className="w-5 h-5 text-[#1A1613]" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="14" cy="14" r="13" />
            <circle cx="14" cy="14" r="8" />
            <circle cx="14" cy="14" r="3" />
          </svg>
          <span
            className="text-[16px] leading-none tracking-tight text-[#1A1613]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Jyotish Guru
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              const newMode = user.displayMode === "simple" ? "technical" : "simple";
              setUser((prev) => prev ? { ...prev, displayMode: newMode } : prev);
              await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ displayMode: newMode }),
              });
            }}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#E4D7BC] hover:border-[#1A1613] transition-all cursor-pointer"
          >
            <span className="text-[10px] text-[#524C44] tracking-wide">{user.displayMode === "simple" ? "Simple" : "Technical"}</span>
            <div className={`w-7 h-3.5 rounded-full relative transition-colors ${
              user.displayMode === "technical" ? "bg-[#1A1613]" : "bg-[#E4D7BC]"
            }`}>
              <div className="w-2.5 h-2.5 rounded-full bg-[#F8F3E8] absolute top-0.5 transition-all"
                style={{ left: user.displayMode === "technical" ? "15px" : "2px" }} />
            </div>
          </button>
          <Link
            href="/chat"
            className="text-[12px] font-medium px-4 py-2 rounded-full bg-[#1A1613] text-[#F8F3E8] hover:bg-[#2D2520] transition-colors tracking-wide"
          >
            Open Chat
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-[12px] text-[#524C44] hover:text-[#1A1613] transition-colors cursor-pointer tracking-wide"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <div className="text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-4">
            <span className="text-[#8B2E1F]">§</span> Your chart
          </div>
          <h1
            className="text-[36px] md:text-[44px] leading-[1.05] tracking-[-0.01em] text-[#1A1613] mb-2"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Welcome, <span className="italic">{user.name || "Seeker"}</span>
          </h1>
          <p className="text-[14px] text-[#524C44]">
            The sky at the moment of your birth, rendered precisely.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {/* Account Status */}
          <div className="border border-[#E4D7BC] rounded-sm p-6 bg-[#F8F3E8]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] tracking-[0.22em] uppercase text-[#524C44]">Account</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.18em] ${
                user.tier !== "free"
                  ? "bg-[#B5893C]/10 border border-[#B5893C]/40 text-[#8B2E1F]"
                  : "bg-[#F5EFDF] border border-[#E4D7BC] text-[#524C44]"
              }`}>
                {user.tier || "free"}
              </span>
            </div>
            {user.tier === "free" && (
              <>
                <p className="text-[36px] leading-none text-[#1A1613] mb-2 tabular-nums" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {freeRemaining}<span className="text-[#A59E91] text-[20px]">/5</span>
                </p>
                <p className="text-[11px] text-[#A59E91] tracking-wide">free questions left today</p>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="mt-5 w-full py-2.5 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[12px] font-medium tracking-wide hover:bg-[#2D2520] transition-colors cursor-pointer"
                >
                  Upgrade plan
                </button>
              </>
            )}
            {user.tier !== "free" && (
              <>
                <p className="text-[32px] leading-none text-[#1A1613] mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Unlimited
                </p>
                <p className="text-[11px] text-[#A59E91] tracking-wide">conversations available</p>
              </>
            )}
          </div>

          {/* Conversations */}
          <div className="border border-[#E4D7BC] rounded-sm p-6 bg-[#F8F3E8]">
            <h3 className="text-[10px] tracking-[0.22em] uppercase text-[#524C44] mb-4">Conversations</h3>
            <p className="text-[36px] leading-none text-[#1A1613] mb-2 tabular-nums" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              {user.messageCount}
            </p>
            <p className="text-[11px] text-[#A59E91] tracking-wide">total exchanges</p>
          </div>

          {/* Birth Details */}
          <div className="border border-[#E4D7BC] rounded-sm p-6 bg-[#F8F3E8]">
            <h3 className="text-[10px] tracking-[0.22em] uppercase text-[#524C44] mb-4">Birth</h3>
            {user.birthDate ? (
              <>
                <p className="text-[16px] text-[#1A1613] mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {user.birthDate}
                </p>
                <p className="text-[11px] text-[#A59E91] tracking-wide">{user.birthTime} · {user.birthPlace || "N/A"}</p>
              </>
            ) : (
              <p className="text-[12px] text-[#A59E91] italic">Not yet provided</p>
            )}
            <button
              onClick={() => setShowChartForm(true)}
              className="mt-5 w-full py-2.5 rounded-full border border-[#1A1613] text-[#1A1613] text-[12px] font-medium tracking-wide hover:bg-[#1A1613] hover:text-[#F8F3E8] transition-colors cursor-pointer"
            >
              {user.birthDate ? "Update details" : "Add details"}
            </button>
          </div>
        </div>

        {/* People in my life — relations */}
        <div className="border border-[#E4D7BC] rounded-sm p-6 bg-[#F8F3E8] mb-10">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-[#524C44] mb-1">
                <span className="text-[#8B2E1F]">§</span> People in your life
              </div>
              <h3 className="text-[22px] text-[#1A1613] leading-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                {relations.length > 0 ? "Ask about them, too." : "Add a partner, child, or parent."}
              </h3>
              <p className="text-[12px] text-[#A59E91] mt-1 leading-relaxed max-w-md">
                {user.tier === "free"
                  ? `Free accounts can add one person. Upgrade to Rs. 99/month for unlimited.`
                  : "Paid plans can add as many people as you like."}
              </p>
            </div>
            <button
              onClick={() => {
                if (user.tier === "free" && relations.length >= 1) {
                  setShowUpgrade(true);
                } else {
                  setShowRelationForm(true);
                }
              }}
              className="px-5 py-2 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[12px] font-medium tracking-wide hover:bg-[#2D2520] transition-colors cursor-pointer shrink-0"
            >
              + Add person
            </button>
          </div>

          {relations.length === 0 ? (
            <p className="text-[13px] text-[#A59E91] italic border-t border-[#E4D7BC] pt-5">
              No one added yet. Ask the astrologer questions about a loved one by adding their birth details here.
            </p>
          ) : (
            <div className="border-t border-[#E4D7BC] divide-y divide-[#E4D7BC]">
              {relations.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[15px] text-[#1A1613] font-medium" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{r.name}</span>
                      <span className="text-[11px] text-[#8B2E1F] uppercase tracking-[0.15em]">{r.relation}</span>
                    </div>
                    <p className="text-[11px] text-[#A59E91] mt-0.5 tracking-wide truncate">
                      {r.birthDate} · {r.birthTime} · {r.birthPlace}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteRelation(r.id)}
                    className="ml-3 text-[11px] text-[#A59E91] hover:text-[#8B2E1F] transition-colors"
                    title="Remove"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Person (Relation) Modal */}
        {showRelationForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26, 22, 19, 0.5)", backdropFilter: "blur(8px)", overflow: "visible" }}>
            <div className="bg-[#F8F3E8] border border-[#E4D7BC] rounded-sm p-10 w-full max-w-md relative overflow-visible">
              <button
                onClick={() => setShowRelationForm(false)}
                className="absolute top-5 right-5 text-[#A59E91] hover:text-[#1A1613] cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-3">
                <span className="text-[#8B2E1F]">§</span> Add a person
              </div>
              <h3 className="text-[28px] leading-tight tracking-[-0.01em] text-[#1A1613] mb-6" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Their birth details
              </h3>
              <form onSubmit={handleAddRelation} className="space-y-5 overflow-visible">
                {relationError && (
                  <div className="p-3 rounded-sm bg-[#8B2E1F]/5 border border-[#8B2E1F]/30 text-[#8B2E1F] text-sm">
                    {relationError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-[#524C44] mb-2 tracking-[0.18em] uppercase">Name</label>
                    <input
                      type="text"
                      value={relationForm.name}
                      onChange={(e) => setRelationForm({ ...relationForm, name: e.target.value })}
                      required
                      placeholder="Full name"
                      className="w-full px-3 py-2.5 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] text-[14px] focus:outline-none focus:border-[#1A1613] placeholder-[#A59E91]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-[#524C44] mb-2 tracking-[0.18em] uppercase">Relation</label>
                    <select
                      value={relationForm.relation}
                      onChange={(e) => setRelationForm({ ...relationForm, relation: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] text-[14px] focus:outline-none focus:border-[#1A1613]"
                    >
                      <option value="partner">Partner</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-[#524C44] mb-2 tracking-[0.18em] uppercase">Date of birth</label>
                  <input
                    type="date"
                    value={relationForm.birthDate}
                    onChange={(e) => setRelationForm({ ...relationForm, birthDate: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] text-[14px] focus:outline-none focus:border-[#1A1613]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-[#524C44] mb-2 tracking-[0.18em] uppercase">Time of birth</label>
                  <input
                    type="time"
                    value={relationForm.birthTime}
                    onChange={(e) => setRelationForm({ ...relationForm, birthTime: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] text-[14px] focus:outline-none focus:border-[#1A1613]"
                  />
                </div>
                <div ref={relationDropdownRef} style={{ position: "relative", zIndex: 60 }}>
                  <label className="block text-[10px] font-medium text-[#524C44] mb-2 tracking-[0.18em] uppercase">Place of birth</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={relationForm.birthPlace}
                      onChange={(e) => handleRelationPlaceChange(e.target.value)}
                      onFocus={() => relationPlaceResults.length > 0 && setRelationShowDropdown(true)}
                      placeholder="Start typing a city..."
                      autoComplete="off"
                      className="w-full px-3 py-2.5 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] text-[14px] focus:outline-none focus:border-[#1A1613] placeholder-[#A59E91]"
                    />
                    {relationGeocoding && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#8B2E1F] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {relationShowDropdown && relationPlaceResults.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 9999, marginTop: "4px", borderRadius: "4px", border: "1px solid #E4D7BC", background: "#F8F3E8", boxShadow: "0 12px 28px rgba(26,22,19,0.12)", maxHeight: "200px", overflowY: "auto" }}>
                      {relationPlaceResults.map((result, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectRelationPlace(result)}
                          className="w-full text-left px-3 py-2.5 text-[13px] text-[#1A1613] hover:bg-[#F5EFDF] transition-colors cursor-pointer"
                          style={{ borderBottom: i < relationPlaceResults.length - 1 ? "1px solid #E4D7BC" : "none" }}
                        >
                          <span className="block truncate">{result.name}</span>
                          <span className="block text-[11px] text-[#A59E91] mt-0.5 tracking-wide">
                            {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {relationForm.latitude && relationForm.longitude && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-[#F5EFDF] border border-[#E4D7BC]">
                    <svg className="w-4 h-4 text-[#8B2E1F] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[11px] text-[#524C44] tracking-wide">Location set</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={relationLoading}
                  className="w-full py-3 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[13px] font-medium tracking-wide hover:bg-[#2D2520] transition-colors disabled:opacity-50 cursor-pointer mt-2"
                >
                  {relationLoading ? "Adding..." : "Add person"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Birth Chart Form Modal */}
        {showChartForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26, 22, 19, 0.5)", backdropFilter: "blur(8px)", overflow: "visible" }}>
            <div className="bg-[#F8F3E8] border border-[#E4D7BC] rounded-sm p-10 w-full max-w-md relative overflow-visible">
              <button
                onClick={() => setShowChartForm(false)}
                className="absolute top-5 right-5 text-[#A59E91] hover:text-[#1A1613] cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-3">
                <span className="text-[#8B2E1F]">§</span> Birth
              </div>
              <h3 className="text-[28px] leading-tight tracking-[-0.01em] text-[#1A1613] mb-6" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Your details
              </h3>

              <form onSubmit={handleGenerateChart} className="space-y-5 overflow-visible">
                {chartError && (
                  <div className="p-3 rounded-sm bg-[#8B2E1F]/5 border border-[#8B2E1F]/30 text-[#8B2E1F] text-sm">
                    {chartError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-medium text-[#524C44] mb-2 tracking-[0.18em] uppercase">Date of birth</label>
                  <input
                    type="date"
                    value={chartForm.birthDate}
                    onChange={(e) => setChartForm({ ...chartForm, birthDate: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] text-[14px] focus:outline-none focus:border-[#1A1613] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#524C44] mb-2 tracking-[0.18em] uppercase">Time of birth</label>
                  <input
                    type="time"
                    value={chartForm.birthTime}
                    onChange={(e) => setChartForm({ ...chartForm, birthTime: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] text-[14px] focus:outline-none focus:border-[#1A1613] transition-colors"
                  />
                </div>

                <div ref={dropdownRef} style={{ position: "relative", zIndex: 60 }}>
                  <label className="block text-[10px] font-medium text-[#524C44] mb-2 tracking-[0.18em] uppercase">Place of birth</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={chartForm.birthPlace}
                      onChange={(e) => handlePlaceChange(e.target.value)}
                      onFocus={() => placeResults.length > 0 && setShowPlaceDropdown(true)}
                      placeholder="Start typing a city..."
                      autoComplete="off"
                      className="w-full px-3 py-2.5 rounded-sm bg-transparent border border-[#E4D7BC] text-[#1A1613] text-[14px] focus:outline-none focus:border-[#1A1613] transition-colors placeholder-[#A59E91]"
                    />
                    {geocoding && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#8B2E1F] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {showPlaceDropdown && placeResults.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        marginTop: "4px",
                        borderRadius: "4px",
                        border: "1px solid #E4D7BC",
                        background: "#F8F3E8",
                        boxShadow: "0 12px 28px rgba(26,22,19,0.12)",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {placeResults.map((result, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectPlace(result)}
                          className="w-full text-left px-3 py-2.5 text-[13px] text-[#1A1613] hover:bg-[#F5EFDF] transition-colors cursor-pointer"
                          style={{
                            borderBottom: i < placeResults.length - 1 ? "1px solid #E4D7BC" : "none",
                          }}
                        >
                          <span className="block truncate">{result.name}</span>
                          <span className="block text-[11px] text-[#A59E91] mt-0.5 tracking-wide">
                            {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {chartForm.latitude && chartForm.longitude ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-[#F5EFDF] border border-[#E4D7BC]">
                    <svg className="w-4 h-4 text-[#8B2E1F] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[11px] text-[#524C44] tracking-wide">
                      Location set · {chartForm.latitude}, {chartForm.longitude}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#A59E91] italic">
                    Type a city and select from the dropdown to set your birth location.
                  </p>
                )}
                <input type="hidden" value={chartForm.latitude} />
                <input type="hidden" value={chartForm.longitude} />

                <button
                  type="submit"
                  disabled={chartLoading}
                  className="w-full py-3 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[13px] font-medium tracking-wide hover:bg-[#2D2520] transition-colors disabled:opacity-50 cursor-pointer mt-2"
                >
                  {chartLoading ? "Calculating..." : "Generate chart"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Birth Chart Display */}
        {chart && (
          <div className="mb-8">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-1 border-b border-[#E4D7BC]">
              {[
                { id: "overview", label: isSimple ? "Your Chart" : "Overview", show: true },
                { id: "dasha", label: isSimple ? "Life Periods" : "Dasha", show: true },
                { id: "yogas", label: isSimple ? "Strengths" : "Yogas", show: true },
                { id: "ashtakavarga", label: "Ashtakavarga", show: !isSimple },
                { id: "karakas", label: "Karakas & Padas", show: !isSimple },
                { id: "aspects", label: "Aspects", show: !isSimple },
              ].filter(t => t.show).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setChartTab(tab.id)}
                  className={`px-4 py-3 text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-px tracking-wide ${
                    chartTab === tab.id
                      ? "border-[#8B2E1F] text-[#1A1613]"
                      : "border-transparent text-[#524C44] hover:text-[#1A1613]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {chartTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-[#E4D7BC] rounded-sm p-6 bg-[#F8F3E8]">
                  <h3 className="text-[20px] leading-tight text-[#1A1613] mb-5" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                    {isSimple ? "Your Birth Chart" : "Your Rashi Chart"}
                  </h3>
                  <BirthChartSVG chart={chart} />
                </div>

                <div className="space-y-4">
                  {/* Sun Sign */}
                  <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                    <div className="text-[10px] tracking-[0.22em] uppercase text-[#8B2E1F] mb-2">
                      {isSimple ? "Core identity" : "Sun · Surya"}
                    </div>
                    <p className="text-[24px] text-[#1A1613] leading-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                      {chart.sunSign}
                    </p>
                    <p className="text-[12px] text-[#A59E91] mt-1 tracking-wide">
                      {isSimple
                        ? "Your soul, ego, and life purpose"
                        : `${chart.sunNakshatra}, Pada ${chart.sunNakshatraPada}`}
                    </p>
                  </div>

                  {/* Moon Sign */}
                  <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                    <div className="text-[10px] tracking-[0.22em] uppercase text-[#8B2E1F] mb-2">
                      {isSimple ? "Emotions & mind" : "Moon · Chandra"}
                    </div>
                    <p className="text-[24px] text-[#1A1613] leading-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                      {chart.moonSign}
                    </p>
                    <p className="text-[12px] text-[#A59E91] mt-1 tracking-wide">
                      {isSimple
                        ? "Your inner world, feelings, instincts"
                        : `${chart.moonNakshatra}, Pada ${chart.moonNakshatraPada}`}
                    </p>
                  </div>

                  {/* Ascendant */}
                  <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                    <div className="text-[10px] tracking-[0.22em] uppercase text-[#8B2E1F] mb-2">
                      {isSimple ? "Outer personality" : "Ascendant · Lagna"}
                    </div>
                    <p className="text-[24px] text-[#1A1613] leading-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                      {chart.ascendant.rashiName}
                    </p>
                    <p className="text-[12px] text-[#A59E91] mt-1 tracking-wide">
                      {isSimple
                        ? "How others see you"
                        : `${Math.floor(chart.ascendant.degrees)}\u00B0 ${Math.floor((chart.ascendant.degrees % 1) * 60)}\u2032`}
                    </p>
                  </div>

                  {/* Special Lagnas - technical only */}
                  {!isSimple && chart.specialLagnas && chart.specialLagnas.length > 0 && (
                    <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                      <h3 className="text-[10px] tracking-[0.22em] uppercase text-[#524C44] mb-4">Special Lagnas</h3>
                      <div className="space-y-px">
                        {chart.specialLagnas.map((sl, i) => (
                          <div key={i} className="flex items-center justify-between text-[13px] py-2 border-b border-[#E4D7BC] last:border-0">
                            <span className="text-[#1A1613]">{sl.name}</span>
                            <span className="text-[#524C44]">{sl.rashiName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Planetary Positions Table - technical only */}
                  {!isSimple && <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                    <h3 className="text-[10px] tracking-[0.22em] uppercase text-[#524C44] mb-4">Planetary Positions</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="text-[#A59E91] border-b border-[#E4D7BC]">
                            <th className="text-left py-2 pr-2 font-medium tracking-wide">Planet</th>
                            <th className="text-left py-2 pr-2 font-medium tracking-wide">Rashi</th>
                            <th className="text-left py-2 pr-2 font-medium tracking-wide">Deg</th>
                            <th className="text-left py-2 font-medium tracking-wide">Nakshatra</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chart.planets.map((p, i) => (
                            <tr key={i} className="border-b border-[#E4D7BC] last:border-0">
                              <td className={`py-2 pr-2 font-medium ${p.isExalted ? "text-[#2D4F38]" : p.isDebilitated ? "text-[#8B2E1F]" : "text-[#1A1613]"}`}>
                                {p.name}
                              </td>
                              <td className="py-2 pr-2 text-[#524C44]">{p.rashiName}</td>
                              <td className="py-2 pr-2 text-[#A59E91] tabular-nums">{Math.floor(p.degrees)}&deg;{Math.floor((p.degrees % 1) * 60)}&prime;</td>
                              <td className="py-2 text-[#A59E91]">{p.nakshatraName} P{p.nakshatraPada}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>}
                </div>
              </div>
            )}

            {/* Dasha Tab */}
            {chartTab === "dasha" && (
              <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                <h3 className="text-[20px] text-[#1A1613] mb-2 tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {isSimple ? "Your Life Periods" : "Vimsottari Dasha (Planetary Periods)"}
                </h3>
                <p className="text-[12px] text-[#524C44] mb-5 leading-[1.6]">
                  {isSimple
                    ? "Your life is divided into planetary phases. Each phase brings different themes and opportunities. The active one is highlighted."
                    : "The 120-year Vimsottari cycle shows which planet\u2019s themes dominate each phase of your life."}
                </p>
                <div className="space-y-2">
                  {chart.vimsottariDasha.map((dasha, i) => {
                    const now = new Date();
                    const isActive = now >= new Date(dasha.startDate) && now <= new Date(dasha.endDate);
                    const start = new Date(dasha.startDate);
                    const end = new Date(dasha.endDate);
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between text-[13px] px-4 py-3 rounded-sm ${
                          isActive ? "bg-[#F5EFDF] border border-[#8B2E1F]/30" : "border border-[#E4D7BC]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#8B2E1F] animate-pulse" />}
                          <span className={isActive ? "text-[#1A1613] font-medium" : "text-[#524C44]"}>
                            {dasha.lord} {isSimple ? "period" : "Mahadasha"}
                          </span>
                          {isActive && <span className="text-[11px] text-[#8B2E1F] ml-1 italic">active now</span>}
                        </div>
                        <div className="text-right tabular-nums">
                          <span className="text-[11px] text-[#524C44] tracking-wide">
                            {start.getFullYear()} &ndash; {end.getFullYear()}
                          </span>
                          <span className="text-[11px] text-[#A59E91] ml-2">({dasha.years}y)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Yogas Tab */}
            {chartTab === "yogas" && (
              <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                <h3 className="text-[20px] text-[#1A1613] mb-2 tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {isSimple ? `Your Strengths & Patterns (${chart.yogas.length})` : `Yogas (${chart.yogas.length} detected)`}
                </h3>
                <p className="text-[12px] text-[#524C44] mb-5 leading-[1.6]">
                  {isSimple
                    ? "These are special patterns in your chart that point to talents, opportunities, and life themes unique to you."
                    : "Special planetary combinations indicating life outcomes. The Dasha periods determine when each Yoga activates."}
                </p>
                <div className="space-y-2">
                  {chart.yogas.map((yoga, i) => {
                    const [name, ...descParts] = yoga.split(": ");
                    return (
                      <div key={i} className="py-4 border-b border-[#E4D7BC] last:border-0">
                        <div className="flex items-baseline gap-4">
                          <span
                            className="text-[11px] text-[#A59E91] tabular-nums"
                            style={{ fontFamily: "ui-monospace, monospace" }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <span
                              className="text-[16px] text-[#1A1613]"
                              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                            >
                              {name}
                            </span>
                            {descParts.length > 0 && (
                              <p className="text-[13px] text-[#524C44] mt-1 leading-[1.55]">{descParts.join(": ")}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ashtakavarga Tab */}
            {chartTab === "ashtakavarga" && chart.ashtakavarga && (
              <div className="space-y-6">
                {/* Sarvashtakavarga */}
                <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                  <h3 className="text-[20px] text-[#1A1613] mb-2 tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                    Sarvashtakavarga (Total Bindus)
                  </h3>
                  <p className="text-[12px] text-[#524C44] mb-5 leading-[1.6]">
                    Total benefic points across all 12 signs. Higher values (28+) indicate favorable transits through that sign.
                  </p>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                    {chart.ashtakavarga.sarva.map((val, i) => (
                      <div key={i} className="text-center">
                        <div className="text-[10px] text-[#A59E91] mb-1 tracking-wide">{RASHI_NAMES[i].slice(0, 3)}</div>
                        <div className={`py-2 rounded-sm text-[14px] font-medium tabular-nums ${
                          val >= 30 ? "bg-[#2D4F38]/10 text-[#2D4F38]" :
                          val >= 25 ? "bg-[#F5EFDF] text-[#1A1613]" :
                          "bg-[#8B2E1F]/10 text-[#8B2E1F]"
                        }`}>
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bhinnashtakavarga */}
                <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                  <h3 className="text-[10px] tracking-[0.22em] uppercase text-[#524C44] mb-4">Bhinnashtakavarga (Per Planet)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="text-[#A59E91] border-b border-[#E4D7BC]">
                          <th className="text-left py-2 pr-3 sticky left-0 bg-[#F8F3E8] font-medium">Planet</th>
                          {RASHI_NAMES.map((r) => (
                            <th key={r} className="text-center py-2 px-1 min-w-[32px] font-medium">{r.slice(0, 3)}</th>
                          ))}
                          <th className="text-center py-2 px-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(chart.ashtakavarga.bhinna).map(([planet, bindus]) => (
                          <tr key={planet} className="border-b border-[#E4D7BC] last:border-0">
                            <td className="py-2 pr-3 text-[#1A1613] font-medium sticky left-0 bg-[#F8F3E8]">{planet}</td>
                            {bindus.map((b, j) => (
                              <td key={j} className={`text-center py-2 px-1 tabular-nums ${
                                b >= 5 ? "text-[#2D4F38] font-medium" : b <= 2 ? "text-[#8B2E1F]" : "text-[#524C44]"
                              }`}>
                                {b}
                              </td>
                            ))}
                            <td className="text-center py-2 px-2 text-[#1A1613] font-medium tabular-nums">
                              {bindus.reduce((a, b) => a + b, 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Karakas & Padas Tab */}
            {chartTab === "karakas" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chara Karakas */}
                {chart.charaKarakas && chart.charaKarakas.length > 0 && (
                  <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                    <h3 className="text-[20px] text-[#1A1613] mb-2 tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                      Chara Karakas (Jaimini)
                    </h3>
                    <p className="text-[12px] text-[#524C44] mb-5 leading-[1.6]">
                      Variable significators sorted by degrees within sign. Atmakaraka (soul) is the highest.
                    </p>
                    <div className="space-y-px">
                      {chart.charaKarakas.map((ck, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-[#E4D7BC] last:border-0 text-[13px]">
                          <div className="flex items-center gap-3">
                            <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[#8B2E1F]" : "bg-[#A59E91]"}`} />
                            <span className="text-[#1A1613] font-medium">{ck.karaka}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[#1A1613]">{ck.planet}</span>
                            <span className="text-[11px] text-[#A59E91] ml-2 tabular-nums">{ck.degrees.toFixed(1)}&deg;</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Arudha Padas */}
                {chart.arudhaPadas && chart.arudhaPadas.length > 0 && (
                  <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                    <h3 className="text-[20px] text-[#1A1613] mb-2 tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                      Arudha Padas
                    </h3>
                    <p className="text-[12px] text-[#524C44] mb-5 leading-[1.6]">
                      Bhava Arudhas show the worldly manifestation (maya) of each house. AL (Arudha Lagna) is the most important.
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-px">
                      {chart.arudhaPadas.map((ap, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-[#E4D7BC] last:border-0 text-[13px]">
                          <span className="text-[#A59E91] tabular-nums">A{ap.house}</span>
                          <span className="text-[#1A1613]">{ap.padaName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Aspects Tab */}
            {chartTab === "aspects" && chart.aspects && (
              <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-6">
                <h3 className="text-[20px] text-[#1A1613] mb-2 tracking-tight" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  Planetary Aspects (Graha Drishti)
                </h3>
                <p className="text-[12px] text-[#524C44] mb-5 leading-[1.6]">
                  Each planet casts aspects on specific houses. Mars aspects 4/7/8, Jupiter 5/7/9, Saturn 3/7/10.
                </p>
                <div className="space-y-px">
                  {chart.aspects.map((asp, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-[#E4D7BC] last:border-0 text-[13px]">
                      <span className="text-[#1A1613] font-medium">{asp.planet}</span>
                      <div className="flex gap-1.5">
                        {asp.aspectsHouses.map((h) => (
                          <span key={h} className="px-2 py-0.5 rounded-sm border border-[#E4D7BC] text-[#524C44] text-[11px] tabular-nums">
                            H{h}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!chart && (
          <div className="border border-[#E4D7BC] rounded-sm bg-[#F8F3E8] p-16 text-center mb-10">
            <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-[#F5EFDF] border border-[#E4D7BC] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#8B2E1F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <h3 className="text-[28px] leading-tight tracking-[-0.01em] text-[#1A1613] mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Generate your chart
            </h3>
            <p className="text-[14px] text-[#524C44] mb-8 max-w-md mx-auto leading-[1.6]">
              Enter your date, time, and place of birth. We compute your complete Vedic
              chart — planets, nakshatras, and timing periods — in seconds.
            </p>
            <button
              onClick={() => setShowChartForm(true)}
              className="px-7 py-3 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[13px] font-medium tracking-wide hover:bg-[#2D2520] transition-colors cursor-pointer"
            >
              Enter birth details
            </button>
          </div>
        )}

        {/* Quick Action */}
        <div className="text-center">
          <Link
            href="/chat"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[13px] font-medium tracking-wide hover:bg-[#2D2520] transition-colors"
          >
            Start a conversation
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10m0 0l-4-4m4 4l-4 4" />
            </svg>
          </Link>
        </div>
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
