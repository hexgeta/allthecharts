'use client'

import React, { useMemo } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PopulationData } from '@/utils/csvParser'

// Color palette for different boroughs (all 33 London boroughs)
const BOROUGH_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
  '#00D2D3', '#FF9F43', '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE', '#FD79A8',
  '#E17055', '#81ECEC', '#74B9FF', '#E84393', '#2D3436', '#636E72', '#DDD', '#B2BEC3',
  '#00B894', '#00CEC9', '#E17055', '#FDCB6E', '#6C5CE7', '#A29BFE', '#FD79A8', '#FF7675',
  '#74B9FF', '#55A3FF', '#26DE81'
]

interface ChartDataPoint {
  year: number
  population: number
  isHistorical: boolean
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
    return Math.round(value).toLocaleString()
  }

  // Process data for chart - include all borough data for tooltip
  const chartData = useMemo(() => {
    // Aggregate data by year, including all boroughs for tooltip
    const aggregated: { [key: number]: { [borough: string]: number } } = {}
    
    // Process all population data to get borough breakdowns
    populationData.forEach(item => {
      if (item.borough !== 'All Boroughs') {
        if (!aggregated[item.year]) {
          aggregated[item.year] = {}
        }
        aggregated[item.year][item.borough] = item.population
      }
    })

    // Get all unique boroughs and sort by total population
    const boroughTotals: { [borough: string]: number } = {}
    Object.values(aggregated).forEach(yearData => {
      Object.entries(yearData).forEach(([borough, population]) => {
        boroughTotals[borough] = (boroughTotals[borough] || 0) + population
      })
    })

    const sortedBoroughs = Object.entries(boroughTotals)
      .sort((a, b) => b[1] - a[1]) // Descending order
      .map(([borough]) => borough)

    // Convert to chart format
    let chartPoints: (ChartDataPoint & { sortedBoroughs: string[] })[] = Object.entries(aggregated).map(([year, boroughData]) => {
      const yearNum = parseInt(year)
      const isHistorical = yearNum <= 2015
      
      // Calculate main population value based on selected borough
      const mainPopulation = selectedBorough === 'All Boroughs' 
        ? Object.values(boroughData).reduce((sum, pop) => sum + pop, 0)
        : boroughData[selectedBorough] || 0

      const point: any = {
        year: yearNum,
        population: mainPopulation,
        isHistorical,
        formattedYear: year,
        sortedBoroughs
      }

      // Add all borough data for tooltip
      sortedBoroughs.forEach(borough => {
        point[`${borough}_population`] = boroughData[borough] || 0
      })

      return point
    }).sort((a, b) => a.year - b.year)

    // Apply time range filter
    if (timeRange === 'year') {
      chartPoints = chartPoints.slice(-1) // Last year
    }

    return chartPoints
  }, [populationData, selectedBorough, timeRange])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      if (selectedBorough === 'All Boroughs') {
        // Show borough breakdown for All Boroughs
        const boroughEntries: Array<{name: string, population: number, color: string}> = []
        
        data.sortedBoroughs.forEach((borough: string, index: number) => {
          const population = data[`${borough}_population`] || 0
          if (population > 0) {
            boroughEntries.push({
              name: borough,
              population: population,
              color: BOROUGH_COLORS[index % BOROUGH_COLORS.length]
            })
          }
        })

        // Sort by population for display
        boroughEntries.sort((a, b) => b.population - a.population)
        
        // Organize boroughs into 2 columns
        const boroughColumns: Array<Array<{name: string, population: number, color: string}>> = []
        const itemsPerColumn = Math.ceil(boroughEntries.length / 2)
        for (let i = 0; i < boroughEntries.length; i += itemsPerColumn) {
          boroughColumns.push(boroughEntries.slice(i, i + itemsPerColumn))
        }
        
        return (
          <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl max-w-3xl">
            <p className="text-white font-medium mb-2">{label}</p>
            <div className="border-b border-white/20 mb-3 pb-2">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-sm mr-2" 
                  style={{ backgroundColor: data.isHistorical ? '#10b981' : '#6b7280' }}
                />
                <span className="text-gray-300 text-base">
                  Total London Population {data.isHistorical ? '(Historical)' : '(Predicted)'}:
                </span>
                <span className="text-white font-semibold text-lg ml-2">
                  {data.population?.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Individual borough populations:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {boroughColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-0.5">
                  {column.map(({ name, population, color }) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center min-w-0">
                        <div 
                          className="w-2.5 h-2.5 rounded-sm mr-1.5 flex-shrink-0" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-gray-300 truncate">{name}</span>
                      </div>
                      <span className="text-white font-medium ml-2 flex-shrink-0">
                        {population.toLocaleString()}
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
        const boroughEntries: Array<{name: string, population: number, color: string, isSelected: boolean}> = []
        
        data.sortedBoroughs.forEach((borough: string, index: number) => {
          const population = data[`${borough}_population`] || 0
          if (population >= 0) { // Show all boroughs, even with 0 values
            boroughEntries.push({
              name: borough,
              population: population,
              color: BOROUGH_COLORS[index % BOROUGH_COLORS.length],
              isSelected: borough === selectedBorough
            })
          }
        })

        // Sort by population for display
        boroughEntries.sort((a, b) => b.population - a.population)
        
        // Organize boroughs into 2 columns
        const boroughColumns: Array<Array<{name: string, population: number, color: string, isSelected: boolean}>> = []
        const itemsPerColumn = Math.ceil(boroughEntries.length / 2)
        for (let i = 0; i < boroughEntries.length; i += itemsPerColumn) {
          boroughColumns.push(boroughEntries.slice(i, i + itemsPerColumn))
        }
        
        return (
          <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl max-w-3xl">
            <p className="text-white font-medium mb-2">{label}</p>
            <div className="border-b border-white/20 mb-3 pb-2">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-sm mr-2" 
                  style={{ backgroundColor: data.isHistorical ? '#10b981' : '#6b7280' }}
                />
                <span className="text-gray-300 text-base">
                  {selectedBorough} Population {data.isHistorical ? '(Historical)' : '(Predicted)'}:
                </span>
                <span className="text-white font-semibold text-lg ml-2">
                  {data.population?.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                All borough comparison:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {boroughColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-0.5">
                  {column.map(({ name, population, color, isSelected }) => (
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
                        {population.toLocaleString()}
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
    <div className="w-full space-y-6">
      {/* Chart */}
      <Card className="bg-black border-white/20">
        <CardHeader>
          <CardTitle className="text-white">
            Population Trends: {selectedBorough}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {selectedBorough === 'All Boroughs' 
              ? 'Total London population by year from official estimates'
              : `${selectedBorough} population by year from official estimates`
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
                    { value: 'Population (Historical)', type: 'rect', color: '#10b981' },
                    { value: 'Population (Predicted)', type: 'rect', color: '#6b7280' }
                  ]}
                />
                <Bar dataKey="population">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isHistorical ? '#10b981' : '#6b7280'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 