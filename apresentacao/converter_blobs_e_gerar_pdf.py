#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import requests
import base64

def converter_blobs_para_imagens():
    """Converte blobs em imagens reais e gera PDF"""
    
    print("🔄 CONVERTENDO BLOBS PARA IMAGENS REAIS...")
    
    # Carregar JSON de imagens
    try:
        with open('informacoes_imagens.json', 'r', encoding='utf-8') as f:
            image_data = json.load(f)
        print(f"📊 Carregadas {image_data['total']} imagens do JSON")
    except FileNotFoundError:
        print("❌ Arquivo 'informacoes_imagens.json' não encontrado!")
        return
    
    # Criar pasta para imagens
    os.makedirs('imagens_mapas', exist_ok=True)
    
    # Converter cada blob para imagem
    imagens_convertidas = []
    
    for i, img in enumerate(image_data['images']):
        print(f"🔄 Processando {i+1}/{len(image_data['images'])}: {img['projectName']}")
        
        if img['imageUrl'].startswith('blob:'):
            # Tentar baixar do servidor local
            blob_url = img['imageUrl']
            
            try:
                # Fazer requisição para o blob
                response = requests.get(blob_url, timeout=10)
                
                if response.status_code == 200:
                    # Salvar imagem
                    filename = f"imagens_mapas/{img['filename']}"
                    with open(filename, 'wb') as f:
                        f.write(response.content)
                    
                    # Converter para base64
                    img_base64 = base64.b64encode(response.content).decode('utf-8')
                    
                    imagens_convertidas.append({
                        'projectId': img['projectId'],
                        'projectName': img['projectName'],
                        'filename': img['filename'],
                        'base64': img_base64,
                        'localPath': filename
                    })
                    
                    print(f"✅ Convertido: {img['filename']}")
                else:
                    print(f"❌ Erro ao baixar {blob_url}: {response.status_code}")
                    imagens_convertidas.append({
                        'projectId': img['projectId'],
                        'projectName': img['projectName'],
                        'filename': img['filename'],
                        'base64': None,
                        'localPath': None
                    })
                    
            except Exception as e:
                print(f"❌ Erro ao processar {img['projectName']}: {e}")
                imagens_convertidas.append({
                    'projectId': img['projectId'],
                    'projectName': img['projectName'],
                    'filename': img['filename'],
                    'base64': None,
                    'localPath': None
                })
        else:
            print(f"⚠️ Não é blob: {img['imageUrl']}")
    
    # Salvar JSON com imagens convertidas
    with open('imagens_convertidas.json', 'w', encoding='utf-8') as f:
        json.dump({
            'total': len(imagens_convertidas),
            'images': imagens_convertidas
        }, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Conversão concluída! {len([img for img in imagens_convertidas if img['base64']])} imagens convertidas")
    
    # Gerar HTML com imagens base64
    gerar_html_com_imagens(imagens_convertidas)

def gerar_html_com_imagens(imagens_convertidas):
    """Gera HTML com imagens base64 embutidas"""
    
    print("📄 GERANDO HTML COM IMAGENS EMBUTIDAS...")
    
    # Carregar HTML dos projetos
    try:
        with open('apresentacao.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print("❌ Arquivo 'apresentacao.html' não encontrado!")
        return
    
    # Criar mapa de imagens
    image_map = {}
    for img in imagens_convertidas:
        image_map[img['projectId']] = img
    
    # Gerar HTML para cada projeto
    projects_html = []
    
    for img in imagens_convertidas:
        project_name = img['projectName']
        
        # Gerar HTML da imagem
        if img['base64']:
            img_html = f'<img src="data:image/png;base64,{img["base64"]}" alt="Mapa do Projeto" style="max-width: 100%; max-height: 256px; border-radius: 8px;" />'
        else:
            img_html = '<div style="text-align: center; padding: 20px; color: #6b7280; background-color: #f3f4f6; border-radius: 8px;">Imagem não disponível</div>'
        
        project_html = f"""
        <div class="card" style="page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #e5e7eb; padding: 20px; font-family: Arial, sans-serif; background: white;">
            <div class="card-header">
                <h2 style="color: #1f2937; font-size: 20px; margin: 0;">{project_name}</h2>
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
                        {img_html}
                    </div>
                </div>
            </div>
        </div>
        """
        
        projects_html.append(project_html)
    
    # Gerar HTML completo
    full_html = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório de Projetos PPI - Mapas</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            .header h1 {{
                color: #1f2937;
                margin: 0;
                font-size: 24px;
            }}
            .header p {{
                color: #6b7280;
                margin: 5px 0 0 0;
                font-size: 14px;
            }}
            .card {{
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
                padding: 20px;
                margin-bottom: 20px;
                page-break-inside: avoid;
            }}
            .card-header {{
                margin-bottom: 16px;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 12px;
            }}
            .card-content {{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }}
            .section {{
                margin-bottom: 16px;
            }}
            .section h3 {{
                color: #1f2937;
                font-size: 16px;
                margin-bottom: 8px;
            }}
            .section p {{
                color: #4b5563;
                font-size: 14px;
                line-height: 1.5;
            }}
            .map-container {{
                text-align: center;
            }}
            .map-container img {{
                max-width: 100%;
                max-height: 256px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }}
            @media print {{
                body {{ background: white; }}
                .card {{ page-break-inside: avoid; }}
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Relatório de Projetos PPI</h1>
            <p>Programa de Parcerias de Investimentos - {len(projects_html)} projetos com mapas</p>
        </div>
        
        <div class="container">
            {''.join(projects_html)}
        </div>
    </body>
    </html>
    """
    
    # Salvar HTML
    with open('projetos_ppi_mapas_final.html', 'w', encoding='utf-8') as f:
        f.write(full_html)
    
    print("✅ HTML gerado: projetos_ppi_mapas_final.html")
    print(f"📊 Total de projetos: {len(projects_html)}")
    print(f"📊 Imagens convertidas: {len([img for img in imagens_convertidas if img['base64']])}")
    print("🎯 ABRA o arquivo 'projetos_ppi_mapas_final.html' no navegador e imprima para PDF!")

if __name__ == "__main__":
    print("🚨 ATENÇÃO: Este script precisa que a aplicação esteja RODANDO!")
    print("📱 Certifique-se de que o servidor local está ativo em http://127.0.0.1:5507")
    print()
    
    resposta = input("A aplicação está rodando? (s/n): ")
    if resposta.lower() == 's':
        converter_blobs_para_imagens()
    else:
        print("❌ Inicie a aplicação primeiro e execute este script novamente!")
