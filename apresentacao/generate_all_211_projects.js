const fs = require('fs');

// Ler todos os arquivos de dados
function loadAllData() {
    const projects = {};
    
    try {
        // Carregar projects.json (dados principais)
        const projectsJson = JSON.parse(fs.readFileSync('../data/projects.json', 'utf8'));
        projectsJson.forEach(project => {
            projects[project.id] = {
                id: project.id,
                sector: project.sector,
                name: project.name,
                status: project.status,
                statusColor: project.statusColor,
                description: project.details?.description || '',
                currentSituation: project.details?.currentSituation || '',
                nextSteps: project.details?.nextSteps || '',
                risks: project.details?.risks || [],
                timeline: project.details?.timeline || [],
                timelineHTML: '' // Será preenchido depois
            };
        });
        
        // Carregar projetos_descricao.json (descrições detalhadas)
        try {
            const descricoes = JSON.parse(fs.readFileSync('../projetos_descricao.json', 'utf8'));
            descricoes.forEach(proj => {
                if (proj.sourceId && projects[proj.sourceId]) {
                    projects[proj.sourceId].description = proj.description || projects[proj.sourceId].description;
                    if (proj.rawData?.GPSCoordinates?.length > 0) {
                        const coords = proj.rawData.GPSCoordinates[0].location;
                        if (coords && coords.x && coords.y) {
                            projects[proj.sourceId].coordinates = {
                                lat: parseFloat(coords.y),
                                lng: parseFloat(coords.x)
                            };
                        }
                    }
                }
            });
        } catch (e) {
            console.log('Arquivo projetos_descricao.json não encontrado');
        }
        
        // Carregar consolidado_etapas_with_names.json (etapas/timeline com nomes)
        const consolidado = JSON.parse(fs.readFileSync('consolidado_etapas_with_names.json', 'utf8'));
        
        // Processar dados do consolidado
        Object.entries(consolidado).forEach(([guid, data]) => {
            const projectName = data.nome_projeto || guid;
            
            // Criar timeline baseada nas etapas
            const timeline = [];
            const etapas = [
                { key: 'estudos', name: 'Estudos', situacao: data.estudos_situacao },
                { key: 'consulta', name: 'Consulta Pública', situacao: data.consulta_situacao },
                { key: 'tcu', name: 'TCU', situacao: data.tcu_situacao },
                { key: 'edital', name: 'Edital', situacao: data.edital_situacao },
                { key: 'licitacao', name: 'Leilão', situacao: data.licitacao_situacao },
                { key: 'contrato', name: 'Contrato', situacao: data.contrato_situacao }
            ];
            
            // Encontrar o último índice concluído
            let lastCompletedIndex = -1;
            etapas.forEach((etapa, index) => {
                if (etapa.situacao === 'completo') {
                    lastCompletedIndex = index;
                }
            });
            
            // Gerar timeline com estilo igual ao apresentacao.html
            let progressWidth = '0%';
            if (lastCompletedIndex >= 0) {
                progressWidth = `${((lastCompletedIndex + 1) / etapas.length) * 100}%`;
            }
            
            const timelineHTML = `
                <div class="phase-timeline phase-timeline--compact">
                    <div class="phase-line"></div>
                    <div class="phase-line-completed" style="width: ${progressWidth}"></div>
                    <div class="phase-items">
                        ${etapas.map((etapa, index) => {
                            let statusClass = '';
                            let statusIcon = '';
                            
                            if (index <= lastCompletedIndex) {
                                statusClass = 'completed';
                                statusIcon = '✓';
                            } else if (etapa.situacao === 'em_andamento') {
                                statusClass = 'current';
                                statusIcon = '◐';
                            } else {
                                statusIcon = '○';
                            }
                            
                            return `
                                <div class="phase-item">
                                    <div class="phase-dot ${statusClass}">
                                        ${statusIcon}
                                    </div>
                                    <div class="phase-label ${statusClass}">
                                        <span style="font-weight: 500;">${etapa.name}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            
            // Determinar status baseado no progresso
            let status = 'Em Planejamento';
            let statusColor = 'bg-yellow-500';
            
            if (data.contrato_situacao === 'completo') {
                status = 'Contrato Assinado';
                statusColor = 'bg-green-500';
            } else if (data.licitacao_situacao === 'completo') {
                status = 'Leilão Realizado';
                statusColor = 'bg-green-500';
            } else if (data.edital_situacao === 'completo') {
                status = 'Edital Publicado';
                statusColor = 'bg-blue-500';
            } else if (data.tcu_situacao === 'completo') {
                status = 'Em Análise no TCU';
                statusColor = 'bg-yellow-500';
            } else if (data.consulta_situacao === 'completo' || data.estudos_situacao === 'completo') {
                status = 'Em Andamento';
                statusColor = 'bg-blue-500';
            }
            
            // Adicionar projeto se não existir ou atualizar existente
            if (!projects[guid]) {
                projects[guid] = {
                    id: guid,
                    sector: 'Outros',
                    name: projectName,
                    status: status,
                    statusColor: statusColor,
                    description: 'Projeto do Programa de Parcerias de Investimentos',
                    currentSituation: 'Em andamento',
                    nextSteps: 'Aguardando próximas etapas do processo',
                    risks: ['Riscos em análise'],
                    timelineHTML: timelineHTML
                };
            } else {
                // Atualizar dados existentes com a timeline
                projects[guid].timelineHTML = timelineHTML;
                projects[guid].status = status;
                projects[guid].statusColor = statusColor;
            }
        });
        
        // Garantir que todos os projetos tenham timelineHTML
        Object.keys(projects).forEach(key => {
            if (!projects[key].timelineHTML) {
                // Criar timeline padrão para projetos sem dados no consolidado
                const etapas = ['Estudos', 'Consulta Pública', 'TCU', 'Edital', 'Leilão', 'Contrato'];
                const timelineHTML = `
                    <div class="phase-timeline phase-timeline--compact">
                        <div class="phase-line"></div>
                        <div class="phase-line-completed" style="width: 0%"></div>
                        <div class="phase-items">
                            ${etapas.map(etapa => `
                                <div class="phase-item">
                                    <div class="phase-dot">
                                        ○
                                    </div>
                                    <div class="phase-label">
                                        <span style="font-weight: 500;">${etapa}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                projects[key].timelineHTML = timelineHTML;
            }
        });
        
        return Object.values(projects);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return [];
    }
}

function getStatusClass(statusColor) {
    if (statusColor.includes('green')) return 'status-completed';
    if (statusColor.includes('yellow')) return 'status-pending';
    if (statusColor.includes('blue')) return 'status-in-progress';
    return 'status-pending';
}

// Gerar coordenadas aproximadas baseadas no nome do projeto
function generateCoordinates(projectName, sector) {
    // Coordenadas aproximadas para algumas cidades/estados brasileiros
    const cityCoordinates = {
        'São Paulo': { lat: -23.5505, lng: -46.6333 },
        'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
        'Brasília': { lat: -15.8267, lng: -47.9218 },
        'Salvador': { lat: -12.9714, lng: -38.5014 },
        'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
        'Recife': { lat: -8.0476, lng: -34.8770 },
        'Fortaleza': { lat: -3.7319, lng: -38.5267 },
        'Belém': { lat: -1.4558, lng: -48.4902 },
        'Curitiba': { lat: -25.4284, lng: -49.2733 },
        'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
        'Manaus': { lat: -3.1190, lng: -60.0217 },
        'Goiânia': { lat: -16.6864, lng: -49.2643 }
    };
    
    // Mapeamento de setores para coordenadas padrão
    const sectorCoordinates = {
        'Portos': { lat: -23.965, lng: -46.302 }, // Santos
        'Rodovias': { lat: -19.9167, lng: -43.9345 }, // Belo Horizonte
        'Ferrovias': { lat: -12.727, lng: -45.896 }, // FIOL
        'Energia': { lat: -15.8267, lng: -47.9218 }, // Brasília
        'Óleo e Gás': { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
        'Hidrovias': { lat: -3.7319, lng: -38.5267 }, // Fortaleza
        'Aeroportos': { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
        'Saneamento': { lat: -23.5505, lng: -46.6333 }, // São Paulo
        'Outros': { lat: -15.8267, lng: -47.9218 } // Brasília
    };
    
    // Tentar encontrar cidade no nome do projeto
    for (const [city, coords] of Object.entries(cityCoordinates)) {
        if (projectName.toLowerCase().includes(city.toLowerCase())) {
            return coords;
        }
    }
    
    // Retornar coordenadas do setor
    return sectorCoordinates[sector] || sectorCoordinates['Outros'];
}

function generateProjectCard(project) {
    const coords = project.coordinates || generateCoordinates(project.name, project.sector);
    const statusClass = getStatusClass(project.statusColor);
    
    return `
        <!-- Card ${project.name} -->
        <div class="card">
            <div class="card-header">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">${project.sector}</p>
                        <h2 style="color: #1f2937; font-size: 20px; margin: 0; font-weight: 700;">${project.name}</h2>
                    </div>
                    <span class="status-badge ${statusClass}">${project.status}</span>
                </div>
            </div>
            
            <div class="project-info-grid">
                <!-- Descrição -->
                <div class="info-card card--descricao">
                    <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="color: #3b82f6; font-weight: bold;">•</span>
                        Descrição
                    </h3>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">${project.description}</p>
                </div>
                
                <!-- Situação Atual -->
                <div class="info-card card--situacao">
                    <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="color: #10b981; font-weight: bold;">•</span>
                        Situação Atual
                    </h3>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">${project.currentSituation}</p>
                </div>
                
                <!-- Mapa -->
                <div class="info-card card--mapa">
                    <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="color: #ef4444; font-weight: bold;">•</span>
                        Localização
                    </h3>
                    <div style="height: 200px; width: 100%; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameborder="0" 
                            scrolling="no" 
                            marginheight="0" 
                            marginwidth="0" 
                            src="https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed">
                        </iframe>
                    </div>
                    <p style="color: #6b7280; font-size: 12px; margin-top: 8px;">Coordenadas: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}</p>
                </div>
                
                <!-- Próximos Passos -->
                <div class="info-card card--deliberacao">
                    <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="color: #f59e0b; font-weight: bold;">•</span>
                        Próximos Passos
                    </h3>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">${project.nextSteps}</p>
                </div>
                
                <!-- Pontos de Atenção -->
                <div class="info-card card--riscos">
                    <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="color: #dc2626; font-weight: bold;">•</span>
                        Pontos de Atenção
                    </h3>
                    <ul>
                        ${project.risks.map(risk => `<li>${risk}</li>`).join('')}
                    </ul>
                </div>
                
                <!-- ETAPA -->
                <div class="info-card card--progresso">
                    <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        <span style="color: #8b5cf6; font-weight: bold;">•</span>
                        ETAPA
                    </h3>
                    ${project.timelineHTML || '<p style="color: #6b7280; text-align: center;">Timeline não disponível</p>'}
                </div>
            </div>
        </div>
    `;
}

// Gerar HTML completo
function generateCompleteHTML() {
    const allProjects = loadAllData();
    
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Projetos PPI - Todos os 211 Projetos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            color: #6b7280;
            margin: 5px 0 0 0;
            font-size: 14px;
        }
        .card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            padding: 20px;
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .card-header {
            margin-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 12px;
        }
        
        /* Grid de informações completo igual ao modal */
        .project-info-grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: 2fr 1fr 1fr;
            grid-auto-rows: auto;
            grid-template-areas: 
                'descricao situacao mapa' 
                'descricao deliberacao riscos' 
                'progresso progresso progresso';
            margin-top: 20px;
        }
        
        .card--descricao {
            grid-area: descricao;
        }
        
        .card--situacao {
            grid-area: situacao;
        }
        
        .card--mapa {
            grid-area: mapa;
        }
        
        .card--deliberacao {
            grid-area: deliberacao;
        }
        
        .card--riscos {
            grid-area: riscos;
        }
        
        .card--progresso {
            grid-area: progresso;
        }
        
        .info-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .info-card h3 {
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .info-card p {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
        }
        
        .info-card ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .info-card li {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 8px;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-completed {
            background-color: #dcfce7;
            color: #166534;
        }
        
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        
        .status-in-progress {
            background-color: #dbeafe;
            color: #1e40af;
        }
        
        /* Timeline de Etapas - Estilo igual ao apresentacao.html */
        .phase-timeline {
            position: relative;
            margin: 2rem 0;
            padding: 0 1rem;
        }
        
        .phase-timeline--compact {
            margin: 1rem 0;
        }
        
        .phase-line {
            position: absolute;
            top: 16px;
            left: 0;
            right: 0;
            height: 4px;
            background-color: #e5e7eb;
            border-radius: 2px;
        }
        
        .phase-line-completed {
            position: absolute;
            top: 16px;
            left: 0;
            height: 4px;
            background-color: #10B981;
            border-radius: 2px;
            transition: width 0.3s ease;
        }
        
        .phase-items {
            display: flex;
            justify-content: space-between;
            position: relative;
            z-index: 1;
        }
        
        .phase-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            min-width: 100px;
        }
        
        .phase-dot {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #e5e7eb;
            border: 3px solid white;
            position: relative;
            z-index: 2;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #6b7280;
        }
        
        .phase-dot.completed {
            background-color: #10B981 !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
            color: white;
        }
        
        .phase-dot.current {
            background-color: #6B7280 !important;
            box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.3);
            transform: scale(1.2);
        }
        
        .phase-label {
            margin-top: 0.5rem;
            font-size: 0.75rem;
            text-align: center;
            color: #6B7280;
            font-weight: 500;
            transition: color 0.3s ease;
        }
        
        .phase-label.completed {
            color: #10B981;
            font-weight: 600;
        }
        
        .phase-label.current {
            color: #4B5563;
            font-weight: 700;
        }
        
        @media print {
            body { background: white; }
            .card { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório de Projetos PPI</h1>
        <p>Programa de Parcerias de Investimentos - Todos os ${allProjects.length} projetos com informações completas</p>
    </div>
    
    <div class="container">
        ${allProjects.map(project => generateProjectCard(project)).join('\n\n')}
    </div>
</body>
</html>`;

    fs.writeFileSync('projetos_ppi_mapas_google_all_211_projects.html', htmlContent);
    console.log(`HTML gerado com sucesso!`);
    console.log(`Total de projetos: ${allProjects.length}`);
    
    // Salvar também apenas os cards para facilitar edição
    const cardsHTML = allProjects.map(project => generateProjectCard(project)).join('\n\n');
    fs.writeFileSync('all_211_projects_cards.html', cardsHTML);
    console.log('Cards salvos em all_211_projects_cards.html');
}

// Executar
generateCompleteHTML();
