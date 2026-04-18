/**
 * Comprehensive Vedic astrology interpretation data
 * Based on P.V.R. Narasimha Rao's textbook
 *
 * All descriptions are written as plain life insights — no astrology jargon.
 * These are shown to end users who don't know astrology.
 */

// ---------------------------------------------------------------------------
// 1. FUNCTIONAL BENEFICS & MALEFICS (Table 30)
// ---------------------------------------------------------------------------

export const FUNCTIONAL_BENEFICS_MALEFICS: Record<
  string,
  {
    yogakaraka: string | null;
    benefics: string[];
    neutrals: string[];
    malefics: string[];
  }
> = {
  Aries: {
    yogakaraka: null,
    benefics: ["Sun", "Mars", "Jupiter"],
    neutrals: [],
    malefics: ["Mercury", "Venus", "Saturn"],
  },
  Taurus: {
    yogakaraka: "Saturn",
    benefics: ["Sun", "Mercury", "Saturn"],
    neutrals: ["Mars"],
    malefics: ["Moon", "Jupiter", "Venus"],
  },
  Gemini: {
    yogakaraka: null,
    benefics: ["Venus"],
    neutrals: ["Moon", "Mercury", "Saturn"],
    malefics: ["Sun", "Mars", "Jupiter"],
  },
  Cancer: {
    yogakaraka: "Mars",
    benefics: ["Moon", "Mars", "Jupiter"],
    neutrals: ["Sun", "Saturn"],
    malefics: ["Mercury", "Venus"],
  },
  Leo: {
    yogakaraka: "Mars",
    benefics: ["Sun", "Mars", "Jupiter"],
    neutrals: ["Moon"],
    malefics: ["Mercury", "Venus", "Saturn"],
  },
  Virgo: {
    yogakaraka: null,
    benefics: ["Mercury", "Venus"],
    neutrals: ["Sun", "Saturn"],
    malefics: ["Moon", "Mars", "Jupiter"],
  },
  Libra: {
    yogakaraka: "Saturn",
    benefics: ["Mercury", "Venus", "Saturn"],
    neutrals: [],
    malefics: ["Sun", "Mars", "Jupiter"],
  },
  Scorpio: {
    yogakaraka: null,
    benefics: ["Moon", "Jupiter"],
    neutrals: ["Sun", "Mars"],
    malefics: ["Mercury", "Venus", "Saturn"],
  },
  Sagittarius: {
    yogakaraka: null,
    benefics: ["Sun", "Mars"],
    neutrals: ["Moon", "Mercury", "Jupiter"],
    malefics: ["Venus", "Saturn"],
  },
  Capricorn: {
    yogakaraka: "Venus",
    benefics: ["Venus", "Mercury", "Saturn"],
    neutrals: ["Sun"],
    malefics: ["Mars", "Jupiter"],
  },
  Aquarius: {
    yogakaraka: "Venus",
    benefics: ["Venus", "Saturn"],
    neutrals: ["Sun", "Mercury"],
    malefics: ["Moon", "Mars", "Jupiter"],
  },
  Pisces: {
    yogakaraka: null,
    benefics: ["Moon", "Mars"],
    neutrals: ["Jupiter"],
    malefics: ["Sun", "Mercury", "Venus", "Saturn"],
  },
};

// ---------------------------------------------------------------------------
// 2. NAKSHATRA PERSONALITIES
// ---------------------------------------------------------------------------

export const NAKSHATRA_PERSONALITIES: Record<string, string> = {
  Ashwini:
    "You have a natural gift for healing and helping others bounce back from setbacks. Quick to act and full of initiative, you prefer to dive right in rather than overthink. Life keeps offering you fresh starts, and you embrace each one with youthful energy.",

  Bharani:
    "You carry intensity within you and aren't afraid of life's heavy moments — in fact, you often bear burdens that would crush others. There is a transformative quality to your experiences; you are constantly being reborn through what you endure. Beneath the intensity lives a deep appreciation for beauty, pleasure, and the fullness of life.",

  Krittika:
    "You have a sharp, discerning mind that cuts through confusion and gets straight to the truth. There is a purifying quality about you — you burn away what isn't authentic, sometimes bluntly. People trust your honesty even when it stings, and your willpower can move mountains.",

  Rohini:
    "Creativity flows through everything you do, and people are drawn to your natural charm and beauty. You have a deep need to grow things — ideas, relationships, projects — and watch them flourish. Material comfort matters to you, and you have a talent for attracting abundance.",

  Mrigashira:
    "You are a perpetual seeker, always searching for that next fascinating idea or experience. Curiosity is your defining trait — it makes you versatile but sometimes restless and hard to pin down. You thrive in exploration and need variety to stay engaged with life.",

  Ardra:
    "You experience emotions with tremendous force, and your life often features upheavals that strip away the old to make room for something new. There is a stormy intensity to your nature, but every storm you weather leaves you stronger and wiser. You understand suffering deeply, which gives you remarkable empathy for others.",

  Punarvasu:
    "No matter how far you fall, you always find your way back — renewal is your superpower. You carry wisdom earned through hardship and have a philosophical outlook that keeps you steady during dark times. Generosity comes naturally to you, and people feel safe in your optimistic presence.",

  Pushya:
    "You are a natural nourisher — your presence feeds and strengthens everyone around you. Steady, patient, and responsible, you build things that last and find deep satisfaction in helping others grow. There is a teacher quality in you, even if you never stand in front of a classroom.",

  Ashlesha:
    "You possess deep psychological insight and can read people and situations with almost uncanny accuracy. There is a magnetic, somewhat mysterious quality to your personality that draws others in. You understand power dynamics intuitively and know how to use influence, though you must be careful not to manipulate.",

  Magha:
    "You carry a natural sense of authority and dignity that commands respect wherever you go. There is a connection to tradition and lineage in your life — family legacy matters, whether you embrace it or rebel against it. Leadership comes naturally, and you expect a certain standard from yourself and others.",

  "Purva Phalguni":
    "You are wired for enjoyment and know how to savour life's pleasures without apology. Creative expression — whether through art, romance, or celebration — is essential to your well-being. You bring warmth and fun to any gathering, and people love your generous, light-hearted spirit.",

  "Uttara Phalguni":
    "Reliability is your hallmark — when you commit to something or someone, you follow through completely. You have a strong sense of service and feel most fulfilled when helping others in tangible ways. People lean on you because you are steady, trustworthy, and genuinely kind.",

  Hasta:
    "You have remarkably skilled hands and a talent for making things — whether physical crafts, deals, or clever solutions to tricky problems. Detail-oriented and resourceful, you can manifest results where others only see obstacles. Your adaptability and quick thinking are your greatest assets.",

  Chitra:
    "You have an artist's eye and a drive to create something beautiful and brilliant in the world. Whether it's your appearance, your work, or your environment, you insist on quality and style. You are often drawn to architecture, design, or any field where you can build something visually striking.",

  Swati:
    "Independence is non-negotiable for you — you need freedom to move, think, and grow on your own terms. Like the wind, you adapt to whatever environment you find yourself in, which makes you incredibly flexible. Be mindful of scattering your energy too widely; focus turns your adaptability into real power.",

  Vishakha:
    "Once you set a goal, you pursue it with single-minded determination that borders on obsession. You are driven, ambitious, and willing to go through fire to achieve what you want. This focused intensity makes you very successful, though you sometimes need to remember to enjoy the journey.",

  Anuradha:
    "Devotion defines you — to friends, to causes, to the people you love. You have exceptional organizational skills and the ability to bring groups of people together around shared purpose. Friendship is sacred to you, and your loyalty once given is nearly unbreakable.",

  Jyeshtha:
    "You carry a protective, elder-sibling energy — you naturally step up to defend the vulnerable and take charge in crises. There is a warrior spirit in you that does not back down from confrontation when something important is at stake. You've learned many of your best lessons the hard way, and that has made you both tough and wise.",

  Moola:
    "You are driven to get to the root of things, whether that means questioning beliefs, investigating mysteries, or tearing down structures that no longer serve. Destruction of old patterns is a recurring theme in your life, and it always leads to deeper understanding. You are a natural researcher, philosopher, or reformer.",

  "Purva Ashadha":
    "You carry an invincible spirit — once you declare something, you find the energy to make it happen. There is a purifying, energizing quality to your presence that revitalises everyone around you. You believe in truth and will stand by your convictions even when the crowd goes the other way.",

  "Uttara Ashadha":
    "You are built for lasting victory — not the quick win, but the kind earned through patience, integrity, and universal principles. People respect you because you play fair and think about the greater good. Leadership roles find you because others sense your incorruptible character.",

  Shravana:
    "You learn best by listening, and your ability to truly hear what others are saying gives you a rare social intelligence. You are a natural connector — linking people, ideas, and traditions in meaningful ways. Knowledge acquisition is almost effortless for you, and you retain what you learn.",

  Dhanishtha:
    "Wealth and abundance tend to flow toward you, and you are generous with what you have. There is a rhythmic, musical quality to your nature — you appreciate harmony in all its forms. You enjoy the good things in life and have the energy and courage to go out and earn them.",

  Shatabhisha:
    "You are a natural healer who often walks a solitary path, comfortable with your own company. There is a secretive, self-contained quality about you — you reveal yourself slowly, if at all. Your insights into health, science, or the hidden workings of life are unusually deep.",

  "Purva Bhadrapada":
    "A fiery, transformative energy runs through your life — you are drawn to extremes and aren't afraid of intensity. You may oscillate between worldly ambition and deep spiritual longing, sometimes experiencing both at once. Your passion, when channelled well, has the power to transform not just your life but those around you.",

  "Uttara Bhadrapada":
    "You possess a deep, calm stability that others find profoundly reassuring. Beneath your composed exterior lies immense power — like a deep ocean that rarely shows its currents on the surface. You are drawn to meditation, contemplation, and any practice that connects you to something timeless.",

  Revati:
    "You are a gentle, nourishing soul who instinctively cares for those who are lost, weak, or in need. There is a sense of completion about your energy — you help bring things to a safe harbour. Creative and imaginative, you often have a rich inner world and a talent for storytelling or the arts.",
};

// ---------------------------------------------------------------------------
// 3. PLANET IN HOUSE MEANINGS
// ---------------------------------------------------------------------------

export const PLANET_IN_HOUSE_MEANING: Record<string, Record<number, string>> = {
  Sun: {
    1: "Strong sense of self and natural authority. People notice you when you walk into a room.",
    2: "Your identity is closely tied to what you earn and what you value. Family pride and financial independence matter deeply to you.",
    3: "You express yourself with confidence and courage. Siblings and short journeys play an important role in shaping who you are.",
    4: "Home, roots, and private life are central to your identity. You may take great pride in your home or your heritage.",
    5: "Creativity and self-expression are your lifeblood. You shine brightest when creating, performing, or mentoring the next generation.",
    6: "You find purpose through service, problem-solving, and overcoming obstacles. Health and daily routines need conscious attention.",
    7: "Partnerships define a major chapter of your life. You may attract strong, authoritative partners or become a natural leader in relationships.",
    8: "You are drawn to life's mysteries and transformations. Deep inner changes and encounters with hidden truths shape your path.",
    9: "You are a natural seeker of meaning, drawn to philosophy, travel, or higher learning. Mentors and teachers profoundly influence your life.",
    10: "Career and public reputation are extremely important to you. You are driven to achieve visible success and recognition.",
    11: "Your social circle and long-term ambitions fuel your sense of self. Friendships and community involvement bring great fulfilment.",
    12: "You may feel most alive in solitude, spiritual practice, or behind-the-scenes work. Letting go of ego opens your deepest strengths.",
  },
  Moon: {
    1: "Your emotions are visible to everyone — what you feel shows on your face. Sensitivity and empathy define how you move through the world.",
    2: "Emotional security is closely linked to financial stability and family closeness. Comfort foods and familiar surroundings soothe your soul.",
    3: "You process feelings by talking, writing, or moving. Communication and short trips keep you emotionally balanced.",
    4: "Home is your sanctuary, and feeling rooted is essential to your peace of mind. Your relationship with your mother or nurturing figures is especially significant.",
    5: "You pour your heart into creative projects and children. Romance and playful self-expression bring deep emotional satisfaction.",
    6: "Worry and overthinking can be your Achilles heel. Channelling emotions into service, health routines, or problem-solving helps you thrive.",
    7: "You seek emotional fulfilment through close partnerships. You need a partner who truly understands your changing moods and inner world.",
    8: "Emotions run deep and you're drawn to what's hidden. Transformation comes through emotional intensity and facing fears.",
    9: "Travel, philosophy, and expanding your horizons lift your spirits. You feel most at peace when connected to something bigger than yourself.",
    10: "Your career and public role are deeply emotional matters — you can't just punch a clock. Work has to feel meaningful to keep you engaged.",
    11: "Friendships and group activities nourish you emotionally. Your hopes and dreams for the future drive much of your daily motivation.",
    12: "You have a rich inner life and may need regular solitude to recharge. Dreams, intuition, and spiritual experiences are unusually vivid.",
  },
  Mars: {
    1: "You have strong physical energy and a competitive spirit. Courage and directness are your trademarks, though impatience can trip you up.",
    2: "You are fierce about protecting your resources and values. Financial independence is something you fight hard to achieve and maintain.",
    3: "Brave, bold communication comes naturally. You have the courage to take initiative and are often the one who acts first among siblings or peers.",
    4: "You bring intensity to your home life and may enjoy renovation, real estate, or vigorous activity at home. Inner restlessness drives you forward.",
    5: "You throw yourself into creative projects and competitive pursuits with passion. Romance can be fiery, and you inspire bold action in others.",
    6: "You excel at overcoming obstacles and defeating competitors. Physical fitness and disciplined routines channel your warrior energy productively.",
    7: "You attract dynamic, assertive partners and business relationships can be spirited. Learning to cooperate without competing strengthens all your bonds.",
    8: "You have tremendous resilience and can survive crises that would break others. Transformation often comes through intense, sometimes painful experiences.",
    9: "You pursue knowledge and beliefs with passionate conviction. Travel to challenging destinations or fighting for a cause gives your life meaning.",
    10: "Ambition and drive power your career. You are willing to work extremely hard and take risks to reach the top of your field.",
    11: "You actively pursue your goals and dreams, rallying friends and allies along the way. Group activities and social causes energise you.",
    12: "Your energy works best behind the scenes or in spiritual practice. Learning to release anger and channel drive into selfless action brings peace.",
  },
  Mercury: {
    1: "You lead with your mind — curious, communicative, and always learning something new. People see you as witty, youthful, and intellectually sharp.",
    2: "You have a talent for making money through communication, writing, or trading. Your speech and financial skills develop early in life.",
    3: "Communication is your superpower. Writing, speaking, teaching, and networking come naturally, and your mind is always buzzing with ideas.",
    4: "Your home may be full of books, gadgets, or learning materials. Intellectual stimulation in your private life keeps you happy.",
    5: "You express creativity through words and ideas. Education, writing, and intellectual games bring great joy and may involve your children too.",
    6: "Your analytical mind excels at solving problems and improving systems. Health awareness through research and detail-oriented work suits you well.",
    7: "You need intellectual compatibility in relationships above all. Communication is the foundation of your partnerships, both personal and professional.",
    8: "You have a mind built for research, investigation, and uncovering hidden information. Psychology, finance, and mysteries fascinate you.",
    9: "Higher learning, long-distance communication, and philosophical exploration feed your restless intellect. You may become a perpetual student or teacher.",
    10: "Your career likely involves communication, data, writing, or intellectual skills. You are known professionally for your sharp mind and versatility.",
    11: "Your social network is your intellectual playground. You attract friends who stimulate your thinking and support your innovative goals.",
    12: "Your mind is drawn to the subconscious, dreams, and spiritual knowledge. Journaling, meditation, or working behind the scenes suits your thoughtful nature.",
  },
  Jupiter: {
    1: "You radiate optimism and wisdom. People naturally trust you and seek your advice, and opportunities tend to find their way to you.",
    2: "Financial growth and family prosperity are highlighted in your life. You value generosity, good food, and accumulating both wealth and knowledge.",
    3: "You bring wisdom and a philosophical outlook to everyday communications. Relationships with siblings can be rewarding and growth-oriented.",
    4: "Home life is blessed with comfort and positivity. You may own property, value education, and create a warm, welcoming household.",
    5: "Creativity, children, and learning bring tremendous joy. You are a natural teacher and mentor, and romance tends to be meaningful and growth-oriented.",
    6: "You have a gift for overcoming challenges with a positive attitude. Service to others and health-conscious living bring great rewards.",
    7: "You attract wise, generous, and supportive partners. Marriage and business partnerships tend to bring growth and mutual benefit.",
    8: "You handle life's transformations with grace and often benefit through inheritance, insurance, or other people's resources. Deep study comes naturally.",
    9: "This is your strongest placement — you are a born philosopher, traveller, and seeker of truth. Luck and wisdom walk with you.",
    10: "You achieve success through integrity and ethical conduct. Public reputation is excellent, and career growth tends to be steady and substantial.",
    11: "Your dreams and ambitions are expansive, and influential friends help you achieve them. Social engagement and community leadership come naturally.",
    12: "Spiritual growth, charitable work, and time spent in retreat nourish your soul. You find meaning in letting go and giving back.",
  },
  Venus: {
    1: "You carry natural charm and a love of beauty. People are drawn to your pleasant demeanour, and you move through the world with grace.",
    2: "You have a talent for attracting money and surrounding yourself with beautiful things. Good food, fine arts, and comfortable living matter to you.",
    3: "You communicate with grace and diplomacy. Creative writing, artistic hobbies, and pleasant relationships with siblings enrich your daily life.",
    4: "Your home is likely beautiful, comfortable, and a source of deep pleasure. Luxury vehicles, fine furnishings, and domestic harmony are important to you.",
    5: "Romance, creativity, and entertainment are central to your happiness. You have a talent for the arts and a gift for making life enjoyable.",
    6: "You bring harmony to difficult situations and may work in health, beauty, or service industries. Relationships at work tend to be pleasant.",
    7: "Partnership and marriage are among the most important themes in your life. You attract loving, attractive partners and value harmony above all.",
    8: "You may experience deep transformation through intimate relationships. Shared resources, inheritance, or a partner's wealth could play a significant role.",
    9: "You find joy in travel, culture, and higher learning. Your philosophical outlook is coloured by a love of beauty, art, and different traditions.",
    10: "Your career may involve beauty, art, entertainment, diplomacy, or luxury goods. You are well-liked in professional settings and climb through charm.",
    11: "Your social life is vibrant and pleasurable. Friends, networking events, and cultural gatherings fuel both your happiness and your ambitions.",
    12: "You find deep pleasure in solitude, fantasy, and spiritual connection. Secret romances or hidden artistic talents may be part of your story.",
  },
  Saturn: {
    1: "You take life seriously and may have had to grow up fast. Discipline, hard work, and perseverance are built into your character, and real success comes with maturity.",
    2: "Building financial security requires patience and sustained effort. You are careful with money and value what is earned through hard work over anything handed to you.",
    3: "Communication and learning may have come slowly, but what you master, you master deeply. Your efforts and courage build steadily over time.",
    4: "Home life may have involved challenges or responsibilities early on. You build lasting foundations and value property, stability, and emotional endurance.",
    5: "Creativity and self-expression develop through discipline rather than spontaneity. Parenthood or creative work may involve delays but ultimately brings deep satisfaction.",
    6: "You are a tireless worker who excels in service, healthcare, or problem-solving roles. Chronic health matters may need ongoing attention, but your discipline handles them well.",
    7: "Relationships require patience and commitment — you may marry later or attract partners who are older or more serious. The bonds you build endure.",
    8: "You handle hardship and transformation with remarkable endurance. Life tests you through crises, but each one forges greater strength and resilience.",
    9: "Your approach to beliefs and higher learning is practical and structured. Wisdom comes through real-world experience rather than abstract theory.",
    10: "Career success is almost guaranteed through sheer perseverance, but it comes slowly. You are built for long-term achievement and may gain authority in your field.",
    11: "Your ambitions are realistic and hard-won. A small circle of loyal, long-term friends matters more to you than a large social network.",
    12: "Solitude, spiritual discipline, and behind-the-scenes work suit you well. You may face periods of isolation that ultimately deepen your character and wisdom.",
  },
  Rahu: {
    1: "You have a powerful, magnetic personality that can be unconventional or ahead of its time. Life pushes you to forge a bold, unique identity.",
    2: "You have intense desires around wealth, speech, and family. Unusual ways of earning money or unexpected family dynamics shape your path.",
    3: "You are a bold communicator willing to take risks others avoid. Media, technology, or unconventional skills may become your strength.",
    4: "Home life may involve unusual circumstances or foreign influences. You are driven to find emotional security in non-traditional ways.",
    5: "Creativity, romance, and self-expression take unexpected, sometimes dramatic turns. Your children or creative projects may be unique or unconventional.",
    6: "You are a fierce competitor who can overcome enemies and obstacles through shrewd strategy. Health matters may involve unusual or hard-to-diagnose issues.",
    7: "Partnerships may involve people from different backgrounds or unconventional relationship structures. You crave connection but must learn to trust.",
    8: "You are drawn powerfully to life's mysteries — occult knowledge, hidden truths, and transformative experiences. Major life changes come suddenly and intensely.",
    9: "Your spiritual and philosophical path is unconventional. You may be drawn to foreign cultures, unusual belief systems, or revolutionary ideas.",
    10: "Ambitious and driven for public recognition, you may rise through unconventional career paths or sudden opportunities. Fame and controversy can coexist.",
    11: "Your dreams are large and you pursue them relentlessly. Influential, sometimes unusual friendships and powerful networks help you achieve big goals.",
    12: "Foreign lands, spiritual seeking, and the subconscious mind fascinate you. You may spend significant time abroad or in deep retreat from ordinary life.",
  },
  Ketu: {
    1: "You may feel detached from your own identity or body at times, as if observing life from a distance. Spiritual growth and self-discovery are major life themes.",
    2: "Material wealth and family traditions may feel less important to you than they do to others. You seek value in experiences and knowledge over possessions.",
    3: "Communication may be sparse or deeply introspective. You bring an unusual, intuitive perspective to writing, learning, and interaction with siblings.",
    4: "You may feel emotionally detached from your childhood home or roots. Inner peace comes through spiritual practice rather than material comfort.",
    5: "Creativity is channelled through intuition rather than formal training. Relationships with children or romance may have an unusual, karmic quality.",
    6: "You handle enemies and obstacles with a calm, almost indifferent strength. Health issues may be mysterious but respond well to alternative approaches.",
    7: "Relationships may feel fated or carry lessons from a past life. You seek deep spiritual connection rather than conventional partnership.",
    8: "You have natural access to hidden knowledge and intuitive abilities. Transformation happens quietly within you, often through letting go of attachments.",
    9: "You carry spiritual wisdom from past experience and may feel less need for formal religious structures. Your inner compass already points toward truth.",
    10: "Career and worldly success may feel less important to you — or you achieve them with an air of detachment. Your work may involve healing or spirituality.",
    11: "Large social circles and ambitious goals may not motivate you. You find fulfilment through small, meaningful connections and surrendering expectations.",
    12: "This is a natural placement for spiritual liberation. You are drawn to meditation, solitude, and transcendence, and may find great peace in letting go.",
  },
};

// ---------------------------------------------------------------------------
// 4. DASHA FAVORABILITY
// ---------------------------------------------------------------------------

/**
 * Assess how favorable a dasha (planetary period) is for a person.
 *
 * @param dashaLord     - Planet ruling the dasha (e.g. "Jupiter")
 * @param ascendantSign - The person's rising sign (e.g. "Aries")
 * @param planetRashi   - 0-based rashi index where the dasha lord sits (0 = Aries)
 * @param ascRashi      - 0-based rashi index of the ascendant
 * @param isExalted     - Whether the dasha lord is exalted
 * @param isDebilitated - Whether the dasha lord is debilitated
 */
export function assessDashaFavorability(
  dashaLord: string,
  ascendantSign: string,
  planetRashi: number,
  ascRashi: number,
  isExalted: boolean,
  isDebilitated: boolean
): { favorable: boolean; description: string } {
  // Determine functional nature for this ascendant
  const funcData = FUNCTIONAL_BENEFICS_MALEFICS[ascendantSign];
  if (!funcData) {
    return {
      favorable: false,
      description: "Unable to assess this period — ascendant data unavailable.",
    };
  }

  const isBenefic = funcData.benefics.includes(dashaLord);
  const isMalefic = funcData.malefics.includes(dashaLord);
  const isYogakaraka = funcData.yogakaraka === dashaLord;
  const isNeutral = funcData.neutrals.includes(dashaLord);

  // Determine house placement relative to ascendant
  const houseNum = ((planetRashi - ascRashi + 12) % 12) + 1;

  // Kendras (angles): 1, 4, 7, 10 — strong positions
  const isKendra = [1, 4, 7, 10].includes(houseNum);
  // Trikonas (trines): 1, 5, 9 — most auspicious
  const isTrikona = [1, 5, 9].includes(houseNum);
  // Dusthanas (difficult): 6, 8, 12
  const isDusthana = [6, 8, 12].includes(houseNum);
  // Upachaya (improving): 3, 6, 10, 11
  const isUpachaya = [3, 6, 10, 11].includes(houseNum);

  // Scoring
  let score = 0;
  const notes: string[] = [];

  if (isYogakaraka) {
    score += 3;
    notes.push(
      "This planet is exceptionally supportive for you and can bring outstanding results"
    );
  } else if (isBenefic) {
    score += 2;
    notes.push("This planet is naturally supportive for your life path");
  } else if (isNeutral) {
    score += 0;
    notes.push(
      "This planet is neutral for you — results depend heavily on other factors"
    );
  } else if (isMalefic) {
    score -= 2;
    notes.push(
      "This planet tends to create challenges and friction in your life"
    );
  }

  if (isTrikona) {
    score += 2;
    notes.push(
      "It sits in one of the luckiest positions in your chart, amplifying positive results"
    );
  } else if (isKendra) {
    score += 1;
    notes.push(
      "It holds a position of power and visibility, making its effects very tangible"
    );
  } else if (isDusthana) {
    score -= 1;
    notes.push(
      "Its position can bring obstacles, health concerns, or hidden difficulties"
    );
  } else if (isUpachaya) {
    score += 0;
    notes.push(
      "Its position improves over time — challenges early on give way to better results later"
    );
  }

  if (isExalted) {
    score += 2;
    notes.push(
      "This planet is at peak strength right now, delivering its best possible outcomes"
    );
  }
  if (isDebilitated) {
    score -= 2;
    notes.push(
      "This planet is in a weakened state, so its promises may be delayed or diminished"
    );
  }

  const favorable = score > 0;

  // Build description
  let summary: string;
  if (score >= 4) {
    summary =
      "This is an excellent period for you. Expect growth, opportunities, and meaningful progress in important areas of life.";
  } else if (score >= 2) {
    summary =
      "This is a generally positive period. Good things are likely, though you may need to put in consistent effort to make the most of them.";
  } else if (score >= 0) {
    summary =
      "This is a mixed period with both opportunities and challenges. Stay steady, be patient, and avoid impulsive decisions.";
  } else if (score >= -2) {
    summary =
      "This period requires extra caution. Obstacles and delays are likely, but they carry lessons. Focus on health, patience, and careful planning.";
  } else {
    summary =
      "This is a challenging period. Take things slow, avoid major risks, and focus on building resilience. Things will improve once this phase passes.";
  }

  const description = summary + " " + notes.join(". ") + ".";

  return { favorable, description };
}

// ---------------------------------------------------------------------------
// 5. REMEDIES
// ---------------------------------------------------------------------------

export const REMEDIES: Record<
  string,
  {
    gemstone: string;
    metal: string;
    finger: string;
    mantra: string;
    deity: string;
    grain: string;
    color: string;
    fasting_day: string;
    good_deeds: string;
  }
> = {
  Sun: {
    gemstone: "Ruby",
    metal: "Gold",
    finger: "Ring finger",
    mantra: "Om Hraam Hreem Hraum Sah Suryaya Namah",
    deity: "Lord Surya (Sun God)",
    grain: "Wheat",
    color: "Red or copper",
    fasting_day: "Sunday",
    good_deeds:
      "Donate wheat, jaggery, or copper items on Sundays. Offer water to the rising sun each morning. Respect your father and authority figures.",
  },
  Moon: {
    gemstone: "Pearl",
    metal: "Silver",
    finger: "Little finger",
    mantra: "Om Shraam Shreem Shraum Sah Chandraya Namah",
    deity: "Lord Shiva / Goddess Parvati",
    grain: "Rice",
    color: "White or cream",
    fasting_day: "Monday",
    good_deeds:
      "Donate rice, white cloth, or silver items on Mondays. Serve and care for your mother. Offer milk or water to a Shiva lingam.",
  },
  Mars: {
    gemstone: "Red Coral",
    metal: "Copper",
    finger: "Ring finger",
    mantra: "Om Kraam Kreem Kraum Sah Bhaumaya Namah",
    deity: "Lord Hanuman / Lord Kartikeya",
    grain: "Red lentils (masoor dal)",
    color: "Red",
    fasting_day: "Tuesday",
    good_deeds:
      "Donate red lentils, jaggery, or red cloth on Tuesdays. Recite Hanuman Chalisa. Practice physical discipline and channel anger constructively.",
  },
  Mercury: {
    gemstone: "Emerald",
    metal: "Bronze or brass",
    finger: "Little finger",
    mantra: "Om Braam Breem Braum Sah Budhaya Namah",
    deity: "Lord Vishnu",
    grain: "Moong dal (green gram)",
    color: "Green",
    fasting_day: "Wednesday",
    good_deeds:
      "Donate green cloth, moong dal, or educational materials on Wednesdays. Support children's education. Practice truthful and kind speech.",
  },
  Jupiter: {
    gemstone: "Yellow Sapphire",
    metal: "Gold",
    finger: "Index finger",
    mantra: "Om Graam Greem Graum Sah Gurave Namah",
    deity: "Lord Brihaspati / Lord Dakshinamurthy",
    grain: "Chickpeas (chana dal)",
    color: "Yellow",
    fasting_day: "Thursday",
    good_deeds:
      "Donate yellow cloth, turmeric, chickpeas, or books on Thursdays. Respect teachers and elders. Support religious or educational institutions.",
  },
  Venus: {
    gemstone: "Diamond",
    metal: "Silver or platinum",
    finger: "Middle finger",
    mantra: "Om Draam Dreem Draum Sah Shukraya Namah",
    deity: "Goddess Lakshmi",
    grain: "Lima beans or white rice",
    color: "White or pastel colours",
    fasting_day: "Friday",
    good_deeds:
      "Donate white cloth, sugar, rice, or perfume on Fridays. Respect women and practice generosity. Support the arts and creative endeavours.",
  },
  Saturn: {
    gemstone: "Blue Sapphire",
    metal: "Iron or steel",
    finger: "Middle finger",
    mantra: "Om Praam Preem Praum Sah Shanaischaraya Namah",
    deity: "Lord Shani / Lord Hanuman",
    grain: "Sesame seeds (til) or black urad dal",
    color: "Dark blue or black",
    fasting_day: "Saturday",
    good_deeds:
      "Donate sesame oil, black cloth, iron items, or mustard oil on Saturdays. Serve the elderly, disabled, or disadvantaged. Practice patience and humility.",
  },
  Rahu: {
    gemstone: "Hessonite (Gomed)",
    metal: "Lead or mixed metals",
    finger: "Middle finger",
    mantra: "Om Bhraam Bhreem Bhraum Sah Rahave Namah",
    deity: "Goddess Durga",
    grain: "Black urad dal",
    color: "Dark blue, black, or smoky grey",
    fasting_day: "Saturday",
    good_deeds:
      "Donate blankets, black cloth, or mustard oil on Saturdays. Feed birds. Practice mindfulness to overcome obsessive tendencies and anxiety.",
  },
  Ketu: {
    gemstone: "Cat's Eye (Lehsunia)",
    metal: "Mixed metals",
    finger: "Ring finger",
    mantra: "Om Sraam Sreem Sraum Sah Ketave Namah",
    deity: "Lord Ganesha",
    grain: "Horse gram (kulthi dal)",
    color: "Grey or earthy brown",
    fasting_day: "Tuesday or Saturday",
    good_deeds:
      "Donate blankets, sesame seeds, or grey/brown cloth. Feed stray dogs. Practice meditation and spiritual study to harness Ketu's gift of detachment.",
  },
};

// ---------------------------------------------------------------------------
// 6. RASHI DETAILED TRAITS
// ---------------------------------------------------------------------------

export const RASHI_DETAILED_TRAITS: Record<
  string,
  {
    element: string;
    quality: string;
    bodyPart: string;
    personality: string;
    constitution: string;
    direction: string;
  }
> = {
  Aries: {
    element: "Fire",
    quality: "Movable",
    bodyPart: "Head and face",
    personality:
      "Bold, energetic, and always ready to take the lead. You have a pioneering spirit that thrives on new challenges and fresh starts. Patience is not your strongest suit — you prefer action over deliberation. Your enthusiasm is infectious, and you inspire others to be brave.",
    constitution: "Pitta",
    direction: "East",
  },
  Taurus: {
    element: "Earth",
    quality: "Fixed",
    bodyPart: "Face, throat, and neck",
    personality:
      "Steady, reliable, and deeply sensual — you appreciate beauty, comfort, and the finer things in life. Once you make up your mind, changing it is nearly impossible, which gives you great perseverance but can sometimes come across as stubbornness. You value security and build things that last. People trust you because your word is solid.",
    constitution: "Vata",
    direction: "South",
  },
  Gemini: {
    element: "Air",
    quality: "Dual",
    bodyPart: "Shoulders, arms, and hands",
    personality:
      "Quick-witted, curious, and endlessly adaptable — your mind moves fast and in many directions at once. You are a natural communicator who can talk to anyone about anything. Boredom is your biggest enemy, so you constantly seek new information and experiences. Your versatility is a superpower, but learning to focus on fewer things deeply will unlock your full potential.",
    constitution: "Vata",
    direction: "West",
  },
  Cancer: {
    element: "Water",
    quality: "Movable",
    bodyPart: "Chest and stomach",
    personality:
      "Deeply caring, emotionally sensitive, and fiercely protective of the people you love. Your home and family are your anchor, and you pour enormous energy into creating a safe, nurturing environment. Your moods can shift like the tides, but underneath the fluctuations lies tremendous emotional strength. You have an incredible memory, especially for how things made you feel.",
    constitution: "Kapha",
    direction: "North",
  },
  Leo: {
    element: "Fire",
    quality: "Fixed",
    bodyPart: "Heart and upper back",
    personality:
      "Warm, generous, and naturally magnetic — you light up any room you enter. You have a deep need to be recognized and appreciated for who you are and what you create. Leadership comes instinctively, and you lead with your heart. Your pride and dignity are important to you, and you expect loyalty from those you give it to.",
    constitution: "Pitta",
    direction: "East",
  },
  Virgo: {
    element: "Earth",
    quality: "Dual",
    bodyPart: "Intestines and lower abdomen",
    personality:
      "Detail-oriented, analytical, and driven by a genuine desire to be useful. You see the flaws others miss and have a talent for making things work better. Service to others gives your life meaning, though you can be your own harshest critic. Your intelligence is practical rather than theoretical — you solve real problems and improve real systems.",
    constitution: "Vata",
    direction: "South",
  },
  Libra: {
    element: "Air",
    quality: "Movable",
    bodyPart: "Lower back and kidneys",
    personality:
      "Charming, fair-minded, and deeply committed to harmony and balance. You see both sides of every situation, which makes you an excellent mediator but can lead to indecisiveness. Relationships — romantic, professional, and social — are the arena where you learn and grow the most. Beauty, art, and refined living are not luxuries for you but necessities.",
    constitution: "Kapha",
    direction: "West",
  },
  Scorpio: {
    element: "Water",
    quality: "Fixed",
    bodyPart: "Reproductive organs",
    personality:
      "Intense, perceptive, and unafraid of life's darker corners. You feel everything deeply and approach life as a series of transformations — constantly shedding old skins. Trust does not come easily to you, but once given, your loyalty is absolute. You have a powerful will and the ability to regenerate from almost any setback.",
    constitution: "Kapha",
    direction: "North",
  },
  Sagittarius: {
    element: "Fire",
    quality: "Dual",
    bodyPart: "Hips and thighs",
    personality:
      "Optimistic, adventurous, and always seeking the bigger picture. You crave freedom — physical, intellectual, and spiritual — and feel stifled by too many rules or routines. Your enthusiasm and honesty are refreshing, though your bluntness can sometimes land like a brick. You are a natural teacher and storyteller who inspires others to dream bigger.",
    constitution: "Pitta",
    direction: "East",
  },
  Capricorn: {
    element: "Earth",
    quality: "Movable",
    bodyPart: "Knees and bones",
    personality:
      "Disciplined, ambitious, and built for the long haul. You approach life like a mountain climb — steady, strategic, and always moving upward. Responsibility sits easily on your shoulders, and you often take on more than your share. Success comes to you later in life through sheer perseverance, and it is all the sweeter for being hard-earned.",
    constitution: "Vata",
    direction: "South",
  },
  Aquarius: {
    element: "Air",
    quality: "Fixed",
    bodyPart: "Ankles and calves",
    personality:
      "Independent, original, and driven by a vision of how things could be better for everyone. You march to your own drum and are comfortable standing apart from the crowd. Humanitarian ideals and community welfare genuinely motivate you, but on a personal level you can seem emotionally detached. Your innovative thinking is often ahead of its time.",
    constitution: "Vata",
    direction: "West",
  },
  Pisces: {
    element: "Water",
    quality: "Dual",
    bodyPart: "Feet",
    personality:
      "Compassionate, imaginative, and profoundly intuitive — you absorb the emotions of everyone around you like a sponge. Your inner world is vivid and rich, often expressed through art, music, spirituality, or healing. Boundaries can be a challenge because you feel everything so deeply. You are the dreamer of the zodiac, and your empathy is both your greatest gift and your biggest vulnerability.",
    constitution: "Kapha",
    direction: "North",
  },
};
