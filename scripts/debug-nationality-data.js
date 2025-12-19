const XLSX = require('xlsx');
const path = require('path');

// Read the XLS file
const xlsPath = path.join(__dirname, '../public/nationality-borough.xls');
const workbook = XLSX.readFile(xlsPath);

// Look at 2019 sheet in detail
const sheet = workbook.Sheets['2019'];
const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('=== Header rows (0-4) ===');
for (let i = 0; i <= 4; i++) {
  console.log(`\nRow ${i}:`);
  const row = jsonData[i];
  if (row) {
    row.forEach((cell, j) => {
      if (cell !== undefined && cell !== null && cell !== '') {
        console.log(`  Col ${j}: "${cell}"`);
      }
    });
  }
}

console.log('\n=== Sample data row (Barking and Dagenham) ===');
const barkingRow = jsonData[6];
console.log('Full row:', barkingRow);

console.log('\n=== Column by column analysis ===');
barkingRow.forEach((cell, j) => {
  console.log(`Col ${j}: ${cell}`);
});

// Let's also check Tower Hamlets as it should have high non-British
console.log('\n=== Looking for Tower Hamlets ===');
for (let i = 5; i < jsonData.length; i++) {
  const row = jsonData[i];
  if (row && row[1] && row[1].includes('Tower')) {
    console.log(`Row ${i}:`, row);
    console.log('\nColumn analysis for Tower Hamlets:');
    row.forEach((cell, j) => {
      console.log(`Col ${j}: ${cell}`);
    });
    break;
  }
}

// Check Newham (very diverse borough)
console.log('\n=== Looking for Newham ===');
for (let i = 5; i < jsonData.length; i++) {
  const row = jsonData[i];
  if (row && row[1] === 'Newham') {
    console.log(`Row ${i}:`, row);
    break;
  }
}

