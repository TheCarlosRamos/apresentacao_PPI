const fs = require('fs');
const { parse } = require('csv-parse/sync');
const newman = require('newman');
const path = require('path');

// Configurações
const CSV_FILE = 'guids_com_nome.csv';
const COLLECTIONS = [
  'Consulta Publica.postman_collection.json',
  'Estudos.postman_collection.json',
  'Situação do contrato (contrato).postman_collection.json',
  'Status da fase aviso de licitação (Edital).postman_collection.json',
  'Status da fase Licitação (leilão).postman_collection.json',
  'Status do controle externo (TCU).postman_collection.json'
];

// Lê o arquivo CSV
function readGuids() {
  try {
    const fileContent = fs.readFileSync(CSV_FILE, 'utf8');
    // Remove a primeira linha (cabeçalho) e linhas vazias, depois mapeia para um array de GUIDs
    return fileContent
      .split('\n')
      .slice(1) // Remove o cabeçalho
      .map(line => line.trim())
      .filter(Boolean); // Remove linhas vazias
  } catch (error) {
    console.error('Erro ao ler o arquivo de GUIDs:', error);
    process.exit(1);
  }
}

// Executa uma coleção do Postman para um GUID específico
async function runCollection(collectionFile, guid) {
  return new Promise((resolve, reject) => {
    const run = newman.run({
      collection: require(`./${collectionFile}`),
      reporters: 'cli',
      envVar: [
        {
          key: 'var',
          value: guid
        }
      ]
    }, (err) => {
      if (err) {
        console.error(`Erro ao executar a coleção ${collectionFile} para o GUID ${guid}:`, err);
        return reject(err);
      }
      resolve();
    });

    run.on('request', (error, args) => {
      if (error) {
        console.error("Erro na requisição:", error);
        return;
      }

      const response = args.response;
      if (response) {
        const body = response.stream.toString();
        // Sanitiza o nome do arquivo
        const safeCollectionName = path.parse(collectionFile).name.replace(/[^a-z0-9]/gi, '_');
        const fileName = `${guid}-${safeCollectionName}.json`;
        const filePath = path.join('output', fileName);

        try {
          // Tenta formatar se for JSON válido
          const jsonBody = JSON.parse(body);
          fs.writeFileSync(filePath, JSON.stringify(jsonBody, null, 2));
        } catch (e) {
          // Se não for JSON, salva como texto
          fs.writeFileSync(filePath, body);
        }
        console.log(`Salvo: ${filePath}`);
      }
    });
  });
}

// Função principal
async function main() {
  const guids = readGuids();
  console.log(`Encontrados ${guids.length} GUIDs para processar`);

  // Cria o diretório de saída se não existir
  const outputDir = 'output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Para cada GUID, executa todas as coleções
  for (const guid of guids) {
    console.log(`\nProcessando GUID: ${guid}`);

    for (const collection of COLLECTIONS) {
      try {
        console.log(`  Executando coleção: ${collection}`);
        await runCollection(collection, guid);
      } catch (error) {
        console.error(`Erro ao processar GUID ${guid} na coleção ${collection}:`, error);
      }
    }
  }

  console.log('\nProcessamento concluído!');
}

// Executa o script
main().catch(console.error);
