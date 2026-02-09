const fs = require('fs');
const { execSync } = require('child_process');
const csv = require('csv-parser');
const path = require('path');

const results = [];
const outputFile = path.join(__dirname, 'api_responses.json');

// Read the CSV file
fs.createReadStream(path.join(__dirname, '..', 'projects.csv'))
  .pipe(csv())
  .on('data', (row) => {
    if (row.GUID) {
      results.push(row.GUID);
    } else if (row['']) {  // In case there's no header and GUIDs are in the first column
      results.push(row['']);
    }
  })
  .on('end', () => {
    console.log(`Found ${results.length} project GUIDs`);
    processGuids(results);
  });

async function processGuids(guids) {
  const allResponses = [];
  
  for (const [index, guid] of guids.entries()) {
    console.log(`\nProcessing GUID ${index + 1} of ${guids.length}: ${guid}`);
    
    try {
      // Run the newman command for each GUID
      const command = `npx newman run "${path.join(__dirname, 'temp_collection.json')}" --env-var "GUID=${guid}" --export-environment ${path.join(__dirname, 'env.json')} --reporters cli,json --reporter-json-export ${path.join(__dirname, 'output', `${guid}.json`)}`;
      
      console.log(`Executing: ${command}`);
      const output = execSync(command, { stdio: 'pipe' }).toString();
      
      // Parse the output to get the response
      const response = {
        guid,
        status: 'success',
        output: output
      };
      allResponses.push(response);
      
      // Save progress after each request
      fs.writeFileSync(outputFile, JSON.stringify(allResponses, null, 2));
      console.log(`Successfully processed ${index + 1}/${guids.length}`);
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error processing GUID ${guid}:`, error.message);
      allResponses.push({
        guid,
        status: 'error',
        error: error.message
      });
      // Save progress even if there was an error
      fs.writeFileSync(outputFile, JSON.stringify(allResponses, null, 2));
      
      // Continue with the next GUID even if one fails
      continue;
    }
  }
  
  console.log(`\nProcessing complete. Results saved to ${outputFile}`);
}
