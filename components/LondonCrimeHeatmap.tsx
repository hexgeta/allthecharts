'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CrimeData } from '@/utils/csvParser'

interface LondonCrimeHeatmapProps {
  crimeData: CrimeData[]
  selectedCrimeType: string
  timeRange: 'all' | 'year'
  viewMode: 'absolute' | 'per100k'
}



export default function LondonCrimeHeatmap({ 
  crimeData, 
  selectedCrimeType, 
  timeRange, 
  viewMode 
}: LondonCrimeHeatmapProps) {

  // Simple borough data processing for display
  const boroughStats = useMemo(() => {
    const filteredData = crimeData.filter(crime => {
      const crimeTypeString = `${crime.majorText} - ${crime.minorText}`
      if (selectedCrimeType !== 'All Crime Types' && crimeTypeString !== selectedCrimeType) {
        return false
      }
      return true
    })

    const boroughCounts: { [key: string]: number } = {}
    filteredData.forEach(crime => {
      const borough = crime.boroughName
      if (borough && borough !== 'All Boroughs') {
        const totalCrimes = Object.values(crime.monthlyData).reduce((sum, count) => sum + count, 0)
        boroughCounts[borough] = (boroughCounts[borough] || 0) + totalCrimes
      }
    })

    // Convert to array and sort by crime count
    return Object.entries(boroughCounts)
      .map(([borough, count]) => ({ borough, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15) // Show top 15 boroughs
  }, [crimeData, selectedCrimeType])

  return (
    <Card className="bg-black border-white/20">
      <CardHeader>
        <CardTitle className="text-white">
          London Crime Distribution
        </CardTitle>
        <CardDescription className="text-gray-400">
          Crime counts by borough - {selectedCrimeType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full overflow-hidden rounded-lg">
          <div className="grid gap-2 h-full overflow-y-auto">
            {boroughStats.length > 0 ? (
              boroughStats.map((stat, index) => {
                const maxCount = boroughStats[0]?.count || 1
                const intensity = (stat.count / maxCount) * 100
                const heatColor = `hsl(${Math.max(0, 240 - intensity * 2.4)}, 70%, ${Math.max(20, 70 - intensity * 0.3)}%)`
                
                return (
                  <div
                    key={stat.borough}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-700"
                    style={{ backgroundColor: `${heatColor}20`, borderColor: heatColor }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: heatColor }}
                      />
                      <span className="text-white font-medium">{stat.borough}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{stat.count.toLocaleString()}</div>
                      <div className="text-gray-400 text-sm">#{index + 1}</div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available for the selected filters
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 