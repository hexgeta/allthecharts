'use client'

import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, Label,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBirthRatesData } from '@/hooks/useBirthRatesData'
import { Loader2 } from 'lucide-react'

const FERT = '#c084fc' // fertility (left axis)
const MARR = '#38bdf8' // marriage rate (right axis)

interface OverlayChartProps {
  code: string
  startYear: number
  endYear: number
  height?: number
  smartphoneBand?: { from: number; to: number } | null
}

export default function OverlayChart({
  code,
  startYear,
  endYear,
  height = 440,
  smartphoneBand = null,
}: OverlayChartProps) {
  const { data, isLoading, error } = useBirthRatesData()

  const country = data?.meta.countries[code]
  const rows = useMemo(() => {
    if (!data) return []
    const byYear = new Map<number, { year: number; fertility?: number; marriage?: number }>()
    const add = (series: [number, number][], key: 'fertility' | 'marriage') => {
      for (const [year, value] of series || []) {
        if (year < startYear || year > endYear) continue
        if (!byYear.has(year)) byYear.set(year, { year })
        byYear.get(year)![key] = value
      }
    }
    add(data.fertility[code], 'fertility')
    add(data.marriageRate[code], 'marriage')
    return Array.from(byYear.values()).sort((a, b) => a.year - b.year)
  }, [data, code, startYear, endYear])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const f = payload.find((p: any) => p.dataKey === 'fertility')?.value
    const m = payload.find((p: any) => p.dataKey === 'marriage')?.value
    return (
      <div className="bg-black/95 border border-white/20 rounded-lg p-3 shadow-2xl min-w-[190px]">
        <p className="text-white font-semibold text-sm mb-2">{label}</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FERT }} />
              <span className="text-gray-300">Births per woman</span>
            </div>
            <span className="text-white font-medium">{f != null ? f.toFixed(2) : '—'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MARR }} />
              <span className="text-gray-300">Marriages / 1,000</span>
            </div>
            <span className="text-white font-medium">{m != null ? m.toFixed(1) : '—'}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-black/20 border-gray-800 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">
          {country?.label || code}: births vs marriages
        </CardTitle>
        <CardDescription className="text-gray-400 text-sm flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5" style={{ backgroundColor: FERT }} />
            Fertility rate — births per woman (left)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 border-b border-dashed" style={{ borderColor: MARR }} />
            Crude marriage rate — per 1,000 people (right)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center text-red-400 text-sm" style={{ height }}>
            Failed to load data
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center text-gray-500 text-sm" style={{ height }}>
            No data available
          </div>
        ) : (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 16, right: 12, left: 6, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                {smartphoneBand && (
                  <ReferenceArea
                    x1={smartphoneBand.from}
                    x2={smartphoneBand.to}
                    fill="#a855f7"
                    fillOpacity={0.1}
                    stroke="#a855f7"
                    strokeOpacity={0.22}
                    ifOverflow="extendDomain"
                  >
                    <Label value="Smartphone era" position="insideTop" fill="#c4b5fd" fontSize={11} offset={10} />
                  </ReferenceArea>
                )}
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[startYear, endYear]}
                  allowDecimals={false}
                  axisLine={{ stroke: '#333', strokeWidth: 1 }}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 12 }}
                  tickFormatter={(v: number) => String(v)}
                />
                <YAxis
                  yAxisId="fert"
                  domain={[0, 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: FERT, fontSize: 11, dx: -4 }}
                  width={40}
                  tickFormatter={(v: number) => v.toFixed(1)}
                />
                <YAxis
                  yAxisId="marr"
                  orientation="right"
                  domain={[0, 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: MARR, fontSize: 11, dx: 4 }}
                  width={36}
                  tickFormatter={(v: number) => v.toFixed(0)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#555', strokeDasharray: '3 3' }} />
                <Line
                  yAxisId="fert"
                  type="monotone"
                  dataKey="fertility"
                  stroke={FERT}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls
                />
                <Line
                  yAxisId="marr"
                  type="monotone"
                  dataKey="marriage"
                  stroke={MARR}
                  strokeWidth={2.5}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
