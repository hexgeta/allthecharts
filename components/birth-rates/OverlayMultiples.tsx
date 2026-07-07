'use client'

import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBirthRatesData } from '@/hooks/useBirthRatesData'
import { Loader2 } from 'lucide-react'

const FERT = '#c084fc' // fertility (left axis)
const MARR = '#38bdf8' // marriage rate (right axis)

interface OverlayMultiplesProps {
  codes: string[]
  startYear: number
  endYear: number
  title: string
  description?: string
}

export default function OverlayMultiples({ codes, startYear, endYear, title, description }: OverlayMultiplesProps) {
  const { data, isLoading, error } = useBirthRatesData()
  const meta = data?.meta.countries ?? {}

  const { panels, fertDomain, marrDomain } = useMemo(() => {
    if (!data) return { panels: [] as any[], fertDomain: [0, 1], marrDomain: [0, 1] }
    let fMax = 0, mMax = 0
    const panels = codes.map(code => {
      const byYear = new Map<number, { year: number; fertility?: number; marriage?: number }>()
      for (const [y, v] of data.fertility[code] || []) {
        if (y < startYear || y > endYear) continue
        if (!byYear.has(y)) byYear.set(y, { year: y })
        byYear.get(y)!.fertility = v
        if (v > fMax) fMax = v
      }
      for (const [y, v] of data.marriageRate[code] || []) {
        if (y < startYear || y > endYear) continue
        if (!byYear.has(y)) byYear.set(y, { year: y })
        byYear.get(y)!.marriage = v
        if (v > mMax) mMax = v
      }
      const rows = Array.from(byYear.values()).sort((a, b) => a.year - b.year)
      const lastF = [...rows].reverse().find(r => r.fertility != null)?.fertility ?? null
      const lastM = [...rows].reverse().find(r => r.marriage != null)?.marriage ?? null
      return { code, rows, lastF, lastM }
    })
    return {
      panels,
      fertDomain: [0, Math.ceil(fMax)],
      marrDomain: [0, Math.ceil(mMax)],
    }
  }, [data, codes, startYear, endYear])

  const Tip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const f = payload.find((p: any) => p.dataKey === 'fertility')?.value
    const m = payload.find((p: any) => p.dataKey === 'marriage')?.value
    return (
      <div className="bg-black/95 border border-white/20 rounded px-2 py-1 text-[11px] space-y-0.5">
        <div className="text-gray-400">{label}</div>
        <div style={{ color: FERT }}>{f != null ? `${f.toFixed(2)} births/woman` : '—'}</div>
        <div style={{ color: MARR }}>{m != null ? `${m.toFixed(1)} marr./1,000` : '—'}</div>
      </div>
    )
  }

  return (
    <Card className="bg-black/20 border-gray-800 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">{title}</CardTitle>
        <CardDescription className="text-gray-400 text-sm flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5" style={{ backgroundColor: FERT }} />
            Fertility rate — births per woman (left)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 border-b border-dashed" style={{ borderColor: MARR }} />
            Crude marriage rate — per 1,000 (right)
          </span>
        </CardDescription>
        {description && <CardDescription className="text-gray-500 text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40 text-red-400 text-sm">Failed to load data</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {panels.map(p => (
                <div key={p.code} className="rounded-lg border border-gray-800 bg-black/30 p-2.5">
                  <div className="flex items-baseline justify-between mb-1 gap-1">
                    <span className="text-[13px] font-medium text-white truncate">
                      {meta[p.code]?.label || p.code}
                    </span>
                    <span className="text-[11px] tabular-nums whitespace-nowrap">
                      <span style={{ color: FERT }}>{p.lastF != null ? p.lastF.toFixed(1) : '—'}</span>
                      <span className="text-gray-600"> · </span>
                      <span style={{ color: MARR }}>{p.lastM != null ? p.lastM.toFixed(1) : '—'}</span>
                    </span>
                  </div>
                  <div style={{ height: 116 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={p.rows} margin={{ top: 6, right: 2, left: 0, bottom: 0 }}>
                        <XAxis
                          dataKey="year"
                          type="number"
                          domain={[startYear, endYear]}
                          ticks={[startYear, endYear]}
                          allowDecimals={false}
                          tick={{ fill: '#666', fontSize: 10 }}
                          axisLine={{ stroke: '#333' }}
                          tickLine={false}
                          tickFormatter={(v: number) => String(v)}
                        />
                        <YAxis yAxisId="fert" hide domain={fertDomain} />
                        <YAxis yAxisId="marr" orientation="right" hide domain={marrDomain} />
                        <Tooltip content={<Tip />} cursor={{ stroke: '#555', strokeDasharray: '3 3' }} />
                        <Line
                          yAxisId="fert"
                          type="monotone"
                          dataKey="fertility"
                          stroke={FERT}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 3, strokeWidth: 0 }}
                          connectNulls
                        />
                        <Line
                          yAxisId="marr"
                          type="monotone"
                          dataKey="marriage"
                          stroke={MARR}
                          strokeWidth={2}
                          strokeDasharray="4 3"
                          dot={false}
                          activeDot={{ r: 3, strokeWidth: 0 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-600 mt-3">
              All panels share the same axes (fertility 0–{fertDomain[1]}, marriage 0–{marrDomain[1]}). Numbers
              top-right of each panel are the latest fertility · marriage values.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
