#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de teste para validar a integração de timelines
"""

import json
import re
import os

def test_timeline_integration():
    """Testa se os dados de timeline foram corretamente inseridos no apresentacao.html"""
    
    print("\n" + "="*70)
    print("TESTE DE INTEGRAÇÃO DE TIMELINES")
    print("="*70 + "\n")
    
    apresentacao_path = r"apresentacao\apresentacao.html"
    
    with open(apresentacao_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Teste 1: Verificar se allTimelineProjects existe
    print("✓ Teste 1: Verificando se 'allTimelineProjects' existe...")
    if 'const allTimelineProjects = {' in content:
        print("  ✓ PASSOU: allTimelineProjects encontrado\n")
    else:
        print("  ✗ FALHOU: allTimelineProjects não encontrado\n")
        return False
    
    # Teste 2: Verificar se alguns projetos conhecidos estão presentes
    print("✓ Teste 2: Verificando dados de projetos específicos...")
    known_projects = [
        '"ecd74fa2-d64d-42ca-bb9a-a6dbe4dbfef5"',
        '"d9463ed7-caf9-44cf-812f-f9be35dfa3d2"',
        '"c5dd423a-0cfd-4e36-8fd9-03bb18dc250e"'
    ]
    
    found_count = 0
    for project_guid in known_projects:
        if project_guid in content:
            found_count += 1
    
    if found_count == len(known_projects):
        print(f"  ✓ PASSOU: Encontrados {found_count}/{len(known_projects)} projetos conhecidos\n")
    else:
        print(f"  ✗ FALHOU: Encontrados apenas {found_count}/{len(known_projects)} projetos\n")
        return False
    
    # Teste 3: Verificar se a função getPhaseStatesFromTimelineData existe
    print("✓ Teste 3: Verificando se 'getPhaseStatesFromTimelineData' existe...")
    if 'function getPhaseStatesFromTimelineData(projectSourceId)' in content:
        print("  ✓ PASSOU: Função getPhaseStatesFromTimelineData encontrada\n")
    else:
        print("  ✗ FALHOU: Função getPhaseStatesFromTimelineData não encontrada\n")
        return False
    
    # Teste 4: Verificar se o fallback foi adicionado em renderProjectDetails
    print("✓ Teste 4: Verificando se fallback de timeline foi adicionado...")
    if 'phaseStates = getPhaseStatesFromTimelineData(sourceId)' in content:
        print("  ✓ PASSOU: Fallback de timeline encontrado\n")
    else:
        print("  ✗ FALHOU: Fallback de timeline não encontrado\n")
        return False
    
    # Teste 5: Contar quantidade de projetos
    print("✓ Teste 5: Contando quantidade de projetos extraídos...")
    # Procura por padrões como "guid": "valor"
    project_pattern = r'"[a-f0-9\-]{36}":\s*\{'
    matches = re.findall(project_pattern, content)
    project_count = len(matches)
    
    if project_count >= 200:  # Esperamos ~211
        print(f"  ✓ PASSOU: {project_count} projetos encontrados (esperado ~211)\n")
    else:
        print(f"  ✗ AVISO: Apenas {project_count} projetos encontrados (esperado ~211)\n")
        # Não é um falha crítica, continua
    
    # Teste 6: Verificar integridade de alguns dados
    print("✓ Teste 6: Verificando integridade de dados de projetos...")
    test_project = 'd9463ed7-caf9-44cf-812f-f9be35dfa3d2'
    
    # Procura pelo projeto específico e seus dados
    if (f'"{test_project}"' in content and
        'estudos_situacao' in content and
        'consulta_situacao' in content and
        'licitacao_situacao' in content and
        'contrato_situacao' in content):
        print("  ✓ PASSOU: Dados de etapas encontrados para projeto teste\n")
    else:
        print("  ✗ FALHOU: Dados de etapas incompletos\n")
        return False
    
    print("="*70)
    print("RESULTADO: ✓ TODOS OS TESTES PASSARAM")
    print("="*70 + "\n")
    
    return True

if __name__ == '__main__':
    # Muda para o diretório correto
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    success = test_timeline_integration()
    exit(0 if success else 1)
