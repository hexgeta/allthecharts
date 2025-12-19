const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the XLS file
const xlsPath = path.join(__dirname, '../public/ethnic-groups-by-borough.xls');
const workbook = XLSX.readFile(xlsPath);

// Process only year sheets (skip Metadata)
const yearSheets = workbook.SheetNames.filter(name => /^\d{4}$/.test(name));

const ethnicityData = [];

yearSheets.forEach(year => {
  const sheet = workbook.Sheets[year];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  // Data starts from row 3 (index 3), rows 0-2 are headers
  for (let i = 3; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    // Skip empty rows
    if (!row || row.length < 7) continue;
    
    const areaCode = row[0];
    const areaName = row[1];
    
    // Only include London boroughs (E09 codes)
    if (!areaCode || !areaCode.toString().startsWith('E09')) continue;
    
    // Column indices:
    // Col 2: White
    // Col 3: Asian
    // Col 4: Black
    // Col 5: Mixed/Other
    // Col 6: Total
    
    const parseNum = (val) => {
      if (val === '-' || val === '.' || val === undefined || val === null) return null;
      const num = parseInt(val);
      return isNaN(num) ? null : num;
    };
    
    const white = parseNum(row[2]);
    const asian = parseNum(row[3]);
    const black = parseNum(row[4]);
    const mixedOther = parseNum(row[5]);
    const total = parseNum(row[6]);
    
    // Skip if we don't have any valid data
    if (white === null && asian === null && black === null && mixedOther === null) continue;
    
    ethnicityData.push({
      year: parseInt(year),
      borough: areaName,
      areaCode: areaCode,
      white: white,
      asian: asian,
      black: black,
      mixedOther: mixedOther,
      total: total
    });
  }
});

// Sort by year descending, then by borough
ethnicityData.sort((a, b) => {
  if (b.year !== a.year) return b.year - a.year;
  return a.borough.localeCompare(b.borough);
});

// Output as JSON
const outputPath = path.join(__dirname, '../public/ethnicity-borough.json');
fs.writeFileSync(outputPath, JSON.stringify(ethnicityData, null, 2));

console.log(`Converted ${ethnicityData.length} records`);
console.log(`Saved to ${outputPath}`);

// Show sample data
console.log('\nSample data (2020):');
console.log(ethnicityData.filter(d => d.year === 2020).slice(0, 5));

// Show available years
const years = [...new Set(ethnicityData.map(d => d.year))].sort();
console.log('\nAvailable years:', years);

// Show totals for 2020 to verify
const london2020 = ethnicityData.filter(d => d.year === 2020);
const totals = {
  white: london2020.reduce((sum, d) => sum + (d.white || 0), 0),
  asian: london2020.reduce((sum, d) => sum + (d.asian || 0), 0),
  black: london2020.reduce((sum, d) => sum + (d.black || 0), 0),
  mixedOther: london2020.reduce((sum, d) => sum + (d.mixedOther || 0), 0),
  total: london2020.reduce((sum, d) => sum + (d.total || 0), 0)
};
console.log('\nLondon 2020 totals:');
console.log(totals);
console.log(`White: ${((totals.white / totals.total) * 100).toFixed(1)}%`);
console.log(`Asian: ${((totals.asian / totals.total) * 100).toFixed(1)}%`);
console.log(`Black: ${((totals.black / totals.total) * 100).toFixed(1)}%`);
console.log(`Mixed/Other: ${((totals.mixedOther / totals.total) * 100).toFixed(1)}%`);

