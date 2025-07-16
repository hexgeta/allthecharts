'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OptimizedChartData, OptimizedChartDataPoint } from '@/utils/optimizedCsvParser'

interface MpsCrimeChartProps {
  chartData: OptimizedChartData
  selectedBorough: string
  selectedCrimeType: string
  timeRange: 'all' | 'year'
  viewMode: 'absolute' | 'per100k'
}

// Color palette for different boroughs (all 33 London boroughs)
const BOROUGH_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
  '#00D2D3', '#FF9F43', '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE', '#FD79A8',
  '#E17055', '#81ECEC', '#74B9FF', '#E84393', '#2D3436', '#636E72', '#DDD', '#B2BEC3',
  '#00B894', '#00CEC9', '#E17055', '#FDCB6E', '#6C5CE7', '#A29BFE', '#FD79A8', '#FF7675',
  '#74B9FF', '#55A3FF', '#26DE81'
]

export default function MpsCrimeChart({ 
  chartData, 
  selectedBorough, 
  selectedCrimeType, 
  timeRange,
  viewMode 
}: MpsCrimeChartProps) {
  // Helper function to format numbers with abbreviations
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${Math.round(value / 1000000)}M`
    }
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`
    }
    // For per100k rates, show 1 decimal place if it's a decimal, otherwise whole number
    if (value % 1 !== 0 && value < 100) {
      return value.toFixed(1)
    }
    return Math.round(value).toString()
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
  }

  // Prepare chart data based on view mode
  const chartPoints = chartData.chartPoints.map(point => ({
    ...point,
    value: viewMode === 'absolute' ? point.absolute : point.per100k
  }))

  // Custom tooltip component - simplified for performance
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      if (selectedBorough === 'All Boroughs') {
        // Stacked chart tooltip - simplified
        const boroughEntries: Array<{name: string, value: number, color: string}> = []
        
        chartData.sortedBoroughs.forEach((borough, index) => {
          const suffix = viewMode === 'absolute' ? '_absolute' : '_per100k'
          const value = data[`${borough}${suffix}`] || 0
          if (value > 0) {
            boroughEntries.push({
              name: borough,
              value: value,
              color: BOROUGH_COLORS[index % BOROUGH_COLORS.length]
            })
          }
        })

        // Sort by value for display
        boroughEntries.sort((a, b) => b.value - a.value)
        
        // Organize boroughs into columns of 10
        const boroughColumns: Array<Array<{name: string, value: number, color: string}>> = []
        for (let i = 0; i < boroughEntries.length; i += 10) {
          boroughColumns.push(boroughEntries.slice(i, i + 10))
        }
        
        return (
          <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl max-w-4xl">
            <p className="text-white font-medium mb-3">{formatDate(label)}</p>
            <div className={`grid gap-x-6 gap-y-1 max-h-80 overflow-y-auto`} style={{ gridTemplateColumns: `repeat(${boroughColumns.length}, minmax(180px, 1fr))` }}>
              {boroughColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-1">
                  {column.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-gray-300 truncate">{name}</span>
                      </div>
                      <span className="text-white font-medium ml-2">{value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="border-t border-white/20 mt-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Total:</span>
                <span className="text-white font-medium">{data.value?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )
      } else {
        // Single borough tooltip
        return (
          <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
            <p className="text-white font-medium">{formatDate(label)}</p>
            <p className="text-gray-300">
              {viewMode === 'absolute' ? 'Count' : 'Per 100k'}: {' '}
              <span className="text-white font-medium">{data.value?.toLocaleString()}</span>
            </p>
          </div>
        )
      }
    }
    return null
  }

  return (
    <Card className="bg-black/20 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">
          Crime Trends: {selectedBorough}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {selectedCrimeType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartPoints} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date"
                tickFormatter={formatDate}
                ticks={chartPoints.map(point => point.date).filter(date => date.endsWith('-01'))}
                axisLine={{ stroke: '#888', strokeWidth: 0 }}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 14, dy: 5 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 14, dx: -5 }}
                tickFormatter={formatNumber}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {selectedBorough === 'All Boroughs' ? (
                // Stacked bars for top boroughs - much more efficient
                chartData.sortedBoroughs.map((borough, index) => {
                  const dataKey = `${borough}_${viewMode}`
                  return (
                    <Bar
                      key={borough}
                      dataKey={dataKey}
                      stackId="boroughs"
                      fill={BOROUGH_COLORS[index % BOROUGH_COLORS.length]}
                      stroke="none"
                    />
                  )
                })
              ) : (
                // Single bar for individual borough
                <Bar 
                  dataKey="value" 
                  fill="#3B82F6" 
                  stroke="none"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 