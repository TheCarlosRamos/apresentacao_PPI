@echo off
setlocal enabledelayedexpansion

echo Iniciando execucao da colecao Estudos para cada GUID...

set "COLLECTION=Estudos.postman_collection.json"
set "GUID_FILE=guids_com_nome.csv"
set "LINE_NUMBER=0"

for /f "usebackq delims=" %%G in ("%GUID_FILE%") do (
    set /a "LINE_NUMBER+=1"
    if !LINE_NUMBER! gtr 1 (
        set "GUID=%%G"
        if "!GUID!" neq "" (
            echo.
            echo [%TIME%] Executando para GUID: !GUID!
            newman run "%COLLECTION%" --env-var "guid=!GUID!"
            if !ERRORLEVEL! neq 0 (
                echo Erro ao executar para GUID: !GUID!
            )
        )
    )
)

echo.
echo Execucao concluida!
pause
