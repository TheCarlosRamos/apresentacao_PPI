const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const projetosPath = path.join(__dirname, 'projetos_descricao.json');
const etapasPath = path.join(__dirname, 'apresentacao', 'consolidado_etapas.json');
const outputPath = path.join(__dirname, 'projetos_com_etapas.json');

// Função para ler um arquivo JSON
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erro ao ler o arquivo ${filePath}:`, error);
        process.exit(1);
    }
}

// Função para salvar um arquivo JSON
function saveJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Arquivo salvo com sucesso em: ${filePath}`);
    } catch (error) {
        console.error(`Erro ao salvar o arquivo ${filePath}:`, error);
        process.exit(1);
    }
}

// Ler os arquivos
console.log('Lendo arquivos...');
const projetos = readJsonFile(projetosPath);
const etapas = readJsonFile(etapasPath);

// Combinar os dados
console.log('Combinando dados...');
const projetosAtualizados = projetos.map(projeto => {
    const etapa = etapas[projeto.guid];
    if (etapa) {
        // Adicionar os campos de etapas ao projeto
        return {
            ...projeto,
            ...etapa
        };
    }
    return projeto; // Manter o projeto inalterado se não houver correspondência
});

// Salvar o resultado
console.log('Salvando resultado...');
saveJsonFile(outputPath, projetosAtualizados);

console.log('Processo concluído!');
