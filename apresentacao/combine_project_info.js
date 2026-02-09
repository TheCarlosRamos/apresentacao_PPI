const fs = require('fs');
const path = require('path');

// Paths
const descricaoPath = path.join(__dirname, 'projetos_descricao.json');
const secretariaPath = path.join(__dirname, 'project_secretaria.json');
const outputPath = path.join(__dirname, 'project_secretaria_with_names.json');

// Read the files
const projetosDescricao = JSON.parse(fs.readFileSync(descricaoPath, 'utf-8'));
const projectSecretaria = JSON.parse(fs.readFileSync(secretariaPath, 'utf-8'));

// Create a map of GUID to project name for faster lookup
const projectNameMap = {};
projetosDescricao.forEach(project => {
    projectNameMap[project.guid] = project.name;
});

// Create the combined result
const combinedResult = [];

// Process each project in project_secretaria
for (const [guid, system] of Object.entries(projectSecretaria)) {
    const projectInfo = {
        guid,
        name: projectNameMap[guid] || 'Nome não encontrado',
        system: system
    };
    combinedResult.push(projectInfo);
}

// Save the combined result
fs.writeFileSync(outputPath, JSON.stringify(combinedResult, null, 2));

console.log(`Processed ${combinedResult.length} projects.`);
console.log(`Results saved to: ${outputPath}`);
