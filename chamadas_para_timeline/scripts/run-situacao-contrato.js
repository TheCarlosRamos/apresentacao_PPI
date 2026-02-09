const fs = require('fs');
const newman = require('newman');

// Lê o arquivo de GUIDs
function readGuids() {
    try {
        const fileContent = fs.readFileSync('../guids_com_nome.csv', 'utf8');
        // Remove a primeira linha (cabeçalho) e linhas vazias
        return fileContent
            .split('\n')
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
            collection: '../Situação do contrato (contrato).postman_collection.json',
            reporters: 'cli',
            envVar: [
                {
                    key: 'guid',
                    value: guid
                }
            ]
        }, (err) => {
            if (err) {
                console.error(`Erro ao processar GUID ${guid}:`, err);
                return resolve();
            }
            console.log(`Concluído para GUID: ${guid}`);
            resolve();
        });
    });
}

// Função principal
async function main() {
    const guids = readGuids();
    console.log(`Iniciando processamento de ${guids.length} GUIDs...`);
    
    for (const guid of guids) {
        console.log(`\nProcessando GUID: ${guid}`);
        await runCollection(guid);
    }
    
    console.log('\nProcessamento concluído!');
}

main().catch(console.error);
