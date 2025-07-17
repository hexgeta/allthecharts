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

// Chart data interfaces (compatible with existing chart components)
export interface ChartData {
  chartPoints: ChartDataPoint[]
  sortedBoroughs: string[]
}

export interface ChartDataPoint {
  date: string
  absolute: number
  per100k: number
  isIncomplete?: boolean
  [key: string]: any // For dynamic borough properties like "Camden_absolute", "Camden_per100k"
}

// List of 33 actual London boroughs - ensures consistency between crime and population data
const LONDON_BOROUGHS = [
  'Barking and Dagenham', 'Barnet', 'Bexley', 'Brent', 'Bromley', 'Camden', 'City of London',
  'Croydon', 'Ealing', 'Enfield', 'Greenwich', 'Hackney', 'Hammersmith and Fulham', 'Haringey',
  'Harrow', 'Havering', 'Hillingdon', 'Hounslow', 'Islington', 'Kensington and Chelsea',
  'Kingston upon Thames', 'Lambeth', 'Lewisham', 'Merton', 'Newham', 'Redbridge',
  'Richmond upon Thames', 'Southwark', 'Sutton', 'Tower Hamlets', 'Waltham Forest',
  'Wandsworth', 'Westminster'
]

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
    
    const code = row[0]
    const year = parseInt(row[1])
    const borough = row[2]
    const population = parseInt(row[3])
    
    // Only include London boroughs (codes starting with E09) - excludes UK/England/Scotland etc.
    if (!isNaN(year) && !isNaN(population) && borough && code.startsWith('E09')) {
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

// Generate predicted population data for years 2016-2030 using improved prediction
function generatePredictedPopulation(historicalData: PopulationData[]): PopulationData[] {
  const predictions: PopulationData[] = []
  const boroughs = [...new Set(historicalData.map(d => d.borough))]
  
  for (const borough of boroughs) {
    // Get historical data for this borough
    const boroughData = historicalData.filter(d => d.borough === borough)
    

    
    if (boroughData.length < 2) continue // Need at least 2 data points for regression
    
    // Sort by year and extract x (years) and y (population)
    boroughData.sort((a, b) => a.year - b.year)
    
    // Use only the most recent 10 years for better trend analysis
    const recentData = boroughData.slice(-10)
    const years = recentData.map(d => d.year)
    const populations = recentData.map(d => d.population)
    
    // Calculate linear regression
    const { slope, intercept } = linearRegression(years, populations)
    

    
    // Get the last known population value as baseline
    const lastKnownPopulation = boroughData[boroughData.length - 1].population
    const lastKnownYear = boroughData[boroughData.length - 1].year
    
    // Ensure minimum growth rate (prevent decline unless slope is strongly negative)
    // For London boroughs, assume at least 0.5% annual growth if regression shows decline
    const minGrowthRate = 0.005 // 0.5% annually
    const adjustedSlope = slope < 0 ? lastKnownPopulation * minGrowthRate : slope
    

    
    // Generate predictions for 2016-2030
    for (let year = 2016; year <= 2030; year++) {
      let predictedPopulation: number
      
      if (year <= lastKnownYear) {
        // Use actual regression for years we might have some data
        predictedPopulation = Math.round(slope * year + intercept)
      } else {
        // Use adjusted projection from last known year
        const yearsFromLastKnown = year - lastKnownYear
        predictedPopulation = Math.round(lastKnownPopulation + (adjustedSlope * yearsFromLastKnown))
      }
      
      // Ensure predicted population is reasonable (at least 80% of last known)
      const minimumPopulation = Math.round(lastKnownPopulation * 0.8)
      predictedPopulation = Math.max(predictedPopulation, minimumPopulation)
      
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
    
    // Generate predicted data for 2016-2030
    const predictedData = generatePredictedPopulation(historicalData)
    
    // Combine historical and predicted data
    return [...historicalData, ...predictedData]
  } catch (error) {
    console.error('Error loading population CSV:', error)
    throw error
  }
}

// Helper function to get population for a specific borough and year
function getPopulationForBorough(populationData: PopulationData[], borough: string, year: number): number {
  const pop = populationData.find(p => p.borough === borough && p.year === year)
  return pop ? pop.population : 0
}

// Helper function to get total London population for a specific year
function getTotalLondonPopulation(populationData: PopulationData[], year: number): number {
  return populationData
    .filter(p => p.year === year && p.borough !== 'All Boroughs')
    .reduce((sum, p) => sum + p.population, 0)
}

// Process original crime data for charts (compatible with existing chart components)
export function processCrimeData(
  data: CrimeData[],
  populationData: PopulationData[],
  selectedBorough: string,
  selectedCrimeType: string,
  timeRange: 'all' | 'year',
  timeGranularity: 'monthly' | 'yearly' = 'monthly'
): ChartData {

  
  // Filter data based on selections
  let filtered = data.filter(item => {
    if (selectedBorough !== 'All Boroughs' && item.boroughName !== selectedBorough) return false
    if (selectedCrimeType !== 'All Crime Types' && `${item.majorText} - ${item.minorText}` !== selectedCrimeType) return false
    // Only include actual London boroughs (excludes "Unknown", "Heathrow", etc.)
    return LONDON_BOROUGHS.includes(item.boroughName) || selectedBorough === 'All Boroughs'
  })

  if (selectedBorough === 'All Boroughs') {
    // Stacked chart logic for all boroughs
    const dateAggregated: { 
      [date: string]: { 
        [borough: string]: { absolute: number } 
      } 
    } = {}
    
    filtered.forEach(item => {
      // Only include actual London boroughs (excludes "Unknown", "Heathrow", etc.)
      if (LONDON_BOROUGHS.includes(item.boroughName)) {
        Object.keys(item.monthlyData).forEach(date => {
          if (!dateAggregated[date]) {
            dateAggregated[date] = {}
          }
          if (!dateAggregated[date][item.boroughName]) {
            dateAggregated[date][item.boroughName] = { absolute: 0 }
          }
          
          const crimeCount = item.monthlyData[date] || 0
          dateAggregated[date][item.boroughName].absolute += crimeCount
        })
      }
    })

    // Get all unique boroughs and sort by total crime count
    const boroughTotals: { [borough: string]: number } = {}
    Object.values(dateAggregated).forEach(dateData => {
      Object.entries(dateData).forEach(([borough, data]) => {
        boroughTotals[borough] = (boroughTotals[borough] || 0) + data.absolute
      })
    })

    const sortedBoroughs = Object.entries(boroughTotals)
      .sort((a, b) => b[1] - a[1]) // Descending order
      .map(([borough]) => borough)

    // Convert to chart format and sort by date
    let chartPoints: ChartDataPoint[] = Object.entries(dateAggregated).map(([date, boroughData]) => {
      const year = parseInt(date.substring(0, 4))
      const month = date.substring(4, 6)
      const formattedDate = `${year}-${month}`
      
      // Calculate totals for this date
      let totalAbsolute = 0
      const totalPopulation = getTotalLondonPopulation(populationData, year)
      
      // Create flat structure with borough data as direct properties
      const point: any = {
        date: formattedDate,
        absolute: 0,
        per100k: 0,
        isIncomplete: false
      }

      // Add each borough as a direct property for better chart performance
      sortedBoroughs.forEach(borough => {
        const data = boroughData[borough] || { absolute: 0 }
        const boroughPopulation = getPopulationForBorough(populationData, borough, year)
        
        point[`${borough}_absolute`] = data.absolute
        point[`${borough}_per100k`] = boroughPopulation > 0 ? (data.absolute / boroughPopulation) * 100000 : 0
        
        totalAbsolute += data.absolute
      })

      // Calculate correct totals
      point.absolute = totalAbsolute
      point.per100k = totalPopulation > 0 ? (totalAbsolute / totalPopulation) * 100000 : 0

      return point
    }).sort((a, b) => a.date.localeCompare(b.date))

          // Apply time granularity aggregation for all boroughs
    if (timeGranularity === 'yearly') {

      
      // Aggregate monthly data into yearly totals
      const yearlyAggregated: { [year: string]: any } = {}
      
      chartPoints.forEach(point => {
        const year = point.date.substring(0, 4) // Extract year from "YYYY-MM" format
        
        if (!yearlyAggregated[year]) {
          yearlyAggregated[year] = {
            date: year,
            absolute: 0,
            per100k: 0,
            monthCount: 0,
            isIncomplete: false
          }
          
          // Initialize borough totals
          sortedBoroughs.forEach(borough => {
            yearlyAggregated[year][`${borough}_absolute`] = 0
            yearlyAggregated[year][`${borough}_per100k`] = 0
          })
        }
        
        // Aggregate absolute values (sum them up)
        yearlyAggregated[year].absolute += point.absolute || 0
        yearlyAggregated[year].monthCount += 1
        
        // Aggregate borough data
        sortedBoroughs.forEach(borough => {
          yearlyAggregated[year][`${borough}_absolute`] += point[`${borough}_absolute`] || 0
        })
      })
      
      // Calculate yearly per100k rates (re-calculate based on yearly totals and population)
      chartPoints = Object.values(yearlyAggregated).map(yearData => {
        const year = parseInt(yearData.date)
        const totalPopulation = getTotalLondonPopulation(populationData, year)
        
        // Calculate main per100k rate
        yearData.per100k = totalPopulation > 0 ? (yearData.absolute / totalPopulation) * 100000 : 0
        
        // Calculate borough per100k rates
        sortedBoroughs.forEach(borough => {
          const boroughPopulation = getPopulationForBorough(populationData, borough, year)
          yearData[`${borough}_per100k`] = boroughPopulation > 0 ? 
            (yearData[`${borough}_absolute`] / boroughPopulation) * 100000 : 0
        })
        
        // Mark year as incomplete if it has less than 12 months of data
        yearData.isIncomplete = yearData.monthCount < 12
        
        // Remove helper properties
        delete yearData.monthCount
        return yearData
      }).sort((a, b) => a.date.localeCompare(b.date))
      

    }

    // Apply time range filter
    if (timeRange === 'year') {
      chartPoints = chartPoints.slice(-12) // Last year (or last 12 data points for yearly view)
    }



    return { chartPoints, sortedBoroughs }
  } else {
    // Single borough logic - but still include all borough data for comparison in tooltip
    const dateAggregated: { 
      [date: string]: { 
        [borough: string]: { absolute: number } 
      } 
    } = {}
    
    // First, get all crime data for all boroughs (not just the selected one) for tooltip comparison
    const allData = data.filter(item => {
      if (selectedCrimeType !== 'All Crime Types' && `${item.majorText} - ${item.minorText}` !== selectedCrimeType) return false
      // Only include actual London boroughs (excludes "Unknown", "Heathrow", etc.)
      return LONDON_BOROUGHS.includes(item.boroughName)
    })
    
    allData.forEach(item => {
      Object.keys(item.monthlyData).forEach(date => {
        if (!dateAggregated[date]) {
          dateAggregated[date] = {}
        }
        if (!dateAggregated[date][item.boroughName]) {
          dateAggregated[date][item.boroughName] = { absolute: 0 }
        }
        
        const crimeCount = item.monthlyData[date] || 0
        dateAggregated[date][item.boroughName].absolute += crimeCount
      })
    })

    // Get all unique boroughs and sort by total crime count
    const boroughTotals: { [borough: string]: number } = {}
    Object.values(dateAggregated).forEach(dateData => {
      Object.entries(dateData).forEach(([borough, data]) => {
        boroughTotals[borough] = (boroughTotals[borough] || 0) + data.absolute
      })
    })

    const sortedBoroughs = Object.entries(boroughTotals)
      .sort((a, b) => b[1] - a[1]) // Descending order
      .map(([borough]) => borough)

    // Convert to chart format and sort by date
    let chartPoints: ChartDataPoint[] = Object.entries(dateAggregated).map(([date, boroughData]) => {
      const year = parseInt(date.substring(0, 4))
      const month = date.substring(4, 6)
      const formattedDate = `${year}-${month}`
      
             // Create point with selected borough's main data
       const selectedBoroughData = boroughData[selectedBorough] || { absolute: 0 }
              const selectedBoroughPopulation = getPopulationForBorough(populationData, selectedBorough, year)
       
       const point: any = {
         date: formattedDate,
         absolute: selectedBoroughData.absolute,
         per100k: selectedBoroughPopulation > 0 ? (selectedBoroughData.absolute / selectedBoroughPopulation) * 100000 : 0,
         isIncomplete: false
       }

      // Add all borough data for tooltip comparison
      sortedBoroughs.forEach(borough => {
        const data = boroughData[borough] || { absolute: 0 }
        const boroughPopulation = getPopulationForBorough(populationData, borough, year)
        
        point[`${borough}_absolute`] = data.absolute
        point[`${borough}_per100k`] = boroughPopulation > 0 ? (data.absolute / boroughPopulation) * 100000 : 0
      })

      return point
    }).sort((a, b) => a.date.localeCompare(b.date))

    // Apply time granularity aggregation for single borough
    if (timeGranularity === 'yearly') {

      
      // Aggregate monthly data into yearly totals
      const yearlyAggregated: { [year: string]: any } = {}
      
      chartPoints.forEach(point => {
        const year = point.date.substring(0, 4) // Extract year from "YYYY-MM" format
        
        if (!yearlyAggregated[year]) {
          yearlyAggregated[year] = {
            date: year,
            absolute: 0,
            per100k: 0,
            monthCount: 0,
            isIncomplete: false
          }
          
          // Initialize borough totals
          sortedBoroughs.forEach(borough => {
            yearlyAggregated[year][`${borough}_absolute`] = 0
            yearlyAggregated[year][`${borough}_per100k`] = 0
          })
        }
        
        // Aggregate absolute values (sum them up)
        yearlyAggregated[year].absolute += point.absolute || 0
        yearlyAggregated[year].monthCount += 1
        
        // Aggregate borough data
        sortedBoroughs.forEach(borough => {
          yearlyAggregated[year][`${borough}_absolute`] += point[`${borough}_absolute`] || 0
        })
      })
      
      // Calculate yearly per100k rates (re-calculate based on yearly totals and population)
      chartPoints = Object.values(yearlyAggregated).map(yearData => {
        const year = parseInt(yearData.date)
        const totalPopulation = getTotalLondonPopulation(populationData, year)
        
        // Calculate main per100k rate
        yearData.per100k = totalPopulation > 0 ? (yearData.absolute / totalPopulation) * 100000 : 0
        
        // Calculate borough per100k rates
        sortedBoroughs.forEach(borough => {
          const boroughPopulation = getPopulationForBorough(populationData, borough, year)
          yearData[`${borough}_per100k`] = boroughPopulation > 0 ? 
            (yearData[`${borough}_absolute`] / boroughPopulation) * 100000 : 0
        })
        
        // Mark year as incomplete if it has less than 12 months of data
        yearData.isIncomplete = yearData.monthCount < 12
        
        // Remove helper properties
        delete yearData.monthCount
        return yearData
      }).sort((a, b) => a.date.localeCompare(b.date))
      

    }

    // Apply time range filter
    if (timeRange === 'year') {
      chartPoints = chartPoints.slice(-12) // Last year (or last 12 data points for yearly view)
    }

    return { chartPoints, sortedBoroughs }
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