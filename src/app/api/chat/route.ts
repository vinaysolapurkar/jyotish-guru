import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VEDIC_ASTROLOGY_SYSTEM_PROMPT, generateLifeThemes } from "@/lib/system-prompt";
import { calculateBirthChart, formatDegrees } from "@/lib/astrology";

const FREE_MESSAGES_PER_DAY = 5;

async function countTodayUserMessages(userId: string): Promise<number> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  return prisma.message.count({
    where: {
      userId,
      role: "user",
      createdAt: { gte: since },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check daily message limit for free users
    const isPaidTier = user.tier !== "free";
    const todayCount = isPaidTier ? 0 : await countTodayUserMessages(user.id);
    if (!isPaidTier && todayCount >= FREE_MESSAGES_PER_DAY) {
      return NextResponse.json(
        {
          error: "FREE_LIMIT_REACHED",
          message: "You've used your 5 free readings for today. Come back tomorrow, or upgrade for unlimited.",
        },
        { status: 403 }
      );
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedMessage = message.trim().slice(0, 2000);

    // Build context with user's birth details
    let birthContext = "";
    if (user.birthDate && user.birthTime && user.latitude && user.longitude) {
      try {
        const chart = calculateBirthChart(
          user.birthDate,
          user.birthTime,
          user.latitude,
          user.longitude
        );
        const currentDasha = chart.vimsottariDasha.find((d) => new Date() >= d.startDate && new Date() <= d.endDate);
        const karakaStr = chart.charaKarakas?.map((ck) => `${ck.karaka}: ${ck.planet} (${ck.degrees.toFixed(1)}deg)`).join(", ") || "N/A";
        const padaStr = chart.arudhaPadas?.map((ap) => `A${ap.house}: ${ap.padaName}`).join(", ") || "N/A";
        const sarvaStr = chart.ashtakavarga?.sarva?.map((v, i) => `${chart.houses[i]?.rashiName || i}: ${v}`).join(", ") || "N/A";
        const aspectStr = chart.aspects?.map((a) => `${a.planet} aspects houses ${a.aspectsHouses.join(",")}`).join("; ") || "N/A";

        // Generate pre-interpreted life themes for the AI to use
        const lifeThemes = generateLifeThemes(chart);

        birthContext = `\n\n========================
THE USER'S BIRTH CHART (ALREADY COMPUTED — USE DIRECTLY, NEVER ASK TO CONFIRM)
========================
Name: ${user.name || "User"}
Birth: ${user.birthDate} at ${user.birthTime}, ${user.birthPlace || "N/A"}

========================
LIFE THEMES — USE THESE TO GIVE HELPFUL, SPECIFIC ANSWERS
(These are pre-interpreted from the chart. Weave them naturally into your responses.)
========================
${lifeThemes}

========================
RAW CHART DATA (for additional detail — translate into plain life insights, never expose raw data)
========================
Ascendant: ${chart.ascendant.rashiName} at ${formatDegrees(chart.ascendant.degrees)}

PLANETS:
${chart.planets.map((p) => `${p.name}: ${p.rashiName} ${formatDegrees(p.degrees)} | Nakshatra: ${p.nakshatraName} Pada ${p.nakshatraPada}${p.isExalted ? " [EXALTED]" : ""}${p.isDebilitated ? " [DEBILITATED]" : ""}`).join("\n")}

CURRENT PLANETARY PERIOD: ${currentDasha?.lord || "Unknown"} Mahadasha (${currentDasha ? `${new Date(currentDasha.startDate).getFullYear()}-${new Date(currentDasha.endDate).getFullYear()}` : "N/A"})

CHARA KARAKAS (Jaimini significators): ${karakaStr}

ARUDHA PADAS: ${padaStr}

SARVASHTAKAVARGA (total benefic points per sign): ${sarvaStr}

PLANETARY ASPECTS: ${aspectStr}

YOGAS DETECTED (${chart.yogas.length}):
${chart.yogas.join("\n")}

SPECIAL LAGNAS: ${chart.specialLagnas?.map((sl) => `${sl.name}: ${sl.rashiName}`).join(", ") || "N/A"}

========================
CRITICAL RULES:
- You ALREADY HAVE the user's birth details and chart above. NEVER ask for date, time, or location again.
- NEVER say "could you confirm your birth details" or ask the user to verify them.
- Treat the chart above as authoritative. Use it directly in every response.
- PRIORITIZE the LIFE THEMES section — it contains pre-translated insights ready to use.
- Never expose raw chart data (planet names, signs, houses) to the user.
========================`;
      } catch {
        birthContext = "\n\n[User has provided birth details but chart calculation encountered an issue. Please ask them to verify their birth details.]";
      }
    } else {
      birthContext = "\n\n[User has not yet provided complete birth details. If relevant to their question, gently ask for their date of birth, exact time of birth, and place of birth to provide personalized readings.]";
    }

    // Fetch relations (family members the user has added) and add their chart summary
    const relations = await prisma.relation.findMany({ where: { userId: user.id } });
    if (relations.length > 0) {
      const relationSummaries = relations
        .map((r) => {
          try {
            const chart = calculateBirthChart(r.birthDate, r.birthTime, r.latitude, r.longitude);
            const active = chart.vimsottariDasha.find((d) => new Date() >= d.startDate && new Date() <= d.endDate);
            return `${r.name} (${r.relation}): ${r.birthDate} ${r.birthTime}, ${r.birthPlace} | Asc ${chart.ascendant.rashiName}, Sun ${chart.sunSign}, Moon ${chart.moonSign}, current period: ${active?.lord || "N/A"}, yogas: ${chart.yogas.slice(0, 3).map(y => y.split(":")[0]).join(", ")}`;
          } catch {
            return `${r.name} (${r.relation}): ${r.birthDate} ${r.birthTime}, ${r.birthPlace}`;
          }
        })
        .join("\n");
      birthContext += `\n\n========================\nOTHER PEOPLE IN THIS USER'S LIFE (their charts are computed — use them when asked)\n========================\n${relationSummaries}\n========================`;
    }

    // Get full conversation history for personalization
    const recentMessages = await prisma.message.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const conversationHistory = recentMessages
      .reverse()
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    // Append current user message (not yet saved, only saved if AI succeeds)
    conversationHistory.push({ role: "user", content: sanitizedMessage });

    // Add user name context
    const nameContext = user.name ? `\n\nThe user's name is ${user.name}. Address them by name naturally.` : "";

    // Display mode context
    const modeContext = (user as Record<string, unknown>).displayMode === "technical"
      ? "\n\n[DISPLAY MODE: TECHNICAL] The user is an astrology enthusiast. You may use proper Sanskrit terminology (Rashi, Nakshatra, Dasha, Yoga, Graha, Bhava, etc.) and include degree positions. Still keep the tone conversational and human, but you can reference chart details directly."
      : "\n\n[DISPLAY MODE: SIMPLE — STRICTLY ENFORCED] Zero astrology jargon. Zero planet names. Zero Sanskrit. The user has no idea what a Mahadasha or Rahu or 10th house means — and they don't want to know. Talk ONLY about their real life: career, relationships, money, health, family, decisions. You're a wise friend giving life advice, not an astrologer giving a reading. If you catch yourself about to write any astrology term, delete it and rephrase as a plain life insight.";

    // Call DeepSeek API
    const deepseekResponse = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: VEDIC_ASTROLOGY_SYSTEM_PROMPT + modeContext + nameContext + birthContext,
            },
            ...conversationHistory,
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      }
    );

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error("DeepSeek API error:", errorText);
      return NextResponse.json(
        { error: "AI service is currently unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await deepseekResponse.json();
    const aiMessage =
      data.choices?.[0]?.message?.content ||
      "I apologize, I could not generate a response. Please try again.";

    // Save user message + AI response together (only after AI succeeds)
    await prisma.message.createMany({
      data: [
        { userId: user.id, role: "user", content: sanitizedMessage },
        { userId: user.id, role: "assistant", content: aiMessage },
      ],
    });

    // Increment message count
    await prisma.user.update({
      where: { id: user.id },
      data: { messageCount: { increment: 1 } },
    });

    return NextResponse.json({
      message: aiMessage,
      messageCount: user.messageCount + 1,
      tier: user.tier,
      freeMessagesRemaining: isPaidTier
        ? null
        : Math.max(0, FREE_MESSAGES_PER_DAY - (todayCount + 1)),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
