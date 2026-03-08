'use client'

import React, { useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useWorldBankIndicator, transformToChartData, COUNTRIES,
  getCountryColor, type IndicatorKey
} from '@/hooks/useWorldBankData'
import { Loader2 } from 'lucide-react'

interface TrendChartProps {
  indicatorKey: IndicatorKey
  selectedCountries: string[]
  chartType?: 'line' | 'bar' | 'area'
  startYear?: number
  endYear?: number
  height?: number
  description?: string
}

const formatValue = (value: number, unit: string): string => {
  if (unit === '$') {
    if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }
  if (unit === '%') {
    return `${value.toFixed(1)}%`
  }
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`
  if (Math.abs(value) < 1 && value !== 0) return value.toFixed(2)
  return value.toFixed(1)
}

const formatAxisValue = (value: number, unit: string): string => {
  if (unit === '$') {
    if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(0)}T`
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(0)}B`
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(0)}M`
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }
  if (unit === '%') return `${value.toFixed(0)}%`
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(0)}B`
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(0)}M`
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(0)}K`
  return value.toFixed(0)
}

function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload || payload.length === 0) return null

  const sorted = [...payload].filter((p: any) => p.value != null).sort((a: any, b: any) => b.value - a.value)

  return (
    <div className="bg-black/95 border border-white/20 rounded-lg p-3 shadow-2xl min-w-[200px]">
      <p className="text-white font-semibold text-sm mb-2">{label}</p>
      <div className="space-y-1">
        {sorted.map((entry: any) => {
          const country = COUNTRIES.find(c => c.code === entry.dataKey)
          return (
            <div key={entry.dataKey} className="flex items-center justify-between text-xs gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-300">{country?.name || entry.dataKey}</span>
              </div>
              <span className="text-white font-medium">
                {formatValue(entry.value, unit)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CustomLegend({ payload }: any) {
  if (!payload) return null
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry: any) => {
        const country = COUNTRIES.find(c => c.code === entry.value)
        return (
          <div key={entry.value} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-400">{country?.name || entry.value}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function TrendChart({
  indicatorKey,
  selectedCountries,
  chartType = 'line',
  startYear = 1990,
  endYear = 2024,
  height = 400,
  description,
}: TrendChartProps) {
  const { data, isLoading, error, indicator } = useWorldBankIndicator(
    indicatorKey,
    selectedCountries,
    startYear,
    endYear
  )

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return transformToChartData(data, selectedCountries)
  }, [data, selectedCountries])

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 10, bottom: 5 },
    }

    const xAxisProps = {
      dataKey: 'year' as const,
      axisLine: { stroke: '#333', strokeWidth: 1 },
      tickLine: false,
      tick: { fill: '#888', fontSize: 12 },
      tickFormatter: (v: number) => String(v),
    }

    const yAxisProps = {
      axisLine: false,
      tickLine: false,
      tick: { fill: '#888', fontSize: 11, dx: -5 },
      tickFormatter: (v: number) => formatAxisValue(v, indicator.unit),
      width: 65,
    }

    const tooltipProps = {
      content: <CustomTooltip unit={indicator.unit} />,
      cursor: { stroke: '#555', strokeDasharray: '3 3' },
    }

    if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            {selectedCountries.map((code, i) => (
              <linearGradient key={code} id={`gradient-${code}-${indicatorKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getCountryColor(code, i)} stopOpacity={0.3} />
                <stop offset="95%" stopColor={getCountryColor(code, i)} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip {...tooltipProps} />
          <Legend content={<CustomLegend />} />
          {selectedCountries.map((code, i) => (
            <Area
              key={code}
              type="monotone"
              dataKey={code}
              stroke={getCountryColor(code, i)}
              fill={`url(#gradient-${code}-${indicatorKey})`}
              strokeWidth={2}
              connectNulls
              dot={false}
            />
          ))}
        </AreaChart>
      )
    }

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip {...tooltipProps} />
          <Legend content={<CustomLegend />} />
          {selectedCountries.map((code, i) => (
            <Bar
              key={code}
              dataKey={code}
              fill={getCountryColor(code, i)}
              fillOpacity={0.8}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      )
    }

    // Default: line chart
    return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip {...tooltipProps} />
        <Legend content={<CustomLegend />} />
        {selectedCountries.map((code, i) => (
          <Line
            key={code}
            type="monotone"
            dataKey={code}
            stroke={getCountryColor(code, i)}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls
          />
        ))}
      </LineChart>
    )
  }

  return (
    <Card className="bg-black/20 border-gray-800 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">{indicator.name}</CardTitle>
        {description && (
          <CardDescription className="text-gray-400 text-sm">{description}</CardDescription>
        )}
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
            No data available for selected countries
          </div>
        ) : (
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
