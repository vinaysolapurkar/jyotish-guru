// =============================================================================
// Computation Registry & Interpretation Dictionary
// Central reference for all Jyotish Guru astrology computations
// =============================================================================

import {
  type BirthChartData,
  type DashaPeriod,
  calculateBirthChart,
  getCurrentDasha,
  RASHI_LORDS,
  RASHI_NAMES,
  HOUSE_SIGNIFICATIONS,
  EXALTATION,
  DEBILITATION,
} from "./astrology";

import {
  FUNCTIONAL_BENEFICS_MALEFICS,
  PLANET_IN_HOUSE_MEANING,
  RASHI_DETAILED_TRAITS,
  NAKSHATRA_PERSONALITIES,
  REMEDIES,
  assessDashaFavorability,
} from "./interpretation-data";

// =============================================================================
// 1. FUNCTION INDEX — Compact string for DeepSeek's system prompt (~500 tokens)
// =============================================================================

export const FUNCTION_INDEX = `
AVAILABLE COMPUTATIONS (pick one or more, return JSON):

TIMING:
- marriage_timing: When marriage happened/will happen. Needs: birth_data. Optional: actual_marriage_year (for rectification).
- career_timing: Career changes, promotions, job loss. Needs: birth_data.
- children_timing: When children born/will be born. Needs: birth_data. Optional: marriage_year (IMPORTANT: ask user when they married BEFORE predicting children — children come after marriage), actual_children_years.
- difficult_periods: Losses, setbacks, health crises, accidents. Needs: birth_data.
- wealth_periods: Financial gains, income growth. Needs: birth_data.
- education_timing: Academic achievements, degree completion. Needs: birth_data.
- travel_foreign: Foreign travel, relocation abroad. Needs: birth_data.

ANALYSIS:
- current_period: What's happening now and next 1-2 years. Needs: birth_data.
- personality: Character traits, strengths, weaknesses. Needs: birth_data.
- health_analysis: Constitution, vulnerable body areas, health timing. Needs: birth_data.
- spiritual_path: Spiritual growth, meditation, guru connection. Needs: birth_data.
- relationship_nature: How they love, what they need in partner. Needs: birth_data.
- career_nature: What kind of work suits them, career strengths. Needs: birth_data.

ADVANCED:
- birth_rectification: Adjust birth time using known events. Needs: birth_data + at least 2 known events (marriage year, first child year, first job year).
- annual_forecast: This year's predictions using Tithi Pravesha. Needs: birth_data.
- remedies: Gemstones, mantras, deities, fasting for specific problems. Needs: birth_data + problem_area.
- compatibility: Relationship compatibility with another person. Needs: both birth_data.
- full_chart: Complete chart dump with all calculations. Needs: birth_data.

MISSING INPUT HANDLING:
If a computation needs data you don't have (e.g., birth_rectification needs known events), ASK the user for it before calling the computation. Return: {"action": "ask_user", "question": "...", "for_computation": "..."}

Return format: {"computations": ["type1", "type2"], "params": {"actual_marriage_year": 2012}}
Or: {"action": "ask_user", "question": "To give you accurate timing, I need to calibrate. When did you get married? When was your first child born?", "for_computation": "birth_rectification"}
`;

// =============================================================================
// 3. INTERPRETATION DICTIONARY
// =============================================================================

/** Dasha lord placed in house X from ascendant — what life results to expect */
export const DASHA_LORD_IN_HOUSE: Record<number, string> = {
  1: "Focus on self, health, personality, new beginnings. You become more visible and take initiative.",
  2: "Money matters, family dynamics, speech and diet become prominent. Gains or losses in wealth.",
  3: "Courage, short trips, siblings, communication, writing. A period of effort and initiative.",
  4: "Home, property, mother, vehicles, inner peace. Domestic changes and emotional foundations shift.",
  5: "Children, creativity, romance, education, spiritual practice. A period of intelligence and joy.",
  6: "Health challenges, enemies, debts, service, legal matters. Obstacles arise but can be overcome.",
  7: "Marriage, partnerships, business deals, public dealings. Relationships take center stage.",
  8: "Transformation, sudden events, chronic issues, inheritance, occult. A period of deep change.",
  9: "Fortune, father, guru, higher learning, long travel, dharma. Luck and wisdom expand.",
  10: "Career peak, public recognition, authority, professional changes. Your actions become visible.",
  11: "Gains, income growth, fulfilled desires, elder siblings, networking. Wishes start materializing.",
  12: "Expenditure, foreign lands, isolation, spiritual growth, losses. Letting go brings liberation.",
};

/** Marriage indicators: 7th lord placed in house X */
const LORD7_IN_HOUSE: Record<number, string> = {
  1: "Spouse is closely tied to your identity. Marriage comes through personal effort or self-initiated meetings.",
  2: "Marriage brings wealth or family connection. Spouse may come from a known family or similar background.",
  3: "Spouse may come through siblings, neighbors, or short travels. Communication is key in marriage.",
  4: "Marriage brings domestic happiness. Spouse may be from hometown or connected to property/real estate.",
  5: "Love marriage likely. Spouse connected to education, creativity, or children. Romance-driven union.",
  6: "Marriage may face obstacles, health issues, or come through service/work. Spouse may be in healthcare.",
  7: "Strong marriage potential. Spouse is independent and the relationship is a central life theme.",
  8: "Marriage involves transformation. Sudden meetings, age gaps, or inheritance through spouse possible.",
  9: "Spouse from foreign land or different culture. Marriage connected to higher education or spirituality.",
  10: "Marriage connected to career. Spouse may be a colleague or marriage brings professional growth.",
  11: "Marriage fulfills long-held desires. Spouse may come through friends or social networks.",
  12: "Spouse may be from foreign land. Marriage involves sacrifice, spiritual connection, or privacy.",
};

/** Venus in house X — relationship style */
const VENUS_IN_HOUSE: Record<number, string> = {
  1: "Naturally charming and attractive. Love comes easily and relationships start through personal magnetism.",
  2: "Values comfort and luxury in relationships. Expresses love through gifts, food, and material care.",
  3: "Flirtatious communicator. Finds romance through social activities, short trips, and creative expression.",
  4: "Loves deeply at home. Needs a beautiful, comfortable living space. Romance tied to emotional security.",
  5: "Deeply romantic and creative in love. Children and artistic expression bring joy. Love marriages favored.",
  6: "May face obstacles in love or attract partners through work/service. Needs to watch health in relationships.",
  7: "Excellent for marriage. Attracts loving, beautiful partners. Relationships are harmonious and fulfilling.",
  8: "Intense, transformative love life. Deep physical and emotional bonds. May receive wealth through partner.",
  9: "Attracted to partners from different cultures or backgrounds. Love connected to travel and philosophy.",
  10: "Romance may come through career. Partner may be professionally accomplished. Public displays of affection.",
  11: "Finds love through friends and social circles. Relationships fulfill long-term hopes and dreams.",
  12: "Secret romances or love in foreign lands. Deep spiritual connection with partner. Private love life.",
};

/** Upapada Lagna in house X from ascendant */
const UL_IN_HOUSE: Record<number, string> = {
  1: "Spouse strongly influences your identity and life direction. Marriage is a defining life event.",
  2: "Marriage brings wealth and family growth. Spouse contributes to financial stability.",
  3: "Spouse is courageous and communicative. Marriage involves travel and initiative.",
  4: "Marriage brings home comforts and emotional security. Spouse is nurturing.",
  5: "Marriage connected to children, creativity, or education. Loving and joyful partnership.",
  6: "Marriage may face health or legal challenges. Spouse may be in service or healthcare fields.",
  7: "Strong, stable marriage. Spouse is an equal partner. Classic partnership placement.",
  8: "Marriage involves deep transformation. Sudden changes through spouse. Inheritance possible.",
  9: "Spouse from different background or culture. Marriage brings wisdom and fortune.",
  10: "Spouse is career-oriented. Marriage connected to professional life and public image.",
  11: "Marriage brings gains and fulfilled wishes. Spouse connected to social networks.",
  12: "Spouse may be from abroad. Marriage involves spiritual growth or some sacrifice.",
};

/** Career indicators: 10th lord in house X */
const LORD10_IN_HOUSE: Record<number, string> = {
  1: "Self-made career. Your personality IS your career. Leadership and entrepreneurship favored.",
  2: "Career connected to finance, speech, food, or family business. Earns well through profession.",
  3: "Career involves communication, writing, media, sales, or short travels. Courage drives success.",
  4: "Career in real estate, agriculture, vehicles, or working from home. Emotional satisfaction from work.",
  5: "Career in education, entertainment, creativity, speculation, or children-related fields.",
  6: "Career in service, healthcare, law, military, or problem-solving. Success through overcoming competition.",
  7: "Career in partnerships, consulting, law, or public-facing roles. Business partnerships drive success.",
  8: "Career in research, insurance, occult, psychology, or investigation. Transformative work.",
  9: "Career in teaching, religion, law, publishing, or international business. Fortune through career.",
  10: "Very strong career placement. Achieves high status and recognition. Government or corporate leadership.",
  11: "Career brings large gains. Success through networking and large organizations. Income-focused work.",
  12: "Career abroad, in hospitals, ashrams, or behind-the-scenes. May involve foreign companies.",
};

/** Health: body part governed by each house */
export const BODY_PART_BY_HOUSE: Record<number, string> = {
  1: "Head, brain, overall constitution",
  2: "Face, right eye, throat, speech organs",
  3: "Arms, shoulders, hands, ears, nervous system",
  4: "Chest, heart, lungs, breasts",
  5: "Stomach, upper abdomen, liver, spleen",
  6: "Lower abdomen, intestines, kidneys",
  7: "Lower back, reproductive organs, bladder",
  8: "Chronic illness zones, reproductive system, rectum",
  9: "Hips, thighs, arteries",
  10: "Knees, joints, bones, skin",
  11: "Ankles, calves, left ear, circulatory system",
  12: "Feet, left eye, sleep disorders, immune system",
};

/** Health: body tissue/system governed by each planet */
export const BODY_PART_BY_PLANET: Record<string, string> = {
  Sun: "Heart, bones, right eye, vitality, spine, blood circulation",
  Moon: "Mind, blood, left eye, fluids, breasts, stomach, sleep",
  Mars: "Muscles, blood (red cells), head injuries, inflammation, surgery, accidents",
  Mercury: "Nervous system, skin, speech, lungs, intestines, analytical mind",
  Jupiter: "Liver, fat tissue, arterial system, ears, expansion of tumors if afflicted",
  Venus: "Reproductive system, kidneys, throat, skin beauty, hormones, diabetes",
  Saturn: "Bones, teeth, joints, chronic diseases, depression, aging, hair, nails",
  Rahu: "Unusual or hard-to-diagnose illness, phobias, toxins, epidemics, mental fog",
  Ketu: "Mysterious ailments, viral infections, spiritual crises, nerve disorders, skin issues",
};

/** Moon in D-30 sign — mental/emotional pattern */
export const D30_MOON_SIGN: Record<string, string> = {
  Aries: "Restless mind, prone to anger and impulsiveness. Needs physical outlets for mental stress.",
  Taurus: "Emotionally stable but can be stubborn. Finds peace through comfort, food, and nature.",
  Gemini: "Anxious, overthinking mind. Mental health improves with communication and intellectual engagement.",
  Cancer: "Deeply emotional, mood swings, attachment issues. Nurturing environment heals.",
  Leo: "Mental confidence but ego sensitivity. Needs recognition to feel emotionally secure.",
  Virgo: "Analytical worry, perfectionism, self-criticism. Benefits from structured routines.",
  Libra: "Seeks mental balance through relationships. Indecisiveness causes inner stress.",
  Scorpio: "Intense emotions, obsessive tendencies, deep psychological patterns. Transformation heals.",
  Sagittarius: "Optimistic outlook but restless spirit. Travel, philosophy, and teaching stabilize mood.",
  Capricorn: "Prone to melancholy and heavy responsibility. Discipline and achievement lift spirits.",
  Aquarius: "Emotionally detached, unconventional inner world. Needs intellectual freedom for mental health.",
  Pisces: "Highly intuitive, absorbs others' emotions. Prone to escapism. Meditation and art heal.",
};

/** Marana Karaka Sthana — house where each planet is severely weakened */
export const MARANA_KARAKA_STHANA: Record<string, number> = {
  Sun: 12,    // Sun dies in house of losses/isolation
  Moon: 8,    // Moon dies in house of death/transformation
  Mars: 7,    // Mars dies in house of partnerships
  Mercury: 4, // Mercury dies in house of home/emotions
  Jupiter: 3, // Jupiter dies in house of courage/short trips
  Venus: 6,   // Venus dies in house of enemies/disease
  Saturn: 1,  // Saturn dies in house of self/personality
  Rahu: 9,    // Rahu dies in house of dharma/fortune
  Ketu: 3,    // Ketu dies in house of courage/effort
};

/** Badhakasthana — the obstructing house based on sign type */
export const BADHAKASTHANA: Record<string, number> = {
  Movable: 11,  // For Aries, Cancer, Libra, Capricorn: 11th house is badhaka
  Fixed: 9,     // For Taurus, Leo, Scorpio, Aquarius: 9th house is badhaka
  Dual: 7,      // For Gemini, Virgo, Sagittarius, Pisces: 7th house is badhaka
};

/** Assembled interpretation tables */
export const INTERPRETATIONS = {
  dashaLordInHouse: DASHA_LORD_IN_HOUSE,
  marriageIndicators: {
    lord7InHouse: LORD7_IN_HOUSE,
    venusInHouse: VENUS_IN_HOUSE,
    ulInHouse: UL_IN_HOUSE,
  },
  careerIndicators: {
    lord10InHouse: LORD10_IN_HOUSE,
  },
  healthIndicators: {
    bodyPartByHouse: BODY_PART_BY_HOUSE,
    bodyPartByPlanet: BODY_PART_BY_PLANET,
    d30MoonSign: D30_MOON_SIGN,
  },
  maranKarakaSthana: MARANA_KARAKA_STHANA,
  badhakasthana: BADHAKASTHANA,
};

// =============================================================================
// HELPERS
// =============================================================================

/** Get house number (1-12) of a planet relative to ascendant */
function houseOf(planetRashi: number, ascRashi: number): number {
  return ((planetRashi - ascRashi + 12) % 12) + 1;
}

/** Find a planet in the chart by name */
function findPlanet(chart: BirthChartData, name: string) {
  return chart.planets.find((p) => p.name === name);
}

/** Get the rashi index of a house lord relative to ascendant */
function houseLordRashi(chart: BirthChartData, houseNum: number): number | null {
  const houseRashi = (chart.ascendant.rashi + houseNum - 1) % 12;
  const lordName = RASHI_LORDS[houseRashi];
  const planet = findPlanet(chart, lordName);
  return planet ? planet.rashi : null;
}

/** Get which house a house lord sits in */
function houseLordInHouse(chart: BirthChartData, houseNum: number): number | null {
  const lordRashi = houseLordRashi(chart, houseNum);
  if (lordRashi === null) return null;
  return houseOf(lordRashi, chart.ascendant.rashi);
}

/** Get all dashas/antardashas that overlap a year range */
function dashasInRange(dashas: DashaPeriod[], startYear: number, endYear: number): DashaPeriod[] {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return dashas.filter((d) => d.startDate <= end && d.endDate >= start);
}

/** Format a date range as "YYYY-YYYY" */
function periodStr(d: DashaPeriod): string {
  return `${d.startDate.getFullYear()}-${d.endDate.getFullYear()}`;
}

/** Get antardasha periods with their house significations */
function antardashaInsights(chart: BirthChartData, md: DashaPeriod): string[] {
  const results: string[] = [];
  const ascSign = chart.ascendant.rashiName;
  if (!md.antardashas) return results;
  for (const ad of md.antardashas) {
    const planet = findPlanet(chart, ad.lord);
    if (!planet) continue;
    const house = houseOf(planet.rashi, chart.ascendant.rashi);
    const houseDesc = DASHA_LORD_IN_HOUSE[house] || "";
    const fav = assessDashaFavorability(ad.lord, ascSign, planet.rashi, chart.ascendant.rashi, planet.isExalted, planet.isDebilitated);
    results.push(`${ad.lord} sub-period (${periodStr(ad)}): House ${house} focus. ${houseDesc} ${fav.favorable ? "Positive" : "Challenging"} period.`);
  }
  return results;
}

/** Check if planet is in Marana Karaka Sthana */
function isInMKS(chart: BirthChartData, planetName: string): boolean {
  const planet = findPlanet(chart, planetName);
  if (!planet) return false;
  const house = houseOf(planet.rashi, chart.ascendant.rashi);
  return MARANA_KARAKA_STHANA[planetName] === house;
}

/** Get sign quality (Movable/Fixed/Dual) */
function signQuality(rashiIndex: number): string {
  const qualities = ["Movable", "Fixed", "Dual", "Movable", "Fixed", "Dual", "Movable", "Fixed", "Dual", "Movable", "Fixed", "Dual"];
  return qualities[rashiIndex];
}

/** Get Upapada Lagna house from arudha padas */
function getUpapadaHouse(chart: BirthChartData): number | null {
  const ul = chart.arudhaPadas.find((a) => a.house === 12);
  if (!ul) return null;
  return houseOf(ul.padaRashi, chart.ascendant.rashi);
}

/** Collect timing-relevant dashas for a set of house lords */
function timingForHouses(chart: BirthChartData, houseNums: number[]): string[] {
  const relevantPlanets = new Set<string>();
  for (const h of houseNums) {
    const houseRashi = (chart.ascendant.rashi + h - 1) % 12;
    relevantPlanets.add(RASHI_LORDS[houseRashi]);
    // Also add planets sitting in these houses
    for (const p of chart.planets) {
      if (houseOf(p.rashi, chart.ascendant.rashi) === h) {
        relevantPlanets.add(p.name);
      }
    }
  }

  // Extract birth year from first dasha start
  const birthYear = chart.vimsottariDasha[0]?.startDate?.getFullYear() ?? 1983;
  const adultYear = birthYear + 18; // Only show periods after age 18

  const nowYear = new Date().getFullYear();
  const past: string[] = [];
  const future: string[] = [];
  for (const md of chart.vimsottariDasha) {
    if (!md.antardashas) continue;
    for (const ad of md.antardashas) {
      if (ad.startDate.getFullYear() < adultYear) continue;
      if (ad.startDate.getFullYear() > birthYear + 100) continue; // 100 years from DOB
      if (relevantPlanets.has(md.lord) || relevantPlanets.has(ad.lord)) {
        const entry = `${md.lord}-${ad.lord} (${periodStr(ad)})`;
        if (ad.endDate.getFullYear() <= nowYear) {
          past.push(entry);
        } else {
          future.push(entry);
        }
      }
    }
  }
  // Return future periods first, then past — so future is always visible
  const results: string[] = [];
  if (future.length > 0) {
    results.push("UPCOMING PERIODS:");
    results.push(...future.slice(0, 5));
  }
  if (past.length > 0) {
    results.push("\nPAST PERIODS:");
    results.push(...past.slice(-5));
  }
  return results;
}

// =============================================================================
// 2. COMPUTATION REGISTRY
// =============================================================================

export const COMPUTATION_REGISTRY: Record<string, {
  name: string;
  description: string;
  requiredInputs: string[];
  optionalInputs: string[];
  compute: (chart: BirthChartData, params?: Record<string, any>) => string;
}> = {

  // ---------------------------------------------------------------------------
  // TIMING COMPUTATIONS
  // ---------------------------------------------------------------------------

  marriage_timing: {
    name: "Marriage Timing",
    description: "Predicts when marriage happened or will happen based on 7th house, Venus, Upapada Lagna, and dasha periods.",
    requiredInputs: ["birth_data"],
    optionalInputs: ["actual_marriage_year"],
    compute: (chart, params) => {
      const lines: string[] = ["MARRIAGE TIMING ANALYSIS\n"];

      // --- TYPE OF MARRIAGE (love vs arranged) ---
      const venus = findPlanet(chart, "Venus");
      const lord5House = houseLordInHouse(chart, 5);
      const lord7House = houseLordInHouse(chart, 7);
      const venusHouse = venus ? houseOf(venus.rashi, chart.ascendant.rashi) : 0;

      // Love marriage indicators: Venus in 5th, 5th lord in 7th, 7th lord in 5th, Venus conjunct 5th lord
      const loveIndicators: string[] = [];
      if (venusHouse === 5) loveIndicators.push("Venus in the 5th house of romance");
      if (lord5House === 7) loveIndicators.push("5th lord (romance) sitting in the 7th house of marriage");
      if (lord7House === 5) loveIndicators.push("7th lord (spouse) sitting in the 5th house of love");
      const lord5Rashi = houseLordRashi(chart, 5);
      if (venus && lord5Rashi !== null && venus.rashi === lord5Rashi) loveIndicators.push("Venus conjunct the 5th lord");
      // Rahu in 7th can also indicate unconventional marriage
      const rahu = findPlanet(chart, "Rahu");
      if (rahu && houseOf(rahu.rashi, chart.ascendant.rashi) === 7) loveIndicators.push("Rahu in the 7th house suggesting an unconventional union");

      if (loveIndicators.length >= 2) {
        lines.push(`TYPE: Strong love marriage indicators — ${loveIndicators.join(", ")}. This chart leans heavily toward a self-chosen partner.`);
      } else if (loveIndicators.length === 1) {
        lines.push(`TYPE: Some romantic element likely in how you meet your spouse (${loveIndicators[0]}), but the match may still involve family approval or introduction.`);
      } else {
        lines.push("TYPE: The chart favors a traditionally arranged or family-introduced marriage. The partner is likely to come through family networks, community, or matchmaking.");
      }

      // --- 7th lord analysis ---
      if (lord7House) {
        lines.push(`\nYour marriage significator sits in house ${lord7House}: ${LORD7_IN_HOUSE[lord7House]}`);
      }

      // --- Venus analysis ---
      if (venus) {
        lines.push(`\nVenus (love planet) in house ${venusHouse}: ${VENUS_IN_HOUSE[venusHouse]}`);
        if (venus.isExalted) lines.push("Venus is exalted — relationships are blessed with grace, attraction, and natural ease.");
        if (venus.isDebilitated) lines.push("Venus is debilitated — relationships require extra patience and conscious effort. Growth comes through working on the relationship.");
        if (venus.isRetrograde) lines.push("Venus is retrograde — you may revisit past relationships or take time to understand what you truly want in love before committing.");
      }

      // --- QUALITY OF MARRIED LIFE (from Navamsa 7th house) ---
      const nav7Rashi = (chart.navamsa.ascendant.rashi + 6) % 12;
      const nav7Sign = RASHI_NAMES[nav7Rashi];
      const nav7Traits = RASHI_DETAILED_TRAITS[nav7Sign];
      lines.push(`\nMARRIED LIFE QUALITY (Navamsa 7th house in ${nav7Sign}):`);
      if (nav7Traits) {
        lines.push(`The deeper texture of your marriage carries ${nav7Sign} energy — ${nav7Traits.personality.split(".")[0].toLowerCase()}.`);
      }
      // Check planets in Navamsa 7th
      const nav7Planets = chart.navamsa.planets.filter((p) => p.rashi === nav7Rashi);
      if (nav7Planets.length > 0) {
        const nav7Names = nav7Planets.map((p) => p.name).join(", ");
        lines.push(`${nav7Names} in your Navamsa 7th house — ${nav7Planets.length > 1 ? "these planets color" : "this planet colors"} your married life with ${nav7Planets.map((p) => {
          if (p.name === "Jupiter") return "wisdom and growth";
          if (p.name === "Venus") return "love and harmony";
          if (p.name === "Saturn") return "commitment but also distance or delay";
          if (p.name === "Mars") return "passion but also occasional friction";
          if (p.name === "Mercury") return "communication and intellectual bonding";
          if (p.name === "Sun") return "pride and authority dynamics";
          if (p.name === "Moon") return "deep emotional connection";
          if (p.name === "Rahu") return "unconventional dynamics";
          if (p.name === "Ketu") return "spiritual bonding but possible detachment";
          return "unique energy";
        }).join(" and ")}.`);
      }

      // --- SPOUSE CHARACTERISTICS (from Darakaraka and Navamsa 7th lord) ---
      const dk = chart.charaKarakas.find((ck) => ck.karaka === "DK" || ck.karaka === "Darakaraka");
      if (dk) {
        const dkPlanet = findPlanet(chart, dk.planet);
        if (dkPlanet) {
          const dkSign = dkPlanet.rashiName;
          lines.push(`\nSPOUSE PROFILE (Darakaraka ${dk.planet} in ${dkSign}):`);
          const spouseTraits: Record<string, string> = {
            Sun: "Your spouse carries natural authority, dignity, and leadership. They are likely confident, possibly connected to government or management.",
            Moon: "Your spouse is nurturing, emotionally sensitive, and caring. They create a warm home environment and are deeply intuitive.",
            Mars: "Your spouse is energetic, assertive, and action-oriented. They may be athletic, competitive, or work in engineering/military/surgery.",
            Mercury: "Your spouse is intelligent, communicative, and youthful in spirit. They may be in business, writing, accounting, or tech.",
            Jupiter: "Your spouse is wise, generous, and well-educated. They may be a teacher, counselor, or someone with strong values.",
            Venus: "Your spouse is attractive, artistic, and refined. They appreciate beauty, luxury, and the finer things in life.",
            Saturn: "Your spouse is mature, disciplined, and hardworking. They may be older or carry responsibilities seriously. The bond deepens with time.",
          };
          if (spouseTraits[dk.planet]) lines.push(spouseTraits[dk.planet]);
        }
      }

      // Upapada Lagna
      const ulHouse = getUpapadaHouse(chart);
      if (ulHouse) {
        lines.push(`\nUpapada Lagna in house ${ulHouse}: ${UL_IN_HOUSE[ulHouse]}`);
      }

      // D-9 (Navamsa) lagna
      lines.push(`\nNavamsa (marriage chart) Ascendant: ${chart.navamsa.ascendant.rashiName}`);
      const navVenus = chart.navamsa.planets.find((p) => p.name === "Venus");
      if (navVenus) {
        lines.push(`Venus in Navamsa: ${navVenus.rashiName} — this colors the quality of married life.`);
      }

      // --- TIMING with WHY explanations ---
      lines.push("\nKey marriage timing periods:");
      const relevantHouses = [7, 2, 11];
      const relevantPlanets = new Set<string>();
      for (const h of relevantHouses) {
        const houseRashi = (chart.ascendant.rashi + h - 1) % 12;
        relevantPlanets.add(RASHI_LORDS[houseRashi]);
        for (const p of chart.planets) {
          if (houseOf(p.rashi, chart.ascendant.rashi) === h) relevantPlanets.add(p.name);
        }
      }
      // Add Venus as natural karaka
      relevantPlanets.add("Venus");

      const birthYear = chart.vimsottariDasha[0]?.startDate?.getFullYear() ?? 1983;
      const nowYear = new Date().getFullYear();
      const futureEntries: string[] = [];
      const pastEntries: string[] = [];

      for (const md of chart.vimsottariDasha) {
        if (!md.antardashas) continue;
        for (const ad of md.antardashas) {
          if (ad.startDate.getFullYear() < birthYear + 18) continue;
          if (ad.startDate.getFullYear() > birthYear + 100) continue;
          if (relevantPlanets.has(md.lord) || relevantPlanets.has(ad.lord)) {
            // Build a WHY explanation
            const reasons: string[] = [];
            const mdPlanet = findPlanet(chart, md.lord);
            const adPlanet = findPlanet(chart, ad.lord);
            if (mdPlanet) {
              const mdH = houseOf(mdPlanet.rashi, chart.ascendant.rashi);
              if (mdH === 7) reasons.push(`${md.lord} directly activates your partnership house`);
              else if (mdH === 2) reasons.push(`${md.lord} activates family and commitment`);
              else if (mdH === 11) reasons.push(`${md.lord} activates fulfillment of desires`);
            }
            if (adPlanet) {
              const adH = houseOf(adPlanet.rashi, chart.ascendant.rashi);
              if (adH === 7) reasons.push(`${ad.lord} triggers the marriage house`);
              else if (adH === 2) reasons.push(`${ad.lord} brings family events`);
              else if (adH === 11) reasons.push(`${ad.lord} brings wish fulfillment`);
            }
            if (md.lord === "Venus" || ad.lord === "Venus") reasons.push("Venus period naturally activates love and marriage");

            const why = reasons.length > 0 ? ` — ${reasons.join("; ")}` : "";
            const entry = `${md.lord}-${ad.lord} (${periodStr(ad)})${why}`;

            if (ad.endDate.getFullYear() <= nowYear) {
              pastEntries.push(entry);
            } else {
              futureEntries.push(entry);
            }
          }
        }
      }

      if (futureEntries.length > 0) {
        lines.push("UPCOMING PERIODS:");
        lines.push(...futureEntries.slice(0, 5));
      }
      if (pastEntries.length > 0) {
        lines.push("\nPAST PERIODS:");
        lines.push(...pastEntries.slice(-3));
      }

      if (params?.actual_marriage_year) {
        const year = params.actual_marriage_year;
        const matchingDashas = dashasInRange(chart.vimsottariDasha, year, year);
        if (matchingDashas.length > 0) {
          lines.push(`\nAt your actual marriage year (${year}), you were running: ${matchingDashas.map((d) => d.lord).join("-")} dasha.`);
        }
      }

      return lines.join("\n");
    },
  },

  career_timing: {
    name: "Career Timing",
    description: "Career changes, promotions, job loss timing based on 10th house, Saturn, and dasha periods.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["CAREER TIMING ANALYSIS\n"];

      // --- CAREER TYPE from D-10 and 10th lord ---
      const lord10House = houseLordInHouse(chart, 10);
      if (lord10House) {
        lines.push(`Your career lord sits in house ${lord10House}: ${LORD10_IN_HOUSE[lord10House]}`);
      }

      // D-10 planet analysis for career type
      const d10Planets = chart.dasamsa.planets;
      const d10_10Rashi = (chart.dasamsa.ascendant.rashi + 9) % 12;
      const d10InTenth = d10Planets.filter((p) => p.rashi === d10_10Rashi);
      if (d10InTenth.length > 0) {
        const careerFlavors: string[] = d10InTenth.map((p) => {
          if (p.name === "Sun") return "leadership, government, or authority roles";
          if (p.name === "Moon") return "public-facing work, hospitality, or nurturing professions";
          if (p.name === "Mars") return "engineering, military, sports, surgery, or real estate";
          if (p.name === "Mercury") return "communication, writing, business, IT, or accounting";
          if (p.name === "Jupiter") return "teaching, law, consulting, finance, or advisory roles";
          if (p.name === "Venus") return "arts, entertainment, luxury goods, fashion, or diplomacy";
          if (p.name === "Saturn") return "manufacturing, mining, labor-intensive work, or government service";
          if (p.name === "Rahu") return "technology, foreign companies, unconventional industries, or media";
          if (p.name === "Ketu") return "research, spiritual work, alternative medicine, or behind-the-scenes roles";
          return "specialized work";
        });
        lines.push(`\nCAREER TYPE INDICATORS: Planets in D-10 10th house point toward ${careerFlavors.join(" combined with ")}.`);
      }

      // --- BUSINESS vs SERVICE ---
      // Compare 7th house (business/partnership) vs 6th house (service/employment) strength in D-10
      const d10_7Rashi = (chart.dasamsa.ascendant.rashi + 6) % 12;
      const d10_6Rashi = (chart.dasamsa.ascendant.rashi + 5) % 12;
      const d10In7 = d10Planets.filter((p) => p.rashi === d10_7Rashi);
      const d10In6 = d10Planets.filter((p) => p.rashi === d10_6Rashi);
      const sav7d1 = chart.ashtakavarga.sarva[(chart.ascendant.rashi + 6) % 12];
      const sav6d1 = chart.ashtakavarga.sarva[(chart.ascendant.rashi + 5) % 12];

      if (d10In7.length > d10In6.length || sav7d1 > sav6d1 + 3) {
        lines.push("\nBUSINESS vs SERVICE: Your chart favors independent business, partnerships, or consulting. The entrepreneurial path has stronger planetary support for you.");
      } else if (d10In6.length > d10In7.length || sav6d1 > sav7d1 + 3) {
        lines.push("\nBUSINESS vs SERVICE: Your chart leans toward employment, service roles, or working within established organizations. You thrive with structured environments.");
      } else {
        lines.push("\nBUSINESS vs SERVICE: Both paths are viable for you. You could succeed in employment or business — the running dasha period will tip the balance.");
      }

      // --- CURRENT CAREER ENERGY ---
      const currentMD = getCurrentDasha(chart.vimsottariDasha);
      if (currentMD) {
        const mdPlanet = findPlanet(chart, currentMD.lord);
        if (mdPlanet) {
          const mdHouse = houseOf(mdPlanet.rashi, chart.ascendant.rashi);
          const careerHouses = [10, 6, 7, 11, 2];
          if (careerHouses.includes(mdHouse)) {
            lines.push(`\nCURRENT CAREER ENERGY: Strong — your current major period lord ${currentMD.lord} directly activates house ${mdHouse}, which is career-relevant. This is an active professional phase.`);
          } else if ([1, 5, 9].includes(mdHouse)) {
            lines.push(`\nCURRENT CAREER ENERGY: Growth-oriented — your ${currentMD.lord} period activates house ${mdHouse}, bringing personal development, learning, and visibility that supports career indirectly.`);
          } else {
            lines.push(`\nCURRENT CAREER ENERGY: Moderate — your ${currentMD.lord} period focuses on house ${mdHouse} matters. Career changes are possible but not the primary theme right now.`);
          }
        }
      }

      // D-10 (Dasamsa) analysis
      lines.push(`\nDasamsa (career chart) Ascendant: ${chart.dasamsa.ascendant.rashiName}`);
      const d10Sun = chart.dasamsa.planets.find((p) => p.name === "Sun");
      const d10Saturn = chart.dasamsa.planets.find((p) => p.name === "Saturn");
      if (d10Sun) lines.push(`Sun in D-10: ${d10Sun.rashiName} — your authority and leadership expression at work.`);
      if (d10Saturn) lines.push(`Saturn in D-10: ${d10Saturn.rashiName} — your work ethic, discipline, and career longevity.`);

      // Saturn analysis (karaka for career)
      const saturn = findPlanet(chart, "Saturn");
      if (saturn) {
        const satHouse = houseOf(saturn.rashi, chart.ascendant.rashi);
        lines.push(`\nSaturn (career planet) in house ${satHouse}: ${PLANET_IN_HOUSE_MEANING["Saturn"]?.[satHouse] || ""}`);
      }

      // --- STRENGTHS TO LEVERAGE ---
      const strengths: string[] = [];
      for (const p of chart.planets) {
        if (p.isExalted) {
          const h = houseOf(p.rashi, chart.ascendant.rashi);
          strengths.push(`${p.name} exalted in house ${h} — leverage ${p.name === "Sun" ? "leadership and authority" : p.name === "Moon" ? "emotional intelligence and public connect" : p.name === "Mars" ? "courage, drive, and technical skills" : p.name === "Mercury" ? "communication and analytical ability" : p.name === "Jupiter" ? "wisdom, teaching, and advisory roles" : p.name === "Venus" ? "creativity, aesthetics, and people skills" : p.name === "Saturn" ? "discipline, structure, and long-term planning" : "this planet's energy"} for career growth`);
        }
      }
      if (strengths.length > 0) {
        lines.push("\nKEY STRENGTHS TO LEVERAGE:");
        lines.push(strengths.join("\n"));
      }

      // --- TIMING with career event type ---
      lines.push("\nKey career timing periods:");
      const relevantPlanets = new Set<string>();
      for (const h of [10, 6, 11]) {
        const houseRashi = (chart.ascendant.rashi + h - 1) % 12;
        relevantPlanets.add(RASHI_LORDS[houseRashi]);
        for (const p of chart.planets) {
          if (houseOf(p.rashi, chart.ascendant.rashi) === h) relevantPlanets.add(p.name);
        }
      }

      const birthYear = chart.vimsottariDasha[0]?.startDate?.getFullYear() ?? 1983;
      const nowYear = new Date().getFullYear();
      const ascSign = chart.ascendant.rashiName;
      const futureEntries: string[] = [];
      const pastEntries: string[] = [];

      for (const md of chart.vimsottariDasha) {
        if (!md.antardashas) continue;
        for (const ad of md.antardashas) {
          if (ad.startDate.getFullYear() < birthYear + 18) continue;
          if (ad.startDate.getFullYear() > birthYear + 100) continue;
          if (relevantPlanets.has(md.lord) || relevantPlanets.has(ad.lord)) {
            const adPlanet = findPlanet(chart, ad.lord);
            const mdPlanet = findPlanet(chart, md.lord);
            let eventType = "";
            if (adPlanet) {
              const adH = houseOf(adPlanet.rashi, chart.ascendant.rashi);
              const fav = assessDashaFavorability(ad.lord, ascSign, adPlanet.rashi, chart.ascendant.rashi, adPlanet.isExalted, adPlanet.isDebilitated);
              if (adH === 10 && fav.favorable) eventType = " → promotion or recognition likely";
              else if (adH === 11 && fav.favorable) eventType = " → income growth, gains from profession";
              else if (adH === 7) eventType = " → business partnerships or independent ventures";
              else if (adH === 6 && !fav.favorable) eventType = " → work conflicts or job changes";
              else if (adH === 8) eventType = " → sudden career transformation";
              else if (adH === 12) eventType = " → foreign assignment or career pause";
              else if (adH === 1 && fav.favorable) eventType = " → new career identity or fresh start";
              else if (fav.favorable) eventType = " → positive career developments";
              else eventType = " → career challenges requiring patience";
            }
            const entry = `${md.lord}-${ad.lord} (${periodStr(ad)})${eventType}`;
            if (ad.endDate.getFullYear() <= nowYear) pastEntries.push(entry);
            else futureEntries.push(entry);
          }
        }
      }

      if (futureEntries.length > 0) {
        lines.push("UPCOMING PERIODS:");
        lines.push(...futureEntries.slice(0, 5));
      }
      if (pastEntries.length > 0) {
        lines.push("\nPAST PERIODS:");
        lines.push(...pastEntries.slice(-3));
      }

      return lines.join("\n");
    },
  },

  children_timing: {
    name: "Children Timing",
    description: "Predicts when children are born based on 5th house and Jupiter periods.",
    requiredInputs: ["birth_data"],
    optionalInputs: ["marriage_year", "actual_children_years"],
    compute: (chart, params) => {
      const lines: string[] = ["CHILDREN TIMING ANALYSIS\n"];

      // --- NUMBER OF CHILDREN INDICATION ---
      // From 5th house strength and Jupiter's condition
      const sav5 = chart.ashtakavarga.sarva[(chart.ascendant.rashi + 4) % 12];
      const sav9 = chart.ashtakavarga.sarva[(chart.ascendant.rashi + 8) % 12];
      const jupiter = findPlanet(chart, "Jupiter");
      const lord5House = houseLordInHouse(chart, 5);

      // Count planets in 5th house
      const planetsIn5 = chart.planets.filter((p) => houseOf(p.rashi, chart.ascendant.rashi) === 5);
      // Check if Rahu/Ketu afflict 5th
      const rahuIn5 = planetsIn5.some((p) => p.name === "Rahu");
      const ketuIn5 = planetsIn5.some((p) => p.name === "Ketu");
      const saturnIn5 = planetsIn5.some((p) => p.name === "Saturn");

      let childrenCount = "two or more children";
      if ((rahuIn5 || ketuIn5) && saturnIn5) {
        childrenCount = "possibly one child, with some delays or difficulties in conceiving";
      } else if (rahuIn5 || ketuIn5) {
        childrenCount = "one to two children, with some karmic complexity around children";
      } else if (saturnIn5) {
        childrenCount = "children likely come with some delay, but Saturn's discipline brings responsible parenting";
      } else if (sav5 >= 30 && jupiter && !jupiter.isDebilitated) {
        childrenCount = "two or more children, with the 5th house well-supported";
      } else if (sav5 < 22) {
        childrenCount = "fewer children or some challenges around children — focused attention on each child";
      }
      lines.push(`CHILDREN INDICATION: The chart suggests ${childrenCount}.`);
      lines.push(`5th house strength: ${sav5} Ashtakavarga points${sav5 >= 28 ? " (strong)" : sav5 < 22 ? " (needs support)" : " (moderate)"}.`);

      // --- GENDER INDICATION from 5th house sign ---
      const house5Rashi = (chart.ascendant.rashi + 4) % 12;
      const house5Sign = RASHI_NAMES[house5Rashi];
      // Odd signs (Aries, Gemini, Leo, Libra, Sag, Aquarius = indexes 0,2,4,6,8,10) indicate male
      const isOddSign = house5Rashi % 2 === 0;
      lines.push(`\n5th house sign is ${house5Sign} (${isOddSign ? "odd/masculine" : "even/feminine"} sign) — the first child may lean toward ${isOddSign ? "male" : "female"}, though this is one of several indicators and not definitive.`);

      // --- RELATIONSHIP WITH CHILDREN ---
      if (lord5House) {
        lines.push(`\nYour 5th lord (children) sits in house ${lord5House}: ${DASHA_LORD_IN_HOUSE[lord5House]}`);
        if (lord5House === 1) lines.push("Children are closely identified with you — you see yourself in them and they shape your identity.");
        else if (lord5House === 4) lines.push("Children bring happiness to your home life. Strong emotional bond with children.");
        else if (lord5House === 7) lines.push("Children may connect you to your spouse more deeply, or play a role in partnerships.");
        else if (lord5House === 9) lines.push("Excellent — children bring fortune and continue your legacy. You are a natural mentor to them.");
        else if (lord5House === 10) lines.push("Children may be connected to your career or bring you public recognition as a parent.");
        else if (lord5House === 6) lines.push("Some challenges or health concerns around children may arise, but overcome with care.");
        else if (lord5House === 8) lines.push("Deep transformative experiences through children. The bond grows through overcoming difficulties together.");
        else if (lord5House === 12) lines.push("Children may settle far from you, or you may sacrifice significantly for their welfare. The bond is spiritual.");
      }

      if (jupiter) {
        const jupHouse = houseOf(jupiter.rashi, chart.ascendant.rashi);
        lines.push(`\nJupiter (natural significator of children) in house ${jupHouse}: ${PLANET_IN_HOUSE_MEANING["Jupiter"]?.[jupHouse] || ""}`);
        if (jupiter.isExalted) lines.push("Jupiter exalted — children are a tremendous source of blessing, joy, and pride.");
        if (jupiter.isDebilitated) lines.push("Jupiter debilitated — children may come with delays or challenges, but they ultimately teach you profound patience and unconditional love.");
        if (jupiter.isRetrograde) lines.push("Jupiter retrograde — blessings related to children may come in unexpected ways or timing.");
      }

      // Timing via houses 5, 9 (children, fortune), 2 (family growth)
      lines.push("\nKey children timing periods:");
      let periods = timingForHouses(chart, [5, 9, 2]);

      // Filter: children come AFTER marriage
      const marriageYear = params?.marriage_year ? Number(params.marriage_year) : null;
      if (marriageYear) {
        periods = periods.filter(p => {
          const yearMatch = p.match(/\((\d{4})/);
          return yearMatch ? Number(yearMatch[1]) >= marriageYear : true;
        });
        lines.push(`(Filtered to periods after marriage year ${marriageYear})`);
      }
      lines.push(periods.slice(0, 10).join("\n"));

      if (params?.actual_children_years) {
        for (const year of params.actual_children_years) {
          const matchingDashas = dashasInRange(chart.vimsottariDasha, year, year);
          if (matchingDashas.length > 0) {
            lines.push(`At child born in ${year}: running ${matchingDashas.map((d) => d.lord).join("-")} dasha.`);
          }
        }
      }

      return lines.join("\n");
    },
  },

  difficult_periods: {
    name: "Difficult Periods",
    description: "Identifies losses, setbacks, health crises, and accidents from dusthana lords, MKS planets, and malefic dashas.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["DIFFICULT PERIODS ANALYSIS\n"];
      const ascSign = chart.ascendant.rashiName;
      const nowYear = new Date().getFullYear();

      // Check Marana Karaka Sthana planets with DETAILED effects
      const mksWarnings: string[] = [];
      for (const planet of chart.planets) {
        if (isInMKS(chart, planet.name)) {
          const house = houseOf(planet.rashi, chart.ascendant.rashi);
          const mksEffects: Record<string, string> = {
            Sun: "vitality drops, authority figures cause problems, father's health may suffer, career setbacks through ego conflicts",
            Moon: "deep emotional disturbance, anxiety, depression risk, mother's health concerns, sleep disorders, feeling emotionally unsafe",
            Mars: "relationship conflicts, partnership breakdowns, physical injuries from recklessness, blood-related health issues",
            Mercury: "mental restlessness at home, property disputes, education disruptions, nervous system complaints",
            Jupiter: "poor judgment in daily decisions, conflicts with siblings, wisdom fails in practical matters, spiritual stagnation",
            Venus: "relationship disappointments through illness or enemies, romantic betrayals, kidney or reproductive health issues, creative blocks",
            Saturn: "chronic health issues, identity crisis, feeling burdened by existence, delayed recognition despite hard work",
          };
          mksWarnings.push(`${planet.name} is in Marana Karaka Sthana (house ${house}) — severely weakened. During ${planet.name} periods: ${mksEffects[planet.name] || "challenges related to " + (BODY_PART_BY_PLANET[planet.name] || "its significations")}.`);
        }
      }
      if (mksWarnings.length > 0) {
        lines.push("CRITICAL WEAKNESS DETECTED:");
        lines.push(mksWarnings.join("\n"));
      }

      // Badhakasthana analysis — DETAILED
      const ascQuality = signQuality(chart.ascendant.rashi);
      const badhakHouse = BADHAKASTHANA[ascQuality];
      if (badhakHouse) {
        const badhakRashi = (chart.ascendant.rashi + badhakHouse - 1) % 12;
        const badhakLord = RASHI_LORDS[badhakRashi];
        const badhakPlanet = findPlanet(chart, badhakLord);
        lines.push(`\nBADHAKA (INEXPLICABLE TROUBLES):`);
        lines.push(`Your ascendant is ${ascQuality}, so house ${badhakHouse} is your Badhakasthana, ruled by ${badhakLord}.`);
        lines.push(`Periods of ${badhakLord} can bring sudden obstacles that seem to come from nowhere — legal tangles, bureaucratic blocks, health mysteries, or spiritual disturbances that defy logical explanation.`);
        if (badhakPlanet) {
          const bpHouse = houseOf(badhakPlanet.rashi, chart.ascendant.rashi);
          lines.push(`${badhakLord} sits in your house ${bpHouse}, so these obstructions manifest through ${HOUSE_SIGNIFICATIONS[bpHouse - 1]?.split(",")[0] || "that area of life"}.`);
          const remedy = REMEDIES[badhakLord];
          if (remedy) {
            lines.push(`Mitigation: Worship ${remedy.deity} and recite "${remedy.mantra}" during ${badhakLord} periods.`);
          }
        }
      }

      // --- DIFFICULTY TYPE for past/future periods ---
      lines.push("\nCHALLENGING TIMING PERIODS:");

      const relevantPlanets = new Set<string>();
      for (const h of [6, 8, 12]) {
        const houseRashi = (chart.ascendant.rashi + h - 1) % 12;
        relevantPlanets.add(RASHI_LORDS[houseRashi]);
        for (const p of chart.planets) {
          if (houseOf(p.rashi, chart.ascendant.rashi) === h) relevantPlanets.add(p.name);
        }
      }

      const birthYear = chart.vimsottariDasha[0]?.startDate?.getFullYear() ?? 1983;
      const pastEntries: string[] = [];
      const futureEntries: string[] = [];

      for (const md of chart.vimsottariDasha) {
        if (!md.antardashas) continue;
        for (const ad of md.antardashas) {
          if (ad.startDate.getFullYear() < birthYear + 5) continue;
          if (ad.startDate.getFullYear() > birthYear + 100) continue;
          if (relevantPlanets.has(md.lord) || relevantPlanets.has(ad.lord)) {
            const adPlanet = findPlanet(chart, ad.lord);
            let difficultyType = "";
            if (adPlanet) {
              const adH = houseOf(adPlanet.rashi, chart.ascendant.rashi);
              if (adH === 6) difficultyType = " — health issues, debts, enemies, or legal problems";
              else if (adH === 8) difficultyType = " — sudden loss, accidents, chronic illness flare-ups, or emotional crisis";
              else if (adH === 12) difficultyType = " — financial drain, isolation, hospitalization, or forced separation";
              else if (adH === 2) difficultyType = " — family conflicts or financial strain";
              else if (adH === 7) difficultyType = " — relationship or partnership troubles";
              else if (adH === 1) difficultyType = " — health and identity challenges";
              else difficultyType = " — general obstacles and delays";
            }
            const entry = `${md.lord}-${ad.lord} (${periodStr(ad)})${difficultyType}`;
            if (ad.endDate.getFullYear() <= nowYear) pastEntries.push(entry);
            else futureEntries.push(entry);
          }
        }
      }

      if (futureEntries.length > 0) {
        lines.push("\nUPCOMING CHALLENGING PERIODS (what to prepare for):");
        for (const entry of futureEntries.slice(0, 5)) {
          lines.push(entry);
        }
        lines.push("\nMITIGATION STRATEGIES: During these periods, avoid risky investments, get regular health checkups, maintain strong relationships, and follow the remedies section for the relevant planets.");
      }
      if (pastEntries.length > 0) {
        lines.push("\nPAST CHALLENGING PERIODS (for validation):");
        lines.push(...pastEntries.slice(-5));
      }

      // Debilitated planet periods with SPECIFIC difficulty types
      const debPlanets = chart.planets.filter((p) => p.isDebilitated);
      if (debPlanets.length > 0) {
        lines.push("\nDEBILITATED PLANETS (periods bring specific struggles):");
        for (const p of debPlanets) {
          const debEffects: Record<string, string> = {
            Sun: "confidence drops, authority figures become hostile, father figures cause worry, career recognition is blocked despite effort",
            Moon: "emotional turbulence, mental health concerns, difficulty finding inner peace, mother's health may suffer",
            Mars: "low energy, courage fails at crucial moments, siblings cause problems, property disputes, accident-prone",
            Mercury: "poor decisions in business, communication breakdowns, skin or nerve issues, educational setbacks",
            Jupiter: "financial misjudgments, loss of faith, relationship with children strained, bad advice from mentors",
            Venus: "love disappointments, financial losses through luxury or women, reproductive health concerns, artistic blocks",
            Saturn: "career collapses, chronic disease flares, overwhelming responsibilities, loneliness, delayed results in everything",
          };
          lines.push(`${p.name} debilitated in ${p.rashiName}: ${debEffects[p.name] || "struggles related to " + (BODY_PART_BY_PLANET[p.name] || "its significations")}.`);
        }
      }

      return lines.join("\n");
    },
  },

  wealth_periods: {
    name: "Wealth Periods",
    description: "Financial gains, income growth periods based on 2nd, 11th house and benefic dashas.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["WEALTH PERIODS ANALYSIS\n"];

      // --- HOW YOU EARN BEST (2nd lord placement) ---
      const lord2House = houseLordInHouse(chart, 2);
      const lord11House = houseLordInHouse(chart, 11);
      if (lord2House) {
        lines.push(`2nd lord (wealth) in house ${lord2House}: ${DASHA_LORD_IN_HOUSE[lord2House]}`);
        const earningStyle: Record<number, string> = {
          1: "You earn best through personal initiative, self-branding, and putting yourself out there. Your personality IS your earning tool.",
          2: "Wealth accumulates steadily through savings, family business, or inherited financial sense. You have a natural banker's instinct.",
          3: "You earn through communication — writing, media, sales, marketing, or entrepreneurial ventures requiring courage.",
          4: "Real estate, vehicles, agriculture, or home-based business bring the best returns. Property is your wealth builder.",
          5: "Speculation, creative work, education sector, or entertainment generate your best income. Smart risks pay off.",
          6: "Service sector, healthcare, law, or competitive industries are your money zones. You earn by solving others' problems.",
          7: "Business partnerships, consulting, client work, or marriage bring financial growth. Others' money flows to you through collaboration.",
          8: "Insurance, inheritance, joint finances, research, or other people's resources build your wealth. Sudden financial events are common.",
          9: "Teaching, publishing, international business, law, or spiritual/religious work generate the best income. Fortune favors your finances.",
          10: "Career and professional achievement are your primary wealth source. The higher you climb, the more you earn.",
          11: "Networking, large organizations, friends in high places, and social connections bring financial gains. Your network IS your net worth.",
          12: "Foreign income, exports, online business, or work in isolation (research, writing, spiritual work) generate wealth. Spending wisely is key.",
        };
        lines.push(`EARNING STYLE: ${earningStyle[lord2House] || ""}`);
      }

      // --- SOURCE OF GAINS (11th house planets) ---
      const planetsIn11 = chart.planets.filter((p) => houseOf(p.rashi, chart.ascendant.rashi) === 11);
      if (planetsIn11.length > 0) {
        lines.push("\nSOURCES OF GAINS (planets in 11th house):");
        for (const p of planetsIn11) {
          const gainSource: Record<string, string> = {
            Sun: "Gains through government, authority figures, father, or leadership roles.",
            Moon: "Gains through public, women, mother, liquids, hospitality, or nurturing professions.",
            Mars: "Gains through real estate, engineering, military, sports, or competitive fields.",
            Mercury: "Gains through business, communication, writing, trade, or intellectual work.",
            Jupiter: "Gains through teaching, finance, law, consulting, or wisdom-based professions. Very auspicious for wealth.",
            Venus: "Gains through arts, entertainment, luxury goods, women, or beauty industry.",
            Saturn: "Gains through hard work, labor, manufacturing, or serving the underprivileged. Slow but steady income growth.",
            Rahu: "Gains through technology, foreign connections, unconventional means, or sudden windfalls.",
            Ketu: "Gains through spiritual work, research, alternative medicine, or detachment-based wisdom.",
          };
          lines.push(`${p.name} in 11th: ${gainSource[p.name] || "Unique gains through " + p.name + "'s energy."}`);
        }
      }
      if (lord11House) lines.push(`11th lord (gains) in house ${lord11House}: ${DASHA_LORD_IN_HOUSE[lord11House]}`);

      // --- WINDFALL POTENTIAL (8th house) ---
      const lord8House = houseLordInHouse(chart, 8);
      const planetsIn8 = chart.planets.filter((p) => houseOf(p.rashi, chart.ascendant.rashi) === 8);
      lines.push("\nWINDFALL & SUDDEN WEALTH POTENTIAL:");
      if (planetsIn8.some((p) => p.name === "Jupiter")) {
        lines.push("Jupiter in 8th house — strong potential for inheritance, insurance payouts, or spouse's wealth flowing to you. Sudden financial blessings possible.");
      } else if (planetsIn8.some((p) => p.name === "Venus")) {
        lines.push("Venus in 8th house — wealth through marriage or partner's resources is likely. Sudden gains through beauty, entertainment, or luxury sectors.");
      } else if (planetsIn8.some((p) => p.name === "Rahu")) {
        lines.push("Rahu in 8th house — sudden unexpected money events (both gains and losses). Speculation and joint ventures carry both high reward and high risk.");
      } else if (lord8House && [2, 11, 9, 5].includes(lord8House)) {
        lines.push("8th lord connects to wealth houses — occasional windfalls through inheritance, insurance, tax benefits, or partner's resources are indicated.");
      } else {
        lines.push("Windfall potential is moderate — steady earning is more reliable for you than relying on sudden gains.");
      }

      // --- SPENDING TENDENCIES (12th house) ---
      const lord12House = houseLordInHouse(chart, 12);
      const planetsIn12 = chart.planets.filter((p) => houseOf(p.rashi, chart.ascendant.rashi) === 12);
      lines.push("\nSPENDING PATTERN:");
      if (planetsIn12.some((p) => p.name === "Venus")) {
        lines.push("Venus in 12th — you spend generously on luxury, comfort, travel, and pleasures. Beautiful things are hard to resist. Budget consciously.");
      } else if (planetsIn12.some((p) => p.name === "Mars")) {
        lines.push("Mars in 12th — impulsive spending or expenses through property, vehicles, or medical bills. Channel this into foreign ventures or spiritual pursuits.");
      } else if (planetsIn12.some((p) => p.name === "Rahu")) {
        lines.push("Rahu in 12th — spending on foreign travel, unconventional pursuits, or sudden unexpected expenses. Money can slip away if not tracked carefully.");
      } else if (planetsIn12.some((p) => p.name === "Saturn")) {
        lines.push("Saturn in 12th — expenses related to long-term commitments, charitable work, or spiritual pursuits. You spend reluctantly but wisely.");
      } else if (lord12House && [2, 11].includes(lord12House)) {
        lines.push("12th lord connects to wealth houses — you may spend freely but also replenish. The money circulates rather than stagnating.");
      } else {
        lines.push("Spending is generally moderate. No extreme patterns — you manage finances with reasonable balance.");
      }

      // Ashtakavarga for wealth houses
      const sav2 = chart.ashtakavarga.sarva[(chart.ascendant.rashi + 1) % 12];
      const sav11 = chart.ashtakavarga.sarva[(chart.ascendant.rashi + 10) % 12];
      lines.push(`\nAshtakavarga strength: 2nd house = ${sav2} points, 11th house = ${sav11} points.`);
      if (sav2 >= 30) lines.push("2nd house is strong — wealth accumulation is well-supported.");
      if (sav11 >= 30) lines.push("11th house is strong — income and gains flow steadily.");
      if (sav2 < 25) lines.push("2nd house is weak — wealth accumulation requires extra effort and discipline.");
      if (sav11 < 25) lines.push("11th house is weak — income growth may be slower, focus on building multiple income streams.");

      // --- TIMING with financial event type ---
      lines.push("\nKey wealth timing periods:");
      const ascSign = chart.ascendant.rashiName;
      const relevantPlanets = new Set<string>();
      for (const h of [2, 11, 9, 5]) {
        const houseRashi = (chart.ascendant.rashi + h - 1) % 12;
        relevantPlanets.add(RASHI_LORDS[houseRashi]);
        for (const p of chart.planets) {
          if (houseOf(p.rashi, chart.ascendant.rashi) === h) relevantPlanets.add(p.name);
        }
      }

      const birthYear = chart.vimsottariDasha[0]?.startDate?.getFullYear() ?? 1983;
      const nowYear = new Date().getFullYear();
      const futureEntries: string[] = [];
      const pastEntries: string[] = [];

      for (const md of chart.vimsottariDasha) {
        if (!md.antardashas) continue;
        for (const ad of md.antardashas) {
          if (ad.startDate.getFullYear() < birthYear + 18) continue;
          if (ad.startDate.getFullYear() > birthYear + 100) continue;
          if (relevantPlanets.has(md.lord) || relevantPlanets.has(ad.lord)) {
            const adPlanet = findPlanet(chart, ad.lord);
            let eventType = "";
            if (adPlanet) {
              const adH = houseOf(adPlanet.rashi, chart.ascendant.rashi);
              const fav = assessDashaFavorability(ad.lord, ascSign, adPlanet.rashi, chart.ascendant.rashi, adPlanet.isExalted, adPlanet.isDebilitated);
              if (adH === 2 && fav.favorable) eventType = " → steady income growth, savings increase";
              else if (adH === 11 && fav.favorable) eventType = " → gains, fulfilled financial wishes, income jump";
              else if (adH === 9 && fav.favorable) eventType = " → fortune shines, lucky money, investments pay off";
              else if (adH === 5 && fav.favorable) eventType = " → speculative gains, creative income, investment returns";
              else if (adH === 8) eventType = " → sudden financial events (windfall OR unexpected expense)";
              else if (adH === 10 && fav.favorable) eventType = " → career-driven income boost, promotion with raise";
              else if (adH === 7) eventType = " → business profits, partnership income";
              else if (adH === 12) eventType = " → high expenditure phase, foreign income possible";
              else if (fav.favorable) eventType = " → positive financial energy";
              else eventType = " → financial caution advised";
            }
            const entry = `${md.lord}-${ad.lord} (${periodStr(ad)})${eventType}`;
            if (ad.endDate.getFullYear() <= nowYear) pastEntries.push(entry);
            else futureEntries.push(entry);
          }
        }
      }

      if (futureEntries.length > 0) {
        lines.push("UPCOMING PERIODS:");
        lines.push(...futureEntries.slice(0, 5));
      }
      if (pastEntries.length > 0) {
        lines.push("\nPAST PERIODS:");
        lines.push(...pastEntries.slice(-3));
      }

      return lines.join("\n");
    },
  },

  education_timing: {
    name: "Education Timing",
    description: "Academic achievements and degree completion timing from 4th, 5th, 9th houses.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["EDUCATION TIMING ANALYSIS\n"];

      const lord4House = houseLordInHouse(chart, 4);
      const lord5House = houseLordInHouse(chart, 5);
      const lord9House = houseLordInHouse(chart, 9);
      if (lord4House) lines.push(`4th lord (basic education) in house ${lord4House}: ${DASHA_LORD_IN_HOUSE[lord4House]}`);
      if (lord5House) lines.push(`5th lord (intelligence, learning) in house ${lord5House}: ${DASHA_LORD_IN_HOUSE[lord5House]}`);
      if (lord9House) lines.push(`9th lord (higher education) in house ${lord9House}: ${DASHA_LORD_IN_HOUSE[lord9House]}`);

      const mercury = findPlanet(chart, "Mercury");
      if (mercury) {
        const merHouse = houseOf(mercury.rashi, chart.ascendant.rashi);
        lines.push(`\nMercury (learning planet) in house ${merHouse}: ${PLANET_IN_HOUSE_MEANING["Mercury"]?.[merHouse] || ""}`);
      }

      lines.push("\nKey education timing periods:");
      const periods = timingForHouses(chart, [4, 5, 9]);
      lines.push(periods.slice(0, 10).join("\n"));

      return lines.join("\n");
    },
  },

  travel_foreign: {
    name: "Foreign Travel Timing",
    description: "Foreign travel and relocation abroad based on 9th, 12th houses and Rahu.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["FOREIGN TRAVEL ANALYSIS\n"];

      const lord9House = houseLordInHouse(chart, 9);
      const lord12House = houseLordInHouse(chart, 12);
      if (lord9House) lines.push(`9th lord (long journeys) in house ${lord9House}: ${DASHA_LORD_IN_HOUSE[lord9House]}`);
      if (lord12House) lines.push(`12th lord (foreign lands) in house ${lord12House}: ${DASHA_LORD_IN_HOUSE[lord12House]}`);

      const rahu = findPlanet(chart, "Rahu");
      if (rahu) {
        const rahuHouse = houseOf(rahu.rashi, chart.ascendant.rashi);
        lines.push(`\nRahu (foreign influence) in house ${rahuHouse}: ${PLANET_IN_HOUSE_MEANING["Rahu"]?.[rahuHouse] || ""}`);
      }

      // Check if 4th lord in 12th or 12th lord in 4th (common foreign settlement indicator)
      const lord4Pos = houseLordInHouse(chart, 4);
      if (lord4Pos === 12) lines.push("\n4th lord in 12th house — strong indicator of settling away from birthplace, possibly abroad.");
      if (lord12House === 4) lines.push("\n12th lord in 4th house — foreign influences in homeland or eventual foreign settlement.");

      lines.push("\nKey foreign travel timing periods:");
      const periods = timingForHouses(chart, [9, 12, 3]);
      lines.push(periods.slice(0, 10).join("\n"));

      return lines.join("\n");
    },
  },

  // ---------------------------------------------------------------------------
  // ANALYSIS COMPUTATIONS
  // ---------------------------------------------------------------------------

  current_period: {
    name: "Current Period Analysis",
    description: "What is happening now and in the next 1-2 years based on current dasha/antardasha.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["CURRENT PERIOD ANALYSIS\n"];
      const ascSign = chart.ascendant.rashiName;
      const now = new Date();

      const currentMD = getCurrentDasha(chart.vimsottariDasha);
      if (!currentMD) {
        return "Unable to determine current dasha period. Birth data may need adjustment.";
      }

      const mdPlanet = findPlanet(chart, currentMD.lord);
      if (mdPlanet) {
        const mdHouse = houseOf(mdPlanet.rashi, chart.ascendant.rashi);
        const fav = assessDashaFavorability(currentMD.lord, ascSign, mdPlanet.rashi, chart.ascendant.rashi, mdPlanet.isExalted, mdPlanet.isDebilitated);
        lines.push(`MAJOR PERIOD: ${currentMD.lord} (${periodStr(currentMD)})`);
        lines.push(`${currentMD.lord} sits in house ${mdHouse}: ${DASHA_LORD_IN_HOUSE[mdHouse]}`);
        lines.push(fav.description);
      }

      // Current antardasha
      let currentAD: DashaPeriod | undefined;
      if (currentMD.antardashas) {
        currentAD = currentMD.antardashas.find((ad) => now >= ad.startDate && now <= ad.endDate);
        if (currentAD) {
          const adPlanet = findPlanet(chart, currentAD.lord);
          if (adPlanet) {
            const adHouse = houseOf(adPlanet.rashi, chart.ascendant.rashi);
            const fav = assessDashaFavorability(currentAD.lord, ascSign, adPlanet.rashi, chart.ascendant.rashi, adPlanet.isExalted, adPlanet.isDebilitated);
            lines.push(`\nSUB-PERIOD: ${currentAD.lord} (${periodStr(currentAD)})`);
            lines.push(`${currentAD.lord} in house ${adHouse}: ${DASHA_LORD_IN_HOUSE[adHouse]}`);
            lines.push(fav.description);
          }
        }

        // --- PRATYANTARDASHA (sub-sub period) — what's happening THIS month ---
        if (currentAD?.antardashas) {
          const currentPAD = currentAD.antardashas.find((pad) => now >= pad.startDate && now <= pad.endDate);
          if (currentPAD) {
            const padPlanet = findPlanet(chart, currentPAD.lord);
            if (padPlanet) {
              const padHouse = houseOf(padPlanet.rashi, chart.ascendant.rashi);
              const padStart = currentPAD.startDate.toLocaleString("en", { month: "short", day: "numeric" });
              const padEnd = currentPAD.endDate.toLocaleString("en", { month: "short", day: "numeric", year: "numeric" });
              lines.push(`\nTHIS MONTH'S FOCUS (Pratyantardasha): ${currentPAD.lord} (${padStart} to ${padEnd})`);
              lines.push(`${currentPAD.lord} activates house ${padHouse}: ${DASHA_LORD_IN_HOUSE[padHouse]}`);
            }
          }

          // Next pratyantardasha — what's shifting soon
          const nextPADs = currentAD.antardashas.filter((pad) => pad.startDate > now).slice(0, 2);
          if (nextPADs.length > 0) {
            lines.push("\nCOMING UP IN THE NEXT FEW MONTHS:");
            for (const pad of nextPADs) {
              const padPlanet = findPlanet(chart, pad.lord);
              if (padPlanet) {
                const padHouse = houseOf(padPlanet.rashi, chart.ascendant.rashi);
                const padStart = pad.startDate.toLocaleString("en", { month: "short", year: "numeric" });
                lines.push(`${pad.lord} from ${padStart}: shifts focus to house ${padHouse} — ${DASHA_LORD_IN_HOUSE[padHouse]}`);
              }
            }
          }
        }

        // --- KEY THEMES: career, relationships, health, money — what's active NOW ---
        lines.push("\nACTIVE LIFE THEMES RIGHT NOW:");
        const mdH = mdPlanet ? houseOf(mdPlanet.rashi, chart.ascendant.rashi) : 0;
        const adH = currentAD ? (() => { const ap = findPlanet(chart, currentAD!.lord); return ap ? houseOf(ap.rashi, chart.ascendant.rashi) : 0; })() : 0;
        const activeHouses = new Set([mdH, adH]);

        const themes: string[] = [];
        if (activeHouses.has(10) || activeHouses.has(6)) themes.push("CAREER is strongly activated — expect professional changes, new responsibilities, or work-related decisions.");
        if (activeHouses.has(7) || activeHouses.has(2)) themes.push("RELATIONSHIPS are in focus — marriage, partnerships, or family dynamics demand attention.");
        if (activeHouses.has(1) || activeHouses.has(8)) themes.push("HEALTH and personal transformation are key themes — pay attention to your body and inner changes.");
        if (activeHouses.has(11) || activeHouses.has(5)) themes.push("MONEY and creative fulfillment are active — gains, investments, or creative projects are energized.");
        if (activeHouses.has(9) || activeHouses.has(12)) themes.push("SPIRITUAL growth and inner journey are calling — travel, learning, or meditation may draw you.");
        if (activeHouses.has(4)) themes.push("HOME and domestic matters need attention — property, family, mother, or emotional foundations.");
        if (activeHouses.has(3)) themes.push("COMMUNICATION and initiative are highlighted — writing, short trips, courage, and self-expression.");
        if (themes.length > 0) lines.push(themes.join("\n"));

        // --- WHAT TO FOCUS ON vs WHAT TO AVOID ---
        if (mdPlanet) {
          const funcData = FUNCTIONAL_BENEFICS_MALEFICS[ascSign];
          const isBeneficMD = funcData?.benefics.includes(currentMD.lord) || funcData?.yogakaraka === currentMD.lord;
          if (isBeneficMD) {
            lines.push("\nFOCUS ON: Taking initiative, making investments, starting new ventures, and pushing forward. The major period supports your efforts.");
          } else {
            lines.push("\nFOCUS ON: Caution, patience, and consolidation. Avoid major risks or confrontations. Use this time to build resilience and inner strength.");
          }
        }

        // --- ENERGY LEVEL AND MENTAL STATE ---
        const moon = findPlanet(chart, "Moon");
        if (moon) {
          const moonH = houseOf(moon.rashi, chart.ascendant.rashi);
          if ([6, 8, 12].includes(moonH)) {
            lines.push("\nMENTAL & EMOTIONAL STATE: Moon's placement suggests emotional sensitivity may be heightened. Make time for self-care, rest, and emotional processing. Meditation or journaling helps.");
          } else if ([1, 5, 9, 11].includes(moonH)) {
            lines.push("\nMENTAL & EMOTIONAL STATE: Moon's placement supports emotional stability and optimism. Your intuition is generally reliable, and your mood supports productive action.");
          } else {
            lines.push("\nMENTAL & EMOTIONAL STATE: Emotional energy is moderate. Stay connected to supportive people and maintain healthy routines for best results.");
          }
        }

        // Next 2-3 antardashas — what's changing in the next 3-6 months
        const futureADs = currentMD.antardashas.filter((ad) => ad.startDate > now).slice(0, 3);
        if (futureADs.length > 0) {
          lines.push("\nWHAT'S CHANGING — UPCOMING SUB-PERIODS:");
          for (const ad of futureADs) {
            const adPlanet = findPlanet(chart, ad.lord);
            if (adPlanet) {
              const futAdHouse = houseOf(adPlanet.rashi, chart.ascendant.rashi);
              const fav = assessDashaFavorability(ad.lord, ascSign, adPlanet.rashi, chart.ascendant.rashi, adPlanet.isExalted, adPlanet.isDebilitated);
              const startMonth = ad.startDate.toLocaleString("en", { month: "short", year: "numeric" });
              lines.push(`${ad.lord} (from ${startMonth}): House ${futAdHouse} focus. ${DASHA_LORD_IN_HOUSE[futAdHouse]} ${fav.favorable ? "A positive shift." : "A period requiring patience."}`);
            }
          }
        }
      }

      return lines.join("\n");
    },
  },

  personality: {
    name: "Personality Analysis",
    description: "Character traits, strengths, and weaknesses from ascendant, Moon, and Sun placements.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["PERSONALITY ANALYSIS\n"];

      // Ascendant sign traits
      const ascTraits = RASHI_DETAILED_TRAITS[chart.ascendant.rashiName];
      if (ascTraits) {
        lines.push(`RISING SIGN — ${chart.ascendant.rashiName}:`);
        lines.push(ascTraits.personality);
      }

      // Moon sign and nakshatra — DETAILED
      lines.push(`\nMOON SIGN — ${chart.moonSign} (your emotional core):`);
      const moonTraits = RASHI_DETAILED_TRAITS[chart.moonSign];
      if (moonTraits) lines.push(moonTraits.personality);

      const nakshatraDesc = NAKSHATRA_PERSONALITIES[chart.moonNakshatra];
      if (nakshatraDesc) {
        lines.push(`\nMOON NAKSHATRA — ${chart.moonNakshatra} (your deepest behavioral pattern):`);
        lines.push(nakshatraDesc);
      }

      // Sun sign
      lines.push(`\nSUN SIGN — ${chart.sunSign} (your soul's expression):`);
      const sunPlanet = findPlanet(chart, "Sun");
      if (sunPlanet) {
        const sunHouse = houseOf(sunPlanet.rashi, chart.ascendant.rashi);
        lines.push(PLANET_IN_HOUSE_MEANING["Sun"]?.[sunHouse] || "");
      }

      // --- ATMAKARAKA — soul's deepest desire ---
      const ak = chart.charaKarakas.find((ck) => ck.karaka === "AK" || ck.karaka === "Atmakaraka");
      if (ak) {
        lines.push(`\nSOUL'S DEEPEST DESIRE (Atmakaraka: ${ak.planet}):`);
        const akMeaning: Record<string, string> = {
          Sun: "Your soul craves respect, recognition, and the ability to lead authentically. The deepest lesson is learning to shine without needing others' approval — finding your inner authority.",
          Moon: "Your soul yearns for emotional security, nurturing, and deep connection. The lesson is learning to give care without losing yourself — finding peace within, regardless of external circumstances.",
          Mars: "Your soul burns to prove its courage, fight for justice, and take decisive action. The lesson is channeling passion without aggression — using strength to protect rather than dominate.",
          Mercury: "Your soul is driven to learn, communicate, and understand the world intellectually. The lesson is using knowledge wisely — not just accumulating information but distilling it into true wisdom.",
          Jupiter: "Your soul seeks wisdom, meaning, and the role of guide or teacher. The lesson is living your values rather than just preaching them — becoming the wisdom you seek to share.",
          Venus: "Your soul desires love, beauty, harmony, and creative expression. The lesson is finding true beauty beyond appearances — learning that the deepest love requires vulnerability and honesty.",
          Saturn: "Your soul is here to learn patience, discipline, and service through hardship. This is one of the most spiritually advanced placements — the lesson is accepting responsibility without resentment and finding freedom within structure.",
          Rahu: "Your soul is driven by an intense, almost obsessive desire to experience something new and unconventional. The lesson is pursuing ambition without losing your moral compass.",
        };
        lines.push(akMeaning[ak.planet] || `${ak.planet} as Atmakaraka gives your soul a unique quest for mastery in ${ak.planet}'s domain.`);
      }

      // --- HOW OTHERS PERCEIVE YOU (from Arudha Lagna) ---
      const al = chart.arudhaPadas.find((a) => a.house === 1);
      if (al) {
        const alHouse = houseOf(al.padaRashi, chart.ascendant.rashi);
        lines.push(`\nHOW THE WORLD SEES YOU (Arudha Lagna in house ${alHouse}):`);
        const alPerception: Record<number, string> = {
          1: "What you see is what you get — your public image matches your true self. People perceive you as authentic and straightforward.",
          2: "People see you as wealthy, well-spoken, or family-oriented, regardless of your actual finances. You project stability and values.",
          3: "You come across as bold, communicative, and entrepreneurial. People see a doer who takes initiative.",
          4: "People perceive you as comfortable, well-settled, and emotionally grounded. You project domestic success and inner peace.",
          5: "You appear creative, intelligent, and lucky. People see you as someone with natural talent and a bright mind.",
          6: "You may appear as someone who overcomes enemies and obstacles. People see a fighter and problem-solver.",
          7: "You project partnership energy — people see you through your relationships and public dealings. You appear socially connected.",
          8: "There is mystery about your public image. People sense depth, power, or hidden resources in you.",
          9: "You appear fortunate, wise, and connected to higher principles. People see a philosophical or spiritual quality in you.",
          10: "You project career success and authority. People see you as accomplished, powerful, and action-oriented.",
          11: "You appear well-connected, affluent, and socially influential. People see someone who achieves their goals.",
          12: "You may appear detached, spiritual, or connected to foreign lands. There is an elusive, other-worldly quality to your image.",
        };
        lines.push(alPerception[alHouse] || "Your public image has a unique, complex quality.");
      }

      // --- HIDDEN TALENTS (from 5th house and its lord) ---
      const lord5H = houseLordInHouse(chart, 5);
      const planetsIn5 = chart.planets.filter((p) => houseOf(p.rashi, chart.ascendant.rashi) === 5);
      lines.push("\nHIDDEN TALENTS & CREATIVE GIFTS:");
      if (planetsIn5.length > 0) {
        for (const p of planetsIn5) {
          const talentMap: Record<string, string> = {
            Sun: "Natural leadership in creative or educational settings. You can inspire and mentor others powerfully.",
            Moon: "Deep emotional intelligence and intuition. You may have a gift for storytelling, nurturing, or understanding people's unspoken needs.",
            Mars: "Competitive edge in creative fields. Talent for sports, engineering, or any pursuit requiring physical or mental courage.",
            Mercury: "Outstanding communication ability — writing, speaking, analysis, or coding. Your mind is a powerful creative tool.",
            Jupiter: "Wisdom and teaching ability. You naturally guide others and may have talent in philosophy, finance, or counseling.",
            Venus: "Strong artistic sensibility — music, art, design, or aesthetic pursuits. Romantic creativity flows naturally.",
            Saturn: "Disciplined creative approach. You build lasting things — whether art, structures, or systems. Late-blooming but enduring talent.",
            Rahu: "Unconventional creative vision. You think outside the box and may innovate in technology, media, or avant-garde fields.",
            Ketu: "Intuitive, spiritual creativity. Past-life talents may surface — you may be naturally good at things without formal training.",
          };
          lines.push(`${p.name} in 5th house: ${talentMap[p.name] || "Unique creative expression through " + p.name + "'s energy."}`);
        }
      } else if (lord5H) {
        lines.push(`5th lord in house ${lord5H}: Your creative and intellectual gifts express through ${DASHA_LORD_IN_HOUSE[lord5H]?.split(".")[0].toLowerCase() || "this life area"}.`);
      }

      // --- BIGGEST LIFE LESSON (from Saturn's house) ---
      const saturn = findPlanet(chart, "Saturn");
      if (saturn) {
        const satHouse = houseOf(saturn.rashi, chart.ascendant.rashi);
        lines.push(`\nBIGGEST LIFE LESSON (Saturn in house ${satHouse}):`);
        const satLesson: Record<number, string> = {
          1: "Learning self-discipline, patience with your own growth, and that true strength comes from enduring rather than forcing. You are here to master yourself.",
          2: "Learning that real wealth comes slowly and must be earned. Financial discipline and valuing what truly matters over superficial possessions.",
          3: "Learning that true courage means persisting when communication fails and efforts seem fruitless. Your voice strengthens over time.",
          4: "Learning to find inner peace despite difficult domestic or emotional circumstances. Home and happiness come through patient building.",
          5: "Learning that creativity and joy require discipline, not just inspiration. Parenthood or creative work may teach deep patience.",
          6: "Learning to serve without resentment, handle enemies with patience, and manage health through consistent routines.",
          7: "Learning that lasting relationships require commitment through difficult times. Marriage or partnerships teach you about patience and compromise.",
          8: "Learning to face transformation, loss, and the unknown with courage. You become stronger through every crisis you survive.",
          9: "Learning that wisdom comes through lived experience, not just beliefs. Your philosophy of life is tested and strengthened through hardship.",
          10: "Learning that career success is a marathon, not a sprint. Your greatest achievements come later in life through relentless perseverance.",
          11: "Learning that true fulfillment comes from realistic goals and genuine friendships rather than chasing every dream. Quality over quantity.",
          12: "Learning to let go, find peace in solitude, and accept that some things are beyond your control. Spiritual maturity through surrender.",
        };
        lines.push(satLesson[satHouse] || "Saturn teaches patience and discipline through this area of life.");
      }

      // Key planet strengths/weaknesses
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      for (const p of chart.planets) {
        if (p.isExalted) strengths.push(`${p.name} is exalted in ${p.rashiName} — exceptional strength in ${p.name}'s areas.`);
        if (p.isDebilitated) weaknesses.push(`${p.name} is debilitated in ${p.rashiName} — challenges in ${p.name}'s areas.`);
        if (isInMKS(chart, p.name)) weaknesses.push(`${p.name} is in Marana Karaka Sthana — deeply weakened, needs conscious attention.`);
      }
      if (strengths.length > 0) {
        lines.push("\nKEY STRENGTHS:");
        lines.push(strengths.join("\n"));
      }
      if (weaknesses.length > 0) {
        lines.push("\nAREAS NEEDING ATTENTION:");
        lines.push(weaknesses.join("\n"));
      }

      // Yogas
      if (chart.yogas.length > 0) {
        lines.push("\nSPECIAL COMBINATIONS (Yogas):");
        lines.push(chart.yogas.join("\n"));
      }

      return lines.join("\n");
    },
  },

  health_analysis: {
    name: "Health Analysis",
    description: "Constitution, vulnerable body areas, and health timing from lagna, 6th/8th houses, and MKS.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["HEALTH ANALYSIS\n"];

      // Constitution with RECOMMENDATIONS
      const ascTraits = RASHI_DETAILED_TRAITS[chart.ascendant.rashiName];
      if (ascTraits) {
        lines.push(`Constitution: ${ascTraits.constitution} type`);
        lines.push(`Primary vulnerable area: ${ascTraits.bodyPart}`);

        // Constitution-specific health advice
        const constitutionAdvice: Record<string, string> = {
          Pitta: "HEALTH PRACTICES FOR YOUR CONSTITUTION: Cool down your system — avoid excessive spicy food, alcohol, and overheating. Favor cooling foods (cucumber, coconut water, milk), moderate exercise (swimming, walking), and stress management. Avoid working in extreme heat. Meditation calms your naturally fiery mind. Best exercise time: early morning before it gets hot.",
          Vata: "HEALTH PRACTICES FOR YOUR CONSTITUTION: Ground and warm yourself — avoid irregular routines, cold dry food, and excessive travel. Favor warm, cooked, oily foods, regular sleep schedules, and gentle, grounding exercise (yoga, walking, tai chi). Oil massage (abhyanga) is excellent for you. Avoid overthinking and over-scheduling.",
          Kapha: "HEALTH PRACTICES FOR YOUR CONSTITUTION: Stay active and light — avoid heavy food, oversleeping, and sedentary habits. Favor light, spicy, warm foods, vigorous daily exercise, and stimulating activities. You have natural endurance but must fight inertia. Best exercise: running, hiking, competitive sports. Avoid dairy excess and sleeping past sunrise.",
        };
        if (constitutionAdvice[ascTraits.constitution]) {
          lines.push(`\n${constitutionAdvice[ascTraits.constitution]}`);
        }
      }

      // --- SPECIFIC BODY PARTS TO WATCH (from 6th lord house placement) ---
      const lord6House = houseLordInHouse(chart, 6);
      if (lord6House !== null) {
        lines.push(`\nDISEASE INDICATORS (6th lord in house ${lord6House}):`);
        lines.push(`Body area to watch: ${BODY_PART_BY_HOUSE[lord6House]}.`);
        // Also note the 6th lord planet itself
        const house6Rashi = (chart.ascendant.rashi + 5) % 12;
        const lord6Name = RASHI_LORDS[house6Rashi];
        if (BODY_PART_BY_PLANET[lord6Name]) {
          lines.push(`${lord6Name} as 6th lord also indicates vulnerability in: ${BODY_PART_BY_PLANET[lord6Name]}.`);
        }
      }

      // 8th house (chronic illness) analysis
      const lord8House = houseLordInHouse(chart, 8);
      if (lord8House !== null) {
        lines.push(`\nCHRONIC HEALTH INDICATORS (8th lord in house ${lord8House}): Watch ${BODY_PART_BY_HOUSE[lord8House]}. Chronic or recurring issues may relate to this area.`);
      }

      // --- MENTAL HEALTH INDICATORS ---
      const moon = findPlanet(chart, "Moon");
      lines.push("\nMENTAL HEALTH PROFILE:");
      if (moon) {
        const moonH = houseOf(moon.rashi, chart.ascendant.rashi);
        const moonStrong = moon.isExalted || [1, 4, 5, 7, 9, 10, 11].includes(moonH);
        const moonWeak = moon.isDebilitated || isInMKS(chart, "Moon") || [6, 8, 12].includes(moonH);

        if (moonWeak) {
          lines.push(`Moon is ${moon.isDebilitated ? "debilitated" : isInMKS(chart, "Moon") ? "in Marana Karaka Sthana" : "in a challenging house"} — emotional health needs conscious attention. You may be prone to anxiety, mood swings, or periods of emotional heaviness. Regular practices like meditation, spending time near water, and connecting with nurturing people are essential.`);
        } else if (moonStrong) {
          lines.push(`Moon is well-placed — your emotional resilience is naturally strong. You recover from stress relatively well and have good intuitive awareness of your mental state.`);
        } else {
          lines.push("Moon is in a moderate position — mental health is generally stable but benefits from regular emotional check-ins, good sleep habits, and stress management routines.");
        }

        // 4th house (inner peace)
        const sav4 = chart.ashtakavarga.sarva[(chart.ascendant.rashi + 3) % 12];
        if (sav4 < 22) {
          lines.push("4th house (inner peace) is weak in Ashtakavarga — finding emotional security and peace of mind may require extra effort. Create a calming home environment.");
        } else if (sav4 >= 30) {
          lines.push("4th house (inner peace) is strong — your home environment and emotional foundations support mental wellness well.");
        }
      }

      // MKS planets — health vulnerabilities
      const mksIssues: string[] = [];
      for (const p of chart.planets) {
        if (isInMKS(chart, p.name)) {
          mksIssues.push(`${p.name} in MKS: Vulnerable to ${BODY_PART_BY_PLANET[p.name]}. Take preventive care — regular checkups and early intervention are key.`);
        }
      }
      if (mksIssues.length > 0) {
        lines.push("\nCRITICAL HEALTH VULNERABILITIES:");
        lines.push(mksIssues.join("\n"));
      }

      // Planets in 6th and 8th houses
      for (const p of chart.planets) {
        const house = houseOf(p.rashi, chart.ascendant.rashi);
        if (house === 6) lines.push(`\n${p.name} in 6th house: Health issues related to ${BODY_PART_BY_PLANET[p.name]}.`);
        if (house === 8) lines.push(`\n${p.name} in 8th house: Chronic issues possible related to ${BODY_PART_BY_PLANET[p.name]}.`);
      }

      // --- CURRENT HEALTH ENERGY from running dasha ---
      const currentMD = getCurrentDasha(chart.vimsottariDasha);
      if (currentMD) {
        const mdPlanet = findPlanet(chart, currentMD.lord);
        if (mdPlanet) {
          const mdHouse = houseOf(mdPlanet.rashi, chart.ascendant.rashi);
          lines.push("\nCURRENT HEALTH ENERGY:");
          if ([6, 8].includes(mdHouse)) {
            lines.push(`Your current ${currentMD.lord} period activates house ${mdHouse} — this is a health-sensitive phase. Be proactive about checkups, diet, and exercise. Do not ignore minor symptoms.`);
          } else if ([1, 5, 9].includes(mdHouse)) {
            lines.push(`Your current ${currentMD.lord} period activates house ${mdHouse} — health energy is generally positive. Your vitality supports an active lifestyle.`);
          } else if (mdHouse === 12) {
            lines.push(`Your current ${currentMD.lord} period activates the 12th house — watch for sleep disturbances, immune system dips, or hospitalization triggers. Rest and recovery are important.`);
          } else {
            lines.push(`Your current ${currentMD.lord} period is not primarily health-focused, but maintain regular health routines.`);
          }
        }
      }

      // Health timing
      lines.push("\nHealth-sensitive periods (6th, 8th house activations):");
      const periods = timingForHouses(chart, [6, 8]);
      lines.push(periods.slice(0, 8).join("\n"));

      return lines.join("\n");
    },
  },

  spiritual_path: {
    name: "Spiritual Path",
    description: "Spiritual growth, meditation tendencies, guru connection from 5th, 9th, 12th houses and Jupiter/Ketu.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["SPIRITUAL PATH ANALYSIS\n"];

      // 9th house (dharma) and 12th house (moksha)
      const lord9House = houseLordInHouse(chart, 9);
      const lord12House = houseLordInHouse(chart, 12);
      if (lord9House) lines.push(`9th lord (dharma, guru) in house ${lord9House}: ${DASHA_LORD_IN_HOUSE[lord9House]}`);
      if (lord12House) lines.push(`12th lord (liberation, transcendence) in house ${lord12House}: ${DASHA_LORD_IN_HOUSE[lord12House]}`);

      // Jupiter (guru karaka)
      const jupiter = findPlanet(chart, "Jupiter");
      if (jupiter) {
        const jupHouse = houseOf(jupiter.rashi, chart.ascendant.rashi);
        lines.push(`\nJupiter (spiritual teacher) in house ${jupHouse}: ${PLANET_IN_HOUSE_MEANING["Jupiter"]?.[jupHouse] || ""}`);
      }

      // Ketu (moksha karaka)
      const ketu = findPlanet(chart, "Ketu");
      if (ketu) {
        const ketuHouse = houseOf(ketu.rashi, chart.ascendant.rashi);
        lines.push(`\nKetu (past-life wisdom, detachment) in house ${ketuHouse}: ${PLANET_IN_HOUSE_MEANING["Ketu"]?.[ketuHouse] || ""}`);
      }

      // 5th house (mantra, past merit)
      const lord5House = houseLordInHouse(chart, 5);
      if (lord5House) lines.push(`\n5th lord (mantra, past-life merit) in house ${lord5House}: ${DASHA_LORD_IN_HOUSE[lord5House]}`);

      // Spiritual timing
      lines.push("\nSpiritual growth periods (9th, 12th, 5th house activations):");
      const periods = timingForHouses(chart, [9, 12, 5]);
      lines.push(periods.slice(0, 8).join("\n"));

      return lines.join("\n");
    },
  },

  relationship_nature: {
    name: "Relationship Nature",
    description: "How they love and what they need in a partner based on Venus, 7th house, and Navamsa.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["RELATIONSHIP NATURE ANALYSIS\n"];

      // 7th house sign and lord
      const house7Rashi = (chart.ascendant.rashi + 6) % 12;
      const house7Sign = RASHI_NAMES[house7Rashi];
      const house7Traits = RASHI_DETAILED_TRAITS[house7Sign];
      lines.push(`7th house sign: ${house7Sign}`);
      if (house7Traits) lines.push(`What you seek in a partner: ${house7Traits.personality}`);

      const lord7House = houseLordInHouse(chart, 7);
      if (lord7House) lines.push(`\n7th lord placement: ${LORD7_IN_HOUSE[lord7House]}`);

      // Venus
      const venus = findPlanet(chart, "Venus");
      if (venus) {
        const venusHouse = houseOf(venus.rashi, chart.ascendant.rashi);
        lines.push(`\nYour love style (Venus in house ${venusHouse}): ${VENUS_IN_HOUSE[venusHouse]}`);
      }

      // Navamsa analysis
      lines.push(`\nNavamsa Ascendant: ${chart.navamsa.ascendant.rashiName} — the deeper layer of your relationship nature.`);
      const navJupiter = chart.navamsa.planets.find((p) => p.name === "Jupiter");
      const navVenus = chart.navamsa.planets.find((p) => p.name === "Venus");
      if (navVenus) lines.push(`Venus in Navamsa ${navVenus.rashiName} — colors the quality and harmony of married life.`);
      if (navJupiter) lines.push(`Jupiter in Navamsa ${navJupiter.rashiName} — indicates wisdom and growth through partnership.`);

      // Planets in 7th house
      for (const p of chart.planets) {
        const house = houseOf(p.rashi, chart.ascendant.rashi);
        if (house === 7) {
          lines.push(`\n${p.name} in 7th house: ${PLANET_IN_HOUSE_MEANING[p.name]?.[7] || ""}`);
        }
      }

      return lines.join("\n");
    },
  },

  career_nature: {
    name: "Career Nature",
    description: "What kind of work suits them and career strengths from 10th house, D-10, and Saturn/Sun.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["CAREER NATURE ANALYSIS\n"];

      // 10th house sign
      const house10Rashi = (chart.ascendant.rashi + 9) % 12;
      const house10Sign = RASHI_NAMES[house10Rashi];
      lines.push(`10th house sign: ${house10Sign}`);
      const traits = RASHI_DETAILED_TRAITS[house10Sign];
      if (traits) lines.push(`Career element: ${traits.element}. Career style: ${traits.personality.split(".")[0]}.`);

      // 10th lord placement
      const lord10House = houseLordInHouse(chart, 10);
      if (lord10House) lines.push(`\n10th lord in house ${lord10House}: ${LORD10_IN_HOUSE[lord10House]}`);

      // Planets in 10th house
      for (const p of chart.planets) {
        const house = houseOf(p.rashi, chart.ascendant.rashi);
        if (house === 10) {
          lines.push(`\n${p.name} in 10th house: ${PLANET_IN_HOUSE_MEANING[p.name]?.[10] || ""}`);
        }
      }

      // D-10 analysis
      lines.push(`\nDasamsa (career chart) Ascendant: ${chart.dasamsa.ascendant.rashiName}`);
      for (const p of chart.dasamsa.planets) {
        if (["Sun", "Saturn", "Mars", "Mercury", "Jupiter"].includes(p.name)) {
          lines.push(`${p.name} in D-10 ${p.rashiName}`);
        }
      }

      // Ashtakavarga for 10th house
      const sav10 = chart.ashtakavarga.sarva[(chart.ascendant.rashi + 9) % 12];
      lines.push(`\nAshtakavarga strength of 10th house: ${sav10} points.`);
      if (sav10 >= 30) lines.push("Strong career house — professional success is well-supported.");
      if (sav10 < 25) lines.push("10th house needs support — career success requires persistent effort.");

      return lines.join("\n");
    },
  },

  // ---------------------------------------------------------------------------
  // ADVANCED COMPUTATIONS
  // ---------------------------------------------------------------------------

  birth_rectification: {
    name: "Birth Time Rectification",
    description: "Adjusts birth time by checking +-5/10/15 min increments against known life events.",
    requiredInputs: ["birth_data", "known_events"],
    optionalInputs: [],
    compute: (chart, params) => {
      if (!params?.birth_date || !params?.birth_time || !params?.latitude || !params?.longitude) {
        return "Birth rectification requires original birth_date, birth_time, latitude, and longitude in params.";
      }
      if (!params?.known_events || Object.keys(params.known_events).length < 2) {
        return "Birth rectification requires at least 2 known life events (e.g., marriage_year, first_child_year, first_job_year).";
      }

      const offsets = [-15, -10, -5, 0, 5, 10, 15]; // minutes
      const [hours, minutes] = params.birth_time.split(":").map(Number);
      const results: { offset: number; score: number; details: string[] }[] = [];

      for (const offset of offsets) {
        const totalMin = hours * 60 + minutes + offset;
        const adjHours = Math.floor(totalMin / 60);
        const adjMin = totalMin % 60;
        const adjTime = `${String(adjHours).padStart(2, "0")}:${String(adjMin).padStart(2, "0")}`;

        let testChart: BirthChartData;
        try {
          testChart = calculateBirthChart(params.birth_date, adjTime, params.latitude, params.longitude);
        } catch {
          continue;
        }

        let score = 0;
        const details: string[] = [`Time: ${adjTime} (offset ${offset > 0 ? "+" : ""}${offset} min)`];

        // Check D-9 lagna for marriage events
        if (params.known_events.marriage_year) {
          const year = params.known_events.marriage_year;
          const matchingDashas = dashasInRange(testChart.vimsottariDasha, year, year);
          for (const md of matchingDashas) {
            const planet = findPlanet(testChart, md.lord);
            if (planet) {
              const house = houseOf(planet.rashi, testChart.ascendant.rashi);
              if ([7, 2, 11, 1].includes(house)) { score += 2; details.push(`Marriage ${year}: ${md.lord} dasha lord in house ${house} — matches.`); }
            }
            if (md.antardashas) {
              for (const ad of md.antardashas) {
                if (ad.startDate.getFullYear() <= year && ad.endDate.getFullYear() >= year) {
                  const adPlanet = findPlanet(testChart, ad.lord);
                  if (adPlanet) {
                    const adHouse = houseOf(adPlanet.rashi, testChart.ascendant.rashi);
                    if ([7, 2, 11].includes(adHouse)) { score += 1; details.push(`Marriage ${year}: ${ad.lord} antardasha lord in house ${adHouse} — matches.`); }
                  }
                }
              }
            }
          }
        }

        // Check for children events
        if (params.known_events.first_child_year) {
          const year = params.known_events.first_child_year;
          const matchingDashas = dashasInRange(testChart.vimsottariDasha, year, year);
          for (const md of matchingDashas) {
            const planet = findPlanet(testChart, md.lord);
            if (planet) {
              const house = houseOf(planet.rashi, testChart.ascendant.rashi);
              if ([5, 9, 2].includes(house)) { score += 2; details.push(`Child ${year}: ${md.lord} dasha lord in house ${house} — matches.`); }
            }
          }
        }

        // Check for career events
        if (params.known_events.first_job_year) {
          const year = params.known_events.first_job_year;
          const matchingDashas = dashasInRange(testChart.vimsottariDasha, year, year);
          for (const md of matchingDashas) {
            const planet = findPlanet(testChart, md.lord);
            if (planet) {
              const house = houseOf(planet.rashi, testChart.ascendant.rashi);
              if ([10, 6, 11].includes(house)) { score += 2; details.push(`Job ${year}: ${md.lord} dasha lord in house ${house} — matches.`); }
            }
          }
        }

        // D-9 lagna check — marriage in Venus/Jupiter navamsa signs is favorable
        details.push(`Navamsa Ascendant: ${testChart.navamsa.ascendant.rashiName}`);
        details.push(`Dasamsa Ascendant: ${testChart.dasamsa.ascendant.rashiName}`);

        results.push({ offset, score, details });
      }

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);

      const lines: string[] = ["BIRTH TIME RECTIFICATION RESULTS\n"];
      lines.push("Testing birth time adjustments against your known life events:\n");

      for (const r of results) {
        lines.push(`--- Score: ${r.score} ---`);
        lines.push(r.details.join("\n"));
        lines.push("");
      }

      const best = results[0];
      if (best && best.offset !== 0) {
        const totalMin = hours * 60 + minutes + best.offset;
        const adjHours = Math.floor(totalMin / 60);
        const adjMin = totalMin % 60;
        lines.push(`RECOMMENDATION: Adjust birth time by ${best.offset > 0 ? "+" : ""}${best.offset} minutes to ${String(adjHours).padStart(2, "0")}:${String(adjMin).padStart(2, "0")} for best alignment with known events.`);
      } else {
        lines.push("RECOMMENDATION: Your recorded birth time appears accurate. No adjustment needed.");
      }

      return lines.join("\n");
    },
  },

  annual_forecast: {
    name: "Annual Forecast",
    description: "This year's predictions based on current and upcoming dasha/antardasha periods.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["ANNUAL FORECAST — " + new Date().getFullYear() + "\n"];
      const ascSign = chart.ascendant.rashiName;
      const thisYear = new Date().getFullYear();

      // Find the mahadasha active this year
      const activeMD = chart.vimsottariDasha.find((d) => d.startDate.getFullYear() <= thisYear && d.endDate.getFullYear() >= thisYear);
      if (!activeMD) return "Unable to compute annual forecast — dasha data unavailable.";

      const mdPlanet = findPlanet(chart, activeMD.lord);
      if (mdPlanet) {
        const mdHouse = houseOf(mdPlanet.rashi, chart.ascendant.rashi);
        lines.push(`Major Period: ${activeMD.lord} (${periodStr(activeMD)})`);
        lines.push(`Theme: ${DASHA_LORD_IN_HOUSE[mdHouse]}`);
        const fav = assessDashaFavorability(activeMD.lord, ascSign, mdPlanet.rashi, chart.ascendant.rashi, mdPlanet.isExalted, mdPlanet.isDebilitated);
        lines.push(fav.description);
      }

      // Antardashas active this year
      if (activeMD.antardashas) {
        const yearADs = activeMD.antardashas.filter((ad) => {
          const adStart = ad.startDate.getFullYear();
          const adEnd = ad.endDate.getFullYear();
          return adStart <= thisYear && adEnd >= thisYear;
        });

        lines.push("\nSUB-PERIODS THIS YEAR:");
        for (const ad of yearADs) {
          const adPlanet = findPlanet(chart, ad.lord);
          if (adPlanet) {
            const adHouse = houseOf(adPlanet.rashi, chart.ascendant.rashi);
            const fav = assessDashaFavorability(ad.lord, ascSign, adPlanet.rashi, chart.ascendant.rashi, adPlanet.isExalted, adPlanet.isDebilitated);
            const startMonth = ad.startDate.toLocaleString("en", { month: "short", year: "numeric" });
            const endMonth = ad.endDate.toLocaleString("en", { month: "short", year: "numeric" });
            lines.push(`\n${ad.lord} sub-period (${startMonth} to ${endMonth}):`);
            lines.push(`Focus area: ${DASHA_LORD_IN_HOUSE[adHouse]}`);
            lines.push(fav.favorable ? "Overall positive period." : "Period requires caution and patience.");
          }
        }
      }

      // Ashtakavarga transit hints
      lines.push("\nKEY HOUSE STRENGTHS (Ashtakavarga):");
      const strongHouses: string[] = [];
      const weakHouses: string[] = [];
      for (let h = 1; h <= 12; h++) {
        const savIndex = (chart.ascendant.rashi + h - 1) % 12;
        const points = chart.ashtakavarga.sarva[savIndex];
        if (points >= 30) strongHouses.push(`House ${h} (${points} pts): ${HOUSE_SIGNIFICATIONS[h - 1].split(",")[0]}`);
        if (points <= 22) weakHouses.push(`House ${h} (${points} pts): ${HOUSE_SIGNIFICATIONS[h - 1].split(",")[0]}`);
      }
      if (strongHouses.length > 0) lines.push("Strong areas: " + strongHouses.join("; "));
      if (weakHouses.length > 0) lines.push("Areas needing care: " + weakHouses.join("; "));

      return lines.join("\n");
    },
  },

  remedies: {
    name: "Remedies",
    description: "Gemstones, mantras, deities, fasting recommendations for specific life problems.",
    requiredInputs: ["birth_data", "problem_area"],
    optionalInputs: [],
    compute: (chart, params) => {
      const lines: string[] = ["REMEDIES & RECOMMENDATIONS\n"];
      const ascSign = chart.ascendant.rashiName;
      const funcData = FUNCTIONAL_BENEFICS_MALEFICS[ascSign];

      const problemArea = params?.problem_area || "general";

      // Map problem areas to relevant houses and planets
      const problemMap: Record<string, { houses: number[]; karakas: string[]; description: string }> = {
        marriage: { houses: [7, 2], karakas: ["Venus"], description: "marriage, relationships, and partnership" },
        career: { houses: [10, 6], karakas: ["Saturn", "Sun"], description: "career, professional growth, and recognition" },
        health: { houses: [1, 6, 8], karakas: ["Sun", "Moon"], description: "health, vitality, and physical well-being" },
        wealth: { houses: [2, 11], karakas: ["Jupiter"], description: "wealth, income, and financial growth" },
        children: { houses: [5], karakas: ["Jupiter"], description: "children, fertility, and parenthood" },
        education: { houses: [4, 5], karakas: ["Mercury", "Jupiter"], description: "education, learning, and intellectual growth" },
        spiritual: { houses: [9, 12], karakas: ["Jupiter", "Ketu"], description: "spiritual growth, inner peace, and divine connection" },
        general: { houses: [1, 9], karakas: ["Jupiter", "Sun"], description: "overall life improvement and well-being" },
      };

      const config = problemMap[problemArea] || problemMap.general;
      lines.push(`FOCUS AREA: ${config.description}\n`);

      // --- IDENTIFY THE WEAKEST PLANET ---
      const relevantPlanets: string[] = [...config.karakas];
      for (const h of config.houses) {
        const houseRashi = (chart.ascendant.rashi + h - 1) % 12;
        relevantPlanets.push(RASHI_LORDS[houseRashi]);
      }

      // Score each relevant planet to find the weakest
      let weakestPlanet = "";
      let weakestScore = 100;
      const seen = new Set<string>();
      for (const pName of relevantPlanets) {
        if (seen.has(pName)) continue;
        seen.add(pName);
        const planet = findPlanet(chart, pName);
        if (!planet) continue;
        let score = 50; // baseline
        if (planet.isExalted) score += 30;
        if (planet.isDebilitated) score -= 30;
        if (isInMKS(chart, pName)) score -= 25;
        if (planet.isRetrograde) score -= 5;
        const house = houseOf(planet.rashi, chart.ascendant.rashi);
        if ([6, 8, 12].includes(house)) score -= 15;
        if ([1, 5, 9].includes(house)) score += 10;
        if (funcData?.malefics.includes(pName)) score -= 10;
        if (funcData?.benefics.includes(pName)) score += 10;
        if (score < weakestScore) { weakestScore = score; weakestPlanet = pName; }
      }

      if (weakestPlanet) {
        const wp = findPlanet(chart, weakestPlanet);
        const wpHouse = wp ? houseOf(wp.rashi, chart.ascendant.rashi) : 0;
        lines.push(`MOST PROBLEMATIC PLANET FOR ${problemArea.toUpperCase()}: ${weakestPlanet}`);
        lines.push(`Currently placed in house ${wpHouse}${wp?.isDebilitated ? " (debilitated)" : ""}${isInMKS(chart, weakestPlanet) ? " (in Marana Karaka Sthana)" : ""}${wp?.isRetrograde ? " (retrograde)" : ""}.`);
        lines.push(`This planet needs the most attention for improvement in ${config.description}.\n`);
      }

      // Recommend strengthening functional benefics, propitiating malefics
      const beneficRemedies: string[] = [];
      const maleficRemedies: string[] = [];

      seen.clear();
      for (const pName of relevantPlanets) {
        if (seen.has(pName)) continue;
        seen.add(pName);
        const remedy = REMEDIES[pName];
        if (!remedy) continue;

        const isBenefic = funcData?.benefics.includes(pName) || funcData?.yogakaraka === pName;
        const planet = findPlanet(chart, pName);
        const isWeak = planet ? (planet.isDebilitated || isInMKS(chart, pName)) : false;

        // Determine best day to start wearing gemstone
        const dayMap: Record<string, string> = {
          Sun: "Sunday at sunrise", Moon: "Monday during Shukla Paksha (waxing moon)",
          Mars: "Tuesday morning", Mercury: "Wednesday morning",
          Jupiter: "Thursday morning", Venus: "Friday morning",
          Saturn: "Saturday evening", Rahu: "Saturday during Rahu Kala", Ketu: "Tuesday or Saturday",
        };

        if (isBenefic || isWeak) {
          beneficRemedies.push(
            `STRENGTHEN ${pName}:\n` +
            `  Gemstone: ${remedy.gemstone}\n` +
            `    - Wear on: ${remedy.finger}\n` +
            `    - Metal: ${remedy.metal}\n` +
            `    - Best day to start: ${dayMap[pName] || remedy.fasting_day}\n` +
            `    - Minimum weight: ${pName === "Jupiter" || pName === "Venus" ? "2 carats" : pName === "Sun" ? "3 carats" : "3-5 carats"}\n` +
            `  Mantra: "${remedy.mantra}"\n` +
            `    - Recite ${pName === "Saturn" || pName === "Rahu" ? "23,000" : pName === "Sun" ? "7,000" : "11,000"} times for full effect, or 108 times daily\n` +
            `  Deity: ${remedy.deity} — worship regularly, especially on ${remedy.fasting_day}s\n` +
            `  Fasting: ${remedy.fasting_day} — even a partial fast (one meal) helps\n` +
            `  Color to favor: ${remedy.color} — wear this color on ${remedy.fasting_day}s\n` +
            `  Charity: ${remedy.good_deeds}`
          );
        } else {
          maleficRemedies.push(
            `PROPITIATE ${pName} (do NOT wear its gemstone — it would amplify problems):\n` +
            `  Mantra: "${remedy.mantra}" — recite 108 times daily, especially on ${remedy.fasting_day}s\n` +
            `  Fasting: Observe a fast on ${remedy.fasting_day} — even skipping one meal counts\n` +
            `  Deity: ${remedy.deity} — regular worship helps pacify this planet\n` +
            `  Charity: ${remedy.good_deeds}\n` +
            `  Color to avoid: ${remedy.color} (for malefic planets, avoid their color rather than favor it)`
          );
        }
      }

      if (beneficRemedies.length > 0) {
        lines.push("GEMSTONES & STRENGTHENING (for your benefic planets):\n");
        lines.push(beneficRemedies.join("\n\n"));
      }

      if (maleficRemedies.length > 0) {
        lines.push("\nPROPITIATION (for challenging planets — mantras & charity, not gemstones):\n");
        lines.push(maleficRemedies.join("\n\n"));
      }

      // --- QUICK DAILY PRACTICE ---
      lines.push("\nQUICK DAILY PRACTICE:");
      if (weakestPlanet) {
        const wr = REMEDIES[weakestPlanet];
        if (wr) {
          lines.push(`Since ${weakestPlanet} needs the most support, your minimum daily practice is:`);
          lines.push(`1. Recite "${wr.mantra}" 108 times (takes about 10 minutes)`);
          lines.push(`2. Wear ${wr.color} on ${wr.fasting_day}s`);
          lines.push(`3. ${wr.good_deeds.split(".")[0]}`);
        }
      }

      // --- YOGAKARAKA BOOST ---
      if (funcData?.yogakaraka) {
        const ykRemedy = REMEDIES[funcData.yogakaraka];
        if (ykRemedy) {
          lines.push(`\nSPECIAL BOOST — YOGAKARAKA ${funcData.yogakaraka}:`);
          lines.push(`For ${ascSign} ascendant, ${funcData.yogakaraka} is your Yogakaraka (most powerful benefic). Strengthening it through ${ykRemedy.gemstone} gemstone and worship of ${ykRemedy.deity} amplifies ALL positive areas of your life — not just ${problemArea}.`);
        }
      }

      return lines.join("\n");
    },
  },

  compatibility: {
    name: "Compatibility Analysis",
    description: "Relationship compatibility between two people based on Moon signs and house overlays.",
    requiredInputs: ["birth_data", "partner_birth_data"],
    optionalInputs: [],
    compute: (chart, params) => {
      if (!params?.partner_chart) {
        return "Compatibility analysis requires a partner_chart (BirthChartData) in params. Please provide the partner's birth details.";
      }
      const partner = params.partner_chart as BirthChartData;
      const lines: string[] = ["COMPATIBILITY ANALYSIS\n"];

      // Moon sign compatibility (Kuta matching simplified)
      lines.push(`Person 1 Moon: ${chart.moonSign} (${chart.moonNakshatra})`);
      lines.push(`Person 2 Moon: ${partner.moonSign} (${partner.moonNakshatra})`);

      // Rashi compatibility — same element is good
      const traits1 = RASHI_DETAILED_TRAITS[chart.moonSign];
      const traits2 = RASHI_DETAILED_TRAITS[partner.moonSign];
      if (traits1 && traits2) {
        if (traits1.element === traits2.element) {
          lines.push(`\nMoon signs share the same element (${traits1.element}) — natural emotional harmony.`);
        } else {
          const compatible: Record<string, string[]> = { Fire: ["Air"], Air: ["Fire"], Water: ["Earth"], Earth: ["Water"] };
          if (compatible[traits1.element]?.includes(traits2.element)) {
            lines.push(`\nMoon sign elements (${traits1.element} + ${traits2.element}) are compatible — they energize each other.`);
          } else {
            lines.push(`\nMoon sign elements (${traits1.element} + ${traits2.element}) require effort — different emotional needs.`);
          }
        }
      }

      // 7th lord exchange
      const p1_lord7 = houseLordInHouse(chart, 7);
      const p2_lord7 = houseLordInHouse(partner, 7);
      lines.push(`\nPerson 1 — 7th lord in house ${p1_lord7}: ${p1_lord7 ? LORD7_IN_HOUSE[p1_lord7] : ""}`);
      lines.push(`Person 2 — 7th lord in house ${p2_lord7}: ${p2_lord7 ? LORD7_IN_HOUSE[p2_lord7] : ""}`);

      // Navamsa comparison
      lines.push(`\nPerson 1 Navamsa Ascendant: ${chart.navamsa.ascendant.rashiName}`);
      lines.push(`Person 2 Navamsa Ascendant: ${partner.navamsa.ascendant.rashiName}`);

      return lines.join("\n");
    },
  },

  full_chart: {
    name: "Full Chart Dump",
    description: "Complete chart with all calculations for comprehensive analysis.",
    requiredInputs: ["birth_data"],
    optionalInputs: [],
    compute: (chart) => {
      const lines: string[] = ["COMPLETE BIRTH CHART ANALYSIS\n"];

      // Ascendant
      lines.push(`Ascendant: ${chart.ascendant.rashiName} at ${chart.ascendant.degrees.toFixed(1)} degrees`);

      // All planets
      lines.push("\nPLANET POSITIONS:");
      for (const p of chart.planets) {
        const house = houseOf(p.rashi, chart.ascendant.rashi);
        let status = "";
        if (p.isExalted) status = " [EXALTED]";
        if (p.isDebilitated) status = " [DEBILITATED]";
        if (p.isRetrograde) status += " [R]";
        if (isInMKS(chart, p.name)) status += " [MKS]";
        lines.push(`${p.name}: ${p.rashiName} ${p.degrees.toFixed(1)}° (House ${house}, ${p.nakshatraName} Pada ${p.nakshatraPada})${status}`);
        const meaning = PLANET_IN_HOUSE_MEANING[p.name]?.[house];
        if (meaning) lines.push(`  → ${meaning}`);
      }

      // Houses
      lines.push("\nHOUSE LORDS & PLACEMENTS:");
      for (let h = 1; h <= 12; h++) {
        const houseRashi = (chart.ascendant.rashi + h - 1) % 12;
        const lordName = RASHI_LORDS[houseRashi];
        const lordHouse = houseLordInHouse(chart, h);
        lines.push(`House ${h} (${RASHI_NAMES[houseRashi]}): Lord ${lordName} in house ${lordHouse}`);
      }

      // Yogas
      if (chart.yogas.length > 0) {
        lines.push("\nYOGAS:");
        lines.push(chart.yogas.join("\n"));
      }

      // Chara Karakas
      lines.push("\nCHARA KARAKAS:");
      for (const ck of chart.charaKarakas) {
        lines.push(`${ck.karaka}: ${ck.planet}`);
      }

      // Arudha Padas
      lines.push("\nARUDHA PADAS:");
      for (const ap of chart.arudhaPadas) {
        lines.push(`A${ap.house}: ${ap.padaName}`);
      }

      // Special Lagnas
      lines.push("\nSPECIAL LAGNAS:");
      for (const sl of chart.specialLagnas) {
        lines.push(`${sl.name}: ${sl.rashiName}`);
      }

      // Divisional charts
      lines.push(`\nNAVAMSA (D-9): Asc ${chart.navamsa.ascendant.rashiName}`);
      for (const p of chart.navamsa.planets) {
        lines.push(`  ${p.name}: ${p.rashiName}`);
      }

      lines.push(`\nDASAMSA (D-10): Asc ${chart.dasamsa.ascendant.rashiName}`);
      for (const p of chart.dasamsa.planets) {
        lines.push(`  ${p.name}: ${p.rashiName}`);
      }

      // Ashtakavarga
      lines.push("\nASHTAKAVARGA (Sarva):");
      for (let i = 0; i < 12; i++) {
        const houseNum = ((i - chart.ascendant.rashi + 12) % 12) + 1;
        lines.push(`House ${houseNum} (${RASHI_NAMES[i]}): ${chart.ashtakavarga.sarva[i]} points`);
      }

      // Dasha periods
      lines.push("\nVIMSOTTARI DASHA PERIODS:");
      for (const md of chart.vimsottariDasha) {
        lines.push(`${md.lord}: ${periodStr(md)}`);
        if (md.antardashas) {
          for (const ad of md.antardashas) {
            lines.push(`  ${ad.lord}: ${periodStr(ad)}`);
          }
        }
      }

      return lines.join("\n");
    },
  },
};
