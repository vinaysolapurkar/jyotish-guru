import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Jyotish Guru",
  description:
    "How Jyotish Guru collects, uses, and protects your personal data.",
};

const sections = [
  {
    n: "I.",
    title: "Who we are",
    body: (
      <>
        <p>
          Jyotish Guru (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is a
          Vedic astrology software application accessible at{" "}
          <a href="https://astro-xi-eight.vercel.app" className="underline hover:text-[#8B2E1F]">
            astro-xi-eight.vercel.app
          </a>{" "}
          and through the Jyotish Guru Android application and Telegram bot.
        </p>
        <p>
          This policy explains what information we collect, how we use it, who
          we share it with, and the rights you hold over your data.
        </p>
      </>
    ),
  },
  {
    n: "II.",
    title: "Information we collect",
    body: (
      <>
        <p>We collect only the information needed to operate the service:</p>
        <ul>
          <li>
            <b>Account details</b> — email address, name (optional), and a
            cryptographically hashed password. We never store passwords in
            plain text.
          </li>
          <li>
            <b>Birth details</b> — date of birth, time of birth, and place of
            birth. These are required to compute your astrological chart and
            are not used for any other purpose.
          </li>
          <li>
            <b>Location coordinates</b> — latitude and longitude derived from
            your birthplace via OpenStreetMap. These are used only for chart
            calculations, never to track your present location.
          </li>
          <li>
            <b>Conversation history</b> — messages you send to the astrologer
            and the responses generated. Stored so the conversation can resume
            and gain context over time.
          </li>
          <li>
            <b>Payment records</b> — transaction identifiers for upgraded
            plans. Actual payment processing is handled by PayPal; we do not
            store card or banking details.
          </li>
          <li>
            <b>Telegram identifier</b> — if you use our Telegram bot, we store
            your Telegram user ID to link conversations to your account.
          </li>
          <li>
            <b>Usage counters</b> — the number of messages you have exchanged,
            used to manage the free tier limit.
          </li>
        </ul>
        <p>
          We do not collect device identifiers, advertising IDs, contact
          lists, photos, camera access, microphone access, or precise location
          from a mobile device.
        </p>
      </>
    ),
  },
  {
    n: "III.",
    title: "How we use your information",
    body: (
      <>
        <ul>
          <li>To compute your birth chart and related astrological calculations.</li>
          <li>To answer your questions by sending the relevant chart context to our AI provider.</li>
          <li>To maintain your account and allow you to sign back in.</li>
          <li>To process upgrade payments through PayPal.</li>
          <li>To enforce the free-tier message limit.</li>
          <li>To improve the service through aggregate, non-identifying analysis.</li>
        </ul>
        <p>
          We do not sell your data. We do not run advertising. We do not
          profile you for marketing purposes.
        </p>
      </>
    ),
  },
  {
    n: "IV.",
    title: "Third parties we share with",
    body: (
      <>
        <p>We share the minimum necessary information with these providers:</p>
        <ul>
          <li>
            <b>DeepSeek AI</b> — conversational model. Receives your question
            and your computed chart summary for each message you send so it
            can produce an answer grounded in your chart. Governed by{" "}
            <a href="https://platform.deepseek.com/privacy" className="underline hover:text-[#8B2E1F]">
              DeepSeek&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <b>OpenStreetMap / Nominatim</b> — geocoding. Receives the city
            name you typed to return coordinates. No account information is
            sent.
          </li>
          <li>
            <b>PayPal</b> — payment processing for upgrades. You interact with
            PayPal directly; we never see your financial details.
          </li>
          <li>
            <b>Turso (libSQL Cloud)</b> — database hosting. Your account data,
            chart information, and messages are stored in an encrypted Turso
            database in the ap-south-1 region.
          </li>
          <li>
            <b>Vercel</b> — web application hosting. Transit of data between
            you and our servers.
          </li>
          <li>
            <b>Telegram</b> — if you interact via our Telegram bot, Telegram
            naturally processes those messages under{" "}
            <a href="https://telegram.org/privacy" className="underline hover:text-[#8B2E1F]">
              their privacy policy
            </a>
            .
          </li>
        </ul>
      </>
    ),
  },
  {
    n: "V.",
    title: "How long we keep your data",
    body: (
      <>
        <p>
          Account and chart data is retained while your account remains
          active. If you delete your account or request deletion, all
          associated records (messages, charts, birth details, payment
          history) are permanently removed from our database within 30 days.
        </p>
        <p>
          Aggregated usage statistics that cannot be traced back to you may be
          retained indefinitely for service improvement.
        </p>
      </>
    ),
  },
  {
    n: "VI.",
    title: "Your rights",
    body: (
      <>
        <p>Regardless of where you live, you have the right to:</p>
        <ul>
          <li><b>Access</b> — ask what personal data we hold about you.</li>
          <li><b>Correct</b> — update inaccurate information.</li>
          <li><b>Delete</b> — request complete erasure of your account and data.</li>
          <li><b>Export</b> — receive a copy of your data in a portable format.</li>
          <li><b>Withdraw consent</b> — at any time, without affecting prior processing.</li>
          <li><b>Object</b> — to any processing you believe is unlawful.</li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:vinaysolapurkar@gmail.com" className="underline hover:text-[#8B2E1F]">
            vinaysolapurkar@gmail.com
          </a>
          . We respond within 14 days.
        </p>
      </>
    ),
  },
  {
    n: "VII.",
    title: "Children",
    body: (
      <p>
        Jyotish Guru is not directed at children under 13. We do not
        knowingly collect personal data from anyone under 13. If we discover
        that a child under 13 has created an account, we will delete it.
      </p>
    ),
  },
  {
    n: "VIII.",
    title: "Security",
    body: (
      <>
        <p>
          All data is transmitted over TLS (HTTPS). Passwords are hashed with
          bcrypt before storage. Our database provider encrypts data at rest.
        </p>
        <p>
          No system is perfectly secure. If we become aware of a breach
          affecting your personal data, we will notify you by email within 72
          hours.
        </p>
      </>
    ),
  },
  {
    n: "IX.",
    title: "Changes to this policy",
    body: (
      <p>
        If we make material changes to how we handle personal data, we will
        update this page and notify registered users by email. The revision
        date below reflects the latest change.
      </p>
    ),
  },
  {
    n: "X.",
    title: "Contact",
    body: (
      <>
        <p>
          For any privacy-related question, concern, or request, contact:
        </p>
        <p className="not-italic">
          Vinay Solapurkar
          <br />
          <a href="mailto:vinaysolapurkar@gmail.com" className="underline hover:text-[#8B2E1F]">
            vinaysolapurkar@gmail.com
          </a>
          <br />
          Belagavi, Karnataka, India
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen bg-[#F8F3E8] text-[#1A1613]"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {/* Nav */}
      <nav className="relative z-20">
        <div className="mx-auto max-w-[900px] px-8 md:px-12 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2.5">
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
          <Link
            href="/"
            className="text-[13px] text-[#524C44] hover:text-[#1A1613] transition-colors"
          >
            Back home
          </Link>
        </div>
        <div className="mx-auto max-w-[900px] px-8 md:px-12">
          <div className="h-px bg-[#E4D7BC]" />
        </div>
      </nav>

      {/* Header */}
      <section className="mx-auto max-w-[900px] px-8 md:px-12 pt-16 pb-12">
        <div className="flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-[#524C44] mb-6">
          <span className="w-8 h-px bg-[#8B2E1F]" />
          <span>Colophon</span>
        </div>
        <h1
          className="text-[40px] md:text-[56px] leading-[1.05] tracking-[-0.02em] text-[#1A1613] mb-5"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Privacy <span className="italic text-[#8B2E1F]">policy.</span>
        </h1>
        <p className="text-[15px] leading-[1.6] text-[#524C44] max-w-[640px]">
          A plain-language summary of what data we collect, how we use it, and
          the rights you hold. If any term needs clarification, email us — we
          will answer.
        </p>
        <p className="mt-6 text-[11px] tracking-[0.18em] uppercase text-[#A59E91]">
          Last updated: 17 April 2026
        </p>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-[900px] px-8 md:px-12 pb-24">
        {sections.map((s) => (
          <article
            key={s.n}
            className="py-10 border-t border-[#E4D7BC] first:border-t-[#1A1613]"
          >
            <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-y-4 gap-x-10">
              <div
                className="text-[13px] tracking-[0.18em] uppercase text-[#8B2E1F] pt-1"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {s.n}
              </div>
              <div>
                <h2
                  className="text-[26px] md:text-[30px] leading-[1.15] tracking-[-0.01em] text-[#1A1613] mb-5"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {s.title}
                </h2>
                <div className="prose-custom text-[15px] leading-[1.7] text-[#524C44] space-y-4">
                  {s.body}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E4D7BC]">
        <div className="mx-auto max-w-[900px] px-8 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] tracking-wide text-[#A59E91]">
          <p>&copy; 2026 Jyotish Guru. All rights reserved.</p>
          <p className="italic">
            &ldquo;Yatha pinde, tatha brahmande.&rdquo; — as within, so without.
          </p>
        </div>
      </footer>

      {/* Minimal prose styling for bullets and paragraphs */}
      <style>{`
        .prose-custom p { margin: 0; }
        .prose-custom ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .prose-custom li {
          position: relative;
          padding-left: 18px;
          margin-bottom: 10px;
        }
        .prose-custom li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 11px;
          width: 6px;
          height: 1px;
          background: #8B2E1F;
        }
        .prose-custom b {
          color: #1A1613;
          font-weight: 600;
        }
        .prose-custom a { color: #524C44; }
      `}</style>
    </div>
  );
}
