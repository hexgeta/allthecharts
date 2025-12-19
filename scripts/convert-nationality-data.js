const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the XLS file
const xlsPath = path.join(__dirname, '../public/nationality-borough.xls');
const workbook = XLSX.readFile(xlsPath);

// Process only year sheets (skip Metadata)
const yearSheets = workbook.SheetNames.filter(name => /^\d{4}$/.test(name));

const nationalityData = [];

yearSheets.forEach(year => {
  const sheet = workbook.Sheets[year];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  // Find data rows (skip header rows, start from row 5 which has actual data)
  // Row 0-3 are headers, row 4 is empty
  for (let i = 5; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    // Skip empty rows or summary rows
    if (!row || row.length < 8) continue;
    
    const areaCode = row[0];
    const areaName = row[1];
    
    // Only include London boroughs (E09 codes)
    if (!areaCode || !areaCode.toString().startsWith('E09')) continue;
    
    // Column indices based on the structure:
    // Col 2: Total estimate
    // Col 5: British estimate  
    // Col 7: Non-British estimate
    const totalEstimate = row[2];
    const britishEstimate = row[5];
    const nonBritishEstimate = row[7];
    
    // Parse numbers (handle ':' and other non-numeric values)
    const parseNum = (val) => {
      if (val === ':' || val === '.' || val === 'c' || val === 'z' || val === undefined || val === null) return null;
      const num = parseInt(val);
      return isNaN(num) ? null : num * 1000; // Values are in thousands
    };
    
    const total = parseNum(totalEstimate);
    const british = parseNum(britishEstimate);
    const nonBritish = parseNum(nonBritishEstimate);
    
    // Skip if we don't have at least british/non-british data
    if (british === null && nonBritish === null) continue;
    
    nationalityData.push({
      year: parseInt(year),
      borough: areaName,
      areaCode: areaCode,
      total: total,
      british: british,
      nonBritish: nonBritish
    });
  }
});

// Sort by year descending, then by borough
nationalityData.sort((a, b) => {
  if (b.year !== a.year) return b.year - a.year;
  return a.borough.localeCompare(b.borough);
});

// Output as JSON
const outputPath = path.join(__dirname, '../public/nationality-borough.json');
fs.writeFileSync(outputPath, JSON.stringify(nationalityData, null, 2));

console.log(`Converted ${nationalityData.length} records`);
console.log(`Saved to ${outputPath}`);

// Show sample data
console.log('\nSample data:');
console.log(nationalityData.slice(0, 5));

// Show available years
const years = [...new Set(nationalityData.map(d => d.year))].sort();
console.log('\nAvailable years:', years);

// Show available boroughs
const boroughs = [...new Set(nationalityData.map(d => d.borough))].sort();
console.log('\nBoroughs:', boroughs);
