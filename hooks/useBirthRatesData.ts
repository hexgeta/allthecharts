'use client'

import useSWR from 'swr'

export interface BirthRatesData {
  meta: {
    countries: Record<string, { label: string; color: string }>
    sources: Record<string, string>
  }
  fertility: Record<string, [number, number][]>
  birthsOutsideMarriage: Record<string, [number, number][]>
  marriageRate: Record<string, [number, number][]>
}

export type BirthRatesMetric = 'fertility' | 'birthsOutsideMarriage' | 'marriageRate'

const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(`birth-rates data: HTTP ${r.status}`)
    return r.json() as Promise<BirthRatesData>
  })

// Static JSON baked by scripts/fetch-owid-birthrates.mjs — same-origin, ~14KB.
export function useBirthRatesData() {
  const { data, error, isLoading } = useSWR<BirthRatesData>('/data/birth-rates.json', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60 * 60 * 1000,
  })
  return { data, error, isLoading }
}

// Pivot { ISO3: [[year, value]] } into recharts rows keyed by year.
export function seriesToChart(
  series: Record<string, [number, number][]>,
  codes: string[],
  startYear: number,
  endYear: number,
): Array<Record<string, number>> {
  const byYear = new Map<number, Record<string, number>>()
  for (const code of codes) {
    for (const [year, value] of series[code] || []) {
      if (year < startYear || year > endYear) continue
      if (!byYear.has(year)) byYear.set(year, { year })
      byYear.get(year)![code] = value
    }
  }
  return Array.from(byYear.values()).sort((a, b) => a.year - b.year)
}
