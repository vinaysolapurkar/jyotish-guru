import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateBirthChart, BirthChartData } from "@/lib/astrology";
import { COMPUTATION_REGISTRY } from "@/lib/computation-registry";
import { saveChartSVG } from "@/lib/chart-image";
import { readFileSync } from "fs";

// --- Constants ---
const FREE_MESSAGES_PER_DAY = 5;
const ADMIN_TELEGRAM_IDS = ["1923935459"];
const UPI_ID = "9916467570@ybl";
const UPI_NAME = "Jyotish Guru";
const MONTHLY_PRICE_INR = 99;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE_URL = process.env.NEXTAUTH_URL || "https://astro-xi-eight.vercel.app";

// --- Telegram helpers ---
async function send(chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

function sendTyping(chatId: string) {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  }).catch(() => {});
}

async function sendChartImage(chatId: string, chart: BirthChartData, name?: string) {
  try {
    const svgPath = saveChartSVG(chart, name || undefined);
    const svgData = readFileSync(svgPath);

    // Convert SVG to PNG using sharp (bundled with Next.js)
    let pngBuffer: Buffer;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sharp = require("sharp");
      pngBuffer = await sharp(Buffer.from(svgData)).png().toBuffer();
    } catch {
      // If sharp fails, send as document fallback
      const form = new FormData();
      form.append("chat_id", chatId);
      form.append("document", new Blob([new Uint8Array(svgData)], { type: "image/svg+xml" }), "birth-chart.svg");
      form.append("caption", "Your Birth Chart (South Indian Style)");
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, { method: "POST", body: form });
      return;
    }

    // Send as inline photo
    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", new Blob([new Uint8Array(pngBuffer)], { type: "image/png" }), "birth-chart.png");
    form.append("caption", "Your Birth Chart (South Indian Style)");
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: form,
    });
  } catch (e) {
    console.error("Chart image error:", e);
  }
}

// --- DeepSeek (single call) ---
async function askDeepSeek(system: string, user: string, maxTokens = 800, temperature = 0.3): Promise<string | null> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      body: JSON.stringify({
        model: "openai/gpt-4.1-mini",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        max_tokens: maxTokens,
        temperature,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("OpenAI API error:", res.status, errText);
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch { return null; }
}

// --- Geocoding ---
async function geocode(place: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`,
      { headers: { "User-Agent": "JyotishGuru-Bot/1.0" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name };
  } catch { return null; }
}

// --- Parsers ---
function parseDate(input: string): string | null {
  const t = input.trim();
  const ddmmyyyy = t.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) { const [, d, m, y] = ddmmyyyy; return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`; }
  const yyyymmdd = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (yyyymmdd) { const [, y, m, d] = yyyymmdd; return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`; }
  return null;
}

function parseTime(input: string): string | null {
  const t = input.trim().toLowerCase().replace(/\./g, ":");

  // Match formats: "7am", "7 am", "7:30am", "7:30 am", "07:30", "7", "19", "7:30pm", "7.30 pm"
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let hours = parseInt(m[1]);
  const minutes = parseInt(m[2] || "0");
  const ampm = m[3]?.toLowerCase();
  if (ampm === "pm" && hours < 12) hours += 12;
  if (ampm === "am" && hours === 12) hours = 0;
  // If no am/pm and hours <= 12, assume AM for morning times (common in India)
  if (!ampm && hours > 0 && hours <= 6) hours += 0; // early morning stays as-is
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// --- User management ---
async function getOrCreateUser(telegramId: string, firstName?: string) {
  let user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: `telegram_${telegramId}@jyotish.app`,
        password: "telegram_oauth_user",
        name: firstName || `Telegram User ${telegramId}`,
        telegramId,
      },
    });
  }
  return user;
}

async function countTodayMessages(userId: string): Promise<number> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  return prisma.message.count({ where: { userId, role: "user", createdAt: { gte: since } } });
}

// --- Question type detection (keyword-based, no API call) ---
const KEYWORD_MAP: [RegExp, string][] = [
  [/\b(marriage|wife|husband|spouse|wedding|marry|shaadi|vivah)\b/i, "marriage_timing"],
  [/\b(career|job|work|business|profession|promotion|employ)\b/i, "career_timing"],
  [/\b(child|kids|baby|son|daughter|pregnan|conceiv|fertility)\b/i, "children_timing"],
  [/\b(money|wealth|income|salary|financial|rich|earn|invest)\b/i, "wealth_periods"],
  [/\b(health|sick|disease|body|medical|illness|hospital)\b/i, "health_analysis"],
  [/\b(loss|fail|difficult|setback|problem|accident|crisis|danger|obstacle)\b/i, "difficult_periods"],
  [/\b(current|now|today|this\s+year|happening|going\s+on|phase|period)\b/i, "current_period"],
  [/\b(about\s+me|myself|personality|who\s+am\s+i|character|nature)\b/i, "personality"],
  [/\b(education|study|degree|school|college|exam|learn)\b/i, "education_timing"],
  [/\b(travel|abroad|foreign|relocat|visa|immigrat|overseas)\b/i, "travel_foreign"],
  [/\b(spiritual|meditation|god|moksha|dharma|prayer|guru)\b/i, "spiritual_path"],
  [/\b(remedy|gemstone|mantra|stone|ring|fasting)\b/i, "remedies"],
  [/\b(love|relationship|partner|dating|breakup|affair)\b/i, "relationship_nature"],
];

function detectQuestionTypes(text: string): string[] {
  const matches: string[] = [];
  for (const [re, type] of KEYWORD_MAP) {
    if (re.test(text) && !matches.includes(type)) matches.push(type);
  }
  return matches.length > 0 ? matches : ["current_period", "personality"];
}

// --- Onboarding prompt ---
const ONBOARDING_PROMPT = `You are a warm, friendly life guide chatting on Telegram. You use ancient wisdom behind the scenes but talk like a real person.
RULES:
- NO markdown (no **, *, #, bullets). Plain text only.
- Keep messages to 2-3 sentences. Use contractions. Sound human.
- 1-2 emoji max. NEVER mention astrology terms, planet names, or Sanskrit.`;

// --- Initial chart reading ---
async function sendInitialReading(
  chatId: string, userId: string, userName: string | null,
  birthDate: string, birthTime: string, birthPlace: string, lat: number, lon: number,
) {
  try {
    const chart = calculateBirthChart(birthDate, birthTime, lat, lon);
    // Send chart image first
    await sendChartImage(chatId, chart, userName || undefined);

    const currentDasha = chart.vimsottariDasha.find(d => new Date() >= d.startDate && new Date() <= d.endDate);
    const topYogas = chart.yogas.slice(0, 3).map(y => y.split(":")[0]).join(", ");

    const chartSummary = [
      `Name: ${userName || "friend"}`,
      `Born: ${birthDate} at ${birthTime} in ${birthPlace}`,
      `Sun Sign: ${chart.sunSign}, Moon Sign: ${chart.moonSign} in ${chart.moonNakshatra}`,
      `Rising Sign: ${chart.ascendant.rashiName}`,
      `Current Period: ${currentDasha?.lord || "unknown"} (${currentDasha ? `${new Date(currentDasha.startDate).getFullYear()}-${new Date(currentDasha.endDate).getFullYear()}` : ""})`,
      `Key Patterns: ${topYogas || "balanced configuration"}`,
    ].join("\n");

    const intro = await askDeepSeek(
      `${ONBOARDING_PROMPT}\n\nYou just looked into this person's life patterns. Share what you see.\nWrite 3-4 short paragraphs. Make them feel seen in the first line. Describe the chapter of life they're in now. End with a question that makes them want to reply.\nNo astrology jargon. No planet or sign names. Speak like a wise friend.`,
      `Chart:\n${chartSummary}\n\nWrite what you see about this person.`, 600, 0.7,
    );
    await send(chatId, intro || `I just looked into your chart and there's a lot to unpack. You're in an interesting chapter right now — one that's building toward something bigger than you might realize. What would you like to know about?`);
    await prisma.birthChart.create({
      data: { userId, chartData: JSON.stringify({ sunSign: chart.sunSign, moonSign: chart.moonSign, ascendant: chart.ascendant.rashiName, currentDasha: currentDasha?.lord, yogasCount: chart.yogas.length }) },
    });
  } catch {
    await send(chatId, "Something went off with the calculation. Type /reset to start fresh.");
  }
}

// --- Chart summary for showing the science ---
function buildChartSummary(chart: BirthChartData): string {
  const currentDasha = chart.vimsottariDasha.find(d => new Date() >= d.startDate && new Date() <= d.endDate);
  const currentAD = currentDasha?.antardashas?.find(a => new Date() >= a.startDate && new Date() <= a.endDate);
  const planets = chart.planets.map(p => {
    let s = `${p.name}: ${p.rashiName}`;
    if (p.isExalted) s += " (exalted)";
    if (p.isDebilitated) s += " (debilitated)";
    if (p.isRetrograde) s += " (R)";
    return s;
  }).join("\n");
  return [
    `Ascendant: ${chart.ascendant.rashiName}`,
    `Sun Sign: ${chart.sunSign} | Moon Sign: ${chart.moonSign}`,
    `Moon Nakshatra: ${chart.moonNakshatra}`,
    `Current Period: ${currentDasha?.lord || "?"} > ${currentAD?.lord || "?"} (${currentDasha?.startDate.getFullYear()}-${currentDasha?.endDate.getFullYear()})`,
    `Yogas: ${chart.yogas.slice(0, 5).map(y => y.split(":")[0]).join(", ")}`,
    `\nPlanetary Positions:\n${planets}`,
    chart.navamsa ? `\nNavamsa Asc: ${chart.navamsa.ascendant.rashiName}` : "",
  ].filter(Boolean).join("\n");
}

// --- Computation runner ---
function runComputations(types: string[], birthDate: string, birthTime: string, lat: number, lon: number) {
  const chart = calculateBirthChart(birthDate, birthTime, lat, lon);
  const chartSummary = buildChartSummary(chart);
  const results: Record<string, string> = {};
  for (const type of types) {
    const entry = COMPUTATION_REGISTRY[type];
    if (entry) {
      try { results[type] = entry.compute(chart, {}); }
      catch { results[type] = `[computation error for ${type}]`; }
    }
  }
  return { chart, results, chartSummary };
}

function buildConversationPrompt(question: string, computed: Record<string, string>): string {
  const block = Object.entries(computed).map(([t, r]) => `--- ${t.toUpperCase()} ---\n${r}`).join("\n\n");

  // Find the NEXT upcoming period from the computed data for future-oriented questions
  const currentYear = new Date().getFullYear();
  const futurePeriodsMatch = block.match(new RegExp(`\\((${currentYear}|${currentYear+1}|${currentYear+2}|${currentYear+3}|${currentYear+4})-\\d{4}\\)`, 'g'));
  const nextPeriod = futurePeriodsMatch?.[0] || "";

  const todayStr = `${currentYear}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;

  return `You translate Vedic astrology computations into plain English on Telegram.

TODAY'S DATE: ${todayStr}

The user asked: "${question}"

COMPUTED DATA FROM CALCULATION ENGINE:
${block}

RULES (follow strictly):
1. For FUTURE questions ("when will I earn money?", "when should I start business?", "good time to..."): ONLY pick periods AFTER today's date (${todayStr}). Ignore all past periods. Pick the NEAREST FUTURE period${nextPeriod ? ` (hint: ${nextPeriod})` : ""}. Say "The strongest upcoming window for this is [period]" clearly. Then 1-2 sentences WHY.
2. For PAST questions ("when did I marry?"): Present the TOP 2-3 most likely periods from the data. Say "Your chart shows these were the strongest windows: [periods]." Then ask "which of these matches your experience?"
3. For ANALYSIS questions ("tell me about...", "am I good at..."): Summarize the key computed insights in 2-3 sentences. Be specific and personal.
4. Maximum 2-3 short paragraphs. Be direct.
5. No astrology jargon. No markdown. No bullet lists.
6. Use ONLY facts from the computed data above. Do NOT invent dates or facts.
7. Do NOT say "I need more info" or "consult an astrologer" — the computed data IS the answer.
8. Do NOT assume their life status. Say "your chart shows..." not "you did/didn't..."
9. End with a brief engaging question.`;
}

// --- Route handler ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;
    if (!message?.text || !message?.chat?.id) return NextResponse.json({ ok: true });

    const chatId = String(message.chat.id);
    const telegramId = String(message.from.id);
    const text = message.text.trim();
    const firstName = message.from.first_name;
    const isAdmin = ADMIN_TELEGRAM_IDS.includes(telegramId);

    let user = await getOrCreateUser(telegramId, firstName);
    if (isAdmin && user.tier === "free") {
      user = await prisma.user.update({ where: { id: user.id }, data: { tier: "professional" } });
    }

    // --- Commands ---
    if (text === "/start" || text === "/reset") {
      if (text === "/reset") {
        await prisma.user.update({ where: { id: user.id }, data: { birthDate: null, birthTime: null, birthPlace: null, latitude: null, longitude: null } });
        await prisma.message.deleteMany({ where: { userId: user.id } });
      }
      sendTyping(chatId);
      const greeting = await askDeepSeek(ONBOARDING_PROMPT,
        `Someone named ${firstName || "a new person"} just started chatting. Greet them warmly in 1-2 sentences, introduce yourself as their life guide, and ask for their date of birth in DD-MM-YYYY format. Give an example like 15-08-1990.`, 300, 0.7);
      await send(chatId, greeting || `Hi ${firstName || "there"}! I'm your personal life guide. To get started, could you share your date of birth? Format: DD-MM-YYYY (like 15-08-1990)`);
      return NextResponse.json({ ok: true });
    }

    if (text === "/help") {
      await send(chatId, `/start - begin fresh\n/reset - clear data and start over\n/chart - see your initial reading again\n\nOr just ask me anything about your life — career, relationships, money, health, timing of events.\n\nWebsite: ${SITE_URL}`);
      return NextResponse.json({ ok: true });
    }

    if (text === "/chart") {
      if (user.birthDate && user.birthTime && user.latitude != null && user.longitude != null) {
        sendTyping(chatId);
        await sendInitialReading(chatId, user.id, user.name, user.birthDate, user.birthTime, user.birthPlace || "Unknown", user.latitude, user.longitude);
      } else {
        await send(chatId, "We haven't set up your chart yet. Type /start to begin.");
      }
      return NextResponse.json({ ok: true });
    }

    // --- /debug (admin only) ---
    if (text.startsWith("/debug") && isAdmin) {
      const question = text.replace(/^\/debug\s*/, "") || "tell me about my current period";
      if (!user.birthDate || !user.birthTime || user.latitude == null || user.longitude == null) {
        await send(chatId, "No birth data. /start first.");
        return NextResponse.json({ ok: true });
      }
      const types = detectQuestionTypes(question);
      const { results } = runComputations(types, user.birthDate, user.birthTime, user.latitude, user.longitude);
      const debug = [`QUESTION: ${question}`, `DETECTED: ${types.join(", ")}`, "",
        ...Object.entries(results).map(([t, r]) => `--- ${t} ---\n${r}`),
        "", "SYSTEM PROMPT:", buildConversationPrompt(question, results)].join("\n");
      await send(chatId, debug.length > 4000 ? debug.slice(0, 4000) + "\n...[truncated]" : debug);
      return NextResponse.json({ ok: true });
    }

    // --- Onboarding: collect birth details ---
    if (!user.birthDate) {
      const parsed = parseDate(text);
      if (!parsed) { await send(chatId, `Hmm, I couldn't read that as a date. Could you send your date of birth like this: DD-MM-YYYY (example: 15-08-1990)?`); return NextResponse.json({ ok: true }); }
      await prisma.user.update({ where: { id: user.id }, data: { birthDate: parsed } });
      await send(chatId, `Got it, ${parsed}. Now I need your exact time of birth — the more precise the better. Format: HH:MM (like 14:30 for 2:30 PM, or 06:15 for morning).`);
      return NextResponse.json({ ok: true });
    }

    if (!user.birthTime) {
      const parsed = parseTime(text);
      if (!parsed) { await send(chatId, `That didn't look like a time I could read. Try HH:MM format — like 14:30 for 2:30 PM or 07:15 for morning.`); return NextResponse.json({ ok: true }); }
      await prisma.user.update({ where: { id: user.id }, data: { birthTime: parsed } });
      await send(chatId, `Perfect, ${parsed}. Last thing — which city and country were you born in?`);
      return NextResponse.json({ ok: true });
    }

    if (user.latitude == null || user.longitude == null) {
      sendTyping(chatId);
      const geo = await geocode(text);
      if (!geo) { await send(chatId, `I couldn't find that location. Could you try again with city and country? Like "Mumbai, India" or "London, UK".`); return NextResponse.json({ ok: true }); }
      const shortName = geo.name.split(",").slice(0, 3).join(",").trim();
      await prisma.user.update({ where: { id: user.id }, data: { birthPlace: shortName, latitude: geo.lat, longitude: geo.lon } });
      await send(chatId, `Found it — ${shortName}. One moment while I look into your chart...`);
      sendTyping(chatId);
      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      if (updated?.birthDate && updated.birthTime && updated.latitude != null && updated.longitude != null) {
        await sendInitialReading(chatId, updated.id, updated.name, updated.birthDate, updated.birthTime, updated.birthPlace || shortName, updated.latitude, updated.longitude);
      }
      return NextResponse.json({ ok: true });
    }

    // --- Paywall ---
    if (!isAdmin && user.tier === "free") {
      const todayCount = await countTodayMessages(user.id);
      if (todayCount >= FREE_MESSAGES_PER_DAY) {
        const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${MONTHLY_PRICE_INR}&cu=INR&tn=${encodeURIComponent("Jyotish Guru Monthly")}`;
        await send(chatId, `You've used your ${FREE_MESSAGES_PER_DAY} free readings for today. They reset tomorrow — or upgrade for unlimited.\n\nUnlimited: Rs. ${MONTHLY_PRICE_INR}/month\nUPI ID: ${UPI_ID}\nTap to pay: ${upiLink}\n\nAfter paying, reply with the UPI reference number.\nOr upgrade at: ${SITE_URL}/signup`);
        return NextResponse.json({ ok: true });
      }
    }

    // --- Conversation mode ---
    sendTyping(chatId);
    await prisma.message.create({ data: { userId: user.id, role: "user", content: text } });

    // 1. Detect question types from keywords
    const questionTypes = detectQuestionTypes(text);

    // 2. Run server-side computations
    const { results, chartSummary } = runComputations(questionTypes, user.birthDate, user.birthTime, user.latitude, user.longitude);

    // 3. Send chart image + details FIRST (shows the science)
    const fullChart = calculateBirthChart(user.birthDate, user.birthTime, user.latitude, user.longitude);
    await sendChartImage(chatId, fullChart, user.name || undefined);
    await send(chatId, `Your Chart:\n${chartSummary}`);

    // 4. Build prompt with minimal history, call AI once
    sendTyping(chatId);
    const systemPrompt = buildConversationPrompt(text, results);
    const recentMessages = await prisma.message.findMany({
      where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 4, select: { role: true, content: true },
    });
    const history = recentMessages.reverse().slice(0, -1)
      .map(m => `${m.role === "user" ? "User" : "Guide"}: ${m.content}`).join("\n");
    const userContent = history ? `Recent conversation:\n${history}\n\nCurrent question: ${text}` : text;

    const reply = await askDeepSeek(systemPrompt, userContent, 800, 0.3);
    const response = reply || "I had trouble connecting right now. Please try again in a moment.";

    // Save response and increment count
    await prisma.message.create({ data: { userId: user.id, role: "assistant", content: response } });
    await prisma.user.update({ where: { id: user.id }, data: { messageCount: { increment: 1 } } });
    await send(chatId, response);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
