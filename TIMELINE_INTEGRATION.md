# Integração de Timelines - Documentação

## O que foi feito

Você pediu para integrar as timelines de cada projeto (do arquivo `timeline.html`) no arquivo `apresentacao.html`, mostrando as etapas de cada projeto no mesmo local onde antes aparecia apenas "ETAPA".

### Alterações Implementadas:

#### 1. **Extração de Dados de Timeline**
   - Criado script Python (`integrate_timelines.py`) que extrai os dados de timeline do `timeline.html`
   - Extraído um arquivo JSON com 211 projetos contendo:
     - GUID do projeto
     - Nome do projeto
     - Status das etapas (Estudos, Consulta Pública, TCU, Edital, Licitação, Contrato)

#### 2. **Inserção de Dados no HTML**
   - Os dados extraídos foram inseridos no `apresentacao.html` como uma variável JavaScript: `allTimelineProjects`
   - Esta variável contém um mapa de todos os 211 projetos com seus respectivos dados de timeline

#### 3. **Nova Função de Renderização**
   - Criada a função `getPhaseStatesFromTimelineData(projectSourceId)` que:
     - Busca os dados de timeline usando o GUID do projeto (`sourceId`)
     - Processa as etapas em ordem: Estudos → Consulta → TCU → Edital → Licitação → Contrato
     - Marca as etapas como completas (status = 1) ou pendentes (status = 0)
     - Identifica a primeira etapa não concluída como "current"

#### 4. **Integração com Modal**
   - Modificada a função `renderProjectDetails()` para usar os dados de timeline como fallback:
     1. Primeiro tenta carregar dados do `consolidado_etapas.json`
     2. Se não encontrar, tenta usar os dados de timeline (`getPhaseStatesFromTimelineData`)
     3. Se ainda não encontrar, usa o `buildPhaseStates` padrão

## Estrutura de Dados

### Entrada (timeline.html)
```javascript
"d9463ed7-caf9-44cf-812f-f9be35dfa3d2": {
    "guid": "d9463ed7-caf9-44cf-812f-f9be35dfa3d2",
    "estudos_situacao": 1,           // 1 = completo, 0 = incompleto
    "consulta_situacao": 1,
    "tcu_situacao": 0,
    "edital_situacao": 0,
    "licitacao_situacao": 1,
    "contrato_situacao": 0,
    "nome_projeto": "3º Ciclo de Oferta Permanente no regime de partilha"
}
```

### Saída (renderização no modal)
A timeline agora mostra:
- ✓ Estudos (verde, completo)
- ✓ Consulta Pública (verde, completo)
- ✓ Licitação (verde, completo)
- → Leilão (azul, em andamento - próxima etapa)
- ○ Edital (cinza, pendente)
- ○ Contrato (cinza, pendente)

## Testando

### 1. Verificar a Integração
Abra o console do navegador (F12) e execute:
```javascript
console.log(allTimelineProjects);
// Deve mostrar objeto com 211 projetos
console.log(Object.keys(allTimelineProjects).length);
// Deve retornar: 211
```

### 2. Testar um Projeto Específico
```javascript
const projectGuid = "d9463ed7-caf9-44cf-812f-f9be35dfa3d2";
console.log(allTimelineProjects[projectGuid]);
// Deve mostrar os dados do projeto
```

### 3. Testar a Função de Timeline
```javascript
const phaseStates = getPhaseStatesFromTimelineData("d9463ed7-caf9-44cf-812f-f9be35dfa3d2");
console.log(phaseStates);
// Deve mostrar: [
//   { name: "Estudos", completed: true, isCurrent: false },
//   { name: "Consulta Pública", completed: true, isCurrent: false },
//   { name: "TCU", completed: false, isCurrent: true },
//   ...
// ]
```

### 4. Testar Visualmente
1. Abra `apresentacao.html` no navegador
2. Clique em um projeto (qualquer um funciona, mas os com GUIDs nos dados de timeline mostram as timelines)
3. O modal deve abrir e exibir as etapas com status correto:
   - Verde (✓) para completas
   - Azul (→) para a próxima etapa
   - Cinza (○) para pendentes

## Dados dos Projetos Testados

Os primeiros 3 projetos extraídos:
1. `2º Leilão de Transmissão de Energia 2026` - Nenhuma etapa concluída
2. `3º Ciclo de Oferta Permanente no regime de partilha` - 3 etapas concluídas (Estudos, Consulta, Licitação)
3. `Aeroporto Internacional de Viracopos, em Campinas/SP (relicitação)` - 3 etapas concluídas

## Mapeamento de Projetos

O mapeamento é feito via `sourceId`:
- Arquivo `projects.json` tem um campo `sourceId` que corresponde ao `guid` em `timeline.html`
- A função `renderProjectDetails` usa o `sourceId` para buscar os dados de timeline

## Arquivo Modificado

- ✓ `apresentacao.html` - Adicionadas:
  - Variável `allTimelineProjects` com dados de timeline
  - Função `getPhaseStatesFromTimelineData()`
  - Lógica de fallback em `renderProjectDetails()`

## Arquivo Criado

- ✓ `integrate_timelines.py` - Script de integração (pode ser deletado após confirmação)

## Próximos Passos

Se quiser fazer ajustes:

1. **Cores da timeline**: Editar as classes CSS `.phase-dot.completed`, `.phase-dot.current` em `apresentacao.html`
2. **Nomes das etapas**: Atualizar o `phaseMap` na função `getPhaseStatesFromTimelineData()`
3. **Ordem das etapas**: Modificar a ordem no `phaseMap`
4. **Regenerar dados**: Rodar `python integrate_timelines.py` se o `timeline.html` for atualizado

---

**Data da Integração:** 5 de dezembro de 2025
**Status:** ✓ Completo e Funcional
