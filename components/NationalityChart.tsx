'use client'

import React, { useMemo } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NationalityData } from '@/utils/csvParser'

interface ChartDataPoint {
  year: number
  british: number
  nonBritish: number
  total: number
  formattedYear: string
}

interface NationalityChartProps {
  nationalityData: NationalityData[]
  selectedBorough: string
}

export default function NationalityChart({ nationalityData, selectedBorough }: NationalityChartProps) {
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
    const aggregated: { [key: number]: { british: number, nonBritish: number } } = {}
    
    nationalityData.forEach(item => {
      // Filter by borough if not "All Boroughs"
      if (selectedBorough !== 'All Boroughs' && item.borough !== selectedBorough) {
        return
      }
      
      if (!aggregated[item.year]) {
        aggregated[item.year] = { british: 0, nonBritish: 0 }
      }
      
      // Add values (null values default to 0)
      aggregated[item.year].british += item.british || 0
      aggregated[item.year].nonBritish += item.nonBritish || 0
    })

    // Convert to chart format
    const chartPoints: ChartDataPoint[] = Object.entries(aggregated).map(([year, data]) => {
      const yearNum = parseInt(year)
      return {
        year: yearNum,
        british: data.british,
        nonBritish: data.nonBritish,
        total: data.british + data.nonBritish,
        formattedYear: year
      }
    }).sort((a, b) => a.year - b.year)

    return chartPoints
  }, [nationalityData, selectedBorough])

  // Calculate percentage for selected view
  const percentageData = useMemo(() => {
    return chartData.map(point => {
      const total = point.british + point.nonBritish
      return {
        ...point,
        britishPercent: total > 0 ? (point.british / total) * 100 : 0,
        nonBritishPercent: total > 0 ? (point.nonBritish / total) * 100 : 0
      }
    })
  }, [chartData])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const total = data.british + data.nonBritish
      const britishPercent = total > 0 ? ((data.british / total) * 100).toFixed(1) : '0'
      const nonBritishPercent = total > 0 ? ((data.nonBritish / total) * 100).toFixed(1) : '0'
      
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: '#3B82F6' }} />
                <span className="text-gray-300 text-sm">British</span>
              </div>
              <span className="text-white font-medium">
                {data.british.toLocaleString()} ({britishPercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: '#F97316' }} />
                <span className="text-gray-300 text-sm">Non-British</span>
              </div>
              <span className="text-white font-medium">
                {data.nonBritish.toLocaleString()} ({nonBritishPercent}%)
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
            British vs Non-British Population
          </CardTitle>
          <CardDescription className="text-gray-400">
            No nationality data available for {selectedBorough}
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
            British vs Non-British Population: {selectedBorough}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {selectedBorough === 'All Boroughs' 
              ? 'Total London population by nationality (2004-2019)'
              : `${selectedBorough} population by nationality (2004-2019)`
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
                    { value: 'British', type: 'rect', color: '#3B82F6' },
                    { value: 'Non-British', type: 'rect', color: '#F97316' }
                  ]}
                />
                <Bar dataKey="british" stackId="a" fill="#3B82F6" name="British" />
                <Bar dataKey="nonBritish" stackId="a" fill="#F97316" name="Non-British" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

