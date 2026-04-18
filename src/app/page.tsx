"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

/* -----------------------------------------------------------------
 * PALETTE
 *   parchment:  #F8F3E8   warm cream background
 *   ink:        #1A1613   deep warm black
 *   ink-soft:   #524C44   secondary text
 *   accent:     #8B2E1F   burnt sienna (single accent, used rarely)
 *   gold:       #B5893C   ochre highlight (rare)
 *   rule:       #E4D7BC   paper divider
 *   mute:       #A59E91   tertiary / meta
 * -----------------------------------------------------------------*/

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const questions = [
  "Is this the right time to change careers?",
  "Am I with the right person?",
  "What is this hard chapter trying to teach me?",
  "When will the finances turn?",
  "What am I here to do?",
  "Why does this keep happening?",
];

const testimonials = [
  {
    name: "Sarah L.",
    location: "London",
    role: "Founder, design studio",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    quote:
      "It pinpointed a career shift during a Saturn period exactly when it happened. I have used a lot of astrology apps. Nothing has ever read me this precisely.",
  },
  {
    name: "Rajesh K.",
    location: "Bangalore",
    role: "Engineering lead",
    image: "https://randomuser.me/api/portraits/men/44.jpg",
    quote:
      "I came in skeptical. The depth convinced me. It understood my chart better than most astrologers I have consulted in person.",
  },
  {
    name: "Maria G.",
    location: "New York",
    role: "Marketing director",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    quote:
      "I knew nothing about Vedic astrology. Every concept was explained in a way I could actually use. I check it on Sunday mornings now.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    tagline: "Try it first",
    features: [
      "Your birth chart",
      "Ten conversations",
      "Daily transits",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Personal",
    price: "$9",
    interval: "/ month",
    tagline: "For anyone seeking clarity",
    features: [
      "Unlimited conversations",
      "All timing cycles revealed",
      "Every chart dimension",
      "Daily personalized guidance",
      "Add family & loved ones",
    ],
    cta: "Begin Personal",
    featured: true,
  },
  {
    name: "Pro",
    price: "$29",
    interval: "/ month",
    tagline: "For the serious student",
    features: [
      "Everything in Personal",
      "Birth-time rectification",
      "Auspicious moment finder",
      "Family chart library (10)",
      "Beautiful PDF reports",
    ],
    cta: "Begin Pro",
    featured: false,
  },
  {
    name: "Practitioner",
    price: "$99",
    interval: "/ month",
    tagline: "For working astrologers",
    features: [
      "Everything in Pro",
      "100 client profiles",
      "White-label reports",
      "API access",
    ],
    cta: "Inquire",
    featured: false,
  },
];

/* ============================================================== */
/* NAV                                                             */
/* ============================================================== */
function Nav() {
  return (
    <nav className="relative z-20">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2.5 group">
          <svg viewBox="0 0 28 28" className="w-6 h-6 text-[#1A1613]" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="14" cy="14" r="13" />
            <circle cx="14" cy="14" r="8" />
            <circle cx="14" cy="14" r="3" />
            <line x1="14" y1="0" x2="14" y2="6" />
            <line x1="14" y1="22" x2="14" y2="28" />
            <line x1="0" y1="14" x2="6" y2="14" />
            <line x1="22" y1="14" x2="28" y2="14" />
          </svg>
          <span
            className="text-[19px] leading-none tracking-tight text-[#1A1613]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Jyotish Guru
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/login"
            className="hidden sm:inline text-[13px] text-[#524C44] hover:text-[#1A1613] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-[13px] font-medium px-5 py-2.5 rounded-full bg-[#1A1613] text-[#F8F3E8] hover:bg-[#2D2520] transition-colors tracking-wide"
          >
            Begin
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <div className="h-px bg-[#E4D7BC]" />
      </div>
    </nav>
  );
}

/* ============================================================== */
/* HERO                                                            */
/* ============================================================== */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 pt-16 md:pt-24 pb-24 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT — editorial copy */}
          <div className="lg:col-span-7">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-8"
            >
              <span className="w-8 h-px bg-[#8B2E1F]" />
              <span>Vedic astrology, since 2026</span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="text-[48px] sm:text-[64px] lg:text-[82px] leading-[0.96] tracking-[-0.02em] text-[#1A1613]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              As deep as{" "}
              <span className="italic text-[#8B2E1F]">your life,</span>
              <br />
              as precise as{" "}
              <span className="italic">the stars.</span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeUp}
              className="mt-8 text-[17px] md:text-[19px] leading-[1.55] text-[#524C44] max-w-[560px]"
            >
              Real Vedic astrology — your full birth chart computed from the
              classical methods, explained in plain language. Ask any question
              about career, relationships, timing, or meaning. The answer is
              grounded in your actual chart, not invented.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-3 px-7 py-4 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[14px] font-medium tracking-wide hover:bg-[#2D2520] transition-all"
              >
                Begin your reading
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10m0 0l-4-4m4 4l-4 4" />
                </svg>
              </Link>
              <a
                href="https://t.me/astrosagepredictionsbot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-[#F8F3E8] text-[#1A1613] text-[14px] font-medium border border-[#1A1613] hover:bg-[#1A1613] hover:text-[#F8F3E8] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
                </svg>
                Chat on Telegram
              </a>
            </motion.div>

            <motion.p
              initial="hidden"
              animate="visible"
              custom={4}
              variants={fadeUp}
              className="mt-6 text-[12px] tracking-wide text-[#A59E91]"
            >
              Ten free conversations. No card required.
            </motion.p>
          </div>

          {/* RIGHT — visual: hero image with chart wheel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
              {/* Warm sunrise photograph — quiet morning light */}
              <img
                src="https://images.unsplash.com/photo-1507608158173-1dcec673a2e5?auto=format&fit=crop&w=1000&q=85"
                alt="A quiet moment at sunrise"
                className="w-full h-full object-cover"
                loading="eager"
              />
              {/* Warm overlay for cohesion */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(248,243,232,0) 40%, rgba(248,243,232,0.08) 100%)" }}
              />
              {/* Ornament overlay — chart wheel bottom-left */}
              <div className="absolute -bottom-8 -left-10 w-44 h-44 hidden sm:block">
                <ChartOrnament />
              </div>
            </div>

            {/* Caption in editorial style */}
            <div className="mt-5 pl-1 text-[11px] tracking-[0.18em] uppercase text-[#A59E91] flex items-center gap-3">
              <span className="w-5 h-px bg-[#A59E91]" />
              Figure I — the moment you are born, the sky becomes you.
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* Small ornamental chart wheel used in hero */
function ChartOrnament() {
  const cx = 100, cy = 100, r = 92;
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl" style={{ filter: "drop-shadow(0 8px 24px rgba(26,22,19,0.15))" }}>
      <circle cx={cx} cy={cy} r={r} fill="#F8F3E8" stroke="#1A1613" strokeWidth="0.75" />
      <circle cx={cx} cy={cy} r={r - 12} fill="none" stroke="#524C44" strokeWidth="0.4" />
      <circle cx={cx} cy={cy} r={r - 32} fill="none" stroke="#524C44" strokeWidth="0.4" />
      <circle cx={cx} cy={cy} r={8} fill="#8B2E1F" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = cx + (r - 32) * Math.cos(angle);
        const y1 = cy + (r - 32) * Math.sin(angle);
        const x2 = cx + r * Math.cos(angle);
        const y2 = cy + r * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1A1613" strokeWidth="0.5" />;
      })}
      {Array.from({ length: 72 }).map((_, i) => {
        const angle = (i * 5 - 90) * (Math.PI / 180);
        const isMajor = i % 6 === 0;
        const inset = isMajor ? 4 : 2;
        const x1 = cx + (r - inset) * Math.cos(angle);
        const y1 = cy + (r - inset) * Math.sin(angle);
        const x2 = cx + r * Math.cos(angle);
        const y2 = cy + r * Math.sin(angle);
        return <line key={`t-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1A1613" strokeWidth="0.3" />;
      })}
      {/* planet dots */}
      {[12, 67, 108, 195, 250, 320].map((deg, i) => {
        const angle = (deg - 90) * (Math.PI / 180);
        const x = cx + (r - 20) * Math.cos(angle);
        const y = cy + (r - 20) * Math.sin(angle);
        return <circle key={i} cx={x} cy={y} r="2" fill="#1A1613" />;
      })}
    </svg>
  );
}

/* ============================================================== */
/* QUESTIONS — emotional hook                                       */
/* ============================================================== */
function Questions() {
  return (
    <section className="relative border-t border-[#E4D7BC] bg-[#F5EFDF]">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="max-w-[720px]"
        >
          <div className="text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-6">
            <span className="text-[#8B2E1F]">§ I.</span> The questions worth asking
          </div>
          <h2
            className="text-[36px] md:text-[52px] leading-[1.04] tracking-[-0.02em] text-[#1A1613]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            A horoscope cannot answer the things <span className="italic">you actually want to know.</span>
          </h2>
          <p className="mt-6 text-[16px] md:text-[17px] leading-[1.6] text-[#524C44] max-w-[560px]">
            Most astrology is entertainment. Vedic astrology, done properly, is
            a five-thousand-year-old system of self-inquiry. It speaks to the
            real stakes of a life.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-16 max-w-[900px]">
          {questions.map((q, i) => (
            <motion.div
              key={q}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.6 }}
              className="flex items-baseline gap-4 py-4 border-b border-[#E4D7BC]"
            >
              <span
                className="text-[11px] tracking-widest text-[#A59E91] tabular-nums"
                style={{ fontFamily: "ui-monospace, monospace" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="text-[19px] md:text-[22px] leading-[1.3] text-[#1A1613]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {q}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/* WHAT YOU RECEIVE                                                 */
/* ============================================================== */
function Benefits() {
  return (
    <section className="relative border-t border-[#E4D7BC]">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <div className="text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-6">
              <span className="text-[#8B2E1F]">§ II.</span> What you receive
            </div>
            <h2
              className="text-[36px] md:text-[48px] leading-[1.05] tracking-[-0.02em] text-[#1A1613]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Not a reading. A <span className="italic">relationship</span> with your chart.
            </h2>
            <p className="mt-6 text-[16px] leading-[1.65] text-[#524C44]">
              Your chart is computed once and becomes a companion — answering
              the quiet questions, marking the turning points, and growing more
              useful the longer you live with it.
            </p>

            <div className="mt-10 relative rounded-sm overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80"
                alt="Still water at dawn"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-7 lg:pt-16">
            {[
              {
                n: "i.",
                h: "Your timing, finally visible.",
                p: "The big moves — careers, partnerships, moves — all have favorable and unfavorable windows. Your Dasha timeline maps every phase from birth to your hundredth year.",
              },
              {
                n: "ii.",
                h: "Your patterns, named and understood.",
                p: "Two hundred classical combinations (yogas) reveal the recurring themes in your life. The hidden strengths you under-use. The patterns that keep showing up.",
              },
              {
                n: "iii.",
                h: "Your relationships, seen clearly.",
                p: "Add a partner, a parent, a child. See where you amplify each other and where the friction lives. Compatibility calculated the classical way, not a quiz.",
              },
              {
                n: "iv.",
                h: "A conversation that remembers you.",
                p: "Every question deepens the reading. Your astrologer remembers what you shared last month, what you were working through, who matters in your life.",
              },
            ].map((b, i) => (
              <motion.div
                key={b.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="py-8 border-b border-[#E4D7BC] first:pt-0 last:border-b-0"
              >
                <div className="flex items-baseline gap-6">
                  <span
                    className="text-[13px] text-[#8B2E1F] pt-1"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {b.n}
                  </span>
                  <div>
                    <h3
                      className="text-[24px] md:text-[28px] leading-[1.2] text-[#1A1613]"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      {b.h}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.65] text-[#524C44] max-w-[560px]">
                      {b.p}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/* DEPTH — trust signals, the technical edge                        */
/* ============================================================== */
function Depth() {
  return (
    <section className="relative border-t border-[#E4D7BC] bg-[#1A1613] text-[#F8F3E8]">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5">
            <div className="text-[11px] tracking-[0.22em] uppercase text-[#B5893C] mb-6">
              <span>§ III.</span> Why this is different
            </div>
            <h2
              className="text-[36px] md:text-[52px] leading-[1.04] tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Other apps <span className="italic">guess.</span>
              <br />
              We <span className="italic text-[#B5893C]">compute.</span>
            </h2>
            <p className="mt-6 text-[16px] leading-[1.65] text-[#D5CCB8] max-w-[480px]">
              Every planetary position, every combination, every timing window is
              derived from mathematics — the same methods used for centuries by
              the world&apos;s classical astrologers. Only then does a language
              model put it into words.
            </p>
            <p className="mt-4 text-[14px] leading-[1.6] text-[#A59E91] max-w-[480px]">
              The difference you feel is the difference between an astrologer
              who reads a generic horoscope and one who has studied your chart
              for a long time.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-x-10 gap-y-10">
              {[
                { n: "20", l: "Divisional sub-charts", s: "Career, marriage, wealth, spirituality — each has its own chart." },
                { n: "200+", l: "Classical patterns detected", s: "The yogas that shape your strengths and challenges." },
                { n: "5", l: "Levels of timing precision", s: "From life-long eras down to the coming hours." },
                { n: "9", l: "Planets computed", s: "The seven classical, plus the lunar nodes." },
                { n: "27", l: "Lunar mansions tracked", s: "The nakshatra system Vedic astrology is built upon." },
                { n: "515", l: "Pages of source methodology", s: "Canonical Parashari rules, encoded as calculation." },
              ].map((s) => (
                <div key={s.l} className="border-t border-[#3D3834] pt-5">
                  <div
                    className="text-[44px] md:text-[52px] leading-none text-[#F8F3E8] tabular-nums"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {s.n}
                  </div>
                  <div className="mt-3 text-[13px] text-[#D5CCB8] tracking-wide">{s.l}</div>
                  <div className="mt-1 text-[12px] text-[#A59E91] leading-snug max-w-[280px]">{s.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/* METHOD — 3 steps                                                 */
/* ============================================================== */
function Method() {
  return (
    <section className="relative border-t border-[#E4D7BC]">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 py-24 md:py-32">
        <div className="max-w-[720px] mb-16">
          <div className="text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-6">
            <span className="text-[#8B2E1F]">§ IV.</span> How it works
          </div>
          <h2
            className="text-[36px] md:text-[48px] leading-[1.05] tracking-[-0.02em] text-[#1A1613]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Three minutes to a chart. A lifetime to understand it.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {[
            {
              step: "01",
              title: "Tell us when and where you were born.",
              desc: "Date, exact time, and city. We use the time and place to locate the sky at the moment you arrived.",
            },
            {
              step: "02",
              title: "We compute your complete chart.",
              desc: "Every planetary position, every divisional sub-chart, every timing period — calculated in seconds.",
            },
            {
              step: "03",
              title: "Ask anything. Get answers grounded in your chart.",
              desc: "Career, timing, relationships, meaning. The reading adapts as your life unfolds.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div
                className="text-[13px] tracking-[0.3em] text-[#8B2E1F] mb-5"
                style={{ fontFamily: "ui-monospace, monospace" }}
              >
                {item.step}
              </div>
              <h3
                className="text-[24px] leading-[1.2] text-[#1A1613]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {item.title}
              </h3>
              <p className="mt-4 text-[15px] leading-[1.65] text-[#524C44]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/* TESTIMONIALS                                                    */
/* ============================================================== */
function Testimonials() {
  return (
    <section className="relative border-t border-[#E4D7BC] bg-[#F5EFDF]">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 py-24 md:py-32">
        <div className="max-w-[720px] mb-20">
          <div className="text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-6">
            <span className="text-[#8B2E1F]">§ V.</span> Testimony
          </div>
          <h2
            className="text-[36px] md:text-[48px] leading-[1.05] tracking-[-0.02em] text-[#1A1613]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            From readers, around the world.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-14">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className="flex flex-col"
            >
              <div
                className="text-[64px] leading-none text-[#8B2E1F] -mb-2 select-none"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                &ldquo;
              </div>
              <blockquote
                className="text-[19px] md:text-[21px] leading-[1.45] text-[#1A1613]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {t.quote}
              </blockquote>
              <div className="mt-8 pt-6 border-t border-[#D9CBAF] flex items-center gap-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover grayscale"
                  loading="lazy"
                />
                <div>
                  <div className="text-[14px] font-medium text-[#1A1613]">{t.name}</div>
                  <div className="text-[12px] text-[#A59E91] tracking-wide">{t.role} · {t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/* PRICING                                                         */
/* ============================================================== */
function Pricing() {
  return (
    <section className="relative border-t border-[#E4D7BC]">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 py-24 md:py-32">
        <div className="max-w-[720px] mb-20">
          <div className="text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-6">
            <span className="text-[#8B2E1F]">§ VI.</span> The offer
          </div>
          <h2
            className="text-[36px] md:text-[48px] leading-[1.05] tracking-[-0.02em] text-[#1A1613]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Begin free. Go as deep as you like.
          </h2>
          <p className="mt-6 text-[16px] leading-[1.65] text-[#524C44]">
            Every plan starts free. Upgrade only when the questions get bigger.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pricing.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className={`relative p-7 flex flex-col ${
                tier.featured
                  ? "bg-[#1A1613] text-[#F8F3E8] rounded-sm"
                  : "bg-[#F8F3E8] border border-[#E4D7BC] rounded-sm"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-2.5 left-7 px-2 py-0.5 bg-[#B5893C] text-[#1A1613] text-[10px] tracking-[0.2em] uppercase font-medium">
                  Most chosen
                </div>
              )}
              <div className="flex items-baseline justify-between mb-1">
                <div
                  className={`text-[22px] ${tier.featured ? "text-[#F8F3E8]" : "text-[#1A1613]"}`}
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {tier.name}
                </div>
              </div>
              <div className={`text-[12px] tracking-wide mb-7 ${tier.featured ? "text-[#A59E91]" : "text-[#8B847C]"}`}>
                {tier.tagline}
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span
                  className={`text-[42px] leading-none ${tier.featured ? "text-[#F8F3E8]" : "text-[#1A1613]"}`}
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {tier.price}
                </span>
                {tier.interval && (
                  <span className={`text-[13px] ${tier.featured ? "text-[#A59E91]" : "text-[#8B847C]"}`}>
                    {tier.interval}
                  </span>
                )}
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className={`text-[14px] leading-[1.55] flex items-start gap-3 ${
                      tier.featured ? "text-[#D5CCB8]" : "text-[#524C44]"
                    }`}
                  >
                    <span
                      className={`mt-[7px] w-1 h-1 rounded-full shrink-0 ${
                        tier.featured ? "bg-[#B5893C]" : "bg-[#8B2E1F]"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`text-[13px] font-medium tracking-wide text-center py-3 rounded-full transition-all ${
                  tier.featured
                    ? "bg-[#F8F3E8] text-[#1A1613] hover:bg-[#D5CCB8]"
                    : "bg-[#1A1613] text-[#F8F3E8] hover:bg-[#2D2520]"
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/* FINAL CTA                                                       */
/* ============================================================== */
function FinalCta() {
  return (
    <section className="relative border-t border-[#E4D7BC]">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 py-32 md:py-40">
        <div className="max-w-[900px] mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[44px] md:text-[72px] leading-[0.98] tracking-[-0.02em] text-[#1A1613]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            The sky at the <span className="italic">moment of your birth</span> is waiting to be read.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#1A1613] text-[#F8F3E8] text-[14px] font-medium tracking-wide hover:bg-[#2D2520] transition-all"
            >
              Begin your reading
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10m0 0l-4-4m4 4l-4 4" />
              </svg>
            </Link>
            <a
              href="https://t.me/astrosagepredictionsbot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#F8F3E8] text-[#1A1613] text-[14px] font-medium border border-[#1A1613] hover:bg-[#1A1613] hover:text-[#F8F3E8] transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
              </svg>
              Try the Telegram bot
            </a>
          </motion.div>
          <p className="mt-8 text-[12px] tracking-wide text-[#A59E91]">
            Ten free conversations. No card required.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================== */
/* FOOTER                                                          */
/* ============================================================== */
function Footer() {
  return (
    <footer className="border-t border-[#E4D7BC] bg-[#F8F3E8]">
      <div className="mx-auto max-w-[1280px] px-8 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Link href="/" className="flex items-baseline gap-2.5">
              <svg viewBox="0 0 28 28" className="w-6 h-6 text-[#1A1613]" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="14" cy="14" r="13" />
                <circle cx="14" cy="14" r="8" />
                <circle cx="14" cy="14" r="3" />
              </svg>
              <span
                className="text-[20px] leading-none tracking-tight text-[#1A1613]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Jyotish Guru
              </span>
            </Link>
            <p className="mt-5 text-[13px] leading-[1.6] text-[#524C44] max-w-[340px]">
              A classical Vedic astrology companion, computed from the source
              methodology, explained in the language of everyday life.
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="text-[11px] tracking-[0.22em] uppercase text-[#A59E91] mb-4">
              Pages
            </div>
            <ul className="space-y-2.5 text-[13px] text-[#524C44]">
              <li><Link href="/signup" className="hover:text-[#1A1613] transition-colors">Begin a reading</Link></li>
              <li><Link href="/login" className="hover:text-[#1A1613] transition-colors">Sign in</Link></li>
              <li><a href="https://t.me/astrosagepredictionsbot" target="_blank" rel="noopener noreferrer" className="hover:text-[#1A1613] transition-colors">Telegram bot</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="text-[11px] tracking-[0.22em] uppercase text-[#A59E91] mb-4">
              Colophon
            </div>
            <p className="text-[13px] leading-[1.6] text-[#524C44]">
              Computational methods based on P.V.R. Narasimha Rao&apos;s <em>Vedic Astrology: An Integrated Approach</em> — a five-hundred-and-fifteen page canonical treatment of the Parashari school.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#E4D7BC] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[11px] tracking-wide text-[#A59E91]">
            &copy; 2026 Jyotish Guru. All rights reserved.
          </p>
          <p className="text-[11px] tracking-wide text-[#A59E91] italic">
            &ldquo;Yatha pinde, tatha brahmande.&rdquo; — as within, so without.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================== */
/* ROOT                                                            */
/* ============================================================== */
export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-[#F8F3E8] text-[#1A1613] overflow-x-hidden"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <Nav />
      <Hero />
      <Questions />
      <Benefits />
      <Depth />
      <Method />
      <Testimonials />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  );
}
