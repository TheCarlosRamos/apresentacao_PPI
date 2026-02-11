// Função para testar e salvar imagens localmente
async function testAndSaveMapImages() {
    console.log('🧪 Iniciando teste de geração de imagens...');
    
    // Criar diretório de testes (simulado)
    const testResults = [];
    
    // Testar com os primeiros 3 projetos
    for (let i = 0; i < Math.min(3, projectData.length); i++) {
        const project = projectData[i];
        console.log(`\n📍 Testando projeto: ${project.name}`);
        
        try {
            // Testar 1: Google Maps Static API
            if (project.coordinates) {
                const lat = parseFloat(project.coordinates.lat);
                const lng = parseFloat(project.coordinates.lng);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x256&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg`;
                    
                    console.log(`🔗 URL do mapa: ${mapUrl}`);
                    
                    // Criar imagem para teste
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    const testResult = {
                        project: project.name,
                        coordinates: project.coordinates,
                        mapUrl: mapUrl,
                        success: false,
                        error: null,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Testar se a imagem carrega
                    await new Promise((resolve) => {
                        img.onload = () => {
                            console.log(`✅ Imagem carregou com sucesso: ${img.width}x${img.height}`);
                            testResult.success = true;
                            testResult.width = img.width;
                            testResult.height = img.height;
                            
                            // Criar canvas para salvar
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            
                            // Converter para blob e criar link de download
                            canvas.toBlob((blob) => {
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `mapa_${project.id}_test.png`;
                                a.click();
                                URL.revokeObjectURL(url);
                                console.log(`💾 Imagem salva: mapa_${project.id}_test.png`);
                            });
                            
                            resolve();
                        };
                        
                        img.onerror = () => {
                            console.error(`❌ Erro ao carregar imagem do mapa`);
                            testResult.error = 'Erro ao carregar imagem';
                            resolve();
                        };
                        
                        img.src = mapUrl;
                    });
                    
                    testResults.push(testResult);
                }
            }
            
            // Testar 2: Verificar snapshots existentes
            const snapshot = window.modalSnapshots ? window.modalSnapshots.get(project.id) : null;
            if (snapshot) {
                console.log(`📸 Snapshot encontrado:`, snapshot);
                testResults.push({
                    project: project.name,
                    type: 'snapshot',
                    hasMapImage: !!snapshot.mapImage,
                    hasMapHTML: !!snapshot.mapHTML,
                    timestamp: snapshot.timestamp
                });
            }
            
        } catch (error) {
            console.error(`❌ Erro no teste do projeto ${project.name}:`, error);
            testResults.push({
                project: project.name,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Salvar resultados do teste
    console.log('\n📊 RESULTADOS DO TESTE:');
    console.table(testResults);
    
    // Criar arquivo de relatório
    const reportData = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        testResults: testResults,
        totalSnapshots: window.modalSnapshots ? window.modalSnapshots.size : 0,
        html2canvasLoaded: typeof html2canvas !== 'undefined',
        jsPDLoaded: typeof window.jspdf !== 'undefined'
    };
    
    // Download do relatório
    const reportBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const reportUrl = URL.createObjectURL(reportBlob);
    const reportLink = document.createElement('a');
    reportLink.href = reportUrl;
    reportLink.download = `map_test_report_${Date.now()}.json`;
    reportLink.click();
    URL.revokeObjectURL(reportUrl);
    
    console.log('📄 Relatório de teste salvo!');
    
    return testResults;
}

// Função para verificar dependências
function checkDependencies() {
    console.log('\n🔍 VERIFICANDO DEPENDÊNCIAS:');
    
    const checks = [
        { name: 'html2canvas', loaded: typeof html2canvas !== 'undefined' },
        { name: 'jsPDF', loaded: typeof window.jspdf !== 'undefined' },
        { name: 'window.modalSnapshots', loaded: !!window.modalSnapshots },
        { name: 'projectData', loaded: !!projectData && projectData.length > 0 }
    ];
    
    console.table(checks);
    
    // Verificar se scripts foram carregados
    const scripts = document.querySelectorAll('script');
    const relevantScripts = Array.from(scripts).filter(script => 
        script.src.includes('html2canvas') || 
        script.src.includes('jspdf') || 
        script.src.includes('export_functions')
    );
    
    console.log('📜 Scripts carregados:', relevantScripts.map(s => s.src));
    
    return checks;
}

// Adicionar funções ao escopo global
window.testAndSaveMapImages = testAndSaveMapImages;
window.checkDependencies = checkDependencies;

// Botão de teste
function addTestButton() {
    const header = document.querySelector('header .flex.items-center.justify-between');
    if (header && !document.getElementById('btnTestMaps')) {
        const testBtn = document.createElement('button');
        testBtn.id = 'btnTestMaps';
        testBtn.className = 'inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md text-sm transition-colors';
        testBtn.innerHTML = '<i class="fas fa-vial"></i> Testar Mapas';
        testBtn.onclick = testAndSaveMapImages;
        
        const container = header.querySelector('.flex.items-center.gap-2');
        if (container) {
            container.appendChild(testBtn);
        }
    }
}

// Adicionar botão quando a página carregar
setTimeout(addTestButton, 5000);

console.log('🧪 Funções de teste carregadas!');
console.log('💡 Use testAndSaveMapImages() para testar');
console.log('💡 Use checkDependencies() para verificar dependências');
