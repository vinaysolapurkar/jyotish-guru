export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: { svg: 32, text: "text-lg" },
    md: { svg: 40, text: "text-xl" },
    lg: { svg: 56, text: "text-3xl" },
  };

  const { svg, text } = dimensions[size];

  return (
    <div className="flex items-center gap-2">
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer celestial ring */}
        <circle cx="50" cy="50" r="46" stroke="url(#goldGrad)" strokeWidth="2" fill="none" />
        <circle cx="50" cy="50" r="42" stroke="url(#purpleGrad)" strokeWidth="1" fill="none" opacity="0.5" />

        {/* Inner zodiac-inspired design */}
        <circle cx="50" cy="50" r="30" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" />

        {/* Stylized star / compass points */}
        <path d="M50 8 L53 42 L50 38 L47 42 Z" fill="url(#goldGrad)" />
        <path d="M50 92 L47 58 L50 62 L53 58 Z" fill="url(#goldGrad)" />
        <path d="M8 50 L42 47 L38 50 L42 53 Z" fill="url(#goldGrad)" />
        <path d="M92 50 L58 53 L62 50 L58 47 Z" fill="url(#goldGrad)" />

        {/* Diagonal rays */}
        <path d="M20 20 L44 44 L42 46 Z" fill="url(#purpleGrad)" opacity="0.7" />
        <path d="M80 20 L56 44 L58 46 Z" fill="url(#purpleGrad)" opacity="0.7" />
        <path d="M20 80 L44 56 L42 54 Z" fill="url(#purpleGrad)" opacity="0.7" />
        <path d="M80 80 L56 56 L58 54 Z" fill="url(#purpleGrad)" opacity="0.7" />

        {/* Central sun */}
        <circle cx="50" cy="50" r="8" fill="url(#goldGrad)" />
        <circle cx="50" cy="50" r="5" fill="#1e1b4b" />
        <circle cx="50" cy="50" r="3" fill="url(#goldGrad)" opacity="0.8" />

        {/* Small stars on the ring */}
        <circle cx="50" cy="6" r="2" fill="#f59e0b" />
        <circle cx="94" cy="50" r="2" fill="#f59e0b" />
        <circle cx="50" cy="94" r="2" fill="#f59e0b" />
        <circle cx="6" cy="50" r="2" fill="#f59e0b" />

        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
      </svg>
      <span
        className={`${text} font-serif font-bold tracking-wide`}
        style={{
          background: "linear-gradient(135deg, #f59e0b, #fbbf24, #d97706)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Jyotish Guru
      </span>
    </div>
  );
}
