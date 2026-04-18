// =============================================================================
// Vedic Astrology Calculation Engine
// Based on P.V.R. Narasimha Rao's "Vedic Astrology: An Integrated Approach"
// =============================================================================

// --- Constants & Data Tables ---

export const RASHI_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export const RASHI_SANSKRIT = [
  "Mesha", "Vrishabha", "Mithuna", "Karkataka", "Simha", "Kanya",
  "Thula", "Vrischika", "Dhanus", "Makara", "Kumbha", "Meena",
] as const;

export const RASHI_SYMBOLS = [
  "\u2648", "\u2649", "\u264A", "\u264B", "\u264C", "\u264D",
  "\u264E", "\u264F", "\u2650", "\u2651", "\u2652", "\u2653",
] as const;

export const GRAHA_NAMES = [
  "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu",
] as const;

export const GRAHA_SANSKRIT = [
  "Surya", "Chandra", "Mangala", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu",
] as const;

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Moola", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

// Vimsottari Dasha lords in sequence, with durations in years
export const VIMSOTTARI_LORDS = [
  { lord: "Ketu", years: 7 },
  { lord: "Venus", years: 20 },
  { lord: "Sun", years: 6 },
  { lord: "Moon", years: 10 },
  { lord: "Mars", years: 7 },
  { lord: "Rahu", years: 18 },
  { lord: "Jupiter", years: 16 },
  { lord: "Saturn", years: 19 },
  { lord: "Mercury", years: 17 },
] as const;

// Nakshatra to Vimsottari lord mapping (from Table 2 of textbook)
export const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
] as const;

// Rashi lords (owners)
export const RASHI_LORDS = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
] as const;

// Exaltation signs (0-indexed rashi)
export const EXALTATION: Record<string, number> = {
  Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6, Rahu: 1, Ketu: 7,
};

// Debilitation signs
export const DEBILITATION: Record<string, number> = {
  Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0, Rahu: 7, Ketu: 1,
};

// Natural benefics and malefics
export const NATURAL_BENEFICS = ["Jupiter", "Venus", "Mercury", "Moon"];
export const NATURAL_MALEFICS = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"];

// House significations (from Chapter 7)
export const HOUSE_SIGNIFICATIONS = [
  "Self, personality, physical body, health, temperament, appearance",
  "Wealth, speech, family, food, right eye, face, oral expression",
  "Courage, younger siblings, short journeys, communication, arms, ears",
  "Mother, home, comforts, vehicles, education, happiness, chest, heart",
  "Children, intelligence, creativity, mantras, past merit, stomach",
  "Enemies, debts, diseases, service, obstacles, maternal uncle",
  "Marriage, spouse, partnerships, business, desires, lower abdomen",
  "Longevity, obstacles, chronic illness, transformation, inheritance, occult",
  "Father, dharma, fortune, guru, higher education, long journeys, religion",
  "Career, profession, fame, karma, social status, government, knees",
  "Gains, income, elder siblings, friends, hopes, ankles",
  "Losses, expenditure, foreign lands, liberation, sleep, left eye, feet",
];

// --- Astronomical Approximations ---
// Simplified planetary longitude calculations using mean elements
// For production, use Swiss Ephemeris or similar

const J2000 = 2451545.0; // Julian Date for J2000.0 epoch
const AYANAMSA_LAHIRI_J2000 = 23.856; // Lahiri ayanamsa at J2000 in degrees
const AYANAMSA_RATE = 0.01396; // degrees per year

function dateToJulianDay(year: number, month: number, day: number, hour: number = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24.0 + B - 1524.5;
}

function getLahiriAyanamsa(jd: number): number {
  const yearsSinceJ2000 = (jd - J2000) / 365.25;
  return AYANAMSA_LAHIRI_J2000 + AYANAMSA_RATE * yearsSinceJ2000;
}

function normalize360(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

// Mean planetary longitudes (tropical) using simplified formulas
function getMeanSunLongitude(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = (M * Math.PI) / 180;
  const C = (1.914602 - 0.004817 * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  return normalize360(L0 + C);
}

function getMeanMoonLongitude(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  const Lp = 218.3165 + 481267.8813 * T;
  const D = 297.8502 + 445267.1115 * T;
  const M = 357.5291 + 35999.0503 * T;
  const Mp = 134.9634 + 477198.8676 * T;
  const F = 93.2720 + 483202.0175 * T;

  const Drad = (D * Math.PI) / 180;
  const Mrad = (M * Math.PI) / 180;
  const Mprad = (Mp * Math.PI) / 180;
  const Frad = (F * Math.PI) / 180;

  let lon = Lp;
  lon += 6.289 * Math.sin(Mprad);
  lon += 1.274 * Math.sin(2 * Drad - Mprad);
  lon += 0.658 * Math.sin(2 * Drad);
  lon += 0.214 * Math.sin(2 * Mprad);
  lon -= 0.186 * Math.sin(Mrad);
  lon -= 0.114 * Math.sin(2 * Frad);

  return normalize360(lon);
}

function getMarsLongitude(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  const L = 355.433 + 19140.2993 * T;
  const M = 319.513 + 19139.8585 * T;
  const Mrad = (M * Math.PI) / 180;
  const lon = L + 10.691 * Math.sin(Mrad) + 0.623 * Math.sin(2 * Mrad);
  return normalize360(lon);
}

function getMercuryLongitude(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  const sunLon = getMeanSunLongitude(jd);
  const M = 174.7948 + 149472.5153 * T;
  const Mrad = (M * Math.PI) / 180;
  const lon = sunLon + 22.014 * Math.sin(Mrad) + 2.543 * Math.sin(2 * Mrad);
  return normalize360(lon);
}

function getJupiterLongitude(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  const L = 34.351 + 3034.9057 * T;
  const M = 20.020 + 3034.6870 * T;
  const Mrad = (M * Math.PI) / 180;
  const lon = L + 5.555 * Math.sin(Mrad) + 0.168 * Math.sin(2 * Mrad);
  return normalize360(lon);
}

function getVenusLongitude(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  const sunLon = getMeanSunLongitude(jd);
  const M = 50.4161 + 58517.8039 * T;
  const Mrad = (M * Math.PI) / 180;
  const lon = sunLon + 0.7758 * Math.sin(Mrad) + 0.0033 * Math.sin(2 * Mrad);
  return normalize360(lon);
}

function getSaturnLongitude(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  const L = 50.077 + 1222.1138 * T;
  const M = 317.021 + 1222.1116 * T;
  const Mrad = (M * Math.PI) / 180;
  const lon = L + 6.404 * Math.sin(Mrad) + 0.169 * Math.sin(2 * Mrad);
  return normalize360(lon);
}

function getRahuLongitude(jd: number): number {
  const T = (jd - J2000) / 36525.0;
  // Rahu (Mean North Node) moves retrograde
  const lon = 125.0446 - 1934.1363 * T;
  return normalize360(lon);
}

// --- Main Calculation Functions ---

export interface PlanetPosition {
  name: string;
  sanskritName: string;
  longitude: number; // sidereal longitude in degrees
  rashi: number; // 0-11
  rashiName: string;
  rashiSanskrit: string;
  degrees: number; // degrees within rashi (0-30)
  nakshatra: number; // 0-26
  nakshatraName: string;
  nakshatraPada: number; // 1-4
  isExalted: boolean;
  isDebilitated: boolean;
  isRetrograde: boolean;
}

export interface AshtakavargaData {
  bhinna: Record<string, number[]>; // planet name -> 12 bindus
  sarva: number[]; // 12 totals
}

export interface ArudhaPadaData {
  house: number;
  padaRashi: number;
  padaName: string;
}

export interface SpecialLagnaData {
  name: string;
  longitude: number;
  rashi: number;
  rashiName: string;
}

export interface CharaKarakaData {
  karaka: string;
  planet: string;
  degrees: number;
}

export interface PlanetaryAspectData {
  planet: string;
  aspectsHouses: number[];
}

export interface BirthChartData {
  ascendant: {
    longitude: number;
    rashi: number;
    rashiName: string;
    degrees: number;
  };
  planets: PlanetPosition[];
  houses: { rashi: number; rashiName: string; signification: string }[];
  sunSign: string;
  sunNakshatra: string;
  sunNakshatraPada: number;
  moonSign: string;
  moonNakshatra: string;
  moonNakshatraPada: number;
  vimsottariDasha: DashaPeriod[];
  yogas: string[];
  ashtakavarga: AshtakavargaData;
  arudhaPadas: ArudhaPadaData[];
  specialLagnas: SpecialLagnaData[];
  charaKarakas: CharaKarakaData[];
  aspects: PlanetaryAspectData[];
}

export interface DashaPeriod {
  lord: string;
  startDate: Date;
  endDate: Date;
  years: number;
}

function calculateAscendant(jd: number, latitude: number, longitude: number): number {
  // Simplified ascendant calculation
  const T = (jd - J2000) / 36525.0;
  const GMST = 280.46061837 + 360.98564736629 * (jd - J2000) + 0.000387933 * T * T;
  const LST = normalize360(GMST + longitude);
  const LSTrad = (LST * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const obliquity = 23.4393 - 0.0130 * T;
  const oblRad = (obliquity * Math.PI) / 180;

  let ascendant = Math.atan2(
    Math.cos(LSTrad),
    -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(LSTrad))
  );
  ascendant = (ascendant * 180) / Math.PI;
  ascendant = normalize360(ascendant);

  return ascendant;
}

export function calculateBirthChart(
  birthDate: string, // YYYY-MM-DD
  birthTime: string, // HH:MM
  latitude: number,
  longitude: number
): BirthChartData {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hours, minutes] = birthTime.split(":").map(Number);
  const hourDecimal = hours + minutes / 60;

  // Adjust for timezone (approximate: use longitude / 15)
  const utcHour = hourDecimal - longitude / 15;
  const jd = dateToJulianDay(year, month, day, utcHour);
  const ayanamsa = getLahiriAyanamsa(jd);

  // Calculate tropical longitudes and convert to sidereal
  const tropicalPositions = [
    { name: "Sun", fn: getMeanSunLongitude },
    { name: "Moon", fn: getMeanMoonLongitude },
    { name: "Mars", fn: getMarsLongitude },
    { name: "Mercury", fn: getMercuryLongitude },
    { name: "Jupiter", fn: getJupiterLongitude },
    { name: "Venus", fn: getVenusLongitude },
    { name: "Saturn", fn: getSaturnLongitude },
    { name: "Rahu", fn: getRahuLongitude },
  ];

  const planets: PlanetPosition[] = tropicalPositions.map((p, index) => {
    const tropLon = p.fn(jd);
    const sidLon = normalize360(tropLon - ayanamsa);
    const rashi = Math.floor(sidLon / 30);
    const degreesInRashi = sidLon - rashi * 30;
    const nakshatra = Math.floor(sidLon / (360 / 27));
    const nakshatraPada = Math.floor((sidLon % (360 / 27)) / (360 / 108)) + 1;

    return {
      name: GRAHA_NAMES[index],
      sanskritName: GRAHA_SANSKRIT[index],
      longitude: sidLon,
      rashi,
      rashiName: RASHI_NAMES[rashi],
      rashiSanskrit: RASHI_SANSKRIT[rashi],
      degrees: degreesInRashi,
      nakshatra,
      nakshatraName: NAKSHATRA_NAMES[nakshatra] || "Unknown",
      nakshatraPada,
      isExalted: EXALTATION[p.name] === rashi,
      isDebilitated: DEBILITATION[p.name] === rashi,
      isRetrograde: false, // Simplified
    };
  });

  // Add Ketu (always 180 degrees from Rahu)
  const rahuPos = planets.find((p) => p.name === "Rahu")!;
  const ketuLon = normalize360(rahuPos.longitude + 180);
  const ketuRashi = Math.floor(ketuLon / 30);
  const ketuDeg = ketuLon - ketuRashi * 30;
  const ketuNak = Math.floor(ketuLon / (360 / 27));
  const ketuPada = Math.floor((ketuLon % (360 / 27)) / (360 / 108)) + 1;

  planets.push({
    name: "Ketu",
    sanskritName: "Ketu",
    longitude: ketuLon,
    rashi: ketuRashi,
    rashiName: RASHI_NAMES[ketuRashi],
    rashiSanskrit: RASHI_SANSKRIT[ketuRashi],
    degrees: ketuDeg,
    nakshatra: ketuNak,
    nakshatraName: NAKSHATRA_NAMES[ketuNak] || "Unknown",
    nakshatraPada: ketuPada,
    isExalted: EXALTATION["Ketu"] === ketuRashi,
    isDebilitated: DEBILITATION["Ketu"] === ketuRashi,
    isRetrograde: true,
  });

  // Calculate Ascendant (Lagna)
  const tropAsc = calculateAscendant(jd, latitude, longitude);
  const sidAsc = normalize360(tropAsc - ayanamsa);
  const ascRashi = Math.floor(sidAsc / 30);

  const ascendant = {
    longitude: sidAsc,
    rashi: ascRashi,
    rashiName: RASHI_NAMES[ascRashi],
    degrees: sidAsc - ascRashi * 30,
  };

  // Calculate houses (whole-sign system as recommended by Parasara)
  const houses = Array.from({ length: 12 }, (_, i) => {
    const houseRashi = (ascRashi + i) % 12;
    return {
      rashi: houseRashi,
      rashiName: RASHI_NAMES[houseRashi],
      signification: HOUSE_SIGNIFICATIONS[i],
    };
  });

  // Sun and Moon signs
  const sunPos = planets.find((p) => p.name === "Sun")!;
  const moonPos = planets.find((p) => p.name === "Moon")!;

  // Calculate Vimsottari Dasha
  const vimsottariDasha = calculateVimsottariDasha(
    moonPos.nakshatra,
    moonPos.longitude % (360 / 27),
    new Date(`${birthDate}T${birthTime}:00`)
  );

  // Detect major yogas
  const yogas = detectYogas(planets, ascRashi);

  // Calculate Ashtakavarga
  const ashtakavarga = calculateAshtakavarga(planets, ascRashi);

  // Calculate Arudha Padas
  const arudhaPadas = calculateArudhaPadas(planets, ascRashi);

  // Calculate Special Lagnas
  const specialLagnas = calculateSpecialLagnas(jd, ayanamsa, sidAsc, latitude, longitude);

  // Calculate Chara Karakas
  const charaKarakas = calculateCharaKarakas(planets);

  // Calculate Planetary Aspects
  const aspects = calculatePlanetaryAspects(planets, ascRashi);

  return {
    ascendant,
    planets,
    houses,
    sunSign: sunPos.rashiName,
    sunNakshatra: sunPos.nakshatraName,
    sunNakshatraPada: sunPos.nakshatraPada,
    moonSign: moonPos.rashiName,
    moonNakshatra: moonPos.nakshatraName,
    moonNakshatraPada: moonPos.nakshatraPada,
    vimsottariDasha,
    yogas,
    ashtakavarga,
    arudhaPadas,
    specialLagnas,
    charaKarakas,
    aspects,
  };
}

function calculateVimsottariDasha(
  moonNakshatra: number,
  progressInNakshatra: number,
  birthDate: Date
): DashaPeriod[] {
  const nakshatraLength = 360 / 27; // 13.333... degrees
  const fractionElapsed = progressInNakshatra / nakshatraLength;

  // Find starting dasha lord from nakshatra
  const dashaLordIndex = moonNakshatra % 9;
  const firstLord = VIMSOTTARI_LORDS[dashaLordIndex];

  // Remaining years in first dasha
  const remainingYearsInFirst = firstLord.years * (1 - fractionElapsed);

  const dashas: DashaPeriod[] = [];
  let currentDate = new Date(birthDate);

  // First (partial) dasha
  const firstEndDate = new Date(currentDate);
  firstEndDate.setFullYear(
    firstEndDate.getFullYear() + Math.floor(remainingYearsInFirst)
  );
  firstEndDate.setMonth(
    firstEndDate.getMonth() +
      Math.round((remainingYearsInFirst % 1) * 12)
  );

  dashas.push({
    lord: firstLord.lord,
    startDate: new Date(currentDate),
    endDate: firstEndDate,
    years: Math.round(remainingYearsInFirst * 10) / 10,
  });
  currentDate = new Date(firstEndDate);

  // Subsequent dashas (full cycle)
  for (let i = 1; i <= 8; i++) {
    const lordIndex = (dashaLordIndex + i) % 9;
    const lord = VIMSOTTARI_LORDS[lordIndex];
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + lord.years);

    dashas.push({
      lord: lord.lord,
      startDate: new Date(currentDate),
      endDate: endDate,
      years: lord.years,
    });
    currentDate = new Date(endDate);
  }

  return dashas;
}

function detectYogas(planets: PlanetPosition[], ascRashi: number): string[] {
  const yogas: string[] = [];

  // Helper to find planet
  const findPlanet = (name: string) => planets.find((p) => p.name === name)!;

  // House number from ascendant (1-indexed)
  const getHouse = (planetRashi: number) => ((planetRashi - ascRashi + 12) % 12) + 1;

  // Get lord of a house (1-indexed)
  const getHouseLord = (house: number) => RASHI_LORDS[(ascRashi + house - 1) % 12];

  // Check if a planet is in own sign
  const isInOwnSign = (planet: PlanetPosition) => RASHI_LORDS[planet.rashi] === planet.name;

  // Check if a rashi difference represents a kendra (0, 3, 6, 9 in 0-indexed offsets)
  const isKendraFrom = (rashi1: number, rashi2: number) => {
    const diff = ((rashi1 - rashi2 + 12) % 12);
    return [0, 3, 6, 9].includes(diff);
  };

  const sun = findPlanet("Sun");
  const moon = findPlanet("Moon");
  const mars = findPlanet("Mars");
  const mercury = findPlanet("Mercury");
  const jupiter = findPlanet("Jupiter");
  const venus = findPlanet("Venus");
  const saturn = findPlanet("Saturn");
  const rahu = findPlanet("Rahu");
  const ketu = findPlanet("Ketu");

  const kendras = [1, 4, 7, 10];
  const trikonas = [1, 5, 9];
  const naturalBenefics = [jupiter, venus, mercury, moon];
  const naturalMalefics = [sun, mars, saturn, rahu, ketu];

  // ===== 1. Gajakesari Yoga =====
  const jupMoonDiff = ((jupiter.rashi - moon.rashi + 12) % 12);
  if ([0, 3, 6, 9].includes(jupMoonDiff)) {
    yogas.push("Gajakesari Yoga: Jupiter in a quadrant from Moon. Indicates wisdom, wealth, fame, and lasting reputation.");
  }

  // ===== 2. Budha-Aditya Yoga =====
  if (sun.rashi === mercury.rashi) {
    yogas.push("Budha-Aditya Yoga: Sun conjunct Mercury. Indicates intelligence, communication skills, and scholarly abilities.");
  }

  // ===== 3. Chandra-Mangala Yoga =====
  if (moon.rashi === mars.rashi) {
    yogas.push("Chandra-Mangala Yoga: Moon conjunct Mars. Indicates earning ability, courage, and material prosperity.");
  }

  // ===== 4-8. Pancha Mahapurusha Yogas =====
  // Hamsa Yoga
  if (kendras.includes(getHouse(jupiter.rashi)) && (jupiter.isExalted || [8, 11].includes(jupiter.rashi))) {
    yogas.push("Hamsa Yoga (Pancha Mahapurusha): Jupiter in a kendra in own/exaltation sign. Indicates righteousness, learning, and spiritual nature.");
  }
  // Malavya Yoga
  if (kendras.includes(getHouse(venus.rashi)) && (venus.isExalted || [1, 6].includes(venus.rashi))) {
    yogas.push("Malavya Yoga (Pancha Mahapurusha): Venus in a kendra in own/exaltation sign. Indicates luxury, beauty, and artistic talent.");
  }
  // Ruchaka Yoga
  if (kendras.includes(getHouse(mars.rashi)) && (mars.isExalted || [0, 7].includes(mars.rashi))) {
    yogas.push("Ruchaka Yoga (Pancha Mahapurusha): Mars in a kendra in own/exaltation sign. Indicates courage, leadership, and commanding personality.");
  }
  // Sasa Yoga
  if (kendras.includes(getHouse(saturn.rashi)) && (saturn.isExalted || [9, 10].includes(saturn.rashi))) {
    yogas.push("Sasa Yoga (Pancha Mahapurusha): Saturn in a kendra in own/exaltation sign. Indicates authority, discipline, and organizational power.");
  }
  // Bhadra Yoga
  if (kendras.includes(getHouse(mercury.rashi)) && (mercury.isExalted || [2, 5].includes(mercury.rashi))) {
    yogas.push("Bhadra Yoga (Pancha Mahapurusha): Mercury in a kendra in own/exaltation sign. Indicates intellect, eloquence, and business acumen.");
  }

  // ===== 9. Dhana Yoga =====
  const lord2 = getHouseLord(2);
  const lord11 = getHouseLord(11);
  const lord2Planet = findPlanet(lord2);
  const lord11Planet = findPlanet(lord11);
  if (lord2Planet.rashi === lord11Planet.rashi) {
    yogas.push("Dhana Yoga: Lords of 2nd and 11th house conjoined. Indicates accumulation of wealth and financial prosperity.");
  }

  // ===== 10-20. Raja Yogas: All valid kendra-trikona lord combinations =====
  const trikonaOffsets = [0, 4, 8]; // 1st, 5th, 9th from asc (0-indexed offset)
  const kendraOffsets = [0, 3, 6, 9]; // 1st, 4th, 7th, 10th from asc (0-indexed offset)
  const rajaYogaCombos: string[] = [];

  for (const t of trikonaOffsets) {
    for (const k of kendraOffsets) {
      if (t === k) continue;
      const trikonaLord = RASHI_LORDS[(ascRashi + t) % 12];
      const kendraLord = RASHI_LORDS[(ascRashi + k) % 12];
      if (trikonaLord === kendraLord) continue;
      const tPlanet = findPlanet(trikonaLord);
      const kPlanet = findPlanet(kendraLord);
      // Conjunction or mutual kendra counts
      if (tPlanet.rashi === kPlanet.rashi) {
        const key = [trikonaLord, kendraLord].sort().join("-");
        if (!rajaYogaCombos.includes(key)) {
          rajaYogaCombos.push(key);
          yogas.push(`Raja Yoga: ${trikonaLord} (trikona lord, house ${t + 1}) conjoined with ${kendraLord} (kendra lord, house ${k + 1}). Indicates power, authority, and success.`);
        }
      }
    }
  }

  // ===== 21. Kemadruma Yoga =====
  const moon2nd = (moon.rashi + 1) % 12;
  const moon12th = (moon.rashi + 11) % 12;
  const realPlanets = [mars, mercury, jupiter, venus, saturn];
  const hasNeighbor = realPlanets.some(
    (p) => p.rashi === moon2nd || p.rashi === moon12th
  );
  if (!hasNeighbor) {
    yogas.push("Kemadruma Yoga: No planets adjacent to Moon. Can indicate periods of loneliness or financial difficulty, but is often cancelled by other factors.");
  }

  // ===== 22. Saraswati Yoga =====
  const goodHouses = [1, 2, 4, 5, 7, 9, 10];
  if (
    goodHouses.includes(getHouse(jupiter.rashi)) &&
    goodHouses.includes(getHouse(venus.rashi)) &&
    goodHouses.includes(getHouse(mercury.rashi))
  ) {
    yogas.push("Saraswati Yoga: Jupiter, Venus, and Mercury in benefic houses. Indicates learning, wisdom, eloquence, and mastery of arts.");
  }

  // ===== 23. Harsha Yoga (Vipareeta Raja Yoga) =====
  // 6th lord in 6th, 8th, or 12th house
  const lord6 = getHouseLord(6);
  const lord6House = getHouse(findPlanet(lord6).rashi);
  if ([6, 8, 12].includes(lord6House)) {
    yogas.push("Harsha Yoga (Vipareeta Raja Yoga): 6th lord in a dusthana house. Indicates overcoming enemies, good health despite odds, and unexpected gains through adversity.");
  }

  // ===== 24. Sarala Yoga (Vipareeta Raja Yoga) =====
  // 8th lord in 6th, 8th, or 12th house
  const lord8 = getHouseLord(8);
  const lord8House = getHouse(findPlanet(lord8).rashi);
  if ([6, 8, 12].includes(lord8House)) {
    yogas.push("Sarala Yoga (Vipareeta Raja Yoga): 8th lord in a dusthana house. Indicates longevity, fearlessness, and prosperity from unexpected sources.");
  }

  // ===== 25. Vimala Yoga (Vipareeta Raja Yoga) =====
  // 12th lord in 6th, 8th, or 12th house
  const lord12 = getHouseLord(12);
  const lord12House = getHouse(findPlanet(lord12).rashi);
  if ([6, 8, 12].includes(lord12House)) {
    yogas.push("Vimala Yoga (Vipareeta Raja Yoga): 12th lord in a dusthana house. Indicates ethical conduct, financial prudence, and spiritual gains.");
  }

  // ===== 26. Neecha Bhanga Raja Yoga =====
  // Debilitated planet whose debilitation is cancelled
  for (const planet of planets) {
    if (!planet.isDebilitated) continue;

    let cancelled = false;
    const debRashi = planet.rashi;
    const lordOfDebSign = RASHI_LORDS[debRashi];

    // Cancellation condition 1: Lord of the sign of debilitation is in a kendra from Lagna or Moon
    const lordPlanet = findPlanet(lordOfDebSign);
    if (lordPlanet && (kendras.includes(getHouse(lordPlanet.rashi)) || isKendraFrom(lordPlanet.rashi, moon.rashi))) {
      cancelled = true;
    }

    // Cancellation condition 2: The planet that is exalted in the debilitation sign is in a kendra from Lagna or Moon
    const exaltedInDebSign = Object.entries(EXALTATION).find(([, r]) => r === debRashi)?.[0];
    if (exaltedInDebSign) {
      const exPlanet = findPlanet(exaltedInDebSign);
      if (exPlanet && (kendras.includes(getHouse(exPlanet.rashi)) || isKendraFrom(exPlanet.rashi, moon.rashi))) {
        cancelled = true;
      }
    }

    // Cancellation condition 3: Lord of exaltation sign of the debilitated planet is in a kendra
    const exaltSign = EXALTATION[planet.name];
    if (exaltSign !== undefined) {
      const exaltLord = RASHI_LORDS[exaltSign];
      const exaltLordPlanet = findPlanet(exaltLord);
      if (exaltLordPlanet && kendras.includes(getHouse(exaltLordPlanet.rashi))) {
        cancelled = true;
      }
    }

    if (cancelled) {
      yogas.push(`Neecha Bhanga Raja Yoga: ${planet.name} is debilitated but cancellation conditions are met. Initially challenging placement transforms into a powerful source of achievement and resilience.`);
    }
  }

  // ===== 27. Kala Sarpa Yoga =====
  // All planets between Rahu-Ketu axis
  {
    const rahuLon = rahu.longitude;
    const ketuLon = ketu.longitude;
    const planetsToCheck = [sun, moon, mars, mercury, jupiter, venus, saturn];
    // Check if all planets are on one side of the Rahu-Ketu axis
    const allOnOneSide = planetsToCheck.every((p) => {
      // Check if planet is between Rahu and Ketu going forward
      if (rahuLon > ketuLon) {
        return p.longitude >= ketuLon && p.longitude <= rahuLon;
      } else {
        return p.longitude >= ketuLon || p.longitude <= rahuLon;
      }
    });
    const allOnOtherSide = planetsToCheck.every((p) => {
      if (rahuLon > ketuLon) {
        return p.longitude <= ketuLon || p.longitude >= rahuLon;
      } else {
        return p.longitude <= ketuLon && p.longitude >= rahuLon;
      }
    });
    if (allOnOneSide || allOnOtherSide) {
      yogas.push("Kala Sarpa Yoga: All seven planets are hemmed between Rahu and Ketu. Indicates karmic intensity, sudden changes in fortune, and a life driven by past-life patterns. Results depend on which direction the axis runs.");
    }
  }

  // ===== 28. Sunapha Yoga =====
  // Any planet (except Sun, Rahu, Ketu) in 2nd from Moon
  {
    const secondFromMoon = (moon.rashi + 1) % 12;
    const sunaphaPresent = realPlanets.some((p) => p.rashi === secondFromMoon);
    if (sunaphaPresent) {
      yogas.push("Sunapha Yoga: Planet(s) in the 2nd house from Moon. Indicates self-earned wealth, intelligence, and a good reputation.");
    }
  }

  // ===== 29. Anapha Yoga =====
  // Any planet (except Sun, Rahu, Ketu) in 12th from Moon
  {
    const twelfthFromMoon = (moon.rashi + 11) % 12;
    const anaphaPresent = realPlanets.some((p) => p.rashi === twelfthFromMoon);
    if (anaphaPresent) {
      yogas.push("Anapha Yoga: Planet(s) in the 12th house from Moon. Indicates good health, pleasing personality, and comfortable life.");
    }
  }

  // ===== 30. Durudhara Yoga =====
  // Planets in both 2nd and 12th from Moon (except Sun, Rahu, Ketu)
  {
    const secondFromMoon = (moon.rashi + 1) % 12;
    const twelfthFromMoon = (moon.rashi + 11) % 12;
    const has2nd = realPlanets.some((p) => p.rashi === secondFromMoon);
    const has12th = realPlanets.some((p) => p.rashi === twelfthFromMoon);
    if (has2nd && has12th) {
      yogas.push("Durudhara Yoga: Planets on both sides of Moon (2nd and 12th). Indicates wealth, generosity, vehicles, and a commanding personality.");
    }
  }

  // ===== 31. Adhi Yoga =====
  // Benefics (Jupiter, Venus, Mercury) in 6th, 7th, and/or 8th from Moon
  {
    const moon6 = (moon.rashi + 5) % 12;
    const moon7 = (moon.rashi + 6) % 12;
    const moon8 = (moon.rashi + 7) % 12;
    const beneficPlanets = [jupiter, venus, mercury];
    const inAdhiHouses = beneficPlanets.filter(
      (p) => p.rashi === moon6 || p.rashi === moon7 || p.rashi === moon8
    );
    if (inAdhiHouses.length >= 2) {
      yogas.push("Adhi Yoga: Multiple benefics in 6th/7th/8th from Moon. Indicates leadership ability, political success, and a prosperous life.");
    }
  }

  // ===== 32. Amala Yoga =====
  // Natural benefic in 10th from Lagna or Moon
  {
    const tenth = getHouse(0) === 1 ? 10 : 10; // 10th house from Lagna
    const tenthFromLagna = (ascRashi + 9) % 12;
    const tenthFromMoon = (moon.rashi + 9) % 12;
    const beneficNames = ["Jupiter", "Venus", "Mercury", "Moon"];
    const amalaFromLagna = planets.some((p) => beneficNames.includes(p.name) && p.rashi === tenthFromLagna);
    const amalaFromMoon = planets.some((p) => beneficNames.includes(p.name) && p.name !== "Moon" && p.rashi === tenthFromMoon);
    if (amalaFromLagna || amalaFromMoon) {
      yogas.push("Amala Yoga: Natural benefic in the 10th house from Lagna or Moon. Indicates an unblemished character, fame, and prosperity through righteous deeds.");
    }
  }

  // ===== 33. Lakshmi Yoga =====
  // 9th lord strong (in own/exaltation or kendra) + Venus in own/exaltation in a kendra
  {
    const lord9 = getHouseLord(9);
    const lord9Planet = findPlanet(lord9);
    const lord9Strong = lord9Planet && (lord9Planet.isExalted || isInOwnSign(lord9Planet) || kendras.includes(getHouse(lord9Planet.rashi)));
    const venusStrong = kendras.includes(getHouse(venus.rashi)) && (venus.isExalted || isInOwnSign(venus));
    if (lord9Strong && venusStrong) {
      yogas.push("Lakshmi Yoga: 9th lord is strong and Venus is in own/exaltation in a kendra. Indicates great wealth, luxury, beauty, and divine grace.");
    }
  }

  // ===== 34. Shakata Yoga =====
  // Jupiter in 6th, 8th, or 12th from Moon
  {
    const jupFromMoon = ((jupiter.rashi - moon.rashi + 12) % 12) + 1;
    if ([6, 8, 12].includes(jupFromMoon)) {
      yogas.push("Shakata Yoga: Jupiter in 6th/8th/12th from Moon. Can indicate fluctuating fortune and ups and downs in life. Often cancelled if Jupiter is in a kendra from Lagna.");
    }
  }

  // ===== 35. Parvata Yoga =====
  // Benefics in kendras and no malefics in kendras
  {
    const beneficInKendra = naturalBenefics.some((p) => kendras.includes(getHouse(p.rashi)));
    const maleficInKendra = [sun, mars, saturn].some((p) => kendras.includes(getHouse(p.rashi)));
    if (beneficInKendra && !maleficInKendra) {
      yogas.push("Parvata Yoga: Benefics in kendras with no malefics in kendras. Indicates fame, leadership, charitable nature, and prosperity.");
    }
  }

  // ===== 36. Kahala Yoga =====
  // Lord of 4th and Jupiter in mutual kendras
  {
    const lord4 = getHouseLord(4);
    const lord4Planet = findPlanet(lord4);
    if (lord4Planet && lord4Planet.name !== "Jupiter" && isKendraFrom(lord4Planet.rashi, jupiter.rashi)) {
      yogas.push("Kahala Yoga: 4th lord and Jupiter in mutual kendras. Indicates courage, energy, and leadership. The native is bold and daring.");
    }
  }

  // ===== 37. Viparita Raja Yoga (extended) =====
  // 6th, 8th, 12th lords in each other's houses (not just in dusthanas)
  {
    const lord6Name = getHouseLord(6);
    const lord8Name = getHouseLord(8);
    const lord12Name = getHouseLord(12);
    const lord6P = findPlanet(lord6Name);
    const lord8P = findPlanet(lord8Name);
    const lord12P = findPlanet(lord12Name);

    // Check mutual exchange between pairs of dusthana lords
    const lord6InH = getHouse(lord6P.rashi);
    const lord8InH = getHouse(lord8P.rashi);
    const lord12InH = getHouse(lord12P.rashi);

    if ((lord6InH === 8 && lord8InH === 6) || (lord6InH === 12 && lord12InH === 6) || (lord8InH === 12 && lord12InH === 8)) {
      yogas.push("Viparita Raja Yoga (Exchange): Dusthana lords exchanging houses. Adversities transform into sources of gain and power. Troubles of enemies become the native's advantage.");
    }
  }

  // ===== 38. Chaturmukha Yoga =====
  // Jupiter, Venus, Mercury, Moon in kendras
  {
    const allInKendras = [jupiter, venus, mercury, moon].every((p) => kendras.includes(getHouse(p.rashi)));
    if (allInKendras) {
      yogas.push("Chaturmukha Yoga: Jupiter, Venus, Mercury, and Moon all in kendras. Indicates great fame, learning, and a virtuous life.");
    }
  }

  // ===== 39. Chamara Yoga =====
  // Lagna lord exalted in a kendra and aspected by Jupiter
  {
    const lagnaLord = RASHI_LORDS[ascRashi];
    const lagnaLordPlanet = findPlanet(lagnaLord);
    if (lagnaLordPlanet && lagnaLordPlanet.isExalted && kendras.includes(getHouse(lagnaLordPlanet.rashi))) {
      // Check Jupiter's aspect (Jupiter aspects 5th, 7th, 9th houses from itself)
      const jupAspects = [5, 7, 9].map((offset) => (jupiter.rashi + offset - 1) % 12);
      if (jupAspects.includes(lagnaLordPlanet.rashi) || jupiter.rashi === lagnaLordPlanet.rashi) {
        yogas.push("Chamara Yoga: Lagna lord exalted in a kendra and aspected by Jupiter. Indicates scholarly eminence, royal favor, and eloquence.");
      }
    }
  }

  // ===== 40. Shankha Yoga =====
  // 5th and 6th lords in mutual kendras
  {
    const lord5 = getHouseLord(5);
    const lord5Planet = findPlanet(lord5);
    const lord6Planet = findPlanet(getHouseLord(6));
    if (lord5Planet && lord6Planet && isKendraFrom(lord5Planet.rashi, lord6Planet.rashi)) {
      yogas.push("Shankha Yoga: 5th and 6th lords in mutual kendras. Indicates longevity, good morals, a learned and prosperous life with philanthropic tendencies.");
    }
  }

  // ===== 41. Bheri Yoga =====
  // Venus, Jupiter in kendra; 9th lord strong
  {
    const lord9 = getHouseLord(9);
    const lord9P = findPlanet(lord9);
    const venusInKendra = kendras.includes(getHouse(venus.rashi));
    const jupInKendra = kendras.includes(getHouse(jupiter.rashi));
    const lord9Strong = lord9P && (lord9P.isExalted || isInOwnSign(lord9P));
    if (venusInKendra && jupInKendra && lord9Strong) {
      yogas.push("Bheri Yoga: Venus and Jupiter in kendras with a strong 9th lord. Indicates wealth, family happiness, and a life free from major diseases.");
    }
  }

  // ===== 42. Mridanga Yoga =====
  // Lagna lord strong in kendra or trikona, and all planets in kendras or trikonas
  {
    const lagnaLord = RASHI_LORDS[ascRashi];
    const lagnaLordP = findPlanet(lagnaLord);
    const goodPositions = [1, 4, 5, 7, 9, 10];
    const lagnaLordStrong = lagnaLordP && goodPositions.includes(getHouse(lagnaLordP.rashi)) && (lagnaLordP.isExalted || isInOwnSign(lagnaLordP));
    if (lagnaLordStrong) {
      const allGood = planets.filter((p) => !["Rahu", "Ketu"].includes(p.name)).every((p) => goodPositions.includes(getHouse(p.rashi)));
      if (allGood) {
        yogas.push("Mridanga Yoga: Lagna lord strong and all planets in kendras/trikonas. Indicates fame that spreads far and wide, like the sound of a drum.");
      }
    }
  }

  // ===== 43. Pushkala Yoga =====
  // Moon sign lord in lagna/kendra, aspecting Moon; lagna lord also strong
  {
    const moonSignLord = RASHI_LORDS[moon.rashi];
    const moonSignLordP = findPlanet(moonSignLord);
    if (moonSignLordP && kendras.includes(getHouse(moonSignLordP.rashi))) {
      yogas.push("Pushkala Yoga: Moon's sign lord in a kendra. Indicates wealth, good speech, fame, and respect from the government.");
    }
  }

  // ===== 44. Vasumati Yoga =====
  // All benefics in upachaya houses (3, 6, 10, 11) from Moon
  {
    const upachayasFromMoon = [3, 6, 10, 11].map((h) => (moon.rashi + h - 1) % 12);
    const beneficsInUpachaya = [jupiter, venus, mercury].every((p) => upachayasFromMoon.includes(p.rashi));
    if (beneficsInUpachaya) {
      yogas.push("Vasumati Yoga: Benefics in upachaya houses from Moon. Indicates exceptional wealth and a prosperous life.");
    }
  }

  // ===== 45. Shubha Kartari Yoga =====
  // Benefics on both sides of the ascendant (2nd and 12th houses)
  {
    const h2Rashi = (ascRashi + 1) % 12;
    const h12Rashi = (ascRashi + 11) % 12;
    const beneficIn2 = [jupiter, venus, mercury].some((p) => p.rashi === h2Rashi);
    const beneficIn12 = [jupiter, venus, mercury].some((p) => p.rashi === h12Rashi);
    if (beneficIn2 && beneficIn12) {
      yogas.push("Shubha Kartari Yoga: Benefics surround the ascendant on both sides. Indicates protection, good health, and overall auspiciousness throughout life.");
    }
  }

  // ===== 46. Papa Kartari Yoga =====
  // Malefics on both sides of the ascendant (2nd and 12th houses)
  {
    const h2Rashi = (ascRashi + 1) % 12;
    const h12Rashi = (ascRashi + 11) % 12;
    const maleficIn2 = [sun, mars, saturn, rahu, ketu].some((p) => p.rashi === h2Rashi);
    const maleficIn12 = [sun, mars, saturn, rahu, ketu].some((p) => p.rashi === h12Rashi);
    if (maleficIn2 && maleficIn12) {
      yogas.push("Papa Kartari Yoga: Malefics hemming the ascendant on both sides. Can indicate obstacles, health challenges, and feeling constrained. Strength of lagna lord can mitigate effects.");
    }
  }

  // ===== 47. Shubhavasi Yoga =====
  // Only benefics in 2nd from Sun
  {
    const sun2nd = (sun.rashi + 1) % 12;
    const beneficInSun2 = [jupiter, venus, mercury, moon].some((p) => p.rashi === sun2nd);
    const maleficInSun2 = [mars, saturn, rahu, ketu].some((p) => p.rashi === sun2nd);
    if (beneficInSun2 && !maleficInSun2) {
      yogas.push("Shubhavasi Yoga: Only benefics in 2nd from Sun. Indicates eloquence, diplomacy, and success in fields requiring communication.");
    }
  }

  // ===== 48. Nipuna Yoga (variant of Budha-Aditya) =====
  // Sun and Mercury in the same sign and Mercury is not combust (within ~14 degrees)
  {
    if (sun.rashi === mercury.rashi) {
      const distance = Math.abs(sun.longitude - mercury.longitude);
      if (distance > 14 || distance < 346) {
        yogas.push("Nipuna Yoga: Sun and Mercury conjoined with sufficient distance. Indicates exceptional skill, cleverness, and expertise in arts or sciences.");
      }
    }
  }

  // ===== 49. Akhanda Samrajya Yoga =====
  // Jupiter lord of 2, 5, or 11 AND in kendra from Moon, plus 9th lord strong
  {
    const jupHouse = getHouse(jupiter.rashi);
    const jupLordsWhichHouses: number[] = [];
    for (let h = 1; h <= 12; h++) {
      if (getHouseLord(h) === "Jupiter") {
        jupLordsWhichHouses.push(h);
      }
    }
    const jupLords2_5_11 = jupLordsWhichHouses.some((h) => [2, 5, 11].includes(h));
    const jupKendraFromMoon = isKendraFrom(jupiter.rashi, moon.rashi);
    if (jupLords2_5_11 && jupKendraFromMoon) {
      yogas.push("Akhanda Samrajya Yoga: Jupiter lords a key house and is in kendra from Moon. Indicates undivided sovereignty, enduring prosperity, and widespread influence.");
    }
  }

  // ===== 50. Voshi Yoga =====
  // Planet (except Moon, Rahu, Ketu) in 2nd from Sun
  {
    const sun2 = (sun.rashi + 1) % 12;
    const voshiPresent = [mars, mercury, jupiter, venus, saturn].some((p) => p.rashi === sun2);
    if (voshiPresent) {
      yogas.push("Voshi Yoga: Planet(s) in the 2nd from Sun. Indicates learning, good memory, and a charitable disposition.");
    }
  }

  if (yogas.length === 0) {
    yogas.push("The chart shows a balanced planetary configuration. Specific results depend on dasha periods and transits.");
  }

  return yogas;
}

// Format degrees to readable string
export function formatDegrees(degrees: number): string {
  const d = Math.floor(degrees);
  const m = Math.floor((degrees - d) * 60);
  return `${d}\u00B0${m}'`;
}

// Get current Vimsottari Dasha period
export function getCurrentDasha(dashas: DashaPeriod[]): DashaPeriod | null {
  const now = new Date();
  return dashas.find((d) => now >= d.startDate && now <= d.endDate) || null;
}

// =============================================================================
// Ashtakavarga Calculation
// Based on Parasara's Bhinnashtakavarga benefic point tables
// =============================================================================

// Benefic point contribution tables from Parasara.
// For each contributing body (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Lagna),
// we list the houses (1-indexed from that body) where it contributes a bindu
// for the given target planet's Bhinnashtakavarga.

const ASHTAKAVARGA_TABLES: Record<string, Record<string, number[]>> = {
  Sun: {
    Sun:     [1, 2, 4, 7, 8, 9, 10, 11],
    Moon:    [3, 6, 10, 11],
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus:   [6, 7, 12],
    Saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna:   [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    Sun:     [3, 6, 7, 8, 10, 11],
    Moon:    [1, 3, 6, 7, 10, 11],
    Mars:    [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus:   [3, 4, 5, 7, 9, 10, 11],
    Saturn:  [3, 5, 6, 11],
    Lagna:   [3, 6, 10, 11],
  },
  Mars: {
    Sun:     [3, 5, 6, 10, 11],
    Moon:    [3, 6, 11],
    Mars:    [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus:   [6, 8, 11, 12],
    Saturn:  [1, 4, 7, 8, 9, 10, 11],
    Lagna:   [1, 3, 6, 10, 11],
  },
  Mercury: {
    Sun:     [5, 6, 9, 11, 12],
    Moon:    [2, 4, 6, 8, 10, 11],
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus:   [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna:   [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    Sun:     [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon:    [2, 5, 7, 9, 11],
    Mars:    [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus:   [2, 5, 6, 9, 10, 11],
    Saturn:  [3, 5, 6, 12],
    Lagna:   [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    Sun:     [8, 11, 12],
    Moon:    [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars:    [3, 4, 6, 8, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus:   [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn:  [3, 4, 5, 8, 9, 10, 11],
    Lagna:   [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun:     [1, 2, 4, 7, 8, 10, 11],
    Moon:    [3, 6, 11],
    Mars:    [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus:   [6, 11, 12],
    Saturn:  [3, 5, 6, 11],
    Lagna:   [1, 3, 4, 6, 10, 11],
  },
};

function calculateAshtakavarga(planets: PlanetPosition[], ascRashi: number): AshtakavargaData {
  const targetPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const contributingBodies = [...targetPlanets, "Lagna"];
  const bhinna: Record<string, number[]> = {};
  const sarva: number[] = new Array(12).fill(0);

  // Get rashi position for each contributing body
  const bodyRashi: Record<string, number> = {};
  for (const p of planets) {
    if (targetPlanets.includes(p.name)) {
      bodyRashi[p.name] = p.rashi;
    }
  }
  bodyRashi["Lagna"] = ascRashi;

  for (const target of targetPlanets) {
    const bindus = new Array(12).fill(0);
    const table = ASHTAKAVARGA_TABLES[target];
    if (!table) {
      bhinna[target] = bindus;
      continue;
    }

    for (const contributor of contributingBodies) {
      const contribRashi = bodyRashi[contributor];
      if (contribRashi === undefined) continue;
      const houses = table[contributor];
      if (!houses) continue;

      for (const h of houses) {
        // h is house from the contributor (1-indexed).
        // The rashi that is h houses away from contributor is (contribRashi + h - 1) % 12
        const targetRashi = (contribRashi + h - 1) % 12;
        bindus[targetRashi] += 1;
      }
    }

    bhinna[target] = bindus;
    for (let i = 0; i < 12; i++) {
      sarva[i] += bindus[i];
    }
  }

  return { bhinna, sarva };
}

// =============================================================================
// Arudha Padas Calculation
// =============================================================================

function calculateArudhaPadas(planets: PlanetPosition[], ascRashi: number): ArudhaPadaData[] {
  const padaNames = [
    "Arudha Lagna (AL)", "Dhana Pada (A2)", "Vikrama Pada (A3)",
    "Sukha Pada (A4)", "Mantra Pada (A5)", "Roga Pada (A6)",
    "Dara Pada (A7)", "Mrityu Pada (A8)", "Dharma Pada (A9)",
    "Karma Pada (A10)", "Labha Pada (A11)", "Vyaya Pada (A12)",
  ];

  const padas: ArudhaPadaData[] = [];

  for (let house = 0; house < 12; house++) {
    // Rashi of this house (whole sign)
    const houseRashi = (ascRashi + house) % 12;

    // Lord of this house
    const lord = RASHI_LORDS[houseRashi];

    // Find the lord's rashi position
    const lordPlanet = planets.find((p) => p.name === lord);
    if (!lordPlanet) {
      padas.push({ house: house + 1, padaRashi: houseRashi, padaName: padaNames[house] });
      continue;
    }
    const lordRashi = lordPlanet.rashi;

    // Count from the house rashi to lord's rashi (inclusive of start = 1)
    const distFromHouseToLord = ((lordRashi - houseRashi + 12) % 12);

    // Count the same distance from the lord's rashi
    let padaRashi = (lordRashi + distFromHouseToLord) % 12;

    // Exception: if pada falls in the same house or the 7th from it, shift to 10th from the house
    if (padaRashi === houseRashi || padaRashi === (houseRashi + 6) % 12) {
      padaRashi = (houseRashi + 9) % 12; // 10th from the house (0-indexed, so +9)
    }

    padas.push({
      house: house + 1,
      padaRashi,
      padaName: padaNames[house],
    });
  }

  return padas;
}

// =============================================================================
// Special Lagnas Calculation
// Bhava Lagna, Hora Lagna, Ghati Lagna
// =============================================================================

function calculateSpecialLagnas(
  jd: number,
  ayanamsa: number,
  sidAscendant: number,
  latitude: number,
  longitude: number
): SpecialLagnaData[] {
  const specialLagnas: SpecialLagnaData[] = [];

  // Time elapsed since sunrise approximation
  // Sunrise is roughly when Sun is at the horizon. For simplicity,
  // we use the fractional day from midnight and assume sunrise at 6:00 local time.
  const fractionalDay = (jd - Math.floor(jd) + 0.5) % 1; // fraction from midnight UT
  const localTimeHours = fractionalDay * 24 + longitude / 15; // approximate local time
  // Approximate hours since sunrise (assume sunrise at 6 AM local)
  const hoursSinceSunrise = ((localTimeHours - 6) + 24) % 24;

  // Bhava Lagna: The ascendant advances roughly 30 degrees per 2 hours (per equal house)
  // Bhava Lagna = Ascendant + (time since sunrise in hours) * 15 degrees (approx)
  // More precisely: Sun's longitude at birth + hoursSinceSunrise * (360/24)
  const sunTropical = getMeanSunLongitude(jd);
  const sunSidereal = normalize360(sunTropical - ayanamsa);

  // Bhava Lagna: Sun's sidereal longitude + (time since sunrise * 360/24)
  const bhavaLagna = normalize360(sunSidereal + hoursSinceSunrise * (360 / 24));
  const bhavaRashi = Math.floor(bhavaLagna / 30);
  specialLagnas.push({
    name: "Bhava Lagna",
    longitude: bhavaLagna,
    rashi: bhavaRashi,
    rashiName: RASHI_NAMES[bhavaRashi],
  });

  // Hora Lagna: Sun's sidereal longitude + (time since sunrise * 720/24)
  // Hora Lagna moves at twice the speed of Bhava Lagna
  const horaLagna = normalize360(sunSidereal + hoursSinceSunrise * (720 / 24));
  const horaRashi = Math.floor(horaLagna / 30);
  specialLagnas.push({
    name: "Hora Lagna",
    longitude: horaLagna,
    rashi: horaRashi,
    rashiName: RASHI_NAMES[horaRashi],
  });

  // Ghati Lagna: Sun's sidereal longitude + (time since sunrise * 1800/24)
  // Ghati Lagna moves at 5x the speed of Bhava Lagna
  const ghatiLagna = normalize360(sunSidereal + hoursSinceSunrise * (1800 / 24));
  const ghatiRashi = Math.floor(ghatiLagna / 30);
  specialLagnas.push({
    name: "Ghati Lagna",
    longitude: ghatiLagna,
    rashi: ghatiRashi,
    rashiName: RASHI_NAMES[ghatiRashi],
  });

  return specialLagnas;
}

// =============================================================================
// Chara Karakas (Variable Significators)
// 8 karakas from Atmakaraka to Darakaraka
// =============================================================================

const KARAKA_NAMES = [
  "Atmakaraka", "Amatyakaraka", "Bhratrikaraka", "Matrikaraka",
  "Putrakaraka", "Gnatikaraka", "Darakaraka",
];

function calculateCharaKarakas(planets: PlanetPosition[]): CharaKarakaData[] {
  // Use Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu (8 planets, exclude Ketu)
  const karakaPlanets = planets.filter((p) => p.name !== "Ketu");

  // Calculate degree within sign for each planet.
  // For Rahu: use 30 - degrees (as Rahu is always retrograde)
  const withDegrees = karakaPlanets.map((p) => ({
    name: p.name,
    effectiveDegrees: p.name === "Rahu" ? 30 - p.degrees : p.degrees,
  }));

  // Sort descending by effective degrees (highest = Atmakaraka)
  withDegrees.sort((a, b) => b.effectiveDegrees - a.effectiveDegrees);

  // Map to karakas (we have 7 karaka names for 8 planets in Jaimini system;
  // the 8th planet gets no special karaka designation but we include it)
  const karakas: CharaKarakaData[] = withDegrees.map((p, i) => ({
    karaka: i < KARAKA_NAMES.length ? KARAKA_NAMES[i] : "Spare Karaka",
    planet: p.name,
    degrees: Math.round(p.effectiveDegrees * 100) / 100,
  }));

  return karakas;
}

// =============================================================================
// Planetary Aspects (Graha Drishti)
// =============================================================================

function calculatePlanetaryAspects(planets: PlanetPosition[], ascRashi: number): PlanetaryAspectData[] {
  const aspects: PlanetaryAspectData[] = [];

  // Special aspects by planet (house offsets from the planet, 1-indexed)
  // All planets have 7th aspect. Additional:
  // Mars: 4th and 8th
  // Jupiter: 5th and 9th
  // Saturn: 3rd and 10th
  const specialAspects: Record<string, number[]> = {
    Sun:     [7],
    Moon:    [7],
    Mars:    [4, 7, 8],
    Mercury: [7],
    Jupiter: [5, 7, 9],
    Venus:   [7],
    Saturn:  [3, 7, 10],
    Rahu:    [5, 7, 9], // Rahu aspects like Jupiter per some traditions
    Ketu:    [5, 7, 9], // Ketu aspects like Jupiter per some traditions
  };

  for (const planet of planets) {
    const aspectOffsets = specialAspects[planet.name] || [7];
    const aspectedHouses: number[] = [];

    for (const offset of aspectOffsets) {
      // The planet is in a certain rashi. The house number of that rashi is:
      const planetHouse = ((planet.rashi - ascRashi + 12) % 12) + 1;
      // The aspected house is offset houses away
      const aspectedHouse = ((planetHouse - 1 + offset) % 12) + 1;
      aspectedHouses.push(aspectedHouse);
    }

    aspects.push({
      planet: planet.name,
      aspectsHouses: aspectedHouses,
    });
  }

  return aspects;
}
