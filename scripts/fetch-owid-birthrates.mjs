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
const COUNTRIES = {
  USA: { label: 'United States', color: '#3B82F6' },
  GBR: { label: 'United Kingdom', color: '#EF4444' },
  AUS: { label: 'Australia', color: '#10B981' },
  FRA: { label: 'France', color: '#8B5CF6' },
  POL: { label: 'Poland', color: '#FB923C' },
  MEX: { label: 'Mexico', color: '#14B8A6' },
  IDN: { label: 'Indonesia', color: '#FACC15' },
  NGA: { label: 'Nigeria', color: '#4ADE80' },
  KOR: { label: 'South Korea', color: '#A855F7' },
  BRA: { label: 'Brazil', color: '#22C55E' },
  // Added for the completed-cohort-fertility exhibit (Human Fertility Database coverage)
  ITA: { label: 'Italy', color: '#22D3EE' },
  ESP: { label: 'Spain', color: '#FB7185' },
  JPN: { label: 'Japan', color: '#F472B6' },
  DEU: { label: 'Germany', color: '#FBBF24' },
  SWE: { label: 'Sweden', color: '#A3E635' },
}
const WANTED = new Set(Object.keys(COUNTRIES))

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

async function fetchSeries(slug, minYear) {
  const url = `https://ourworldindata.org/grapher/${slug}.csv?csvType=full`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OWID ${slug}: HTTP ${res.status}`)
  const text = await res.text()
  const lines = text.split('\n')
  const byCode = {}
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue
    const c = parseCsvLine(lines[i])
    if (c.length < 4) continue
    const code = c[1]
    if (!WANTED.has(code)) continue
    const year = parseInt(c[2], 10)
    const value = parseFloat(c[3])
    if (!Number.isFinite(year) || !Number.isFinite(value)) continue
    if (minYear && year < minYear) continue
    ;(byCode[code] ||= []).push([year, Math.round(value * 1000) / 1000])
  }
  for (const code of Object.keys(byCode)) byCode[code].sort((a, b) => a[0] - b[0])
  return byCode
}

// Note: completedFertility is indexed by the woman's BIRTH COHORT year, not calendar year.
const [fertility, birthsOutsideMarriage, marriageRate, completedFertility, onePersonHouseholds] = await Promise.all([
  fetchSeries('children-born-per-woman', 1950),
  fetchSeries('share-of-births-outside-marriage', 1960),
  fetchSeries('marriage-rate-per-1000-inhabitants', 1950),
  fetchSeries('cohort-fertility-rate', 1935),
  fetchSeries('one-person-households', 1960),
])

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
    },
  },
  fertility,
  birthsOutsideMarriage,
  marriageRate,
  completedFertility,
  onePersonHouseholds,
}

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(payload))
console.log(`✓ wrote ${OUT}`)
console.log(
  `  fertility: ${Object.keys(fertility).length} · ` +
  `birthsOutsideMarriage: ${Object.keys(birthsOutsideMarriage).length} · ` +
  `marriageRate: ${Object.keys(marriageRate).length} · ` +
  `completedFertility: ${Object.keys(completedFertility).length} · ` +
  `onePersonHouseholds: ${Object.keys(onePersonHouseholds).length} countries`,
)
