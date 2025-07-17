export interface OptimizedCrimeData {
  majorText: string
  minorText: string
  boroughName: string
  monthlyData: { [key: string]: number }
  monthlyPer100k: { [key: string]: number }
}

export interface OptimizedChartData {
  chartPoints: OptimizedChartDataPoint[]
  sortedBoroughs: string[]
}

export interface OptimizedChartDataPoint {
  date: string
  absolute: number
  per100k: number
  [key: string]: any // For dynamic borough properties like "Camden_absolute", "Camden_per100k"
}

// Parse CSV content into structured data
function parseOptimizedCSV(content: string): any[] {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })
    return row
  })
}

// Load and parse optimized crime data
export async function loadOptimizedCrimeData(): Promise<OptimizedCrimeData[]> {
  try {
    const response = await fetch('/optimized-crime-data.csv')
    if (!response.ok) {
      throw new Error(`Failed to fetch optimized crime data: ${response.statusText}`)
    }
    
    const content = await response.text()
    const rows = parseOptimizedCSV(content)
    
    console.log(`📊 Loaded ${rows.length} rows from optimized-crime-data.csv`)
    
    const result = rows.map(row => {
      const monthlyData: { [key: string]: number } = {}
      const monthlyPer100k: { [key: string]: number } = {}
      
      // Extract date columns
      Object.keys(row).forEach(key => {
        if (key.endsWith('_absolute')) {
          const date = key.replace('_absolute', '')
          monthlyData[date] = parseInt(row[key]) || 0
        } else if (key.endsWith('_per100k')) {
          const date = key.replace('_per100k', '')
          monthlyPer100k[date] = parseFloat(row[key]) || 0
        }
      })
      
      return {
        majorText: row.MajorText || '',
        minorText: row.MinorText || '',
        boroughName: row.BoroughName || '',
        monthlyData,
        monthlyPer100k
      }
    })
    
    // Debug: Log a sample of the data
    console.log('📊 Sample crime data:', result[0])
    if (result[0] && result[0].monthlyData) {
      console.log('📊 Sample dates available:', Object.keys(result[0].monthlyData).slice(0, 10))
      console.log('📊 Looking for 202106:', result[0].monthlyData['202106'])
    }
    
    return result
  } catch (error) {
    console.error('Error loading optimized crime data:', error)
    throw error
  }
}

// Process optimized data for charts
export function processOptimizedCrimeData(
  data: OptimizedCrimeData[],
  selectedBorough: string,
  selectedCrimeType: string,
  timeRange: 'all' | 'year'
): OptimizedChartData {
  console.log('📊 Processing data with filters:', { selectedBorough, selectedCrimeType, timeRange })
  console.log('📊 Input data length:', data.length)
  
  // Filter data based on selections - simplified
  let filtered = data.filter(item => {
    if (selectedBorough !== 'All Boroughs' && item.boroughName !== selectedBorough) return false
    if (selectedCrimeType !== 'All Crime Types' && `${item.majorText} - ${item.minorText}` !== selectedCrimeType) return false
    return true
  })
  
  console.log('📊 Filtered data length:', filtered.length)

      if (selectedBorough === 'All Boroughs') {
    // Stacked chart logic for all boroughs - optimized for performance
    const dateAggregated: { 
      [date: string]: { 
        [borough: string]: { absolute: number; per100k: number } 
      } 
    } = {}
    
    filtered.forEach(item => {
      if (item.boroughName !== 'All Boroughs') {
        Object.keys(item.monthlyData).forEach(date => {
          if (!dateAggregated[date]) {
            dateAggregated[date] = {}
          }
          if (!dateAggregated[date][item.boroughName]) {
            dateAggregated[date][item.boroughName] = { absolute: 0, per100k: 0 }
          }
          dateAggregated[date][item.boroughName].absolute += item.monthlyData[date] || 0
          dateAggregated[date][item.boroughName].per100k += item.monthlyPer100k[date] || 0
        })
      }
    })
    
    console.log('📊 Date aggregated keys sample:', Object.keys(dateAggregated).slice(0, 10))
    console.log('📊 Data for 202106:', dateAggregated['202106'])

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

    // Convert to chart format and sort by date - flatten borough data for better performance
    let chartPoints: OptimizedChartDataPoint[] = Object.entries(dateAggregated).map(([date, boroughData]) => {
      const year = parseInt(date.substring(0, 4))
      const month = date.substring(4, 6)
      const formattedDate = `${year}-${month}`
      
      // Create flat structure with borough data as direct properties
      const point: any = {
        date: formattedDate,
        absolute: 0,
        per100k: 0
      }

      // Add each borough as a direct property for better chart performance
      sortedBoroughs.forEach(borough => {
        const data = boroughData[borough] || { absolute: 0, per100k: 0 }
        point[`${borough}_absolute`] = data.absolute
        point[`${borough}_per100k`] = data.per100k
        point.absolute += data.absolute
        point.per100k += data.per100k
      })

      return point
    }).sort((a, b) => a.date.localeCompare(b.date))

    // Apply time range filter
    if (timeRange === 'year') {
      chartPoints = chartPoints.slice(-12) // Last year
    }

    console.log('📊 Final chart points length:', chartPoints.length)
    const june2021Point = chartPoints.find(p => p.date === '2021-06')
    console.log('📊 June 2021 data point:', june2021Point)

    return { chartPoints, sortedBoroughs }
  } else {
    // Single borough logic
    const aggregated: { [date: string]: { absolute: number; per100k: number } } = {}
    
    filtered.forEach(item => {
      Object.keys(item.monthlyData).forEach(date => {
        if (!aggregated[date]) {
          aggregated[date] = { absolute: 0, per100k: 0 }
        }
        aggregated[date].absolute += item.monthlyData[date] || 0
        aggregated[date].per100k += item.monthlyPer100k[date] || 0
      })
    })

    // Convert to chart format and sort by date
    let chartPoints: OptimizedChartDataPoint[] = Object.entries(aggregated).map(([date, data]) => {
      const year = parseInt(date.substring(0, 4))
      const month = date.substring(4, 6)
      const formattedDate = `${year}-${month}`
      
      return {
        date: formattedDate,
        absolute: data.absolute,
        per100k: data.per100k
      }
    }).sort((a, b) => a.date.localeCompare(b.date))

    // Apply time range filter
    if (timeRange === 'year') {
      chartPoints = chartPoints.slice(-12) // Last year
    }

    return { chartPoints, sortedBoroughs: [] }
  }
} 