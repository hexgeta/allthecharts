const XLSX = require('xlsx');
const path = require('path');

// Read the XLS file
const xlsPath = path.join(__dirname, '../public/ethnic-groups-by-borough.xls');
const workbook = XLSX.readFile(xlsPath);

// Log sheet names
console.log('Sheet names:', workbook.SheetNames);

// Iterate through each sheet and show structure
workbook.SheetNames.forEach(sheetName => {
  console.log(`\n=== Sheet: ${sheetName} ===`);
  const sheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with headers
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  // Show first 15 rows to understand structure
  console.log('First 15 rows:');
  jsonData.slice(0, 15).forEach((row, i) => {
    console.log(`Row ${i}:`, row);
  });
  console.log('...');
  console.log('Total rows:', jsonData.length);
});

