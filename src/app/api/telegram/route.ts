import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VEDIC_ASTROLOGY_SYSTEM_PROMPT, generateLifeThemes } from "@/lib/system-prompt";
import { calculateBirthChart } from "@/lib/astrology";

const FREE_MESSAGES_PER_DAY = 5;
const ADMIN_TELEGRAM_IDS = ["1923935459"]; // Vinay — app owner
const UPI_ID = "9916467570@ybl";
const UPI_NAME = "Jyotish Guru";
const MONTHLY_PRICE_INR = 99;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE_URL = process.env.NEXTAUTH_URL || "https://astro-xi-eight.vercel.app";

async function countTodayUserMessages(userId: string): Promise<number> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  return prisma.message.count({
    where: { userId, role: "user", createdAt: { gte: since } },
  });
}

function buildUpiLink(amount: number, note: string): string {
  return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
}

async function sendTelegramMessage(chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function sendTyping(chatId: string) {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  }).catch(() => {});
}

async function askDeepSeek(systemPrompt: string, userContent: string, maxTokens = 800): Promise<string | null> {
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

async function geocodePlace(place: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`,
      { headers: { "User-Agent": "JyotishGuru-Bot/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name };
  } catch {
    return null;
  }
}

function parseDate(input: string): string | null {
  const t = input.trim();
  const ddmmyyyy = t.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const yyyymmdd = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (yyyymmdd) {
    const [, y, m, d] = yyyymmdd;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function parseTime(input: string): string | null {
  const t = input.trim();
  const m = t.match(/^(\d{1,2}):(\d{2})(?:\s*(am|pm|AM|PM))?$/i);
  if (!m) return null;
  let hours = parseInt(m[1]);
  const minutes = parseInt(m[2]);
  const ampm = m[3]?.toLowerCase();
  if (ampm === "pm" && hours < 12) hours += 12;
  if (ampm === "am" && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

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

// Friendly assistant persona for onboarding - always warm, personal, conversational
const FRIENDLY_ASSISTANT = `You are a warm, friendly life guide having a personal conversation on Telegram. You use ancient wisdom behind the scenes, but you talk like a real person — no jargon, no astrology terminology.

STRICT RULES:
- NO markdown (no **, no *, no #, no bullets). Plain conversational text only.
- Keep messages short — 2-4 sentences is ideal.
- Use natural language. Contractions are fine ("I'll", "you're", "let's").
- Occasional emoji is good but don't overdo it (1-2 max).
- Never be robotic or formal. You're chatting, not filling a form.
- Sound genuinely curious about them.
- NEVER mention planet names, signs, houses, nakshatras, or any astrology jargon.`;

async function handleChart(chatId: string, userId: string, userName: string | null, birthDate: string, birthTime: string, birthPlace: string, latitude: number, longitude: number, displayMode: string) {
  try {
    const chart = calculateBirthChart(birthDate, birthTime, latitude, longitude);
    const currentDasha = chart.vimsottariDasha.find((d) => new Date() >= d.startDate && new Date() <= d.endDate);
    const topYogas = chart.yogas.slice(0, 3).map((y) => y.split(":")[0]).join(", ");

    // Have DeepSeek write a warm personal chart reveal
    const chartData = `Name: ${userName || "friend"}
Born: ${birthDate} at ${birthTime} in ${birthPlace}
Sun Sign (core identity): ${chart.sunSign}
Moon Sign (emotions): ${chart.moonSign} in ${chart.moonNakshatra}
Rising Sign (outer personality): ${chart.ascendant.rashiName}
Current Life Period: ${currentDasha?.lord || "unknown"} ${currentDasha ? `(${new Date(currentDasha.startDate).getFullYear()}-${new Date(currentDasha.endDate).getFullYear()})` : ""}
Key Patterns: ${topYogas || "balanced configuration"}`;

    const mode = displayMode === "technical"
      ? "You may use Sanskrit terms like Rashi, Nakshatra, Mahadasha."
      : "NEVER use any astrology terms, planet names, sign names, or Sanskrit. Translate everything into plain life insights. Instead of naming planets or signs, describe personality traits, life patterns, and what's ahead in plain English.";

    const intro = await askDeepSeek(
      `${FRIENDLY_ASSISTANT}\n\n${mode}\n\nYou just looked into this person's life patterns based on when and where they were born. Share what you see about them.\n\nWrite 3-4 short paragraphs. Punchy. Specific. Make them feel seen in the first line. Name one specific thing about them that most people wouldn't know — something real, like "you carry a quiet fire that only shows under pressure" or "you've been waiting for someone to see the depth you carry." Then describe the chapter of life they're in right now and what it's building toward. End with a single question that makes them want to write back immediately.\n\nNo bullet points. No astrology jargon. No planet or sign names. Speak directly to them like a wise friend.`,
      `Chart:\n${chartData}\n\nWrite what you see about this person — in plain, human language.`,
      600
    );

    await sendTelegramMessage(
      chatId,
      intro || `I just looked into your chart and there's a lot to unpack. You're in an interesting chapter of life right now — one that's building toward something bigger than you might realize. What would you like to know about?`
    );

    await prisma.birthChart.create({
      data: {
        userId,
        chartData: JSON.stringify({
          sunSign: chart.sunSign,
          moonSign: chart.moonSign,
          ascendant: chart.ascendant.rashiName,
          currentDasha: currentDasha?.lord,
          yogasCount: chart.yogas.length,
        }),
      },
    });
  } catch {
    await sendTelegramMessage(chatId, "Something went off with the calculation. Mind trying again? Type /reset to start fresh.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const telegramId = String(message.from.id);
    const text = message.text.trim();
    const firstName = message.from.first_name;

    let user = await getOrCreateUser(telegramId, firstName);

    // Auto-upgrade admin accounts to professional tier
    if (ADMIN_TELEGRAM_IDS.includes(telegramId) && user.tier === "free") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { tier: "professional" },
      });
    }

    const displayMode = (user as Record<string, unknown>).displayMode as string || "simple";

    // /start or /reset
    if (text === "/start" || text === "/reset") {
      if (text === "/reset") {
        await prisma.user.update({
          where: { id: user.id },
          data: { birthDate: null, birthTime: null, birthPlace: null, latitude: null, longitude: null },
        });
        // Also clear all conversation history for a truly fresh start
        await prisma.message.deleteMany({ where: { userId: user.id } });
      }
      sendTyping(chatId);
      const greeting = await askDeepSeek(
        FRIENDLY_ASSISTANT,
        `Someone named ${firstName || "a new person"} just started chatting with you on Telegram. Greet them warmly in 1-2 sentences, introduce yourself briefly as their Vedic astrologer, and ask for their date of birth in format DD-MM-YYYY (like 15-08-1990). Keep it personal and warm, like meeting a friend.`,
        300
      );
      await sendTelegramMessage(
        chatId,
        greeting || `Hi ${firstName || "there"}! I'm so glad you're here. I'm a Vedic astrologer and I'd love to read your chart. Could you share your date of birth with me? Format: DD-MM-YYYY (like 15-08-1990)`
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/help") {
      await sendTelegramMessage(
        chatId,
        `Here's what I can do:\n\n/start - meet me and share your details\n/reset - start over fresh\n/chart - see your chart again\n\nOr just type any question and I'll answer based on your chart.\n\nWebsite: ${SITE_URL}`
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/chart") {
      if (user.birthDate && user.birthTime && user.birthPlace && user.latitude && user.longitude) {
        sendTyping(chatId);
        await handleChart(chatId, user.id, user.name, user.birthDate, user.birthTime, user.birthPlace, user.latitude, user.longitude, displayMode);
      } else {
        await sendTelegramMessage(chatId, "We haven't set up your chart yet. Type /start to begin - it only takes a moment.");
      }
      return NextResponse.json({ ok: true });
    }

    // ONBOARDING: Collect DOB
    if (!user.birthDate) {
      const parsed = parseDate(text);
      if (!parsed) {
        sendTyping(chatId);
        const retry = await askDeepSeek(
          FRIENDLY_ASSISTANT,
          `The person just sent "${text}" but you asked for their date of birth in DD-MM-YYYY format. Gently and warmly ask them to try again with that format. Give a quick example. Keep it to 1-2 sentences.`,
          200
        );
        await sendTelegramMessage(
          chatId,
          retry || `Hmm, I couldn't quite read that. Could you send your date of birth like this: DD-MM-YYYY (example: 15-08-1990)?`
        );
        return NextResponse.json({ ok: true });
      }
      await prisma.user.update({ where: { id: user.id }, data: { birthDate: parsed } });
      sendTyping(chatId);
      const followup = await askDeepSeek(
        FRIENDLY_ASSISTANT,
        `They just told you their birth date is ${parsed}. Acknowledge it warmly in half a sentence, then ask for their exact time of birth. Mention they should try to be as exact as possible (check birth certificate if possible), and give the format HH:MM in 24-hour time. Keep it warm and to 2-3 sentences.`,
        250
      );
      await sendTelegramMessage(
        chatId,
        followup || `Got it, ${parsed}. Now I need your exact time of birth - the more precise the better. Format: HH:MM (like 14:30 for 2:30 PM).`
      );
      return NextResponse.json({ ok: true });
    }

    // Collect time of birth
    if (!user.birthTime) {
      const parsed = parseTime(text);
      if (!parsed) {
        sendTyping(chatId);
        const retry = await askDeepSeek(
          FRIENDLY_ASSISTANT,
          `They sent "${text}" but you need their birth time in HH:MM format (24-hour). Gently ask again with an example. 1-2 sentences.`,
          200
        );
        await sendTelegramMessage(
          chatId,
          retry || `That didn't look like a time format I could read. Could you try HH:MM? Like 14:30 for 2:30 PM, or 07:15 for 7:15 AM.`
        );
        return NextResponse.json({ ok: true });
      }
      await prisma.user.update({ where: { id: user.id }, data: { birthTime: parsed } });
      sendTyping(chatId);
      const followup = await askDeepSeek(
        FRIENDLY_ASSISTANT,
        `They told you their birth time is ${parsed}. Acknowledge warmly, then ask for the city and country where they were born. Keep to 2 sentences.`,
        200
      );
      await sendTelegramMessage(
        chatId,
        followup || `Perfect, ${parsed}. Last thing — which city and country were you born in?`
      );
      return NextResponse.json({ ok: true });
    }

    // Collect birth place and compute chart
    if (!user.latitude || !user.longitude) {
      sendTyping(chatId);
      const geo = await geocodePlace(text);
      if (!geo) {
        const retry = await askDeepSeek(
          FRIENDLY_ASSISTANT,
          `They sent "${text}" as their birthplace but you couldn't find it. Warmly ask them to try again with city and country. 1-2 sentences.`,
          200
        );
        await sendTelegramMessage(
          chatId,
          retry || `I couldn't pin down that location. Could you try again with the city and country? Like "Mumbai, India" or "London, UK".`
        );
        return NextResponse.json({ ok: true });
      }
      const shortName = geo.name.split(",").slice(0, 3).join(",").trim();
      await prisma.user.update({
        where: { id: user.id },
        data: { birthPlace: shortName, latitude: geo.lat, longitude: geo.lon },
      });
      sendTyping(chatId);
      await sendTelegramMessage(chatId, `Found it — ${shortName}. One moment while I pull up your chart...`);

      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (updatedUser?.birthDate && updatedUser.birthTime && updatedUser.birthPlace && updatedUser.latitude && updatedUser.longitude) {
        await handleChart(chatId, updatedUser.id, updatedUser.name, updatedUser.birthDate, updatedUser.birthTime, updatedUser.birthPlace, updatedUser.latitude, updatedUser.longitude, displayMode);
      }
      return NextResponse.json({ ok: true });
    }

    // PAYWALL — 5 free per day (admins bypass)
    const isAdmin = ADMIN_TELEGRAM_IDS.includes(telegramId);
    const todayCount = isAdmin ? 0 : await countTodayUserMessages(user.id);
    if (!isAdmin && user.tier === "free" && todayCount >= FREE_MESSAGES_PER_DAY) {
      const upiLink = buildUpiLink(MONTHLY_PRICE_INR, "Jyotish Guru Monthly");
      await sendTelegramMessage(
        chatId,
        `You've used your ${FREE_MESSAGES_PER_DAY} free readings for today. Tomorrow they reset — or upgrade now for unlimited.\n\nUnlimited for Rs. ${MONTHLY_PRICE_INR}/month:\n\nUPI ID:  ${UPI_ID}\nOr tap to pay: ${upiLink}\n\nAfter paying, reply with the UPI reference number and I'll activate your account within a few minutes.\n\nOr upgrade on the website: ${SITE_URL}/signup`
      );
      return NextResponse.json({ ok: true });
    }

    // CONVERSATION MODE — full AI chat with chart context
    sendTyping(chatId);
    let chartHeader = "";
    try {
      const chart = calculateBirthChart(user.birthDate, user.birthTime, user.latitude, user.longitude);
      const currentDasha = chart.vimsottariDasha.find((d) => new Date() >= d.startDate && new Date() <= d.endDate);

      // Generate pre-interpreted life themes
      const lifeThemes = generateLifeThemes(chart);

      // Build antardasha timeline
      const currentAntardasha = currentDasha?.antardashas?.find((a) => new Date() >= a.startDate && new Date() <= a.endDate);
      const antardashaTimeline = currentDasha?.antardashas?.map((a) => {
        const active = new Date() >= a.startDate && new Date() <= a.endDate;
        return `${a.lord}: ${a.startDate.getFullYear()}-${String(a.startDate.getMonth()+1).padStart(2,'0')} to ${a.endDate.getFullYear()}-${String(a.endDate.getMonth()+1).padStart(2,'0')}${active ? ' <<< NOW' : ''}`;
      }).join('\n') || 'N/A';

      // Full dasha timeline with antardashas for ALL periods
      const fullDashaTimeline = chart.vimsottariDasha.map((d) => {
        const active = new Date() >= d.startDate && new Date() <= d.endDate;
        const subs = d.antardashas?.map((a) => {
          const subActive = new Date() >= a.startDate && new Date() <= a.endDate;
          return `  ${a.lord}: ${a.startDate.getFullYear()}-${String(a.startDate.getMonth()+1).padStart(2,'0')} to ${a.endDate.getFullYear()}-${String(a.endDate.getMonth()+1).padStart(2,'0')}${subActive ? ' <<< NOW' : ''}`;
        }).join('\n') || '';
        return `${d.lord} Mahadasha: ${d.startDate.getFullYear()}-${d.endDate.getFullYear()}${active ? ' <<< CURRENT' : ''}\n${subs}`;
      }).join('\n');

      // Navamsa data
      const navamsaStr = chart.navamsa ? `Navamsa Ascendant: ${chart.navamsa.ascendant.rashiName}\nNavamsa Planets: ${chart.navamsa.planets.map((p) => `${p.name}:${p.rashiName}`).join(', ')}` : 'N/A';

      // Pre-compute key event timings server-side
      const ascRashi = chart.ascendant.rashi ?? 0;
      const RASHI_LORDS = ["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];
      const lord7 = RASHI_LORDS[(ascRashi + 6) % 12]; // 7th house lord = marriage
      const lord10 = RASHI_LORDS[(ascRashi + 9) % 12]; // 10th house lord = career
      const lord5 = RASHI_LORDS[(ascRashi + 4) % 12]; // 5th house lord = children

      // Find all antardashas of the 7th lord (marriage timing)
      const marriageWindows: string[] = [];
      const careerWindows: string[] = [];
      const childrenWindows: string[] = [];
      for (const md of chart.vimsottariDasha) {
        for (const ad of md.antardashas || []) {
          const range = `${ad.startDate.getFullYear()}-${String(ad.startDate.getMonth()+1).padStart(2,'0')} to ${ad.endDate.getFullYear()}-${String(ad.endDate.getMonth()+1).padStart(2,'0')}`;
          if (ad.lord === lord7 || ad.lord === "Venus" || md.lord === lord7) {
            marriageWindows.push(`${md.lord}-${ad.lord}: ${range}`);
          }
          if (ad.lord === lord10 || ad.lord === "Sun" || md.lord === lord10) {
            careerWindows.push(`${md.lord}-${ad.lord}: ${range}`);
          }
          if (ad.lord === lord5 || ad.lord === "Jupiter" || md.lord === lord5) {
            childrenWindows.push(`${md.lord}-${ad.lord}: ${range}`);
          }
        }
      }

      chartHeader = `========================
THE USER'S BIRTH CHART (COMPUTED USING NARASIMHA RAO'S METHODS)
========================
Name: ${user.name}
Born: ${user.birthDate} at ${user.birthTime}, ${user.birthPlace}

========================
LIFE THEMES — USE THESE TO GIVE HELPFUL, SPECIFIC ANSWERS
========================
${lifeThemes}

========================
PRE-COMPUTED EVENT TIMING (USE THESE EXACT DATES — DO NOT MAKE UP YOUR OWN)
========================
MARRIAGE WINDOWS (7th lord = ${lord7}, Venus periods):
${marriageWindows.slice(0, 10).join('\n')}

CAREER CHANGE WINDOWS (10th lord = ${lord10}, Sun periods):
${careerWindows.slice(0, 10).join('\n')}

CHILDREN WINDOWS (5th lord = ${lord5}, Jupiter periods):
${childrenWindows.slice(0, 10).join('\n')}

CURRENT PERIOD: ${currentDasha?.lord || 'N/A'} Mahadasha > ${currentAntardasha?.lord || 'N/A'} Antardasha

========================
NAVAMSA (D-9) — Marriage & Soul Purpose chart
========================
${navamsaStr}

========================
RAW CHART DATA
========================
Ascendant: ${chart.ascendant.rashiName}
Sun: ${chart.sunSign} | Moon: ${chart.moonSign}
Planets: ${chart.planets.map(p => `${p.name}:${p.rashiName}${p.isExalted ? "[E]" : ""}${p.isDebilitated ? "[D]" : ""}${p.isRetrograde ? "[R]" : ""}`).join(", ")}
Yogas: ${chart.yogas.slice(0, 8).map(y => y.split(":")[0]).join(", ")}

========================
CRITICAL RULES (VIOLATING THESE IS FORBIDDEN):
1. For "when did I marry" → USE THE MARRIAGE WINDOWS ABOVE. The answer is one of those date ranges. DO NOT invent other dates.
2. For "when will career change" → USE THE CAREER WINDOWS ABOVE.
3. For "when will I have children" → USE THE CHILDREN WINDOWS ABOVE.
4. NEVER say "you have not married" or assume the user's life status. You do NOT know their life events.
5. Instead say: "Your chart shows the strongest window for marriage was [date from table above]."
6. NEVER make up dates like "2013-2016" or "2030" unless those EXACT years appear in the pre-computed windows above.
7. If the user says your answer is wrong, APOLOGIZE and re-check the computed windows.
- NEVER guess timing — compute it from the dasha table above
- Never expose chart jargon to the user — translate to plain life language
========================
`;


    } catch {}

    // Include relations the user has added
    const relations = await prisma.relation.findMany({ where: { userId: user.id } });
    if (relations.length > 0) {
      const relationText = relations.map((r) => {
        try {
          const rc = calculateBirthChart(r.birthDate, r.birthTime, r.latitude, r.longitude);
          const active = rc.vimsottariDasha.find((d) => new Date() >= d.startDate && new Date() <= d.endDate);
          return `${r.name} (${r.relation}): born ${r.birthDate} ${r.birthTime}, ${r.birthPlace}. Asc ${rc.ascendant.rashiName}, Sun ${rc.sunSign}, Moon ${rc.moonSign}, current period: ${active?.lord || "N/A"}`;
        } catch {
          return `${r.name} (${r.relation}): ${r.birthDate} ${r.birthTime}, ${r.birthPlace}`;
        }
      }).join("\n");
      chartHeader += `\n========================\nOTHER PEOPLE THIS USER HAS ADDED\n========================\n${relationText}\n========================\n`;
    }

    const recentMessages = await prisma.message.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 2, // Keep minimal history — old wrong answers poison the AI
    });
    const history = recentMessages.reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // === COMPUTE-FIRST QUERY DETECTION ===
    // Detect specific questions and compute answers from chart data BEFORE calling AI
    const actualQuestion = text.startsWith("/debug ") || text.startsWith("/prompt ") ? text.replace(/^\/(debug|prompt)\s+/, "") : text;
    const lc = actualQuestion.toLowerCase();
    let computedAnswer = "";

    try {
      const chart = calculateBirthChart(user.birthDate, user.birthTime, user.latitude, user.longitude);
      const ascR = chart.ascendant.rashi ?? 0;
      const RL = ["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];
      const getHouse = (r: number) => ((r - ascR + 12) % 12) + 1;

      // Marriage question
      if (lc.includes("marr") || lc.includes("wife") || lc.includes("husband") || lc.includes("spouse") || lc.includes("wedding") || lc.includes("shaadi")) {
        const lord7name = RL[(ascR + 6) % 12];
        const windows: string[] = [];
        for (const md of chart.vimsottariDasha) {
          for (const ad of md.antardashas || []) {
            if (ad.lord === lord7name || ad.lord === "Venus") {
              windows.push(`${md.lord}-${ad.lord}: ${ad.startDate.getFullYear()} to ${ad.endDate.getFullYear()}`);
            }
          }
        }
        const venus = chart.planets.find(p => p.name === "Venus")!;
        const venusHouse = getHouse(venus.rashi);
        computedAnswer = `COMPUTED ANSWER (say this warmly, do NOT change the dates): Based on the birth chart calculations, the strongest windows for marriage in this person's life were: ${windows.slice(0, 6).join("; ")}. Venus (relationship energy) is in house ${venusHouse}. DO NOT say "you haven't married" — you don't know. Just state the computed windows and ask which one matches.`;
      }

      // Career question
      if (lc.includes("career") || lc.includes("job") || lc.includes("work") || lc.includes("business") || lc.includes("profession")) {
        const lord10name = RL[(ascR + 9) % 12];
        const mars = chart.planets.find(p => p.name === "Mars")!;
        const sun = chart.planets.find(p => p.name === "Sun")!;
        const currentDasha = chart.vimsottariDasha.find(d => new Date() >= d.startDate && new Date() <= d.endDate);
        const currentAD = currentDasha?.antardashas?.find(a => new Date() >= a.startDate && new Date() <= a.endDate);
        const careerWindows: string[] = [];
        for (const md of chart.vimsottariDasha) {
          for (const ad of md.antardashas || []) {
            if (ad.lord === lord10name || ad.lord === "Sun") {
              careerWindows.push(`${md.lord}-${ad.lord}: ${ad.startDate.getFullYear()} to ${ad.endDate.getFullYear()}`);
            }
          }
        }
        computedAnswer = `COMPUTED ANSWER (say this warmly): Mars is in house ${getHouse(mars.rashi)}${mars.isExalted ? " (very strong)" : ""}. Sun in house ${getHouse(sun.rashi)}. Current period: ${currentDasha?.lord}-${currentAD?.lord} (until ${currentAD?.endDate.getFullYear()}). Career change windows: ${careerWindows.slice(0, 6).join("; ")}. Tell the person about their career energy and timing based on these COMPUTED facts.`;
      }

      // Children question
      if (lc.includes("child") || lc.includes("baby") || lc.includes("son") || lc.includes("daughter") || lc.includes("pregnant") || lc.includes("kids")) {
        const lord5name = RL[(ascR + 4) % 12];
        const childWindows: string[] = [];
        for (const md of chart.vimsottariDasha) {
          for (const ad of md.antardashas || []) {
            if (ad.lord === lord5name || ad.lord === "Jupiter") {
              childWindows.push(`${md.lord}-${ad.lord}: ${ad.startDate.getFullYear()} to ${ad.endDate.getFullYear()}`);
            }
          }
        }
        computedAnswer = `COMPUTED ANSWER (say this warmly): Children-related windows: ${childWindows.slice(0, 6).join("; ")}. State these computed dates. DO NOT make up other dates.`;
      }

      // Current period / what's happening now
      if (lc.includes("what's happening") || lc.includes("current") || lc.includes("right now") || lc.includes("this year") || lc.includes("this period")) {
        const currentDasha = chart.vimsottariDasha.find(d => new Date() >= d.startDate && new Date() <= d.endDate);
        const currentAD = currentDasha?.antardashas?.find(a => new Date() >= a.startDate && new Date() <= a.endDate);
        const nextAD = currentDasha?.antardashas?.find(a => a.startDate > new Date());
        computedAnswer = `COMPUTED ANSWER: Current period is ${currentDasha?.lord} mahadasha (${currentDasha?.startDate.getFullYear()}-${currentDasha?.endDate.getFullYear()}) with ${currentAD?.lord} sub-period (until ${currentAD?.endDate.getFullYear()}-${String((currentAD?.endDate.getMonth() ?? 0)+1).padStart(2,'0')}). Next sub-period: ${nextAD?.lord} (${nextAD?.startDate.getFullYear()}-${nextAD?.endDate.getFullYear()}). Describe what this means for their life in plain language.`;
      }

      // Personality / tell me about myself
      if (lc.includes("about me") || lc.includes("about myself") || lc.includes("personality") || lc.includes("who am i")) {
        const moon = chart.planets.find(p => p.name === "Moon")!;
        computedAnswer = `COMPUTED ANSWER: Ascendant ${chart.ascendant.rashiName}, Moon in ${moon.rashiName} (${moon.nakshatraName})${moon.isExalted ? " EXALTED" : ""}. ${chart.yogas.length} yogas including: ${chart.yogas.slice(0,4).map(y => y.split(":")[0]).join(", ")}. Describe their personality based on these SPECIFIC chart factors. Be concrete and personal.`;
      }
    } catch {}

    const modeContext = displayMode === "technical"
      ? "\n\n[TECHNICAL MODE] You may use Sanskrit terminology like Rashi, Nakshatra, Dasha, Yoga. Still keep the tone conversational."
      : "\n\n[SIMPLE MODE — STRICTLY ENFORCED] Zero astrology jargon. Zero planet names. Zero Sanskrit terms. Talk ONLY about their real life — career, relationships, money, health, family, decisions. You're a wise friend giving life advice, not an astrologer. Rephrase every chart insight as a plain life observation.";

    const telegramTone = "\n\nYou are chatting on Telegram. Keep messages warm, personal, conversational. NO markdown (no **, no *, no #, no bullets). Short paragraphs like a friend talking, not a report.";

    // If we have a computed answer, override the system prompt to force the AI to use it
    const computeOverride = computedAnswer ? `
!!!!! MANDATORY INSTRUCTION — READ THIS FIRST !!!!!
${computedAnswer}

YOUR ENTIRE RESPONSE MUST BE BASED ON THE COMPUTED DATES ABOVE.
- State the dates from the computed answer
- Do NOT use any other dates
- Do NOT say "you haven't married" or make assumptions about the user's life
- Simply say "your chart shows the strongest window was [dates from above]"
- Keep it to 2-3 short paragraphs
- Ask "does this match?" at the end
!!!!! END MANDATORY INSTRUCTION !!!!!

` : "";

    // COMPUTED ANSWER goes FIRST — before everything else — so the AI sees it immediately
    const fullSystemPrompt = computeOverride + chartHeader + VEDIC_ASTROLOGY_SYSTEM_PROMPT + modeContext + telegramTone;

    // DEBUG MODE — admin can see the exact prompt being sent
    if (isAdmin && (text.startsWith("/debug ") || text.startsWith("/prompt "))) {
      const userQ = text.replace(/^\/(debug|prompt)\s+/, "");
      // Show what would be sent to DeepSeek
      const debugOutput = [
        "=== SYSTEM PROMPT (truncated) ===",
        fullSystemPrompt.slice(0, 3500),
        "",
        "=== COMPUTED ANSWER ===",
        computedAnswer || "(none — general question)",
        "",
        "=== USER QUESTION ===",
        userQ,
        "",
        "=== CONVERSATION HISTORY ===",
        history.map(m => `${m.role}: ${m.content.slice(0, 100)}`).join("\n"),
      ].join("\n");
      // Split into chunks for Telegram
      const chunks = [];
      for (let i = 0; i < debugOutput.length; i += 4000) {
        chunks.push(debugOutput.slice(i, i + 4000));
      }
      for (const chunk of chunks) {
        await sendTelegramMessage(chatId, chunk);
      }
      return NextResponse.json({ ok: true });
    }

    const deepseekResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...history,
          { role: "user", content: text },
        ],
        max_tokens: 1000,
        temperature: computedAnswer ? 0.3 : 0.8, // Lower temp when we have computed answer — less creative, more obedient
      }),
    });

    if (!deepseekResponse.ok) {
      await sendTelegramMessage(chatId, "I'm having a moment of trouble connecting. Give me a second and try again?");
      return NextResponse.json({ ok: true });
    }

    const data = await deepseekResponse.json();
    const aiMessage = data.choices?.[0]?.message?.content || "I couldn't find the right words. Ask me again?";

    await prisma.message.createMany({
      data: [
        { userId: user.id, role: "user", content: text },
        { userId: user.id, role: "assistant", content: aiMessage },
      ],
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { messageCount: { increment: 1 } },
    });

    const remaining = (!isAdmin && user.tier === "free") ? Math.max(0, FREE_MESSAGES_PER_DAY - (todayCount + 1)) : null;
    const footer = remaining !== null && remaining <= 2
      ? `\n\n(${remaining} free question${remaining === 1 ? "" : "s"} left today)`
      : "";

    const full = aiMessage + footer;
    const truncated = full.length > 4000 ? aiMessage.slice(0, 3900) + "..." + footer : full;
    await sendTelegramMessage(chatId, truncated);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
