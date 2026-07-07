// Fetches authoritative demographic series from Our World in Data (CC-BY) and
// bakes a small, filtered JSON for the /birth-rates page. Re-run to refresh:
//   node scripts/fetch-owid-birthrates.mjs
//
// Sources:
//  - children-born-per-woman          -> UN World Population Prospects (total fertility rate)
//  - share-of-births-outside-marriage -> OECD / UN, via OWID
//  - marriage-rate-per-1000-inhabitants -> UN / OECD crude marriage rate, via OWID
//
// Data (facts) are not copyrightable; OWID is CC-BY. Attribution lives on the page.

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const OUT = `${ROOT}/public/data/birth-rates.json`

// ISO3 codes we plot, and the display metadata used by the charts.
// Single source of truth for country colours across every chart on the page.
// Chosen so countries that co-appear in any one chart stay visually distinct
// (no two purples, greens, etc. side by side).
const COUNTRIES = {
  USA: { label: 'United States', color: '#3B82F6' }, // blue
  GBR: { label: 'United Kingdom', color: '#EF4444' }, // red
  FRA: { label: 'France', color: '#8B5CF6' }, // violet
  KOR: { label: 'South Korea', color: '#EC4899' }, // pink
  AUS: { label: 'Australia', color: '#10B981' }, // emerald
  POL: { label: 'Poland', color: '#F97316' }, // orange
  MEX: { label: 'Mexico', color: '#14B8A6' }, // teal
  IDN: { label: 'Indonesia', color: '#EAB308' }, // yellow
  NGA: { label: 'Nigeria', color: '#84CC16' }, // lime
  BRA: { label: 'Brazil', color: '#22C55E' }, // green
  ITA: { label: 'Italy', color: '#06B6D4' }, // cyan
  ESP: { label: 'Spain', color: '#F43F5E' }, // rose
  JPN: { label: 'Japan', color: '#FBBF24' }, // amber
  DEU: { label: 'Germany', color: '#64748B' }, // slate
  SWE: { label: 'Sweden', color: '#A855F7' }, // purple
  CHN: { label: 'China', color: '#DC2626' }, // crimson
}
const WANTED = new Set(Object.keys(COUNTRIES))

// BIS real residential property prices (index, 2010 = 100), hosted key-free on FRED.
const HOUSE_PRICE_SERIES = {
  USA: 'QUSR628BIS', GBR: 'QGBR628BIS', FRA: 'QFRR628BIS', KOR: 'QKRR628BIS',
  DEU: 'QDER628BIS', AUS: 'QAUR628BIS', ESP: 'QESR628BIS', ITA: 'QITR628BIS', JPN: 'QJPR628BIS',
}

function parseCsvLine(line) {
  const out = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (ch === '"') inQ = false
      else cur += ch
    } else if (ch === '"') inQ = true
    else if (ch === ',') { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur)
  return out
}

async function fetchSeries(slug, minYear, colIndex = 3) {
  const url = `https://ourworldindata.org/grapher/${slug}.csv?csvType=full`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OWID ${slug}: HTTP ${res.status}`)
  const text = await res.text()
  const lines = text.split('\n')
  const byCode = {}
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue
    const c = parseCsvLine(lines[i])
    if (c.length <= colIndex) continue
    const code = c[1]
    if (!WANTED.has(code)) continue
    const year = parseInt(c[2], 10)
    const value = parseFloat(c[colIndex])
    if (!Number.isFinite(year) || !Number.isFinite(value)) continue
    if (minYear && year < minYear) continue
    ;(byCode[code] ||= []).push([year, Math.round(value * 1000) / 1000])
  }
  for (const code of Object.keys(byCode)) byCode[code].sort((a, b) => a[0] - b[0])
  return byCode
}

// FRED serves BIS/OECD series as CSV without an API key. Quarterly -> annual mean.
async function fetchFredAnnual(seriesId, minYear) {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`FRED ${seriesId}: HTTP ${res.status}`)
  const text = await res.text()
  const lines = text.split('\n')
  const acc = {} // year -> { sum, n }
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue
    const [date, val] = lines[i].split(',')
    if (!date) continue
    const year = parseInt(date.slice(0, 4), 10)
    const value = parseFloat(val)
    if (!Number.isFinite(year) || !Number.isFinite(value)) continue
    if (minYear && year < minYear) continue
    ;(acc[year] ||= { sum: 0, n: 0 })
    acc[year].sum += value
    acc[year].n += 1
  }
  return Object.keys(acc)
    .map(y => [parseInt(y, 10), Math.round((acc[y].sum / acc[y].n) * 100) / 100])
    .sort((a, b) => a[0] - b[0])
}

// Note: completedFertility is indexed by the woman's BIRTH COHORT year, not calendar year.
const [
  fertility, birthsOutsideMarriage, marriageRate, completedFertility,
  onePersonHouseholds, churchAttendance, shareWomenMarried,
] = await Promise.all([
  fetchSeries('children-born-per-woman', 1950),
  fetchSeries('share-of-births-outside-marriage', 1960),
  fetchSeries('marriage-rate-per-1000-inhabitants', 1950),
  fetchSeries('cohort-fertility-rate', 1935),
  fetchSeries('one-person-households', 1960),
  fetchSeries('share-attending-religious-services', 1980),
  // The "15-49 years old" (non-projected) column is at index 4, after "(Projected)".
  fetchSeries('share-of-women-aged-1549-who-are-married-or-in-a-union', 1970, 4),
])

// BIS real house prices (index, 2010 = 100) — from FRED, keyed by our ISO3 codes.
const realHousePrices = {}
await Promise.all(
  Object.entries(HOUSE_PRICE_SERIES).map(async ([code, id]) => {
    try {
      realHousePrices[code] = await fetchFredAnnual(id, 1970)
    } catch (e) {
      console.error(`  house price fail ${code}: ${e.message}`)
    }
  }),
)

const payload = {
  meta: {
    generated: '(run scripts/fetch-owid-birthrates.mjs to refresh)',
    countries: COUNTRIES,
    sources: {
      fertility: 'UN World Population Prospects (2024), via Our World in Data',
      birthsOutsideMarriage: 'OECD Family Database / UN, via Our World in Data',
      marriageRate: 'UN / OECD crude marriage rate, via Our World in Data',
      completedFertility: 'Human Fertility Database (completed cohort fertility), via Our World in Data',
      onePersonHouseholds: 'UN / national censuses (share of one-person households), via Our World in Data',
      realHousePrices: 'BIS real residential property prices (index, 2010=100), via FRED',
      churchAttendance: 'World Values Survey / EVS (frequent religious attendance), via Our World in Data',
      shareWomenMarried: 'UN World Marriage Data (women 15-49 married or in a union), via Our World in Data',
    },
  },
  fertility,
  birthsOutsideMarriage,
  marriageRate,
  completedFertility,
  onePersonHouseholds,
  realHousePrices,
  churchAttendance,
  shareWomenMarried,
}

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(payload))
console.log(`✓ wrote ${OUT}`)
console.log(
  `  fertility: ${Object.keys(fertility).length} · ` +
  `birthsOutsideMarriage: ${Object.keys(birthsOutsideMarriage).length} · ` +
  `marriageRate: ${Object.keys(marriageRate).length} · ` +
  `completedFertility: ${Object.keys(completedFertility).length} · ` +
  `onePersonHouseholds: ${Object.keys(onePersonHouseholds).length} · ` +
  `realHousePrices: ${Object.keys(realHousePrices).length} · ` +
  `churchAttendance: ${Object.keys(churchAttendance).length} · ` +
  `shareWomenMarried: ${Object.keys(shareWomenMarried).length} countries`,
)
