'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartData, ChartDataPoint } from '@/utils/csvParser'

interface MpsCrimeChartProps {
  chartData: ChartData
  selectedBorough: string
  selectedCrimeType: string
  timeRange: 'all' | 'year'
  viewMode: 'absolute' | 'per100k'
  timeGranularity: 'monthly' | 'yearly'
  title?: string
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
  viewMode,
  timeGranularity,
  title
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

  // Format date for display on X-axis (just year)
  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-')
    return year
  }

  // Format date for tooltip (Month Year or just Year)
  const formatTooltipDate = (dateStr: string) => {
    if (dateStr.includes('-')) {
      // Monthly format: "YYYY-MM"
      const [year, month] = dateStr.split('-')
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
      const monthIndex = parseInt(month) - 1
      return `${monthNames[monthIndex]} ${year}`
    } else {
      // Yearly format: "YYYY"
      return dateStr
    }
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
        // Show borough breakdown for both modes, but clarify what the values mean
        const suffix = viewMode === 'absolute' ? '_absolute' : '_per100k'
        const boroughEntries: Array<{name: string, value: number, color: string}> = []
        
        chartData.sortedBoroughs.forEach((borough, index) => {
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
        
        // Organize boroughs into 2 columns
        const boroughColumns: Array<Array<{name: string, value: number, color: string}>> = []
        const itemsPerColumn = Math.ceil(boroughEntries.length / 2)
        for (let i = 0; i < boroughEntries.length; i += itemsPerColumn) {
          boroughColumns.push(boroughEntries.slice(i, i + itemsPerColumn))
        }
        
        return (
          <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl max-w-3xl">
            <p className="text-white font-medium mb-2">{formatTooltipDate(label)}</p>
            <div className="border-b border-white/20 mb-3 pb-2">
              <div className="flex items-center">
                <span className="text-gray-300 text-base">
                  {viewMode === 'absolute' ? 'Total:' : 'London Rate:'}
                </span>
                <span className="text-white font-semibold text-lg">
                  {viewMode === 'absolute' 
                    ? data.value?.toLocaleString() 
                    : `${data.value?.toFixed(1)} per 100k`
                  }
                </span>
              </div>
              {viewMode === 'per100k' && (
                <p className="text-xs text-gray-400 mt-1">
                  Individual borough rates shown below:
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {boroughColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-0.5">
                  {column.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center min-w-0">
                        <div 
                          className="w-2.5 h-2.5 rounded-sm mr-1.5 flex-shrink-0" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-gray-300 truncate">{name}</span>
                      </div>
                      <span className="text-white font-medium ml-2 flex-shrink-0">
                        {viewMode === 'absolute' 
                          ? value.toLocaleString() 
                          : `${value.toFixed(1)}`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      } else {
        // Single borough tooltip - but show all boroughs for comparison
        const suffix = viewMode === 'absolute' ? '_absolute' : '_per100k'
        const boroughEntries: Array<{name: string, value: number, color: string, isSelected: boolean}> = []
        
        chartData.sortedBoroughs.forEach((borough, index) => {
          const value = data[`${borough}${suffix}`] || 0
          if (value >= 0) { // Show all boroughs, even with 0 values
            boroughEntries.push({
              name: borough,
              value: value,
              color: BOROUGH_COLORS[index % BOROUGH_COLORS.length],
              isSelected: borough === selectedBorough
            })
          }
        })

        // Sort by value for display
        boroughEntries.sort((a, b) => b.value - a.value)
        
        // Organize boroughs into 2 columns
        const boroughColumns: Array<Array<{name: string, value: number, color: string, isSelected: boolean}>> = []
        const itemsPerColumn = Math.ceil(boroughEntries.length / 2)
        for (let i = 0; i < boroughEntries.length; i += itemsPerColumn) {
          boroughColumns.push(boroughEntries.slice(i, i + itemsPerColumn))
        }
        
        return (
          <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl max-w-3xl">
            <p className="text-white font-medium mb-2">{formatTooltipDate(label)}</p>
            <div className="border-b border-white/20 mb-3 pb-2">
              <div className="flex items-center">
                <span className="text-gray-300 text-base">
                  {selectedBorough} {viewMode === 'absolute' ? 'Count:' : 'Rate:'}
                </span>
                                 <span className="text-white font-semibold text-lg ml-2">
                   {viewMode === 'absolute' 
                     ? data.absolute?.toLocaleString() 
                     : `${data.per100k?.toFixed(1)} per 100k`
                   }
                 </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                All borough comparison:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {boroughColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-0.5">
                  {column.map(({ name, value, color, isSelected }) => (
                    <div key={name} className={`flex items-center justify-between text-xs ${isSelected ? 'bg-blue-600/30 px-2 py-1 rounded' : ''}`}>
                      <div className="flex items-center min-w-0">
                        <div 
                          className="w-2.5 h-2.5 rounded-sm mr-1.5 flex-shrink-0" 
                          style={{ backgroundColor: color }}
                        />
                        <span className={`truncate ${isSelected ? 'text-blue-200 font-semibold' : 'text-gray-300'}`}>
                          {name}
                        </span>
                      </div>
                      <span className={`ml-2 flex-shrink-0 ${isSelected ? 'text-blue-200 font-semibold' : 'text-white font-medium'}`}>
                        {viewMode === 'absolute' 
                          ? value.toLocaleString() 
                          : `${value.toFixed(1)}`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
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
          {title || `Crime Trends: ${selectedBorough}`}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {selectedCrimeType} - {selectedBorough}
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
                ticks={timeGranularity === 'yearly' 
                  ? chartPoints.map(point => point.date) // Show all years
                  : chartPoints.map(point => point.date).filter(date => date.endsWith('-01')) // Show January months only
                }
                axisLine={{ stroke: '#888', strokeWidth: 0 }}
                tickLine={{ stroke: '#888', strokeWidth: 1 }}
                tick={{ fill: '#888', fontSize: 14, dy: 5 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 14, dx: -5 }}
                tickFormatter={formatNumber}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              />
              
              {selectedBorough === 'All Boroughs' ? (
                // Single bar showing total for all boroughs
                <Bar 
                  dataKey={viewMode === 'absolute' ? 'absolute' : 'per100k'} 
                  fill="#3B82F6" 
                  stroke="none"
                >
                  {chartPoints.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="#3B82F6" 
                      fillOpacity={entry.isIncomplete ? 0.4 : 1.0}
                    />
                  ))}
                </Bar>
              ) : (
                // Single bar for individual borough
                <Bar 
                  dataKey={viewMode === 'absolute' ? 'absolute' : 'per100k'} 
                  fill="#3B82F6" 
                  stroke="none"
                >
                  {chartPoints.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="#3B82F6" 
                      fillOpacity={entry.isIncomplete ? 0.4 : 1.0}
                    />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 