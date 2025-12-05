const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos
const projectsPath = path.join(__dirname, 'apresentacao', 'projects');
const etapasPath = path.join(__dirname, 'apresentacao', 'consolidado_etapas.json');
const outputPath = path.join(__dirname, 'apresentacao', 'projects_atualizado');

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

// Função para mapear os campos de etapas para o formato desejado
function mapearEtapas(etapa) {
    if (!etapa) return {};
    
    return {
        etapas: {
            estudos: {
                situacao: etapa.estudos_situacao,
                status: etapa.estudos_status,
                stage: etapa.estudos_stage,
                theme: etapa.estudos_theme
            },
            contrato: {
                situacao: etapa.contrato_situacao,
                status: etapa.contrato_status,
                stage: etapa.contrato_stage,
                theme: etapa.contrato_theme
            },
            licitacao: {
                situacao: etapa.licitacao_situacao,
                status: etapa.licitacao_status,
                stage: etapa.licitacao_stage,
                theme: etapa.licitacao_theme
            },
            edital: {
                situacao: etapa.edital_situacao,
                status: etapa.edital_status,
                stage: etapa.edital_stage,
                theme: etapa.edital_theme
            },
            tcu: {
                situacao: etapa.tcu_situacao,
                status: etapa.tcu_status,
                stage: etapa.tcu_stage,
                theme: etapa.tcu_theme
            }
        }
    };
}

// Ler os arquivos
console.log('Lendo arquivos...');
const projects = readJsonFile(projectsPath);
const etapas = readJsonFile(etapasPath);

// Combinar os dados
console.log('Combinando dados...');
const projetosAtualizados = projects.map(projeto => {
    const etapa = etapas[projeto.sourceId];
    if (etapa) {
        // Adicionar as etapas ao projeto
        return {
            ...projeto,
            ...mapearEtapas(etapa)
        };
    }
    return projeto; // Manter o projeto inalterado se não houver correspondência
});

// Salvar o resultado
console.log('Salvando resultado...');
saveJsonFile(outputPath, projetosAtualizados);

console.log('Processo concluído!');
