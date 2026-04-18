"use client";

import { BirthChartData, RASHI_NAMES } from "@/lib/astrology";

// North Indian style diamond chart
export default function BirthChartSVG({ chart }: { chart: BirthChartData }) {
  const size = 400;
  const center = size / 2;

  // North Indian chart layout: 12 houses in diamond pattern
  // House positions (center points of each house region)
  const housePositions: { x: number; y: number; house: number }[] = [
    { x: center, y: 70, house: 1 },        // House 1 - top center
    { x: center - 80, y: 70, house: 2 },    // House 2
    { x: 40, y: 70, house: 3 },             // House 3
    { x: 40, y: center, house: 4 },         // House 4
    { x: 40, y: size - 70, house: 5 },      // House 5
    { x: center - 80, y: size - 70, house: 6 }, // House 6
    { x: center, y: size - 70, house: 7 },  // House 7
    { x: center + 80, y: size - 70, house: 8 }, // House 8
    { x: size - 40, y: size - 70, house: 9 }, // House 9
    { x: size - 40, y: center, house: 10 },  // House 10
    { x: size - 40, y: 70, house: 11 },      // House 11
    { x: center + 80, y: 70, house: 12 },    // House 12
  ];

  // Map planets to houses
  const ascRashi = chart.ascendant.rashi;
  const planetsByHouse: Record<number, string[]> = {};
  for (let i = 0; i < 12; i++) {
    planetsByHouse[i + 1] = [];
  }

  chart.planets.forEach((planet) => {
    const house = ((planet.rashi - ascRashi + 12) % 12) + 1;
    const abbrev = planet.name === "Mercury" ? "Me" :
                   planet.name === "Jupiter" ? "Ju" :
                   planet.name === "Venus" ? "Ve" :
                   planet.name === "Saturn" ? "Sa" :
                   planet.name.slice(0, 2);
    planetsByHouse[house].push(abbrev);
  });

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[400px]"
      >
        {/* Background */}
        <rect width={size} height={size} fill="#F8F3E8" rx="4" />

        {/* Outer border */}
        <rect x="10" y="10" width={size - 20} height={size - 20} fill="none" stroke="#1A1613" strokeWidth="1" />

        {/* Center diamond */}
        <line x1={center} y1="10" x2={size - 10} y2={center} stroke="#1A1613" strokeWidth="0.75" />
        <line x1={size - 10} y1={center} x2={center} y2={size - 10} stroke="#1A1613" strokeWidth="0.75" />
        <line x1={center} y1={size - 10} x2="10" y2={center} stroke="#1A1613" strokeWidth="0.75" />
        <line x1="10" y1={center} x2={center} y2="10" stroke="#1A1613" strokeWidth="0.75" />

        {/* Diagonals */}
        <line x1="10" y1="10" x2={center} y2={center} stroke="#A59E91" strokeWidth="0.4" />
        <line x1={size - 10} y1="10" x2={center} y2={center} stroke="#A59E91" strokeWidth="0.4" />
        <line x1="10" y1={size - 10} x2={center} y2={center} stroke="#A59E91" strokeWidth="0.4" />
        <line x1={size - 10} y1={size - 10} x2={center} y2={center} stroke="#A59E91" strokeWidth="0.4" />

        {/* Asc label */}
        <text x={center} y={center - 40} textAnchor="middle" fill="#8B2E1F" fontSize="10" fontWeight="500" letterSpacing="1.5">
          ASC
        </text>

        {/* Rashi labels + planet placements */}
        {housePositions.map((pos, i) => {
          const rashiIndex = (ascRashi + i) % 12;
          return (
            <g key={i}>
              <text
                x={pos.x}
                y={pos.y - 15}
                textAnchor="middle"
                fill="#A59E91"
                fontSize="9"
                letterSpacing="1"
              >
                {RASHI_NAMES[rashiIndex].slice(0, 3)}
              </text>
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fill="#1A1613"
                fontSize="11"
                fontWeight="500"
              >
                {planetsByHouse[i + 1].join(" ")}
              </text>
            </g>
          );
        })}

        {/* Center lagna */}
        <text x={center} y={center - 10} textAnchor="middle" fill="#1A1613" fontSize="10" fontWeight="600" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          {RASHI_NAMES[ascRashi]}
        </text>
        <text x={center} y={center + 5} textAnchor="middle" fill="#A59E91" fontSize="8" letterSpacing="1">
          Lagna
        </text>
      </svg>

      {/* Planet legend */}
      <div className="mt-4 grid grid-cols-3 gap-1.5 text-[11px] w-full max-w-[400px]">
        {chart.planets.map((planet) => (
          <div
            key={planet.name}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-sm border border-[#E4D7BC]"
          >
            <span className={`font-medium ${planet.isExalted ? "text-[#2D4F38]" : planet.isDebilitated ? "text-[#8B2E1F]" : "text-[#1A1613]"}`}>
              {planet.name === "Mercury" ? "Me" : planet.name === "Jupiter" ? "Ju" : planet.name === "Venus" ? "Ve" : planet.name === "Saturn" ? "Sa" : planet.name.slice(0, 2)}
            </span>
            <span className="text-[#A59E91] tabular-nums">
              {planet.rashiName.slice(0, 3)} {Math.floor(planet.degrees)}&deg;
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
