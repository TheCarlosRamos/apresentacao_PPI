const fs = require('fs');
const path = require('path');

const responseBodiesDir = path.join(__dirname, 'response_bodies');
const outputFile = path.join(__dirname, 'project_systems.json');

// Get all JSON files in the response_bodies directory
const files = fs.readdirSync(responseBodiesDir)
  .filter(file => file.endsWith('.json') && !file.includes('_error'));

const results = {};

files.forEach(file => {
  try {
    const filePath = path.join(responseBodiesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Extract the GUID from the filename or response
    const guid = file.replace('.json', '');
    
    // Get the system type
    const systemType = data.data?.FieldValue?.Value?.Value || 'UNKNOWN';
    
    // Add to results
    if (systemType) {
      results[guid] = systemType;
    }
  } catch (error) {
    console.error(`Error processing file ${file}:`, error.message);
  }
});

// Save results to a single file
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

console.log(`Processed ${Object.keys(results).length} projects.`);
console.log(`Results saved to: ${outputFile}`);
