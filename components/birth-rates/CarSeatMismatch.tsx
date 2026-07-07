'use client'

import React from 'react'
import { useBirthRatesData } from '@/hooks/useBirthRatesData'

// Countries where the US "car-seat" mechanism barely applies, yet fertility still fell.
const CASES: { code: string; why: string }[] = [
  { code: 'CHN', why: 'No enforced national child-restraint law until 2021' },
  { code: 'KOR', why: 'Transit-dense cities, low car dependence' },
  { code: 'JPN', why: 'Transit-heavy; different car culture' },
  { code: 'ITA', why: 'Fertility fell long before any booster-seat rules' },
  { code: 'ESP', why: 'Ultra-low fertility, walkable cities' },
  { code: 'BRA', why: 'Lower car ownership, weak enforcement' },
  { code: 'IDN', why: 'Low car ownership, no comparable rule' },
  { code: 'NGA', why: 'Minimal car-seat enforcement' },
]

export default function CarSeatMismatch() {
  const { data } = useBirthRatesData()
  const meta = data?.meta.countries ?? {}

  const latestFertility = (code: string): number | null => {
    const s = data?.fertility[code]
    return s && s.length ? s[s.length - 1][1] : null
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {CASES.map(c => {
        const tfr = latestFertility(c.code)
        const color = meta[c.code]?.color || '#9CA3AF'
        return (
          <div key={c.code} className="rounded-lg border border-gray-800 bg-black/30 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-white truncate">{meta[c.code]?.label || c.code}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color }}>
                {tfr != null ? tfr.toFixed(1) : '—'}
              </span>
            </div>
            <div className="text-[11px] text-gray-500 leading-snug mt-1">{c.why}</div>
          </div>
        )
      })}
    </div>
  )
}
