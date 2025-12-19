'use client'

import React, { useMemo } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EthnicityData } from '@/utils/csvParser'

interface ChartDataPoint {
  year: number
  white: number
  asian: number
  black: number
  mixedOther: number
  total: number
  formattedYear: string
}

interface EthnicityChartProps {
  ethnicityData: EthnicityData[]
  selectedBorough: string
}

// Colors for each ethnic group
const ETHNICITY_COLORS = {
  white: '#94A3B8',      // Slate
  asian: '#F59E0B',      // Amber
  black: '#8B5CF6',      // Purple
  mixedOther: '#10B981'  // Emerald
}

export default function EthnicityChart({ ethnicityData, selectedBorough }: EthnicityChartProps) {
  // Helper function to format large numbers with abbreviations
  const formatLargeNumber = (value: number): string => {
    if (value >= 1000000000) {
      return `${Math.round(value / 1000000000)}B`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`
    }
    return Math.round(value).toLocaleString()
  }

  // Process data for chart
  const chartData = useMemo(() => {
    // Aggregate data by year
    const aggregated: { [key: number]: { white: number, asian: number, black: number, mixedOther: number } } = {}
    
    ethnicityData.forEach(item => {
      // Filter by borough if not "All Boroughs"
      if (selectedBorough !== 'All Boroughs' && item.borough !== selectedBorough) {
        return
      }
      
      if (!aggregated[item.year]) {
        aggregated[item.year] = { white: 0, asian: 0, black: 0, mixedOther: 0 }
      }
      
      // Add values (null values default to 0)
      aggregated[item.year].white += item.white || 0
      aggregated[item.year].asian += item.asian || 0
      aggregated[item.year].black += item.black || 0
      aggregated[item.year].mixedOther += item.mixedOther || 0
    })

    // Convert to chart format
    const chartPoints: ChartDataPoint[] = Object.entries(aggregated).map(([year, data]) => {
      const yearNum = parseInt(year)
      const total = data.white + data.asian + data.black + data.mixedOther
      return {
        year: yearNum,
        white: data.white,
        asian: data.asian,
        black: data.black,
        mixedOther: data.mixedOther,
        total: total,
        formattedYear: year
      }
    }).sort((a, b) => a.year - b.year)

    return chartPoints
  }, [ethnicityData, selectedBorough])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const total = data.total
      
      const getPercent = (val: number) => total > 0 ? ((val / total) * 100).toFixed(1) : '0'
      
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: ETHNICITY_COLORS.white }} />
                <span className="text-gray-300 text-sm">White</span>
              </div>
              <span className="text-white font-medium">
                {data.white.toLocaleString()} ({getPercent(data.white)}%)
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: ETHNICITY_COLORS.asian }} />
                <span className="text-gray-300 text-sm">Asian</span>
              </div>
              <span className="text-white font-medium">
                {data.asian.toLocaleString()} ({getPercent(data.asian)}%)
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: ETHNICITY_COLORS.black }} />
                <span className="text-gray-300 text-sm">Black</span>
              </div>
              <span className="text-white font-medium">
                {data.black.toLocaleString()} ({getPercent(data.black)}%)
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: ETHNICITY_COLORS.mixedOther }} />
                <span className="text-gray-300 text-sm">Mixed/Other</span>
              </div>
              <span className="text-white font-medium">
                {data.mixedOther.toLocaleString()} ({getPercent(data.mixedOther)}%)
              </span>
            </div>
            <div className="border-t border-white/20 mt-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-white font-semibold">
                  {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <Card className="bg-black border-white/20">
        <CardHeader>
          <CardTitle className="text-white">
            Population by Ethnic Group
          </CardTitle>
          <CardDescription className="text-gray-400">
            No ethnicity data available for {selectedBorough}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      <Card className="bg-black border-white/20">
        <CardHeader>
          <CardTitle className="text-white">
            Population by Ethnic Group: {selectedBorough}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {selectedBorough === 'All Boroughs' 
              ? 'Total London population by ethnic group (2012-2020)'
              : `${selectedBorough} population by ethnic group (2012-2020)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 30, right: 20, left: 20, bottom: 30 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(136, 136, 136, 0.2)" 
                  vertical={false} 
                />
                <XAxis 
                  dataKey="year"
                  axisLine={{ stroke: '#888', strokeWidth: 0 }}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 14, dy: 5 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 14, dx: -5 }}
                  tickFormatter={formatLargeNumber}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Legend 
                  payload={[
                    { value: 'White', type: 'rect', color: ETHNICITY_COLORS.white },
                    { value: 'Asian', type: 'rect', color: ETHNICITY_COLORS.asian },
                    { value: 'Black', type: 'rect', color: ETHNICITY_COLORS.black },
                    { value: 'Mixed/Other', type: 'rect', color: ETHNICITY_COLORS.mixedOther }
                  ]}
                />
                <Bar dataKey="white" stackId="a" fill={ETHNICITY_COLORS.white} name="White" />
                <Bar dataKey="asian" stackId="a" fill={ETHNICITY_COLORS.asian} name="Asian" />
                <Bar dataKey="black" stackId="a" fill={ETHNICITY_COLORS.black} name="Black" />
                <Bar dataKey="mixedOther" stackId="a" fill={ETHNICITY_COLORS.mixedOther} name="Mixed/Other" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

