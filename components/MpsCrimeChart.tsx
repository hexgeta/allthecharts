'use client'

import React, { useMemo } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CrimeData, PopulationData } from '@/utils/csvParser'

interface ChartDataPoint {
  date: string
  value: number
  formattedDate: string
}

interface StackedDataPoint {
  date: string
  [borough: string]: number | string  // borough values plus date string
}

interface ChartData {
  chartPoints: ChartDataPoint[] | StackedDataPoint[]
  sortedBoroughs: string[]
}

interface MpsCrimeChartProps {
  data: CrimeData[]
  populationData: PopulationData[]
  selectedBorough: string
  selectedCrimeType: string
  timeRange: 'all' | 'recent' | 'year'
  viewMode: 'absolute' | 'per100k'
}

export default function MpsCrimeChart({ 
  data, 
  populationData, 
  selectedBorough, 
  selectedCrimeType, 
  timeRange, 
  viewMode 
}: MpsCrimeChartProps) {
  // Helper function to get population for a borough and year
  const getPopulation = (borough: string, year: number): number | null => {
    if (borough === 'all') {
      // For "all boroughs", sum up all populations for that year
      // This ensures per-capita calculation uses total London population
      const yearData = populationData.filter(p => p.year === year)
      const totalPop = yearData.reduce((sum, p) => sum + p.population, 0)
      return totalPop > 0 ? totalPop : null
    } else {
      // For specific borough, find exact match for the year
      const pop = populationData.find(p => p.borough === borough && p.year === year)
      return pop ? pop.population : null
    }
  }

  // Process data for chart
  const chartData = useMemo(() => {
    const filtered = data.filter(item => {
      const boroughMatch = selectedBorough === 'all' || item.boroughName === selectedBorough
      const crimeMatch = selectedCrimeType === 'all' || 
        `${item.majorText} - ${item.minorText}` === selectedCrimeType
      return boroughMatch && crimeMatch
    })

    if (selectedBorough === 'all') {
      // Stacked chart logic: separate data by borough
      const boroughData: { [date: string]: { [borough: string]: number } } = {}
      
      filtered.forEach(item => {
        Object.entries(item.monthlyData).forEach(([date, value]) => {
          if (!boroughData[date]) {
            boroughData[date] = {}
          }
          
          const year = parseInt(date.substring(0, 4))
          let adjustedValue = value
          
          // Apply population adjustment for per-capita calculation
          if (viewMode === 'per100k') {
            const population = getPopulation(item.boroughName, year)
            if (population && population > 0) {
              adjustedValue = (value / population) * 100000
            }
          }
          
          boroughData[date][item.boroughName] = (boroughData[date][item.boroughName] || 0) + adjustedValue
        })
      })

      // Calculate total values per borough for sorting
      const boroughTotals: { [borough: string]: number } = {}
      Object.values(boroughData).forEach(dateData => {
        Object.entries(dateData).forEach(([borough, value]) => {
          boroughTotals[borough] = (boroughTotals[borough] || 0) + value
        })
      })

      // Sort boroughs by total values (descending - largest at bottom of stack)
      const sortedBoroughs = Object.keys(boroughTotals).sort((a, b) => boroughTotals[b] - boroughTotals[a])

      // Convert to chart format
      let chartPoints = Object.entries(boroughData).map(([date, boroughValues]) => {
        const chartPoint: any = { date }
        
        // Add borough values in sorted order
        sortedBoroughs.forEach(borough => {
          chartPoint[borough] = boroughValues[borough] || 0
        })
        
        return chartPoint
      }).sort((a, b) => a.date.localeCompare(b.date))

      // Apply time range filter
      if (timeRange === 'recent') {
        chartPoints = chartPoints.slice(-24) // Last 2 years
      } else if (timeRange === 'year') {
        chartPoints = chartPoints.slice(-12) // Last year
      }

      return { chartPoints, sortedBoroughs }
    } else {
      // Single borough logic (existing logic)
      const aggregated: { [key: string]: number } = {}
      
      filtered.forEach(item => {
        Object.entries(item.monthlyData).forEach(([date, value]) => {
          aggregated[date] = (aggregated[date] || 0) + value
        })
      })

      // Convert to chart format and sort by date
      let chartPoints: ChartDataPoint[] = Object.entries(aggregated).map(([date, value]) => {
        const year = parseInt(date.substring(0, 4))
        const month = date.substring(4, 6)
        const formattedDate = `${year}-${month}`
        
        // Apply population adjustment for per-capita calculation
        let adjustedValue = value
        if (viewMode === 'per100k') {
          const population = getPopulation(selectedBorough, year)
          if (population && population > 0) {
            adjustedValue = (value / population) * 100000
          } else {
            // If no population data available, keep original value
            adjustedValue = value
          }
        }
        
        return {
          date,
          value: adjustedValue,
          formattedDate
        }
      }).sort((a, b) => a.date.localeCompare(b.date))

      // Apply time range filter
      if (timeRange === 'recent') {
        chartPoints = chartPoints.slice(-24) // Last 2 years
      } else if (timeRange === 'year') {
        chartPoints = chartPoints.slice(-12) // Last year
      }

      return { chartPoints, sortedBoroughs: [] }
    }
  }, [data, selectedBorough, selectedCrimeType, timeRange, viewMode, populationData])

  // Generate colors for boroughs (when stacking)
  const getBoroughColor = (index: number) => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
      '#14b8a6', '#eab308', '#dc2626', '#9333ea', '#0891b2',
      '#65a30d', '#ea580c', '#db2777', '#7c3aed', '#0e7490',
      '#4d7c0f', '#c2410c', '#be185d', '#5b21b6', '#164e63',
      '#365314', '#9a3412', '#9d174d', '#4c1d95', '#155e75',
      '#166534', '#7c2d12', '#831843', '#581c87', '#0c4a6e'
    ]
    return colors[index % colors.length]
  }

  // Custom tooltip component for colored borough names
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Sort payload by value in descending order for stacked chart
      const sortedPayload = selectedBorough === 'all' 
        ? [...payload].sort((a, b) => b.value - a.value)
        : payload

      // Calculate total for stacked chart
      const total = selectedBorough === 'all' 
        ? payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
        : null

      return (
        <div className="bg-black/85 p-3 border border-white/20 rounded-lg">
          <p className="text-white mb-2">{formatDate(label)}</p>
          {selectedBorough === 'all' && (
            <p className="text-white text-sm font-bold mb-2 pb-2 border-b border-white/20">
              Total: {Math.round(total).toLocaleString()}
            </p>
          )}
          {selectedBorough === 'all' ? (
            // For stacked chart, show boroughs in 2 columns
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {sortedPayload.map((entry: any, index: number) => {
                const formattedValue = Math.round(entry.value).toLocaleString()
                
                return (
                  <p key={index} className="text-sm">
                    <span style={{ color: entry.color }} className="font-medium">
                      {entry.dataKey}
                    </span>
                    : {formattedValue}
                  </p>
                )
              })}
            </div>
          ) : (
            // For single borough chart
            sortedPayload.map((entry: any, index: number) => {
              const formattedValue = Math.round(entry.value).toLocaleString()
              
              return (
                <p key={index} className="text-white text-sm">
                  {viewMode === 'absolute' ? 'Crime Count' : 'Crime Count per 100k'}: {formattedValue}
                </p>
              )
            })
          )}
        </div>
      )
    }
    return null
  }

  const formatDate = (dateStr: string) => {
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="w-full space-y-6">
      {/* Chart */}
      <Card className="bg-black border-white/20">
        <CardHeader>
          <CardTitle className="text-white">
            Crime Trends: {selectedBorough === 'all' ? 'All Boroughs' : selectedBorough}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {selectedCrimeType === 'all' ? 'All Crime Types' : selectedCrimeType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.chartPoints} margin={{ top: 30, right: 20, left: 20, bottom: 30 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(136, 136, 136, 0.2)" 
                  vertical={false} 
                />
                <XAxis 
                  dataKey="date"
                  tickFormatter={formatDate}
                  interval="preserveStartEnd"
                  axisLine={{ stroke: '#888', strokeWidth: 0 }}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 14, dy: 5 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 14, dx: -5 }}
                  tickFormatter={(value) => viewMode === 'per100k' ? value.toFixed(1) : value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                {selectedBorough === 'all' ? (
                  chartData.sortedBoroughs.map((borough, index) => (
                    <Bar 
                      key={borough}
                      dataKey={borough} 
                      stackId="a" 
                      fill={getBoroughColor(index)} 
                      name={borough} 
                    />
                  ))
                ) : (
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6" 
                    name={viewMode === 'absolute' ? 'Crime Count' : 'Crime Count per 100k'} 
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 