#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para integrar dados de timeline do timeline.html no apresentacao.html
"""

import json
import re
import os

# Paths
timeline_path = r"apresentacao\timeline.html"
apresentacao_path = r"apresentacao\apresentacao.html"

def extract_timeline_data():
    """Extrai os dados de timeline do timeline.html"""
    print("Extraindo dados de timeline...")
    
    with open(timeline_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Procura pelo objeto allProjects
    match = re.search(r'const allProjects = \{(.*?)\};', content, re.DOTALL)
    if not match:
        print("❌ Não conseguiu encontrar allProjects")
        return {}
    
    # Extrai o conteúdo do objeto
    obj_content = '{' + match.group(1) + '}'
    
    # Usa uma abordagem de regex mais robusta
    projects = {}
    
    # Procura por padrões como "guid": "valor" 
    pattern = r'"([a-f0-9\-]{36})"\s*:\s*\{([^}]*?"guid"[^}]*?(?:"nome_projeto"|"estudos_situacao")[^}]*)\}'
    
    for proj_match in re.finditer(pattern, content, re.DOTALL):
        guid = proj_match.group(1)
        proj_content = '{' + proj_match.group(2) + '}'
        
        try:
            # Tenta fazer parse do JSON
            proj_data = json.loads(proj_content)
            projects[guid] = proj_data
        except json.JSONDecodeError:
            # Se falhar, tenta extrair os dados manualmente
            proj_data = {'guid': guid}
            
            # Extrai nome do projeto
            nome_match = re.search(r'"nome_projeto"\s*:\s*"([^"]*)"', proj_content)
            if nome_match:
                proj_data['nome_projeto'] = nome_match.group(1)
            
            # Extrai status das etapas
            for etapa in ['estudos_situacao', 'consulta_situacao', 'tcu_situacao', 
                          'edital_situacao', 'licitacao_situacao', 'contrato_situacao']:
                etapa_match = re.search(rf'"{etapa}"\s*:\s*(\d+)', proj_content)
                if etapa_match:
                    proj_data[etapa] = int(etapa_match.group(1))
            
            projects[guid] = proj_data
    
    print(f"✓ Extração concluída: {len(projects)} projetos encontrados")
    return projects

def create_timeline_data_json(timeline_data):
    """Cria um JSON estruturado com os dados de timeline"""
    json_str = json.dumps(timeline_data, ensure_ascii=False, indent=2)
    return json_str

def update_apresentacao():
    """Atualiza o arquivo apresentacao.html"""
    print("\nAtualizando apresentacao.html...")
    
    # Extrai os dados
    timeline_data = extract_timeline_data()
    
    if not timeline_data:
        print("❌ Nenhum dado de timeline foi extraído")
        return False
    
    with open(apresentacao_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Cria a string JSON com os dados de timeline
    json_data = create_timeline_data_json(timeline_data)
    
    # Procura por um local apropriado para inserir os dados (logo após <script>)
    # Vamos inserir após o primeiro <script> tag
    insert_code = f"""
    // Timeline data extracted from timeline.html
    const allTimelineProjects = {json_data};
    """
    
    # Encontra o primeiro <script> tag e insere após ele
    script_pattern = r'(<script>)'
    if re.search(script_pattern, content):
        content = re.sub(
            r'(<script>)',
            r'\1' + insert_code,
            content,
            count=1
        )
        
        with open(apresentacao_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Dados de timeline inseridos em apresentacao.html")
        print(f"  Total de projetos: {len(timeline_data)}")
        return True
    else:
        print("❌ Não conseguiu encontrar <script> tag")
        return False

def test_extraction():
    """Testa a extração de dados"""
    print("\n=== TESTE DE EXTRAÇÃO ===\n")
    timeline_data = extract_timeline_data()
    
    if timeline_data:
        # Mostra os primeiros 3 projetos
        for i, (guid, data) in enumerate(list(timeline_data.items())[:3]):
            print(f"\nProjeto {i+1}:")
            print(f"  GUID: {guid}")
            print(f"  Nome: {data.get('nome_projeto', 'N/A')}")
            print(f"  Etapas:")
            for etapa in ['estudos_situacao', 'consulta_situacao', 'tcu_situacao', 
                          'edital_situacao', 'licitacao_situacao', 'contrato_situacao']:
                valor = data.get(etapa, 'N/A')
                print(f"    - {etapa}: {valor}")
        
        print(f"\n✓ Total de {len(timeline_data)} projetos extraídos")
    else:
        print("❌ Nenhum projeto foi extraído")

if __name__ == '__main__':
    # Muda para o diretório correto
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("=" * 60)
    print("INTEGRAÇÃO DE TIMELINES")
    print("=" * 60)
    
    # Primeiro, faz um teste
    test_extraction()
    
    # Depois, atualiza o arquivo
    print("\n" + "=" * 60)
    if update_apresentacao():
        print("\n✓ Integração concluída com sucesso!")
    else:
        print("\n❌ Erro na integração")
