'use client'

import React, { useMemo } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PopulationData } from '@/utils/csvParser'

interface ChartDataPoint {
  year: number
  historical: number
  predicted: number
  formattedYear: string
}

interface PopulationChartProps {
  populationData: PopulationData[]
  selectedBorough: string
  timeRange: 'all' | 'year'
}

export default function PopulationChart({ populationData, selectedBorough, timeRange }: PopulationChartProps) {
  // Helper function to format large numbers with abbreviations
  const formatLargeNumber = (value: number): string => {
    if (value >= 1000000000) {
      return `${Math.round(value / 1000000000)}B`
    }
    if (value >= 1000000) {
      return `${Math.round(value / 1000000)}M`
    }
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`
    }
    return Math.round(value).toString()
  }

  // Process data for chart
  const chartData = useMemo(() => {
    const filtered = selectedBorough === 'All Boroughs' 
      ? populationData 
      : populationData.filter(item => item.borough === selectedBorough)

    // Aggregate data by year, separating historical and predicted
    const aggregated: { [key: number]: { historical: number; predicted: number } } = {}
    
    filtered.forEach(item => {
      if (!aggregated[item.year]) {
        aggregated[item.year] = { historical: 0, predicted: 0 }
      }
      
      if (item.isPredicted) {
        aggregated[item.year].predicted += item.population
      } else {
        aggregated[item.year].historical += item.population
      }
    })

    // Convert to chart format and sort by year
    let chartPoints: ChartDataPoint[] = Object.entries(aggregated).map(([year, data]) => ({
      year: parseInt(year),
      historical: data.historical,
      predicted: data.predicted,
      formattedYear: year
    })).sort((a, b) => a.year - b.year)

    // Apply time range filter
    if (timeRange === 'year') {
      chartPoints = chartPoints.slice(-1) // Last year
    }

    return chartPoints
  }, [populationData, selectedBorough, timeRange])

  const formatTooltipValue = (value: number, name: string) => {
    if (value === 0) return null // Don't show zero values
    const label = name === 'historical' ? 'Population (Historical)' : 'Population (Predicted)'
    return [value.toLocaleString(), label]
  }

  return (
    <div className="w-full space-y-6">
      {/* Chart */}
      <Card className="bg-black border-white/20">
        <CardHeader>
          <CardTitle className="text-white">
            Population Trends: {selectedBorough === 'all' ? 'All Boroughs' : selectedBorough}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Population data by year from official estimates
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
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.85)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    borderRadius: '10px'
                  }}
                  labelStyle={{ color: 'white' }}
                  itemStyle={{ color: 'white' }}
                  formatter={formatTooltipValue}
                />
                <Legend />
                <Bar 
                  dataKey="historical" 
                  fill="#10b981" 
                  name="Population (Historical)"
                />
                <Bar 
                  dataKey="predicted" 
                  fill="#6b7280" 
                  name="Population (Predicted)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 