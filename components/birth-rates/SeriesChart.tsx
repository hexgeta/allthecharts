'use client'

import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceArea, ReferenceLine, Label,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBirthRatesData, seriesToChart, type BirthRatesMetric } from '@/hooks/useBirthRatesData'
import { Loader2 } from 'lucide-react'

interface SeriesChartProps {
  metric: BirthRatesMetric
  codes: string[]
  startYear: number
  endYear: number
  title: string
  description?: string
  unit?: '' | '%'
  height?: number
  showReplacementLine?: boolean
  smartphoneBand?: { from: number; to: number } | null
}

export default function SeriesChart({
  metric,
  codes,
  startYear,
  endYear,
  title,
  description,
  unit = '',
  height = 440,
  showReplacementLine = false,
  smartphoneBand = null,
}: SeriesChartProps) {
  const { data, isLoading, error } = useBirthRatesData()

  const meta = data?.meta.countries ?? {}
  const chartData = useMemo(
    () => (data ? seriesToChart(data[metric], codes, startYear, endYear) : []),
    [data, metric, codes, startYear, endYear],
  )

  const label = (code: string) => meta[code]?.label || code
  const fmt = (v: number) => (unit === '%' ? `${v.toFixed(0)}%` : v.toFixed(2))

  const CustomTooltip = ({ active, payload, label: yr }: any) => {
    if (!active || !payload?.length) return null
    const sorted = [...payload].filter((p: any) => p.value != null).sort((a: any, b: any) => b.value - a.value)
    return (
      <div className="bg-black/95 border border-white/20 rounded-lg p-3 shadow-2xl min-w-[200px]">
        <p className="text-white font-semibold text-sm mb-2">{yr}</p>
        <div className="space-y-1">
          {sorted.map((e: any) => (
            <div key={e.dataKey} className="flex items-center justify-between text-xs gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                <span className="text-gray-300">{label(e.dataKey)}</span>
              </div>
              <span className="text-white font-medium">{fmt(e.value)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const CustomLegend = ({ payload }: any) =>
    !payload ? null : (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
        {payload.map((e: any) => (
          <div key={e.value} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
            <span className="text-gray-400">{label(e.value)}</span>
          </div>
        ))}
      </div>
    )

  return (
    <Card className="bg-black/20 border-gray-800 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">{title}</CardTitle>
        {description && <CardDescription className="text-gray-400 text-sm">{description}</CardDescription>}
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
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center text-gray-500 text-sm" style={{ height }}>
            No data available
          </div>
        ) : (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 16, left: 6, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />

                {smartphoneBand && (
                  <ReferenceArea
                    x1={smartphoneBand.from}
                    x2={smartphoneBand.to}
                    fill="#a855f7"
                    fillOpacity={0.12}
                    stroke="#a855f7"
                    strokeOpacity={0.25}
                    ifOverflow="extendDomain"
                  >
                    <Label value="Smartphone era" position="insideTop" fill="#c4b5fd" fontSize={11} offset={10} />
                  </ReferenceArea>
                )}

                {showReplacementLine && (
                  <ReferenceLine y={2.1} stroke="#6b7280" strokeDasharray="5 5" strokeWidth={1.5} ifOverflow="extendDomain">
                    <Label value="Replacement rate (2.1)" position="insideBottomRight" fill="#9ca3af" fontSize={11} />
                  </ReferenceLine>
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
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 11, dx: -5 }}
                  width={44}
                  domain={[0, 'auto']}
                  tickFormatter={(v: number) => (unit === '%' ? `${v.toFixed(0)}%` : v.toFixed(1))}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#555', strokeDasharray: '3 3' }} />
                <Legend content={<CustomLegend />} />
                {codes.map(code => (
                  <Line
                    key={code}
                    type="monotone"
                    dataKey={code}
                    stroke={meta[code]?.color || '#3B82F6'}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
