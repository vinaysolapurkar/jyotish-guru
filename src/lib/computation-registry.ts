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
- children_timing: When children born/will be born. Needs: birth_data. Optional: actual_children_years.
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

  const results: string[] = [];
  for (const md of chart.vimsottariDasha) {
    if (!md.antardashas) continue;
    for (const ad of md.antardashas) {
      if (relevantPlanets.has(md.lord) || relevantPlanets.has(ad.lord)) {
        results.push(`${md.lord}-${ad.lord} (${periodStr(ad)})`);
      }
    }
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

      // 7th lord analysis
      const lord7House = houseLordInHouse(chart, 7);
      if (lord7House) {
        lines.push(`Your marriage significator sits in house ${lord7House}: ${LORD7_IN_HOUSE[lord7House]}`);
      }

      // Venus analysis
      const venus = findPlanet(chart, "Venus");
      if (venus) {
        const venusHouse = houseOf(venus.rashi, chart.ascendant.rashi);
        lines.push(`\nVenus (love planet) in house ${venusHouse}: ${VENUS_IN_HOUSE[venusHouse]}`);
        if (venus.isExalted) lines.push("Venus is exalted — relationships are blessed with grace and attraction.");
        if (venus.isDebilitated) lines.push("Venus is debilitated — relationships require extra patience and conscious effort.");
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

      // Timing via dashas — houses 7, 2, 11 (marriage, family, gains)
      lines.push("\nKey marriage timing periods:");
      const periods = timingForHouses(chart, [7, 2, 11]);
      lines.push(periods.slice(0, 10).join("\n"));

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

      const lord10House = houseLordInHouse(chart, 10);
      if (lord10House) {
        lines.push(`Your career lord sits in house ${lord10House}: ${LORD10_IN_HOUSE[lord10House]}`);
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

      // Timing via houses 10, 6 (career, service), 11 (gains)
      lines.push("\nKey career timing periods:");
      const periods = timingForHouses(chart, [10, 6, 11]);
      lines.push(periods.slice(0, 10).join("\n"));

      return lines.join("\n");
    },
  },

  children_timing: {
    name: "Children Timing",
    description: "Predicts when children are born based on 5th house and Jupiter periods.",
    requiredInputs: ["birth_data"],
    optionalInputs: ["actual_children_years"],
    compute: (chart, params) => {
      const lines: string[] = ["CHILDREN TIMING ANALYSIS\n"];

      const lord5House = houseLordInHouse(chart, 5);
      if (lord5House) {
        lines.push(`Your 5th lord (children) sits in house ${lord5House}: ${DASHA_LORD_IN_HOUSE[lord5House]}`);
      }

      const jupiter = findPlanet(chart, "Jupiter");
      if (jupiter) {
        const jupHouse = houseOf(jupiter.rashi, chart.ascendant.rashi);
        lines.push(`Jupiter (natural significator of children) in house ${jupHouse}: ${PLANET_IN_HOUSE_MEANING["Jupiter"]?.[jupHouse] || ""}`);
        if (jupiter.isExalted) lines.push("Jupiter exalted — children are a source of great blessing.");
        if (jupiter.isDebilitated) lines.push("Jupiter debilitated — children may come with delays or challenges that ultimately teach patience.");
      }

      // Timing via houses 5, 9 (children, fortune), 2 (family growth)
      lines.push("\nKey children timing periods:");
      const periods = timingForHouses(chart, [5, 9, 2]);
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

      // Check Marana Karaka Sthana planets
      const mksWarnings: string[] = [];
      for (const planet of chart.planets) {
        if (isInMKS(chart, planet.name)) {
          const house = houseOf(planet.rashi, chart.ascendant.rashi);
          mksWarnings.push(`${planet.name} is in Marana Karaka Sthana (house ${house}) — severely weakened. During ${planet.name} periods, expect challenges related to ${BODY_PART_BY_PLANET[planet.name] || "its significations"}.`);
        }
      }
      if (mksWarnings.length > 0) {
        lines.push("CRITICAL WEAKNESS DETECTED:");
        lines.push(mksWarnings.join("\n"));
      }

      // Badhakasthana analysis
      const ascQuality = signQuality(chart.ascendant.rashi);
      const badhakHouse = BADHAKASTHANA[ascQuality];
      if (badhakHouse) {
        const badhakRashi = (chart.ascendant.rashi + badhakHouse - 1) % 12;
        const badhakLord = RASHI_LORDS[badhakRashi];
        lines.push(`\nBadhaka (obstruction) lord is ${badhakLord} (rules house ${badhakHouse}). Periods of ${badhakLord} can bring sudden obstacles and inexplicable difficulties.`);
      }

      // Dusthana lord periods (6, 8, 12)
      lines.push("\nChallenging timing periods (6th, 8th, 12th house activations):");
      const periods = timingForHouses(chart, [6, 8, 12]);
      lines.push(periods.slice(0, 12).join("\n"));

      // Debilitated planet periods
      const debPlanets = chart.planets.filter((p) => p.isDebilitated);
      if (debPlanets.length > 0) {
        lines.push("\nDebilitated planets whose periods may be difficult:");
        for (const p of debPlanets) {
          lines.push(`${p.name} is debilitated in ${p.rashiName} — its periods bring struggles related to ${BODY_PART_BY_PLANET[p.name] || "its significations"}.`);
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

      const lord2House = houseLordInHouse(chart, 2);
      const lord11House = houseLordInHouse(chart, 11);
      if (lord2House) lines.push(`2nd lord (wealth) in house ${lord2House}: ${DASHA_LORD_IN_HOUSE[lord2House]}`);
      if (lord11House) lines.push(`11th lord (gains) in house ${lord11House}: ${DASHA_LORD_IN_HOUSE[lord11House]}`);

      // Ashtakavarga for wealth houses
      const sav2 = chart.ashtakavarga.sarva[(chart.ascendant.rashi + 1) % 12];
      const sav11 = chart.ashtakavarga.sarva[(chart.ascendant.rashi + 10) % 12];
      lines.push(`\nAshtakavarga strength: 2nd house = ${sav2} points, 11th house = ${sav11} points.`);
      if (sav2 >= 30) lines.push("2nd house is strong — wealth accumulation is well-supported.");
      if (sav11 >= 30) lines.push("11th house is strong — income and gains flow steadily.");
      if (sav2 < 25) lines.push("2nd house is weak — wealth accumulation requires extra effort.");
      if (sav11 < 25) lines.push("11th house is weak — income growth may be slower than desired.");

      // Timing
      lines.push("\nKey wealth timing periods:");
      const periods = timingForHouses(chart, [2, 11, 9, 5]);
      lines.push(periods.slice(0, 10).join("\n"));

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
      if (currentMD.antardashas) {
        const now = new Date();
        const currentAD = currentMD.antardashas.find((ad) => now >= ad.startDate && now <= ad.endDate);
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

        // Next 2-3 antardashas
        const futureADs = currentMD.antardashas.filter((ad) => ad.startDate > now).slice(0, 3);
        if (futureADs.length > 0) {
          lines.push("\nUPCOMING SUB-PERIODS:");
          for (const ad of futureADs) {
            const adPlanet = findPlanet(chart, ad.lord);
            if (adPlanet) {
              const adHouse = houseOf(adPlanet.rashi, chart.ascendant.rashi);
              lines.push(`${ad.lord} (${periodStr(ad)}): House ${adHouse} focus. ${DASHA_LORD_IN_HOUSE[adHouse]}`);
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

      // Moon sign and nakshatra
      lines.push(`\nMOON SIGN — ${chart.moonSign}:`);
      const moonTraits = RASHI_DETAILED_TRAITS[chart.moonSign];
      if (moonTraits) lines.push(moonTraits.personality);

      const nakshatraDesc = NAKSHATRA_PERSONALITIES[chart.moonNakshatra];
      if (nakshatraDesc) {
        lines.push(`\nMOON NAKSHATRA — ${chart.moonNakshatra}:`);
        lines.push(nakshatraDesc);
      }

      // Sun sign
      lines.push(`\nSUN SIGN — ${chart.sunSign}:`);
      const sunPlanet = findPlanet(chart, "Sun");
      if (sunPlanet) {
        const sunHouse = houseOf(sunPlanet.rashi, chart.ascendant.rashi);
        lines.push(PLANET_IN_HOUSE_MEANING["Sun"]?.[sunHouse] || "");
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

      // Constitution
      const ascTraits = RASHI_DETAILED_TRAITS[chart.ascendant.rashiName];
      if (ascTraits) {
        lines.push(`Constitution: ${ascTraits.constitution} type`);
        lines.push(`Primary vulnerable area: ${ascTraits.bodyPart}`);
      }

      // 6th house (disease) analysis
      const lord6House = houseLordInHouse(chart, 6);
      if (lord6House !== null) {
        lines.push(`\n6th lord (disease indicator) in house ${lord6House}: ${BODY_PART_BY_HOUSE[lord6House]} may need attention.`);
      }

      // 8th house (chronic illness) analysis
      const lord8House = houseLordInHouse(chart, 8);
      if (lord8House !== null) {
        lines.push(`8th lord (chronic conditions) in house ${lord8House}: Watch ${BODY_PART_BY_HOUSE[lord8House]}.`);
      }

      // MKS planets — health vulnerabilities
      const mksIssues: string[] = [];
      for (const p of chart.planets) {
        if (isInMKS(chart, p.name)) {
          mksIssues.push(`${p.name} in MKS: Vulnerable to ${BODY_PART_BY_PLANET[p.name]}. Take preventive care.`);
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
      const problemMap: Record<string, { houses: number[]; karakas: string[] }> = {
        marriage: { houses: [7, 2], karakas: ["Venus"] },
        career: { houses: [10, 6], karakas: ["Saturn", "Sun"] },
        health: { houses: [1, 6, 8], karakas: ["Sun", "Moon"] },
        wealth: { houses: [2, 11], karakas: ["Jupiter"] },
        children: { houses: [5], karakas: ["Jupiter"] },
        education: { houses: [4, 5], karakas: ["Mercury", "Jupiter"] },
        spiritual: { houses: [9, 12], karakas: ["Jupiter", "Ketu"] },
        general: { houses: [1, 9], karakas: ["Jupiter", "Sun"] },
      };

      const config = problemMap[problemArea] || problemMap.general;

      // Find the weakest planet related to the problem
      const relevantPlanets: string[] = [...config.karakas];
      for (const h of config.houses) {
        const houseRashi = (chart.ascendant.rashi + h - 1) % 12;
        relevantPlanets.push(RASHI_LORDS[houseRashi]);
      }

      // Recommend strengthening functional benefics, propitiating malefics
      const beneficRemedies: string[] = [];
      const maleficRemedies: string[] = [];

      const seen = new Set<string>();
      for (const pName of relevantPlanets) {
        if (seen.has(pName)) continue;
        seen.add(pName);
        const remedy = REMEDIES[pName];
        if (!remedy) continue;

        const isBenefic = funcData?.benefics.includes(pName) || funcData?.yogakaraka === pName;
        const planet = findPlanet(chart, pName);
        const isWeak = planet ? (planet.isDebilitated || isInMKS(chart, pName)) : false;

        if (isBenefic || isWeak) {
          beneficRemedies.push(
            `STRENGTHEN ${pName}:\n` +
            `  Gemstone: ${remedy.gemstone} (wear on ${remedy.finger} in ${remedy.metal})\n` +
            `  Mantra: ${remedy.mantra}\n` +
            `  Deity: ${remedy.deity}\n` +
            `  Color: ${remedy.color}\n` +
            `  Good deeds: ${remedy.good_deeds}`
          );
        } else {
          maleficRemedies.push(
            `PROPITIATE ${pName}:\n` +
            `  Mantra: ${remedy.mantra}\n` +
            `  Fasting: ${remedy.fasting_day}\n` +
            `  Deity: ${remedy.deity}\n` +
            `  Good deeds: ${remedy.good_deeds}`
          );
        }
      }

      if (beneficRemedies.length > 0) {
        lines.push("GEMSTONES & STRENGTHENING (for your benefic planets):\n");
        lines.push(beneficRemedies.join("\n\n"));
      }

      if (maleficRemedies.length > 0) {
        lines.push("\nPROPITIATION (for challenging planets — no gemstones, use mantras & charity):\n");
        lines.push(maleficRemedies.join("\n\n"));
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
