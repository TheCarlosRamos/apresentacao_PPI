import json
import os

# Define file paths
projetos_file = os.path.join(os.path.dirname(__file__), 'projetos_descricao - Copia.json')
consolidado_file = os.path.join(os.path.dirname(__file__), 'consolidado_etapas.json')
output_file = os.path.join(os.path.dirname(__file__), 'consolidado_etapas_with_names.json')

# Load the projetos_descricao file
with open(projetos_file, 'r', encoding='utf-8') as f:
    projetos_data = json.load(f)

# Create a dictionary mapping GUIDs to project names
projeto_map = {}
for projeto in projetos_data:
    if 'guid' in projeto and 'name' in projeto:
        projeto_map[projeto['guid']] = projeto['name']

# Load the consolidado_etapas file
with open(consolidado_file, 'r', encoding='utf-8') as f:
    consolidado_data = json.load(f)

# Update the consolidado_data with project names
for guid, projeto_info in consolidado_data.items():
    if guid in projeto_map:
        projeto_info['nome_projeto'] = projeto_map[guid]

# Save the updated data to a new file
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(consolidado_data, f, ensure_ascii=False, indent=2)

print(f"Project names have been added. Updated file saved as: {output_file}")
