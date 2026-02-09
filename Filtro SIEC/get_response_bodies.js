const fs = require('fs');
const axios = require('axios');
const csv = require('csv-parser');
const path = require('path');

// Create output directories if they don't exist
const outputDir = path.join(__dirname, 'response_bodies');
const summaryFile = path.join(__dirname, 'responses_summary.json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read the CSV file
const guids = [];
fs.createReadStream(path.join(__dirname, '..', 'projects.csv'))
  .pipe(csv())
  .on('data', (row) => {
    const guid = row.GUID || row['']; // Handle both with and without header
    if (guid) {
      guids.push(guid.trim());
    }
  })
  .on('end', async () => {
    console.log(`Found ${guids.length} project GUIDs`);
    
    const summary = [];
    
    for (const [index, guid] of guids.entries()) {
      console.log(`\nProcessing GUID ${index + 1} of ${guids.length}: ${guid}`);
      
      try {
        const url = `https://api.sif-source.org/projects/${guid}/questions/search/2000720?SPHostUrl=https://www.sif-source.org&SPLanguage=pt-BR&SPClientTag=0&SPProductNumber=15.0.5023.1183`;
        
        // Make the request with basic auth
        const response = await axios.get(url, {
          auth: {
            username: 'adminppi.source@presidencia.gov.br',
            password: 'PPI#source147'
          },
          headers: {
            'Accept': 'application/json'
          }
        });
        
        const responseData = {
          guid,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        };
        
        // Save full response to a separate file
        const responseFile = path.join(outputDir, `${guid}.json`);
        fs.writeFileSync(responseFile, JSON.stringify(responseData, null, 2));
        
        // Add to summary
        summary.push({
          guid,
          status: response.status,
          timestamp: new Date().toISOString(),
          dataReceived: JSON.stringify(response.data).length,
          responseFile: path.basename(responseFile)
        });
        
        console.log(`✅ Success: Status ${response.status} - Data length: ${JSON.stringify(response.data).length} bytes`);
        
      } catch (error) {
        const errorData = {
          guid,
          error: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        };
        
        // Save error to a separate file
        const errorFile = path.join(outputDir, `${guid}_error.json`);
        fs.writeFileSync(errorFile, JSON.stringify(errorData, null, 2));
        
        // Add to summary
        summary.push({
          guid,
          status: error.response?.status || 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString(),
          errorFile: path.basename(errorFile)
        });
        
        console.error(`❌ Error: ${error.message}`);
      }
      
      // Save summary after each request
      fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Processing complete!`);
    console.log(`- Summary saved to: ${summaryFile}`);
    console.log(`- Full responses saved in: ${outputDir}`);
  });
