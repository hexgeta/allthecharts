'use client'

import React, { useEffect, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'

export type MapLoc = {
  name: string
  lng: number
  lat: number
  detail: string
  major?: boolean
}

const W = 540
const H = 720

export default function UkMap({ locations }: { locations: MapLoc[] }) {
  const [geo, setGeo] = useState<any>(null)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/rape-gangs/uk.geo.json')
      .then((r) => r.json())
      .then((d) => { if (alive) setGeo(d) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  if (!geo) {
    return (
      <div className="h-[480px] flex items-center justify-center text-gray-500 text-sm">
        Loading map…
      </div>
    )
  }

  const projection = geoMercator().fitSize([W, H], geo)
  const pathGen = geoPath(projection)
  const outline = pathGen(geo) || ''

  return (
    <div className="relative w-full max-w-[440px] mx-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Map of locations named in the report">
        <path d={outline} fill="rgba(239,68,68,0.05)" stroke="rgba(255,255,255,0.18)" strokeWidth={0.6} />
        {locations.map((loc, i) => {
          const p = projection([loc.lng, loc.lat])
          if (!p) return null
          const [x, y] = p
          const r = loc.major ? 5.5 : 3.8
          const isActive = active === i
          return (
            <g
              key={i}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(isActive ? null : i)}
              className="cursor-pointer"
            >
              <circle cx={x} cy={y} r={r + 5} fill="#EF4444" opacity={isActive ? 0.3 : 0.14} />
              <circle cx={x} cy={y} r={r} fill={loc.major ? '#EF4444' : '#F87171'} stroke="#000" strokeWidth={0.8} />
            </g>
          )
        })}
      </svg>

      {active !== null && (() => {
        const loc = locations[active]
        const p = projection([loc.lng, loc.lat])
        if (!p) return null
        const leftPct = (p[0] / W) * 100
        const topPct = (p[1] / H) * 100
        return (
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-full pointer-events-none"
            style={{ left: `${leftPct}%`, top: `calc(${topPct}% - 8px)` }}
          >
            <div className="w-48 rounded-lg border border-white/20 bg-black/95 p-3 shadow-xl">
              <div className="text-white font-semibold text-sm">{loc.name}</div>
              <div className="text-gray-300 text-xs mt-1 leading-relaxed">{loc.detail}</div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
