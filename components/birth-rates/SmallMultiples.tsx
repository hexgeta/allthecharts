'use client'

import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBirthRatesData, type BirthRatesMetric } from '@/hooks/useBirthRatesData'
import { Loader2 } from 'lucide-react'

interface SmallMultiplesProps {
  metric: BirthRatesMetric
  codes: string[]
  startYear: number
  endYear: number
  title: string
  description?: string
  unit?: '' | '%' | 'index' | 'pct1'
  smartphoneBand?: { from: number; to: number } | null
  showReplacementLine?: boolean
}

export default function SmallMultiples({
  metric,
  codes,
  startYear,
  endYear,
  title,
  description,
  unit = '',
  smartphoneBand = null,
  showReplacementLine = false,
}: SmallMultiplesProps) {
  const { data, isLoading, error } = useBirthRatesData()
  const meta = data?.meta.countries ?? {}

  const fmt = (v: number) =>
    unit === '%' ? `${v.toFixed(0)}%`
    : unit === 'pct1' ? `${v.toFixed(1)}%`
    : unit === 'index' ? v.toFixed(0)
    : v.toFixed(2)

  const { panels, yDomain } = useMemo(() => {
    if (!data) return { panels: [] as any[], yDomain: [0, 1] as [number, number] }
    let max = 0
    const panels = codes.map(code => {
      const rows = (data[metric][code] || [])
        .filter(([y]) => y >= startYear && y <= endYear)
        .map(([year, value]) => {
          if (value > max) max = value
          return { year, value }
        })
      return { code, rows, latest: rows.length ? rows[rows.length - 1].value : null }
    })
    return { panels, yDomain: [0, Math.ceil(max * 1.05)] as [number, number] }
  }, [data, metric, codes, startYear, endYear])

  const Tip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length || payload[0].value == null) return null
    return (
      <div className="bg-black/95 border border-white/20 rounded px-2 py-1 text-xs">
        <span className="text-gray-400">{label}: </span>
        <span className="text-white font-medium">{fmt(payload[0].value)}</span>
      </div>
    )
  }

  return (
    <Card className="bg-black/20 border-gray-800 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">{title}</CardTitle>
        {description && <CardDescription className="text-gray-400 text-sm">{description}</CardDescription>}
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
              {panels.map(p => {
                const color = meta[p.code]?.color || '#3B82F6'
                return (
                  <div key={p.code} className="rounded-lg border border-gray-800 bg-black/30 p-2.5">
                    <div className="flex items-baseline justify-between mb-1 gap-2">
                      <span className="text-[13px] font-medium text-white truncate">
                        {meta[p.code]?.label || p.code}
                      </span>
                      <span className="text-xs font-semibold tabular-nums" style={{ color }}>
                        {p.latest != null ? fmt(p.latest) : '—'}
                      </span>
                    </div>
                    <div style={{ height: 116 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={p.rows} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
                          {smartphoneBand && (
                            <ReferenceArea
                              x1={smartphoneBand.from}
                              x2={smartphoneBand.to}
                              fill="#a855f7"
                              fillOpacity={0.13}
                              stroke="none"
                              ifOverflow="extendDomain"
                            />
                          )}
                          {showReplacementLine && (
                            <ReferenceLine y={2.1} stroke="#6b7280" strokeDasharray="4 4" strokeWidth={1} />
                          )}
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
                          <YAxis hide domain={yDomain} />
                          <Tooltip content={<Tip />} cursor={{ stroke: '#555', strokeDasharray: '3 3' }} />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 3, strokeWidth: 0 }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-gray-600 mt-3">
              All panels share the same vertical scale (0–{fmt(yDomain[1])})
              {showReplacementLine && ', dashed line = replacement rate (2.1)'}
              {smartphoneBand && '; shaded = smartphone era'}. Latest value shown top-right of each panel.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
