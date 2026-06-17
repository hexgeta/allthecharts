'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'

export type MapLoc = {
  name: string
  lng: number
  lat: number
  detail: string
  major?: boolean
}

const W = 540
const H = 760

const FILL: Record<string, string> = {
  confirmed: '#c81e1e',
  suspected: '#e08a8a',
  none: 'rgba(255,255,255,0.05)',
}
const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmed',
  suspected: 'Suspected',
  none: 'Not recorded',
}

export default function UkChoropleth({ locations }: { locations: MapLoc[] }) {
  const [geo, setGeo] = useState<any>(null)
  const [hoverD, setHoverD] = useState<{ name: string; status: string; d: string } | null>(null)
  const [hoverM, setHoverM] = useState<number | null>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const tip = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    fetch('/rape-gangs/uk-districts.geo.json')
      .then((r) => r.json())
      .then((d) => { if (alive) setGeo(d) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const { paths, projection } = useMemo(() => {
    if (!geo) return { paths: [] as any[], projection: null as any }
    const projection = geoMercator().fitSize([W, H], geo)
    const pathGen = geoPath(projection)
    const paths = geo.features.map((f: any) => ({
      d: pathGen(f) || '',
      name: f.properties.name,
      status: f.properties.status,
    }))
    return { paths, projection }
  }, [geo])

  const onMove = (e: React.MouseEvent) => {
    const r = wrap.current?.getBoundingClientRect()
    if (r && tip.current) {
      tip.current.style.left = `${e.clientX - r.left + 14}px`
      tip.current.style.top = `${e.clientY - r.top + 14}px`
    }
  }

  if (!geo) {
    return <div className="h-[520px] flex items-center justify-center text-gray-500 text-sm">Loading map…</div>
  }

  const activeMarker = hoverM != null ? locations[hoverM] : null

  return (
    <div className="relative w-full max-w-[460px] mx-auto" ref={wrap} onMouseMove={onMove}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label="Map of affected districts">
        {paths.map((p: any, i: number) => (
          <path
            key={i}
            d={p.d}
            fill={FILL[p.status] || FILL.none}
            stroke="rgba(0,0,0,0.55)"
            strokeWidth={0.3}
            onMouseEnter={() => setHoverD({ name: p.name, status: p.status, d: p.d })}
            onMouseLeave={() => setHoverD(null)}
          />
        ))}
        {/* hovered district highlight */}
        {hoverD && <path d={hoverD.d} fill="rgba(255,255,255,0.18)" stroke="#fff" strokeWidth={0.8} pointerEvents="none" />}
        {/* location markers */}
        {locations.map((loc, i) => {
          const pt = projection([loc.lng, loc.lat])
          if (!pt) return null
          const [x, y] = pt
          const r = loc.major ? 4.5 : 3
          return (
            <g key={i} onMouseEnter={() => setHoverM(i)} onMouseLeave={() => setHoverM(null)} className="cursor-pointer">
              <circle cx={x} cy={y} r={r + 5} fill="#fff" opacity={hoverM === i ? 0.3 : 0} />
              <circle cx={x} cy={y} r={r + 1.6} fill="#fff" opacity={0.95} />
              <circle cx={x} cy={y} r={r} fill="#7f1d1d" stroke="#450a0a" strokeWidth={0.4} />
            </g>
          )
        })}
      </svg>

      {/* legend */}
      <div className="absolute bottom-2 left-2 rounded-lg border border-white/15 bg-black/80 backdrop-blur-sm px-3 py-2 space-y-1.5">
        {(['confirmed', 'suspected', 'none'] as const).map((s) => (
          <div key={s} className="flex items-center gap-2 text-[11px] text-gray-300">
            <span className="w-3 h-3 rounded-sm" style={{ background: s === 'none' ? 'rgba(255,255,255,0.12)' : FILL[s] }} />
            {STATUS_LABEL[s]}
          </div>
        ))}
        <div className="flex items-center gap-2 text-[11px] text-gray-300 pt-0.5">
          <span className="w-3 h-3 rounded-full bg-[#7f1d1d] border border-white" />
          Named case
        </div>
      </div>

      {/* floating tooltip */}
      <div
        ref={tip}
        className="absolute z-20 pointer-events-none"
        style={{ left: 0, top: 0, display: hoverD || activeMarker ? 'block' : 'none' }}
      >
        <div className="w-52 rounded-lg border border-white/20 bg-black/95 p-2.5 shadow-xl">
          {activeMarker ? (
            <>
              <div className="text-white font-semibold text-sm">{activeMarker.name}</div>
              <div className="text-gray-300 text-xs mt-1 leading-relaxed">{activeMarker.detail}</div>
            </>
          ) : hoverD ? (
            <>
              <div className="text-white font-semibold text-sm">{hoverD.name}</div>
              <div className="text-xs mt-0.5" style={{ color: hoverD.status === 'none' ? '#9ca3af' : FILL[hoverD.status] }}>
                {STATUS_LABEL[hoverD.status]}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
