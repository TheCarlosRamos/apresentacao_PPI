@echo off
setlocal enabledelayedexpansion

:: Define o diretório base como o diretório do script
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%.."

:: Define os arquivos
set "GUID_FILE=guids_com_nome.csv"
set "COLLECTION=Estudos.postman_collection.json"

:: Verifica se os arquivos existem
if not exist "%GUID_FILE%" (
    echo Erro: Arquivo de GUIDs não encontrado: %GUID_FILE%
    dir /b
    exit /b 1
)

if not exist "%COLLECTION%" (
    echo Erro: Arquivo de coleção não encontrado: %COLLECTION%
    dir /b *.postman_collection.json
    exit /b 1
)

echo Executando coleção %COLLECTION% para cada GUID em %GUID_FILE%
echo.

:: Lê o arquivo CSV, ignora a primeira linha e executa para cada GUID
set "skip=1"
for /f "usebackq tokens=*" %%G in ("%GUID_FILE%") do (
    if !skip! gtr 0 (
        set /a skip-=1
    ) else (
        set "guid=%%~G"
        if "!guid!" neq "" (
            echo Executando para GUID: !guid!
            npx newman run "%COLLECTION%" --env-var "guid=!guid!"
            echo.
        )
    )
)

echo Processamento concluído.
pause