#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Demonstração - Mostra como os dados de timeline funcionam
"""

import json
import re

def extract_and_show_timeline_examples():
    """Extrai e mostra exemplos de timelines do arquivo"""
    
    print("\n" + "="*80)
    print("DEMONSTRAÇÃO DE TIMELINES INTEGRADAS")
    print("="*80 + "\n")
    
    apresentacao_path = r"apresentacao\apresentacao.html"
    
    with open(apresentacao_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extrai os dados de allTimelineProjects
    match = re.search(r'const allTimelineProjects = (\{.*?\});', content, re.DOTALL)
    if not match:
        print("❌ Não conseguiu encontrar allTimelineProjects")
        return
    
    try:
        # Tenta fazer parse do JSON (aproximado)
        json_str = match.group(1)
        
        # Para fins de demonstração, vamos buscar por projetos específicos
        projects_to_show = [
            "d9463ed7-caf9-44cf-812f-f9be35dfa3d2",  # 3 etapas completas
            "c5dd423a-0cfd-4e36-8fd9-03bb18dc250e",  # Viracopos
            "ecd74fa2-d64d-42ca-bb9a-a6dbe4dbfef5",  # Leilão Transmissão (zero)
        ]
        
        for i, proj_guid in enumerate(projects_to_show, 1):
            print(f"\n{'─'*80}")
            print(f"EXEMPLO {i}: Projeto {proj_guid}")
            print(f"{'─'*80}")
            
            # Procura pelo projeto
            pattern = f'"{proj_guid}":\\s*{{([^}}]*?"nome_projeto"[^}}]*)}}'
            proj_match = re.search(pattern, content, re.DOTALL)
            
            if proj_match:
                proj_data = '{' + proj_match.group(1) + '}'
                
                # Extrai nome
                nome_match = re.search(r'"nome_projeto"\s*:\s*"([^"]*)"', proj_data)
                nome = nome_match.group(1) if nome_match else "N/A"
                print(f"\n📌 Nome: {nome}\n")
                
                # Extrai etapas
                etapas = [
                    ('Estudos', 'estudos_situacao'),
                    ('Consulta Pública', 'consulta_situacao'),
                    ('TCU', 'tcu_situacao'),
                    ('Edital', 'edital_situacao'),
                    ('Licitação', 'licitacao_situacao'),
                    ('Contrato', 'contrato_situacao'),
                ]
                
                statuses = {}
                for nome_etapa, chave in etapas:
                    match_val = re.search(rf'"{chave}"\s*:\s*(\d+)', proj_data)
                    valor = int(match_val.group(1)) if match_val else 0
                    statuses[nome_etapa] = valor
                
                # Encontra o ponto de parada
                completas = [e for e, v in statuses.items() if v == 1]
                proxima_idx = len(completas)
                
                print("📊 Status das Etapas:")
                for idx, (etapa, valor) in enumerate(statuses.items()):
                    if valor == 1:
                        print(f"   ✓ {etapa:20s} [COMPLETO]")
                    elif idx == proxima_idx:
                        print(f"   → {etapa:20s} [PRÓXIMA ETAPA ⭐]")
                    else:
                        print(f"   ○ {etapa:20s} [PENDENTE]")
                
                # Cálculo de progresso
                total = len(etapas)
                progresso = (len(completas) / total) * 100
                print(f"\n📈 Progresso: {len(completas)}/{total} etapas ({progresso:.0f}%)")
                
                # Barra de progresso visual
                barra_size = 30
                filled = int((len(completas) / total) * barra_size)
                barra = "█" * filled + "░" * (barra_size - filled)
                print(f"   [{barra}]")
            else:
                print(f"   ⚠️  Projeto não encontrado nos dados")
        
        # Estatísticas gerais
        print(f"\n\n{'─'*80}")
        print("📊 ESTATÍSTICAS GERAIS")
        print(f"{'─'*80}")
        
        # Conta projetos
        all_guids = re.findall(r'"([a-f0-9\-]{36})"\s*:\s*{', content)
        unique_guids = set(all_guids)
        
        print(f"\n✓ Total de projetos extraídos: {len(unique_guids)}")
        
        # Analisa progresso médio
        total_etapas = 0
        total_completas = 0
        
        # Mostra informações dos primeiros 5 projetos
        print(f"\n📋 Amostra de projetos (primeiros 5):")
        for i, guid in enumerate(list(unique_guids)[:5], 1):
            # Conta etapas completas
            pattern = f'"{guid}":\\s*{{([^}}]*?"nome_projeto"[^}}]*)}}'
            match = re.search(pattern, content, re.DOTALL)
            
            if match:
                proj_data = '{' + match.group(1) + '}'
                completas = len(re.findall(r'"\w+_situacao"\s*:\s*1', proj_data))
                total = len(re.findall(r'"\w+_situacao"\s*:', proj_data))
                
                nome_match = re.search(r'"nome_projeto"\s*:\s*"([^"]*)"', proj_data)
                nome = nome_match.group(1)[:45] if nome_match else "?"
                
                total_etapas += total
                total_completas += completas
                
                percent = (completas / total * 100) if total > 0 else 0
                print(f"   {i}. {nome:45s} | {completas}/{total} ({percent:.0f}%)")
        
        # Média
        media_etapas = total_etapas // 5 if total_etapas > 0 else 0
        media_completas = total_completas // 5 if total_completas > 0 else 0
        media_percent = (media_completas / media_etapas * 100) if media_etapas > 0 else 0
        
        print(f"\n   Média de progresso: {media_completas}/{media_etapas} etapas ({media_percent:.0f}%)")
        
    except Exception as e:
        print(f"❌ Erro ao processar dados: {e}")
    
    print(f"\n{'='*80}\n")

if __name__ == '__main__':
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    extract_and_show_timeline_examples()
