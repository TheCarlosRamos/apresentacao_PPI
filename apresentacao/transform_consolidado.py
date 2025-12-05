import json
import os

# Define file paths
input_file = os.path.join(os.path.dirname(__file__), 'consolidado_etapas_with_names.json')
output_file = os.path.join(os.path.dirname(__file__), 'consolidado_etapas_final.json')

# Fields to include in the output
fields_to_include = [
    'guid',
    'estudos_situacao',
    'contrato_situacao',
    'licitacao_situacao',
    'edital_situacao',
    'tcu_situacao',
    'consulta_situacao',
    'nome_projeto'
]

# Load the input data
with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Transform the data
transformed_data = {}
for guid, project in data.items():
    new_project = {}
    
    for field in fields_to_include:
        if field in project:
            value = project[field]
            # Convert status fields to 1 for 'completo', 0 otherwise
            if field.endswith('_situacao'):
                new_project[field] = 1 if value == 'completo' else 0
            else:
                new_project[field] = value
    
    transformed_data[guid] = new_project

# Save the transformed data
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(transformed_data, f, ensure_ascii=False, indent=2)

print(f"Transformation complete. New file saved as: {output_file}")
