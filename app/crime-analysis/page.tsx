'use client'

import React, { useState, useEffect, useMemo } from 'react'
import MpsCrimeChart from '@/components/MpsCrimeChart'
import PopulationChart from '@/components/PopulationChart'
import { loadOptimizedCrimeData, processOptimizedCrimeData, OptimizedCrimeData } from '@/utils/optimizedCsvParser'
import { loadPopulationDataFromPublic, PopulationData } from '@/utils/csvParser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, BarChart3 } from 'lucide-react'

export default function CrimeAnalysisPage() {
  const [crimeData, setCrimeData] = useState<OptimizedCrimeData[]>([])
  const [populationData, setPopulationData] = useState<PopulationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [selectedBorough, setSelectedBorough] = useState('All Boroughs')
  const [selectedCrimeType, setSelectedCrimeType] = useState('All Crime Types')
  const [timeRange, setTimeRange] = useState<'all' | 'year'>('all')
  const [viewMode, setViewMode] = useState<'absolute' | 'per100k'>('absolute')

  // Load optimized data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load optimized crime data and population data in parallel
        const [optimizedCrime, population] = await Promise.all([
          loadOptimizedCrimeData(),
          loadPopulationDataFromPublic()
        ])
        
        setCrimeData(optimizedCrime)
        setPopulationData(population)
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Get unique boroughs and crime types for filters
  const { uniqueBoroughs, uniqueCrimeTypes } = useMemo(() => {
    const boroughs = new Set<string>()
    const crimeTypes = new Set<string>()
    
    crimeData.forEach(item => {
      if (item.boroughName && item.boroughName !== 'All Boroughs') {
        boroughs.add(item.boroughName)
      }
      if (item.majorText && item.minorText) {
        crimeTypes.add(`${item.majorText} - ${item.minorText}`)
      }
    })
    
    return {
      uniqueBoroughs: ['All Boroughs', ...Array.from(boroughs).sort()],
      uniqueCrimeTypes: ['All Crime Types', ...Array.from(crimeTypes).sort()]
    }
  }, [crimeData])

  // Process data for charts
  const chartData = useMemo(() => {
    if (crimeData.length === 0) return null
    return processOptimizedCrimeData(crimeData, selectedBorough, selectedCrimeType, timeRange)
  }, [crimeData, selectedBorough, selectedCrimeType, timeRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-gray-300">Loading optimized crime data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Alert className="max-w-md bg-red-900/20 border-red-900">
          <AlertDescription className="text-red-200">
            Error: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">London Crime & Population Data</h1>
          <p className="text-gray-400 text-lg">
            Interactive visualization of Metropolitan Police crime statistics and population data from 2010-2025
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-black/20 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Filters & Options</CardTitle>
            <CardDescription className="text-gray-400">
              Customize the data visualization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-300">Borough</label>
                <Select value={selectedBorough} onValueChange={setSelectedBorough}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {uniqueBoroughs.map(borough => (
                      <SelectItem key={borough} value={borough} className="text-white hover:bg-gray-800">
                        {borough}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-300">Crime Type</label>
                <Select value={selectedCrimeType} onValueChange={setSelectedCrimeType}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {uniqueCrimeTypes.map(crimeType => (
                      <SelectItem key={crimeType} value={crimeType} className="text-white hover:bg-gray-800">
                        {crimeType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-300">Time Range</label>
                <div className="flex gap-2">
                  <Button
                    variant={timeRange === 'all' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('all')}
                    size="sm"
                  >
                    All Time
                  </Button>
                  <Button
                    variant={timeRange === 'year' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('year')}
                    size="sm"
                  >
                    Last Year
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-300">View Mode (Crime Only)</label>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'absolute' ? 'default' : 'outline'}
                    onClick={() => setViewMode('absolute')}
                    size="sm"
                  >
                    Absolute
                  </Button>
                  <Button
                    variant={viewMode === 'per100k' ? 'default' : 'outline'}
                    onClick={() => setViewMode('per100k')}
                    size="sm"
                  >
                    Per 100k
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="space-y-6">
          {chartData && (
            <MpsCrimeChart 
              chartData={chartData}
              selectedBorough={selectedBorough}
              selectedCrimeType={selectedCrimeType}
              timeRange={timeRange}
              viewMode={viewMode}
            />
          )}
          <PopulationChart 
            populationData={populationData}
            selectedBorough={selectedBorough}
            timeRange={timeRange}
          />
        </div>

        {/* Data Sources */}
        <Card className="bg-black/20 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Data Sources</CardTitle>
            <CardDescription className="text-gray-400">
              Official datasets from London Datastore
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-300">Crime Data:</span>
                <a 
                  href="https://data.london.gov.uk/dataset/recorded_crime_summary/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
                >
                  Recorded Crime Summary - London Datastore
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-300">Population Data:</span>
                <a 
                  href="https://data.london.gov.uk/dataset/office-national-statistics-ons-population-estimates-borough/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
                >
                  ONS Population Estimates by Borough - London Datastore
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 