import { BirthChartData } from './astrology';
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';

// South Indian chart: signs are FIXED in position
// Grid positions (row, col) for each sign index (0=Aries..11=Pisces)
const SIGN_GRID: Record<number, [number, number]> = {
  0: [0, 1],  // Aries
  1: [0, 2],  // Taurus
  2: [0, 3],  // Gemini
  3: [1, 3],  // Cancer
  4: [2, 3],  // Leo
  5: [3, 3],  // Virgo
  6: [3, 2],  // Libra
  7: [3, 1],  // Scorpio
  8: [3, 0],  // Sagittarius
  9: [2, 0],  // Capricorn
  10: [1, 0], // Aquarius
  11: [0, 0], // Pisces
};

const SIGN_ABBR = [
  'Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi',
  'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi',
];

const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

const SVG_SIZE = 600;
const PADDING = 20;
const GRID_SIZE = SVG_SIZE - PADDING * 2;
const CELL_SIZE = GRID_SIZE / 4;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generateChartSVG(chart: BirthChartData, name?: string): string {
  const ascendantRashi = chart.ascendant.rashi; // 0-11

  // Group planets by sign (rashi index)
  const planetsBySign: Record<number, string[]> = {};
  for (const planet of chart.planets) {
    const abbr = PLANET_ABBR[planet.name] || planet.name.substring(0, 2);
    let label = abbr;
    if (planet.isRetrograde) label += '(R)';
    if (planet.isExalted) label += '*';
    if (planet.isDebilitated) label += '(D)';

    if (!planetsBySign[planet.rashi]) {
      planetsBySign[planet.rashi] = [];
    }
    planetsBySign[planet.rashi].push(label);
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_SIZE}" height="${SVG_SIZE}" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}">
  <defs>
    <style>
      .sign-label { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 11px; fill: #a09890; }
      .planet-text { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 14px; fill: #e07840; font-weight: 600; }
      .asc-label { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 10px; fill: #c06020; font-weight: 700; }
      .center-title { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 16px; fill: #5a4e42; font-weight: 700; text-anchor: middle; }
      .center-name { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 14px; fill: #7a6e62; text-anchor: middle; }
      .center-sub { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 11px; fill: #a09890; text-anchor: middle; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${SVG_SIZE}" height="${SVG_SIZE}" rx="8" fill="#faf7f2"/>

  <!-- Outer border -->
  <rect x="${PADDING}" y="${PADDING}" width="${GRID_SIZE}" height="${GRID_SIZE}" fill="none" stroke="#8a7e72" stroke-width="1.5" rx="2"/>
`;

  // Draw grid lines
  for (let i = 1; i < 4; i++) {
    const pos = PADDING + i * CELL_SIZE;
    // Horizontal lines
    svg += `  <line x1="${PADDING}" y1="${pos}" x2="${PADDING + GRID_SIZE}" y2="${pos}" stroke="#8a7e72" stroke-width="0.75"/>\n`;
    // Vertical lines
    svg += `  <line x1="${pos}" y1="${PADDING}" x2="${pos}" y2="${PADDING + GRID_SIZE}" stroke="#8a7e72" stroke-width="0.75"/>\n`;
  }

  // Draw each sign cell
  for (let signIdx = 0; signIdx < 12; signIdx++) {
    const [row, col] = SIGN_GRID[signIdx];
    const x = PADDING + col * CELL_SIZE;
    const y = PADDING + row * CELL_SIZE;

    const isAscendant = signIdx === ascendantRashi;

    // Highlight ascendant cell
    if (isAscendant) {
      svg += `  <rect x="${x + 0.5}" y="${y + 0.5}" width="${CELL_SIZE - 1}" height="${CELL_SIZE - 1}" fill="#fff3e0" rx="1"/>\n`;
    }

    // Sign abbreviation at top-left
    svg += `  <text x="${x + 6}" y="${y + 14}" class="sign-label">${SIGN_ABBR[signIdx]}</text>\n`;

    // Ascendant marker
    if (isAscendant) {
      svg += `  <text x="${x + CELL_SIZE - 8}" y="${y + 14}" class="asc-label" text-anchor="end">Asc</text>\n`;
    }

    // Planets in this sign
    const planets = planetsBySign[signIdx] || [];
    if (planets.length > 0) {
      // Calculate layout: stack planets vertically, centered in the cell
      const startY = y + 32;
      const lineHeight = 18;
      const maxPerColumn = Math.floor((CELL_SIZE - 36) / lineHeight);

      if (planets.length <= maxPerColumn) {
        // Single column, centered
        for (let i = 0; i < planets.length; i++) {
          const py = startY + i * lineHeight;
          svg += `  <text x="${x + CELL_SIZE / 2}" y="${py}" class="planet-text" text-anchor="middle">${escapeXml(planets[i])}</text>\n`;
        }
      } else {
        // Two columns for overflow
        const col1 = planets.slice(0, Math.ceil(planets.length / 2));
        const col2 = planets.slice(Math.ceil(planets.length / 2));
        for (let i = 0; i < col1.length; i++) {
          const py = startY + i * lineHeight;
          svg += `  <text x="${x + CELL_SIZE * 0.3}" y="${py}" class="planet-text" text-anchor="middle">${escapeXml(col1[i])}</text>\n`;
        }
        for (let i = 0; i < col2.length; i++) {
          const py = startY + i * lineHeight;
          svg += `  <text x="${x + CELL_SIZE * 0.7}" y="${py}" class="planet-text" text-anchor="middle">${escapeXml(col2[i])}</text>\n`;
        }
      }
    }
  }

  // Center 2x2 area
  const centerX = PADDING + CELL_SIZE;
  const centerY = PADDING + CELL_SIZE;
  const centerW = CELL_SIZE * 2;
  const centerH = CELL_SIZE * 2;

  // Clear the center with background color and re-draw borders
  svg += `  <rect x="${centerX}" y="${centerY}" width="${centerW}" height="${centerH}" fill="#faf7f2" stroke="#8a7e72" stroke-width="1"/>\n`;

  // Decorative inner border
  const inset = 8;
  svg += `  <rect x="${centerX + inset}" y="${centerY + inset}" width="${centerW - inset * 2}" height="${centerH - inset * 2}" fill="none" stroke="#d4c8b8" stroke-width="0.5" rx="4"/>\n`;

  // Center text
  const cx = centerX + centerW / 2;
  const cy = centerY + centerH / 2;
  svg += `  <text x="${cx}" y="${cy - 24}" class="center-title">BIRTH CHART</text>\n`;
  if (name) {
    svg += `  <text x="${cx}" y="${cy + 4}" class="center-name">${escapeXml(name)}</text>\n`;
  }
  svg += `  <text x="${cx}" y="${cy + 28}" class="center-sub">South Indian</text>\n`;

  svg += `</svg>`;
  return svg;
}

/**
 * Save the generated SVG to a temp file and return the file path.
 * Useful for sending via Telegram or other services.
 */
export function saveChartSVG(chart: BirthChartData, name?: string): string {
  const svg = generateChartSVG(chart, name);
  const filePath = `/tmp/chart-${randomUUID()}.svg`;
  writeFileSync(filePath, svg, 'utf-8');
  return filePath;
}

/**
 * Convert SVG to PNG using sharp if available. Returns a Buffer of the PNG image.
 * Falls back to saving SVG and returning null if sharp is not installed.
 */
export async function generateChartPNG(svgString: string): Promise<{ png: Buffer | null; svgPath: string }> {
  const svgPath = `/tmp/chart-${randomUUID()}.svg`;
  writeFileSync(svgPath, svgString, 'utf-8');

  try {
    // Dynamic import so it doesn't fail at compile time if sharp isn't installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sharp = require('sharp') as typeof import('sharp');
    const pngBuffer = await sharp(Buffer.from(svgString))
      .resize(600, 600)
      .png()
      .toBuffer();
    return { png: pngBuffer, svgPath };
  } catch {
    // sharp not available — return SVG path only
    return { png: null, svgPath };
  }
}
