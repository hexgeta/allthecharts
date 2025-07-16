const fs = require('fs');
const path = require('path');

// Helper function for linear regression
function linearRegression(years, populations) {
  const n = years.length;
  const sumX = years.reduce((a, b) => a + b, 0);
  const sumY = populations.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((sum, x, i) => sum + x * populations[i], 0);
  const sumXX = years.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

// Parse CSV function
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    return row;
  });
}

// Load and parse crime data
function loadCrimeData() {
  const crimeContent = fs.readFileSync('public/MPS Borough Level Crime (Historical).csv', 'utf-8');
  const crimeRows = parseCSV(crimeContent);
  
  return crimeRows.map(row => {
    const monthlyData = {};
    Object.keys(row).forEach(key => {
      if (key.match(/^\d{6}$/)) { // YYYYMM format
        monthlyData[key] = parseInt(row[key]) || 0;
      }
    });
    
    return {
      majorText: row.MajorText,
      minorText: row.MinorText,
      boroughName: row.BoroughName,
      monthlyData
    };
  });
}

// Load and parse population data with predictions
function loadPopulationData() {
  const populationContent = fs.readFileSync('public/population-estimates-single-year-age.csv', 'utf-8');
  const populationRows = parseCSV(populationContent);
  
  // Group by borough and calculate totals by year
  const boroughPopulations = {};
  
  populationRows.forEach(row => {
    const borough = row.geography_name;
    const year = parseInt(row.date_code);
    const population = parseInt(row.observation) || 0;
    
    if (!boroughPopulations[borough]) {
      boroughPopulations[borough] = {};
    }
    
    if (!boroughPopulations[borough][year]) {
      boroughPopulations[borough][year] = 0;
    }
    
    boroughPopulations[borough][year] += population;
  });
  
  // Generate predictions for 2016-2025 using linear regression
  const allData = [];
  
  Object.keys(boroughPopulations).forEach(borough => {
    const years = Object.keys(boroughPopulations[borough]).map(Number).sort();
    const populations = years.map(year => boroughPopulations[borough][year]);
    
    // Add historical data
    years.forEach(year => {
      allData.push({
        borough,
        year,
        population: boroughPopulations[borough][year],
        isPredicted: false
      });
    });
    
    // Generate predictions for 2016-2025
    if (years.length >= 2) {
      const { slope, intercept } = linearRegression(years, populations);
      
      for (let year = 2016; year <= 2025; year++) {
        if (!boroughPopulations[borough][year]) {
          const predictedPopulation = Math.round(slope * year + intercept);
          allData.push({
            borough,
            year,
            population: Math.max(0, predictedPopulation),
            isPredicted: true
          });
        }
      }
    }
  });
  
  return allData;
}

// Get population for a specific borough and year
function getPopulation(populationData, borough, year) {
  // Try exact match first
  let popData = populationData.find(p => 
    p.borough === borough && p.year === year
  );
  
  if (popData) {
    return popData.population;
  }
  
  // If not found and year >= 2016, try to find the closest available year
  if (year >= 2016) {
    const boroughData = populationData
      .filter(p => p.borough === borough)
      .sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year));
    
    if (boroughData.length > 0) {
      return boroughData[0].population;
    }
  }
  
  return null;
}

// Generate optimized dataset
function generateOptimizedDataset() {
  console.log('Loading crime data...');
  const crimeData = loadCrimeData();
  
  console.log('Loading population data...');
  const populationData = loadPopulationData();
  
  console.log('Generating optimized dataset...');
  
  // Get all unique dates from crime data
  const allDates = new Set();
  crimeData.forEach(record => {
    Object.keys(record.monthlyData).forEach(date => {
      allDates.add(date);
    });
  });
  
  const sortedDates = Array.from(allDates).sort();
  
  // Generate CSV headers
  const headers = [
    'MajorText',
    'MinorText', 
    'BoroughName'
  ];
  
  // Add date columns for both absolute and per100k
  sortedDates.forEach(date => {
    headers.push(`${date}_absolute`);
    headers.push(`${date}_per100k`);
  });
  
  // Generate optimized rows
  const optimizedRows = [];
  
  crimeData.forEach(record => {
    const row = {
      MajorText: record.majorText,
      MinorText: record.minorText,
      BoroughName: record.boroughName
    };
    
    sortedDates.forEach(date => {
      const year = parseInt(date.substring(0, 4));
      const absoluteValue = record.monthlyData[date] || 0;
      
      // Calculate per 100k rate
      let per100kValue = 0;
      
      if (record.boroughName === 'All Boroughs') {
        // For "All Boroughs", sum all borough populations for that year
        const totalPopulation = populationData
          .filter(p => p.year === year && p.borough !== 'All Boroughs')
          .reduce((sum, p) => sum + p.population, 0);
        
        if (totalPopulation > 0) {
          per100kValue = Math.round((absoluteValue / totalPopulation) * 100000);
        }
      } else {
        // For individual boroughs
        const population = getPopulation(populationData, record.boroughName, year);
        if (population && population > 0) {
          per100kValue = Math.round((absoluteValue / population) * 100000);
        }
      }
      
      row[`${date}_absolute`] = absoluteValue;
      row[`${date}_per100k`] = per100kValue;
    });
    
    optimizedRows.push(row);
  });
  
  // Generate CSV content
  const csvContent = [
    headers.join(','),
    ...optimizedRows.map(row => 
      headers.map(header => row[header] || 0).join(',')
    )
  ].join('\n');
  
  // Write to file
  fs.writeFileSync('public/optimized-crime-data.csv', csvContent);
  
  console.log(`✅ Generated optimized dataset with ${optimizedRows.length} records`);
  console.log(`📁 Saved to: public/optimized-crime-data.csv`);
  console.log(`📊 Columns: ${headers.length} (${sortedDates.length} dates × 2 + 3 metadata)`);
  
  // Calculate file size savings
  const originalCrimeSize = fs.statSync('public/MPS Borough Level Crime (Historical).csv').size;
  const originalPopSize = fs.statSync('public/population-estimates-single-year-age.csv').size;
  const optimizedSize = fs.statSync('public/optimized-crime-data.csv').size;
  
  console.log(`\n📈 Performance Impact:`);
  console.log(`   Original files: ${Math.round((originalCrimeSize + originalPopSize) / 1024)} KB`);
  console.log(`   Optimized file: ${Math.round(optimizedSize / 1024)} KB`);
  console.log(`   Reduction: ${Math.round(((originalCrimeSize + originalPopSize - optimizedSize) / (originalCrimeSize + originalPopSize)) * 100)}%`);
}

// Run the script
try {
  generateOptimizedDataset();
} catch (error) {
  console.error('❌ Error generating optimized dataset:', error.message);
  process.exit(1);
} 