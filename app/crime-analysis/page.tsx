'use client'

import React, { useState, useEffect, useMemo } from 'react'
import MpsCrimeChart from '@/components/MpsCrimeChart'
import PopulationChart from '@/components/PopulationChart'
import { parseMpsCrimeData, loadCsvFromFile, loadCrimeDataFromPublic, loadPopulationDataFromPublic, CrimeData, PopulationData } from '@/utils/csvParser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, BarChart3 } from 'lucide-react'

export default function CrimeAnalysisPage() {
  const [data, setData] = useState<CrimeData[]>([])
  const [populationData, setPopulationData] = useState<PopulationData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // Shared filter state
  const [selectedBorough, setSelectedBorough] = useState<string>('all')
  const [selectedCrimeType, setSelectedCrimeType] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'all' | 'recent' | 'year'>('all')
  const [viewMode, setViewMode] = useState<'absolute' | 'per100k'>('absolute')

  // Helper function to format large numbers with abbreviations
  const formatLargeNumber = (value: number): string => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  // Extract unique boroughs and crime types
  const boroughs = useMemo(() => {
    const unique = [...new Set(data.map(item => item.boroughName))].sort()
    return unique
  }, [data])

  const crimeTypes = useMemo(() => {
    const unique = [...new Set(data.map(item => `${item.majorText} - ${item.minorText}`))].sort()
    return unique
  }, [data])

  // Load the default CSV file on component mount
  useEffect(() => {
    loadDefaultData()
  }, [])

  const loadDefaultData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load both crime and population data
      const [crimeData, populationDataResult] = await Promise.all([
        loadCrimeDataFromPublic(),
        loadPopulationDataFromPublic()
      ])
      
      if (crimeData.length === 0) {
        throw new Error('No valid crime data found in CSV file')
      }
      
      if (populationDataResult.length === 0) {
        throw new Error('No valid population data found in CSV file')
      }
      
      setData(crimeData)
      setPopulationData(populationDataResult)
      setDataLoaded(true)
    } catch (err) {
      setError('Failed to load default datasets. Please upload your own CSV file.')
      console.error('Error loading default data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const csvContent = await loadCsvFromFile(file)
      const parsedData = parseMpsCrimeData(csvContent)
      
      if (parsedData.length === 0) {
        throw new Error('No valid data found in the uploaded file')
      }
      
      setData(parsedData)
      setDataLoaded(true)
    } catch (err) {
      setError(`Failed to parse uploaded file: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const getDataSummary = () => {
    if (data.length === 0) return null

    const boroughs = new Set(data.map(item => item.boroughName))
    const crimeTypes = new Set(data.map(item => item.majorText))
    const totalRecords = data.length

    // Population summary
    const totalPopulation = populationData.reduce((sum, p) => sum + p.population, 0)
    const populationYears = new Set(populationData.map(p => p.year))

    return {
      boroughs: boroughs.size,
      crimeTypes: crimeTypes.size,
      totalRecords,
      totalPopulation,
      populationYears: populationYears.size
    }
  }

  const summary = getDataSummary()

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">
              Crime & Population Analysis
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Interactive visualization of Metropolitan Police Service borough-level crime statistics 
            and population data from 2010-2023. Explore trends across different crime types and London boroughs.
          </p>
        </div>

        {/* Data Loading Section */}
        {!dataLoaded && (
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Load Crime Data</CardTitle>
              <CardDescription className="text-gray-400">
                Upload your own MPS crime CSV file or use the default dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={loadDefaultData} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                  Load Default Dataset
                </Button>
                
                <div className="flex items-center gap-2">
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <Button variant="outline" className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                        Upload CSV File
                      </span>
                    </Button>
                  </label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                  <span className="ml-2 text-gray-300">Loading and parsing data...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Data Summary */}
        {summary && (
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Dataset Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{summary.boroughs}</div>
                  <div className="text-sm text-gray-400">London Boroughs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{summary.crimeTypes}</div>
                  <div className="text-sm text-gray-400">Crime Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{summary.totalRecords.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Crime Records</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">{formatLargeNumber(summary.totalPopulation)}</div>
                  <div className="text-sm text-gray-400">Total Population</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">{summary.populationYears}</div>
                  <div className="text-sm text-gray-400">Population Years</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shared Filters */}
        {dataLoaded && data.length > 0 && (
          <Card className="bg-black border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Data Filters</CardTitle>
              <CardDescription className="text-gray-400">
                Filter and visualize both crime and population data by borough and time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-300">Borough</label>
                  <Select value={selectedBorough} onValueChange={setSelectedBorough}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select borough" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Boroughs</SelectItem>
                      {boroughs.map(borough => (
                        <SelectItem key={borough} value={borough}>
                          {borough}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-300">Crime Type</label>
                  <Select value={selectedCrimeType} onValueChange={setSelectedCrimeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crime type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">All Crime Types</SelectItem>
                      {crimeTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-300">Time Range</label>
                  <Select value={timeRange} onValueChange={(value: 'all' | 'recent' | 'year') => setTimeRange(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time (2010-2023)</SelectItem>
                      <SelectItem value="recent">Recent (Last 2 Years)</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
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
        )}

        {/* Chart Components */}
        {dataLoaded && data.length > 0 && (
          <>
            <MpsCrimeChart 
              data={data} 
              populationData={populationData}
              selectedBorough={selectedBorough}
              selectedCrimeType={selectedCrimeType}
              timeRange={timeRange}
              viewMode={viewMode}
            />
            
            <PopulationChart
              populationData={populationData}
              selectedBorough={selectedBorough}
              timeRange={timeRange}
            />
          </>
        )}


      </div>
    </div>
  )
} 