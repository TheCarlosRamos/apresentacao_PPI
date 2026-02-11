// CONVERSOR DE BLOBS PARA IMAGENS - RODA NO NAVEGADOR
// Execute este script no console do navegador com a aplicação aberta

async function converterBlobsParaImagens() {
    console.log('🔄 CONVERTENDO BLOBS PARA IMAGENS...');
    
    try {
        // Carregar JSON
        const response = await fetch('informacoes_imagens.json');
        const image_data = await response.json();
        
        console.log(`📊 Carregadas ${image_data.total} imagens do JSON`);
        
        // Criar pasta virtual de imagens
        const imagens_convertidas = [];
        
        for (let i = 0; i < image_data.images.length; i++) {
            const img = image_data.images[i];
            console.log(`🔄 Processando ${i+1}/${image_data.images.length}: ${img.projectName}`);
            
            try {
                if (img.imageUrl.startsWith('blob:')) {
                    // Converter blob para base64
                    const blob_response = await fetch(img.imageUrl);
                    const blob = await blob_response.blob();
                    
                    // Converter para base64
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    
                    imagens_convertidas.push({
                        projectId: img.projectId,
                        projectName: img.projectName,
                        filename: img.filename,
                        base64: base64,
                        localPath: img.filename
                    });
                    
                    console.log(`✅ Convertido: ${img.filename}`);
                } else {
                    console.log(`⚠️ Não é blob: ${img.imageUrl}`);
                    imagens_convertidas.push({
                        projectId: img.projectId,
                        projectName: img.projectName,
                        filename: img.filename,
                        base64: null,
                        localPath: null
                    });
                }
            } catch (error) {
                console.error(`❌ Erro ao processar ${img.projectName}:`, error);
                imagens_convertidas.push({
                    projectId: img.projectId,
                    projectName: img.projectName,
                    filename: img.filename,
                    base64: null,
                    localPath: null
                });
            }
        }
        
        console.log(`✅ Conversão concluída! ${imagens_convertidas.filter(img => img.base64).length} imagens convertidas`);
        
        // Salvar JSON com imagens convertidas
        const json_data = {
            total: imagens_convertidas.length,
            images: imagens_convertidas
        };
        
        // Criar download do JSON
        const blob = new Blob([JSON.stringify(json_data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'imagens_convertidas.json';
        a.click();
        URL.revokeObjectURL(url);
        
        // Gerar HTML com imagens base64
        gerarHTMLComImagens(imagens_convertidas);
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

function gerarHTMLComImagens(imagens_convertidas) {
    console.log('📄 GERANDO HTML COM IMAGENS EMBUTIDAS...');
    
    let projects_html = '';
    
    imagens_convertidas.forEach(img => {
        const project_name = img.projectName;
        
        // Gerar HTML da imagem
        let img_html;
        if (img.base64) {
            img_html = `<img src="${img.base64}" alt="Mapa do Projeto" style="max-width: 100%; max-height: 256px; border-radius: 8px;" />`;
        } else {
            img_html = '<div style="text-align: center; padding: 20px; color: #6b7280; background-color: #f3f4f6; border-radius: 8px;">Imagem não disponível</div>';
        }
        
        const project_html = `
        <div class="card" style="page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #e5e7eb; padding: 20px; font-family: Arial, sans-serif; background: white;">
            <div class="card-header">
                <h2 style="color: #1f2937; font-size: 20px; margin: 0;">${project_name}</h2>
                <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Projeto PPI</p>
            </div>
            
            <div class="card-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="section">
                    <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 8px;">Descrição</h3>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Projeto localizado no Brasil, parte do Programa de Parcerias de Investimentos.</p>
                </div>
                
                <div class="section">
                    <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 8px;">Localização</h3>
                    <div style="text-align: center;">
                        ${img_html}
                    </div>
                </div>
            </div>
        </div>
        `;
        
        projects_html += project_html;
    });
    
    const full_html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório de Projetos PPI - Mapas</title>
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
            .card-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            .section {
                margin-bottom: 16px;
            }
            .section h3 {
                color: #1f2937;
                font-size: 16px;
                margin-bottom: 8px;
            }
            .section p {
                color: #4b5563;
                font-size: 14px;
                line-height: 1.5;
            }
            .map-container {
                text-align: center;
            }
            .map-container img {
                max-width: 100%;
                max-height: 256px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
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
            <p>Programa de Parcerias de Investimentos - ${imagens_convertidas.length} projetos com mapas</p>
        </div>
        
        <div class="container">
            ${projects_html}
        </div>
    </body>
    </html>
    `;
    
    // Criar download do HTML
    const html_blob = new Blob([full_html], { type: 'text/html' });
    const html_url = URL.createObjectURL(html_blob);
    const html_a = document.createElement('a');
    html_a.href = html_url;
    html_a.download = 'projetos_ppi_mapas_final.html';
    html_a.click();
    URL.revokeObjectURL(html_url);
    
    console.log('✅ HTML gerado: projetos_ppi_mapas_final.html');
    console.log(`📊 Total de projetos: ${imagens_convertidas.length}`);
    console.log(`📊 Imagens convertidas: ${imagens_convertidas.filter(img => img.base64).length}`);
    console.log('🎯 ABRA o arquivo HTML no navegador e imprima para PDF!');
}

// EXECUTAR A CONVERSÃO
console.log('🚀 Iniciando conversão de blobs...');
converterBlobsParaImagens();
