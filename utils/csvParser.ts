export interface CrimeData {
  majorText: string
  minorText: string
  boroughName: string
  monthlyData: { [key: string]: number }
}

export interface PopulationData {
  year: number
  borough: string
  population: number
  isPredicted?: boolean
}

export function parseMpsCrimeData(csvContent: string): CrimeData[] {
  const lines = csvContent.trim().split('\n')
  
  if (lines.length < 2) {
    return []
  }

  // Parse header to get date columns
  const headers = lines[0].split(',')
  const dateColumns = headers.slice(3) // Skip MajorText, MinorText, BoroughName
  
  const data: CrimeData[] = []

  // Parse each data row
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',')
    
    if (row.length < 4) continue // Skip malformed rows
    
    const majorText = row[0]
    const minorText = row[1]
    const boroughName = row[2]
    
    const monthlyData: { [key: string]: number } = {}
    
    // Parse monthly crime counts
    for (let j = 0; j < dateColumns.length; j++) {
      const dateKey = dateColumns[j]
      const value = parseInt(row[j + 3]) || 0
      monthlyData[dateKey] = value
    }
    
    data.push({
      majorText,
      minorText,
      boroughName,
      monthlyData
    })
  }

  return data
}

export function parsePopulationData(csvContent: string): PopulationData[] {
  const lines = csvContent.trim().split('\n')
  
  if (lines.length < 2) {
    return []
  }

  const data: PopulationData[] = []

  // Parse each data row (skip header)
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',')
    
    if (row.length < 4) continue // Skip malformed rows
    
    const year = parseInt(row[1])
    const borough = row[2]
    const population = parseInt(row[3])
    
    if (!isNaN(year) && !isNaN(population) && borough) {
      data.push({
        year,
        borough,
        population
      })
    }
  }

  return data
}

// Load crime data from public directory
export async function loadCrimeDataFromPublic(): Promise<CrimeData[]> {
  try {
    const response = await fetch('/MPS Borough Level Crime (Historical).csv')
    if (!response.ok) {
      throw new Error(`Failed to load crime CSV: ${response.statusText}`)
    }
    const csvText = await response.text()
    return parseMpsCrimeData(csvText)
  } catch (error) {
    console.error('Error loading crime CSV:', error)
    throw error
  }
}

// Linear regression function to predict future values
function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length
  const sumX = x.reduce((sum, val) => sum + val, 0)
  const sumY = y.reduce((sum, val) => sum + val, 0)
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
  const sumXX = x.reduce((sum, val) => sum + val * val, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  return { slope, intercept }
}

// Generate predicted population data for years 2016-2025 using linear regression
function generatePredictedPopulation(historicalData: PopulationData[]): PopulationData[] {
  const predictions: PopulationData[] = []
  const boroughs = [...new Set(historicalData.map(d => d.borough))]
  
  for (const borough of boroughs) {
    // Get historical data for this borough
    const boroughData = historicalData.filter(d => d.borough === borough)
    
    if (boroughData.length < 2) continue // Need at least 2 data points for regression
    
    // Sort by year and extract x (years) and y (population)
    boroughData.sort((a, b) => a.year - b.year)
    const years = boroughData.map(d => d.year)
    const populations = boroughData.map(d => d.population)
    
    // Calculate linear regression
    const { slope, intercept } = linearRegression(years, populations)
    
    // Generate predictions for 2016-2025
    for (let year = 2016; year <= 2025; year++) {
      const predictedPopulation = Math.round(slope * year + intercept)
      
      // Ensure predicted population is positive
      if (predictedPopulation > 0) {
        predictions.push({
          year,
          borough,
          population: predictedPopulation,
          isPredicted: true
        })
      }
    }
  }
  
  return predictions
}

// Load population data from public directory
export async function loadPopulationDataFromPublic(): Promise<PopulationData[]> {
  try {
    const response = await fetch('/population-estimates-single-year-age.csv')
    if (!response.ok) {
      throw new Error(`Failed to load population CSV: ${response.statusText}`)
    }
    const csvText = await response.text()
    const historicalData = parsePopulationData(csvText)
    
    // Generate predicted data for 2016-2025
    const predictedData = generatePredictedPopulation(historicalData)
    
    // Combine historical and predicted data
    return [...historicalData, ...predictedData]
  } catch (error) {
    console.error('Error loading population CSV:', error)
    throw error
  }
}

export function loadCsvFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      resolve(content)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
} 