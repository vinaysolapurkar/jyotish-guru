import {
  FUNCTIONAL_BENEFICS_MALEFICS,
  NAKSHATRA_PERSONALITIES,
  PLANET_IN_HOUSE_MEANING,
  RASHI_DETAILED_TRAITS,
  REMEDIES,
  assessDashaFavorability,
} from "./interpretation-data";

export const VEDIC_ASTROLOGY_SYSTEM_PROMPT = `You are a wise, warm life guide who uses Vedic astrology behind the scenes to give people real, practical insight about their lives.

## Voice

You talk like a trusted older friend — someone who genuinely cares, speaks plainly, and gets straight to the point. You're warm but not cheesy. Direct but not cold. You have a knack for saying the thing people need to hear.

## The Golden Rule

NEVER sound like an astrologer. Your job is to translate chart data into plain human insight. The user should feel like they're talking to someone who just "gets" them — not someone reading a chart.

## Response Style (CRITICAL — follow every time)

1. Short. 3–5 short paragraphs max. One-sentence paragraphs hit hard — use them.
2. No planet names. No signs. No houses. No nakshatras. No yogas. No Sanskrit. No astrology jargon AT ALL. You have the chart data — use it to form your insight, but never expose the machinery.
3. Talk about their LIFE, not their chart. Be SPECIFIC and ACTIONABLE. Reference real situations — money, relationships, career, health, family, decisions.
4. Conversational. Write like you're texting a friend, not writing an essay. Use contractions. Keep sentences short.
5. No markdown. No **, no *, no #, no bullets, no lists. Just natural flowing text with line breaks between paragraphs.
6. No filler phrases. Cut "It's important to remember," "Many factors come into play," "Trust the process."
7. End with something that makes them want to reply.

## INTERPRETATION GUIDE — How to read the chart data and give USEFUL answers

You will receive a "LIFE THEMES" section with pre-interpreted insights. USE THESE DIRECTLY — they are the translated meaning of the chart. Weave them into your answer naturally.

When the user asks about a specific topic, focus on the relevant life theme:

CAREER questions → Look at: current life period theme, career personality traits, what kind of work suits them, timing of changes
RELATIONSHIP questions → Look at: relationship style, emotional needs, what they need in a partner, current relationship energy
MONEY questions → Look at: wealth patterns, earning style, spending tendencies, timing of gains/losses
HEALTH questions → Look at: physical constitution, stress patterns, what to watch for
GENERAL "tell me about myself" → Give them 2-3 specific personality insights they can verify, then the most important thing about their current life chapter
TIMING questions ("when will X happen") → Use the current life period and upcoming shifts to give specific timeframes

## Making answers GENUINELY HELPFUL

Bad answer (vague): "You're going through a transformative period. Stay patient and good things will come."
Good answer (specific): "The next 18 months are about building, not reaping. Specifically — if you're thinking about switching jobs or starting something new, the window opens around mid-2027. Right now, focus on getting really good at one thing. The people who matter will notice."

Bad answer (generic): "You have a strong personality and people are drawn to you."
Good answer (personal): "You come across as easygoing but there's a stubbornness in you that surprises people. You've probably lost at least one important relationship because you wouldn't bend. The thing is — that same stubbornness is also your biggest asset at work. The trick is knowing when to use it."

Bad answer (fortune cookie): "A new opportunity is on the horizon."
Good answer (actionable): "Someone is going to approach you with a partnership or collaboration in the next few months. Your instinct will be to say no because you prefer working alone. Don't say no immediately — sit with it for a week. This one could be different."

## Tone

- If they're worried: be steady and reassuring. Short sentences. Ground them.
- If they're excited: match their energy but keep it real.
- If they're skeptical: don't argue. Just be so specific about their life that they can't dismiss it.
- If it's a yes/no question: answer it in the first sentence, then explain why in one paragraph.

## Never

- Never mention planet names, signs, houses, nakshatras, dashas, yogas, or any astrology terminology.
- Never predict death, serious illness, or catastrophe.
- Never ask for birth details if they're already in context.
- Never say "as an AI" or "I cannot."
- Never disclaim or apologize.
- Never sound like a textbook or a horoscope column.
- Never give vague platitudes. Every sentence should contain a specific insight or observation.`;

// Pre-interpret chart data into life themes that the AI can use directly

export function generateLifeThemes(chart: {
  ascendant: { rashiName: string; rashi?: number };
  planets: Array<{
    name: string;
    rashiName: string;
    nakshatraName: string;
    isExalted: boolean;
    isDebilitated: boolean;
    degrees: number;
    rashi: number;
  }>;
  houses: Array<{ rashi: number; rashiName: string; signification: string }>;
  yogas: string[];
  vimsottariDasha: Array<{ lord: string; startDate: Date; endDate: Date; years: number }>;
}): string {
  const find = (name: string) => chart.planets.find(p => p.name === name)!;
  const moon = find("Moon");
  const asc = chart.ascendant.rashiName;
  const ascRashi = chart.ascendant.rashi ?? Math.floor(find("Sun").rashi); // fallback

  const getHouse = (planetRashi: number) => ((planetRashi - ascRashi + 12) % 12) + 1;

  const currentDasha = chart.vimsottariDasha.find(d => new Date() >= d.startDate && new Date() <= d.endDate);
  const nextDasha = chart.vimsottariDasha.find(d => d.startDate > new Date());

  const themes: string[] = [];

  // === CORE PERSONALITY (from textbook Chapter 2 rashi traits) ===
  themes.push("=== PERSONALITY (use these to make the person feel seen) ===");

  const ascTrait = RASHI_DETAILED_TRAITS[asc];
  if (ascTrait) {
    themes.push(`Outer personality (how they come across): ${ascTrait.personality}`);
    themes.push(`Physical constitution: ${ascTrait.constitution} type. Body area to watch: ${ascTrait.bodyPart}.`);
  }

  // Moon nakshatra — deepest personality layer
  const nakshatraPersonality = NAKSHATRA_PERSONALITIES[moon.nakshatraName];
  if (nakshatraPersonality) {
    themes.push(`Deepest inner nature (from birth star): ${nakshatraPersonality}`);
  }

  // Moon sign — emotional nature
  const moonTrait = RASHI_DETAILED_TRAITS[moon.rashiName];
  if (moonTrait) {
    themes.push(`Emotional world: ${moonTrait.personality}`);
  }

  // Sun — core identity
  themes.push("Core drive/identity (what they're here to develop): " + getSunTheme(find("Sun")));

  // === KEY PLANET PLACEMENTS (from textbook planet-in-house meanings) ===
  themes.push("\n=== KEY LIFE AREAS (from planet positions — use these for specific questions) ===");

  const keyPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  for (const pName of keyPlanets) {
    const p = find(pName);
    const house = getHouse(p.rashi);
    const meaning = PLANET_IN_HOUSE_MEANING[pName]?.[house];
    if (meaning) {
      themes.push(`${pName} energy (house ${house}): ${meaning}`);
    }
  }

  // === FUNCTIONAL ANALYSIS (from textbook Table 30) ===
  themes.push("\n=== WHICH FORCES HELP vs CHALLENGE THIS PERSON ===");
  const funcData = FUNCTIONAL_BENEFICS_MALEFICS[asc];
  if (funcData) {
    if (funcData.yogakaraka) {
      themes.push(`SPECIAL ADVANTAGE: ${funcData.yogakaraka} is their yogakaraka — a uniquely powerful ally that brings both stability and growth to their life.`);
    }
    themes.push(`Forces working FOR them: ${funcData.benefics.join(", ")} energies`);
    themes.push(`Forces working AGAINST them: ${funcData.malefics.join(", ")} energies`);
  }

  // === CURRENT LIFE CHAPTER (enhanced with favorability from textbook) ===
  themes.push("\n=== CURRENT LIFE CHAPTER (use this for timing and 'what's happening now' questions) ===");

  if (currentDasha) {
    const dashaTheme = getDashaLifeTheme(currentDasha.lord);
    const yearsLeft = Math.round((currentDasha.endDate.getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000) * 10) / 10;
    const dashaP = find(currentDasha.lord);
    const favorability = assessDashaFavorability(
      currentDasha.lord, asc, dashaP.rashi, ascRashi, dashaP.isExalted, dashaP.isDebilitated
    );
    themes.push(`Current life chapter: ${dashaTheme}`);
    themes.push(`Period assessment: ${favorability.description}`);
    themes.push(`This chapter has about ${yearsLeft} years left.`);
    if (nextDasha) {
      const nextP = find(nextDasha.lord);
      const nextFav = assessDashaFavorability(
        nextDasha.lord, asc, nextP.rashi, ascRashi, nextP.isExalted, nextP.isDebilitated
      );
      themes.push(`Next chapter (starting ~${new Date(nextDasha.startDate).getFullYear()}): ${getDashaLifeTheme(nextDasha.lord)}`);
      themes.push(`Next period outlook: ${nextFav.description}`);
    }
  }

  // === CAREER & MONEY ===
  themes.push("\n=== CAREER & MONEY ===");
  themes.push(getCareerTheme(chart));
  themes.push(getWealthTheme(chart));

  // === RELATIONSHIPS ===
  themes.push("\n=== RELATIONSHIPS ===");
  themes.push(getRelationshipTheme(chart));

  // === KEY STRENGTHS & CHALLENGES ===
  themes.push("\n=== KEY STRENGTHS & CHALLENGES ===");
  const yogaInsights = chart.yogas.slice(0, 10).map(y => translateYogaToLife(y)).filter(Boolean);
  themes.push(yogaInsights.join("\n"));

  // Exalted/debilitated planets
  for (const p of chart.planets) {
    if (p.isExalted) {
      themes.push(`STRENGTH: ${getExaltedMeaning(p.name)}`);
    }
    if (p.isDebilitated) {
      themes.push(`CHALLENGE: ${getDebilitatedMeaning(p.name)}`);
    }
  }

  // === REMEDIES (from textbook Chapter 34) ===
  themes.push("\n=== REMEDIES & PRACTICAL ADVICE (offer when asked about improving life) ===");
  // Find the most challenged planet (debilitated or dasha lord if malefic)
  const challengedPlanets = chart.planets.filter(p => p.isDebilitated);
  if (challengedPlanets.length > 0) {
    for (const cp of challengedPlanets.slice(0, 2)) {
      const remedy = REMEDIES[cp.name];
      if (remedy) {
        themes.push(`To strengthen ${cp.name} energy: Wear ${remedy.gemstone} on ${remedy.finger} in ${remedy.metal}. Color to favor: ${remedy.color}. ${remedy.good_deeds} Worship: ${remedy.deity}.`);
      }
    }
  }
  if (currentDasha) {
    const dashaRemedy = REMEDIES[currentDasha.lord];
    if (dashaRemedy) {
      themes.push(`For current life chapter: Favor the color ${dashaRemedy.color}. ${dashaRemedy.good_deeds}`);
    }
  }

  return themes.join("\n");
}

function getSunTheme(sun: { rashiName: string }): string {
  const map: Record<string, string> = {
    "Aries": "Learning to lead and take bold action. Here to pioneer, not follow.",
    "Taurus": "Building something of lasting value. Here to create security and beauty.",
    "Gemini": "Communicating ideas and connecting people. Here to learn and teach.",
    "Cancer": "Nurturing and protecting. Here to create emotional security for self and family.",
    "Leo": "Expressing creativity and leadership. Here to shine and inspire others.",
    "Virgo": "Perfecting skills and being of service. Here to solve problems others can't see.",
    "Libra": "Creating balance and partnerships. Here to bring fairness and beauty to the world.",
    "Scorpio": "Transforming and going deep. Here to uncover truth and rebuild from the ground up.",
    "Sagittarius": "Seeking truth and meaning. Here to explore, teach, and expand horizons.",
    "Capricorn": "Achieving and building legacy. Here to master something and leave a mark.",
    "Aquarius": "Innovating and serving humanity. Here to think differently and make the world better.",
    "Pisces": "Connecting to the spiritual and creative. Here to heal, imagine, and transcend the ordinary.",
  };
  return map[sun.rashiName] || "Developing their unique identity and purpose.";
}

function getDashaLifeTheme(lord: string): string {
  const map: Record<string, string> = {
    "Sun": "A chapter about identity, confidence, and stepping into your power. Authority figures play a key role. Good time for leadership, government matters, or finding your purpose. Can bring health focus too.",
    "Moon": "A chapter about emotions, home, family, and inner peace. Relationships with mother/women are highlighted. Intuition is strong. Good for creative work, travel, and finding emotional security.",
    "Mars": "A chapter about action, courage, and fighting for what you want. High energy period. Good for property, technical work, competition. Watch for impatience, conflicts, and rushing into things.",
    "Mercury": "A chapter about learning, communication, and business. Good for education, writing, trading, technology. Social life picks up. Watch for overthinking and nervousness.",
    "Jupiter": "A chapter about growth, wisdom, and good fortune. Expansion in career, education, or spiritual understanding. Children, teachers, and mentors play important roles. Generally the most favorable period.",
    "Venus": "A chapter about love, pleasure, and material comfort. Good for relationships, marriage, luxury, arts, and finances. Social life flourishes. Watch for overindulgence.",
    "Saturn": "A chapter about hard work, discipline, and building something real. Results come slowly but they last. Tests of patience. The work you do now becomes the foundation for everything after. Can feel heavy but is deeply rewarding.",
    "Rahu": "A chapter about ambition, unconventional paths, and worldly desires. Strong drive to achieve. Can bring sudden changes, foreign connections, and unexpected opportunities. Watch for obsessive behavior and shortcuts.",
    "Ketu": "A chapter about letting go, spiritual growth, and inner transformation. Past patterns come up for release. Good for meditation, healing, and research. Can feel isolating but leads to deep wisdom.",
  };
  return map[lord] || "A period of change and growth.";
}

function getCareerTheme(chart: { ascendant: { rashiName: string }; planets: Array<{ name: string; rashiName: string; rashi: number; isExalted: boolean; isDebilitated: boolean }> }): string {
  const find = (name: string) => chart.planets.find(p => p.name === name)!;
  const saturn = find("Saturn");
  const sun = find("Sun");
  const jupiter = find("Jupiter");
  const mercury = find("Mercury");
  const mars = find("Mars");

  const insights: string[] = [];

  // Saturn shows work ethic and career structure
  if (saturn.isExalted) insights.push("Strong work ethic, natural authority in career. Can handle heavy responsibility.");
  if (saturn.isDebilitated) insights.push("Career may feel unstable or unsatisfying at times. Needs to build discipline consciously.");

  // Sun shows ambition and leadership
  if (sun.isExalted) insights.push("Natural leader with strong career drive. Government or authority roles suit well.");
  if (sun.isDebilitated) insights.push("May struggle with confidence at work or with authority figures. Needs to build self-belief.");

  // Mars for action-oriented career
  if (mars.isExalted) insights.push("Excellent for technical, engineering, sports, or military careers. High drive and energy.");

  // Mercury for business/communication
  if (mercury.isExalted) insights.push("Exceptional in business, communication, technology, writing, or trading.");

  // Jupiter for teaching/advisory
  if (jupiter.isExalted) insights.push("Natural teacher, advisor, or counselor. Good for education, law, finance, or spiritual work.");

  if (insights.length === 0) {
    insights.push("Career success comes through consistent effort rather than natural placement. Adaptable across fields.");
  }

  return "Career: " + insights.join(" ");
}

function getWealthTheme(chart: { planets: Array<{ name: string; rashiName: string; rashi: number; isExalted: boolean; isDebilitated: boolean }> }): string {
  const find = (name: string) => chart.planets.find(p => p.name === name)!;
  const jupiter = find("Jupiter");
  const venus = find("Venus");

  const insights: string[] = [];
  if (jupiter.isExalted) insights.push("Strong wealth potential. Money comes through knowledge, teaching, or advisory roles.");
  if (venus.isExalted) insights.push("Material comforts come easily. Good taste, attracts luxury.");
  if (jupiter.isDebilitated) insights.push("Wealth requires careful management. Avoid overcommitting financially.");
  if (venus.isDebilitated) insights.push("Relationship with money/pleasure needs attention. Tendency toward either overspending or excessive frugality.");

  if (insights.length === 0) {
    insights.push("Steady earning potential. Wealth builds gradually through consistent effort rather than windfalls.");
  }
  return "Money: " + insights.join(" ");
}

function getRelationshipTheme(chart: { ascendant: { rashiName: string }; planets: Array<{ name: string; rashiName: string; rashi: number; isExalted: boolean; isDebilitated: boolean }> }): string {
  const find = (name: string) => chart.planets.find(p => p.name === name)!;
  const venus = find("Venus");
  const moon = find("Moon");
  const mars = find("Mars");

  const insights: string[] = [];

  // Venus-based relationship style
  const venusRelStyle: Record<string, string> = {
    "Aries": "Passionate but impatient in love. Falls fast. Needs excitement in relationships.",
    "Taurus": "Deeply sensual and loyal. Values stability in love. Can be possessive.",
    "Gemini": "Needs intellectual connection in relationships. Flirtatious. Gets bored with routine.",
    "Cancer": "Deeply nurturing in love. Needs emotional security. Can be clingy when insecure.",
    "Leo": "Grand romantic gestures. Generous in love. Needs admiration from partner.",
    "Virgo": "Shows love through acts of service. Can be critical of partner. Modest in romance.",
    "Libra": "Natural romantic. Needs partnership to feel complete. Avoids conflict in relationships.",
    "Scorpio": "All-or-nothing in love. Intense, passionate, possessive. Trust is everything.",
    "Sagittarius": "Needs freedom in relationships. Adventurous lover. Commitment can feel suffocating.",
    "Capricorn": "Takes relationships seriously. Slow to commit but deeply loyal. Shows love through stability.",
    "Aquarius": "Needs space and intellectual rapport. Unconventional in love. Emotionally reserved.",
    "Pisces": "Idealistic and self-sacrificing in love. Deeply romantic but can lose themselves in partner.",
  };
  insights.push(venusRelStyle[venus.rashiName] || "Complex relationship dynamics.");

  if (mars.isDebilitated) insights.push("May struggle to assert needs in relationships. Tendency to avoid confrontation when it's actually needed.");
  if (venus.isDebilitated) insights.push("Relationships may feel like a constant learning experience. Needs to work on giving/receiving love freely.");
  if (venus.isExalted) insights.push("Naturally attracts love and harmony. Relationships tend to be supportive and pleasant.");

  return "Relationships: " + insights.join(" ");
}

function translateYogaToLife(yoga: string): string {
  // Extract yoga name and translate to life meaning
  if (yoga.includes("Gajakesari")) return "STRENGTH: Natural wisdom and good reputation. People respect and remember you. Good judgment in important decisions.";
  if (yoga.includes("Budha-Aditya")) return "STRENGTH: Sharp intellect and communication skills. Good at expressing ideas and persuading others.";
  if (yoga.includes("Chandra-Mangala")) return "STRENGTH: Good earning ability and courage. Willing to take action for what you want.";
  if (yoga.includes("Hamsa")) return "STRENGTH: Righteous, spiritual, and naturally lucky. People trust you instinctively.";
  if (yoga.includes("Malavya")) return "STRENGTH: Natural charm and appreciation for beauty. Attracts comfort and luxury.";
  if (yoga.includes("Ruchaka")) return "STRENGTH: Courageous leader with commanding presence. Good in competitive situations.";
  if (yoga.includes("Sasa")) return "STRENGTH: Disciplined, authoritative, excellent at organizing. Built for long-term success.";
  if (yoga.includes("Bhadra")) return "STRENGTH: Brilliant communicator with business sense. Quick thinker and good networker.";
  if (yoga.includes("Dhana")) return "STRENGTH: Strong wealth potential. Natural ability to accumulate money and resources.";
  if (yoga.includes("Raja Yoga")) return "STRENGTH: Combination for power and success. Leadership opportunities come naturally.";
  if (yoga.includes("Kemadruma")) return "CHALLENGE: May experience periods of loneliness or feeling unsupported. Building a strong social circle is important.";
  if (yoga.includes("Saraswati")) return "STRENGTH: Exceptional learning ability. Good at arts, music, writing, or education.";
  if (yoga.includes("Harsha")) return "STRENGTH: Ability to overcome enemies and obstacles. Health resilience despite challenges.";
  if (yoga.includes("Sarala")) return "STRENGTH: Fearless nature. Gains from unexpected or difficult situations.";
  if (yoga.includes("Vimala")) return "STRENGTH: Ethical character. Financial prudence. Spiritual growth comes naturally.";
  if (yoga.includes("Neecha Bhanga")) return "STRENGTH: What looks like a weakness becomes your greatest asset. Early struggles transform into rare strength.";
  if (yoga.includes("Kala Sarpa")) return "CHALLENGE: Life has intense ups and downs. Sudden changes in fortune. Past patterns strongly influence present. The key is embracing transformation rather than resisting it.";
  if (yoga.includes("Lakshmi")) return "STRENGTH: Blessed with wealth, beauty, and grace. Material comforts come more easily than most.";
  if (yoga.includes("Shakata")) return "CHALLENGE: Fortune fluctuates — high highs and low lows. Building emotional stability is key.";
  if (yoga.includes("Papa Kartari")) return "CHALLENGE: May feel boxed in or constrained at times. Important to actively create space and freedom in life.";
  if (yoga.includes("Adhi")) return "STRENGTH: Leadership ability and potential for high position. Political or organizational success.";
  if (yoga.includes("Amala")) return "STRENGTH: Clean reputation and fame through good deeds. Career brings recognition.";
  if (yoga.includes("balanced")) return "Balanced chart — no extreme highs or lows, steady and adaptable.";

  // For any unmatched yoga, extract the description part after the colon
  const parts = yoga.split(":");
  if (parts.length > 1) {
    const desc = parts.slice(1).join(":").trim();
    // Remove astrology jargon from the description
    return desc
      .replace(/\b(kendra|trikona|dusthana|lagna|rashi|yoga|graha|bhava|dasha)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  return "";
}

function getExaltedMeaning(planet: string): string {
  const map: Record<string, string> = {
    "Sun": "Strong sense of self, leadership, confidence. Commands respect naturally.",
    "Moon": "Emotionally strong, intuitive, nurturing. Inner peace comes naturally.",
    "Mars": "Exceptional courage, energy, and drive. Great at competition and physical tasks.",
    "Mercury": "Brilliant mind, excellent communication. Good at business and analytical thinking.",
    "Jupiter": "Natural wisdom, good fortune, spiritual depth. Things tend to work out.",
    "Venus": "Natural charm, beauty, artistic talent. Attracts love and comfort easily.",
    "Saturn": "Incredible discipline and persistence. Built for long-term achievement.",
    "Rahu": "Strong ambition and ability to navigate unconventional paths. Worldly success.",
    "Ketu": "Deep spiritual insight and detachment. Good at research and uncovering hidden truths.",
  };
  return map[planet] || "Notable strength in this area of life.";
}

function getDebilitatedMeaning(planet: string): string {
  const map: Record<string, string> = {
    "Sun": "Confidence and self-belief need conscious building. May struggle with authority or father figures.",
    "Moon": "Emotions can feel heavy or turbulent. Need to actively cultivate inner peace and stability.",
    "Mars": "Energy and assertiveness need development. May avoid necessary confrontation.",
    "Mercury": "Communication or decision-making can be challenging. Overthinking is common.",
    "Jupiter": "Growth and optimism need to be consciously cultivated. May question faith or meaning.",
    "Venus": "Love and pleasure don't come automatically. Relationships require conscious effort.",
    "Saturn": "Discipline and structure need to be built from scratch. Career path may be unconventional.",
    "Rahu": "Worldly ambitions may feel blocked or misdirected. Finding the right path takes time.",
    "Ketu": "Letting go and spiritual surrender is difficult. Attachment to material outcomes.",
  };
  return map[planet] || "This area of life requires conscious development.";
}
