const fs = require('fs');
const path = require('path');

// Lista de coleções
const collections = [
    'Consulta Publica',
    'Estudos',
    'Situação do contrato (contrato)',
    'Status da fase aviso de licitação (Edital)',
    'Status da fase Licitação (leilão)',
    'Status do controle externo (TCU)'
];

// Template do script
const scriptTemplate = (collectionName) => `const fs = require('fs');
const newman = require('newman');

// Lê o arquivo de GUIDs
function readGuids() {
    try {
        const fileContent = fs.readFileSync('../guids_com_nome.csv', 'utf8');
        // Remove a primeira linha (cabeçalho) e linhas vazias
        return fileContent
            .split('\\n')
            .slice(1)
            .map(line => line.trim())
            .filter(Boolean);
    } catch (error) {
        console.error('Erro ao ler o arquivo de GUIDs:', error);
        process.exit(1);
    }
}

// Executa a coleção para um GUID
async function runCollection(guid) {
    return new Promise((resolve) => {
        newman.run({
            collection: '../${collectionName.replace(/'/g, "\\'")}.postman_collection.json',
            reporters: 'cli',
            envVar: [
                {
                    key: 'guid',
                    value: guid
                }
            ]
        }, (err) => {
            if (err) {
                console.error(\`Erro ao processar GUID \${guid}:\`, err);
                return resolve();
            }
            console.log(\`Concluído para GUID: \${guid}\`);
            resolve();
        });
    });
}

// Função principal
async function main() {
    const guids = readGuids();
    console.log(\`Iniciando processamento de \${guids.length} GUIDs...\`);
    
    for (const guid of guids) {
        console.log(\`\\nProcessando GUID: \${guid}\\n\`);
        await runCollection(guid);
    }
    
    console.log('\\nProcessamento concluído!');
}

main().catch(console.error);
`;

// Cria a pasta scripts se não existir
const scriptsDir = path.join(__dirname, 'scripts');
if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir);
}

// Gera um script para cada coleção
collections.forEach(collection => {
    const scriptName = `run-${collection.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.js`;
    const scriptPath = path.join(scriptsDir, scriptName);
    
    fs.writeFileSync(scriptPath, scriptTemplate(collection), 'utf8');
    console.log(`Script criado: ${scriptPath}`);
});

console.log('\nTodos os scripts foram gerados com sucesso!');
console.log('Para executar um script, use: node scripts/nome-do-script.js');
