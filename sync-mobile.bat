@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   Worldo Mobile Sync
echo ========================================
echo.

set MOBILE_DIR=mobile

:: Verifica se a pasta mobile existe
if not exist "%MOBILE_DIR%" (
    echo Criando pasta %MOBILE_DIR%...
    mkdir "%MOBILE_DIR%"
    echo.
)

:: Limpa a pasta mobile (mantém apenas arquivos importantes)
echo Limpando pasta mobile existente...
if exist "%MOBILE_DIR%\app" rmdir /s /q "%MOBILE_DIR%\app"
if exist "%MOBILE_DIR%\components" rmdir /s /q "%MOBILE_DIR%\components"
if exist "%MOBILE_DIR%\constants" rmdir /s /q "%MOBILE_DIR%\constants"
if exist "%MOBILE_DIR%\hooks" rmdir /s /q "%MOBILE_DIR%\hooks"
if exist "%MOBILE_DIR%\lib" rmdir /s /q "%MOBILE_DIR%\lib"
if exist "%MOBILE_DIR%\stores" rmdir /s /q "%MOBILE_DIR%\stores"
if exist "%MOBILE_DIR%\types" rmdir /s /q "%MOBILE_DIR%\types"
if exist "%MOBILE_DIR%\public" rmdir /s /q "%MOBILE_DIR%\public"
if exist "%MOBILE_DIR%\styles" rmdir /s /q "%MOBILE_DIR%\styles"
if exist "%MOBILE_DIR%\utils" rmdir /s /q "%MOBILE_DIR%\utils"
echo.

:: ========================================
:: COPIA PASTAS (IGNORANDO /api)
:: ========================================

echo Copiando pastas...
echo.

:: Copia app ignorando /api
echo Copiando: app/ (sem api)
if exist "app" (
    xcopy /E /I /Y "app" "%MOBILE_DIR%\app"
    if exist "%MOBILE_DIR%\app\api" (
        rmdir /s /q "%MOBILE_DIR%\app\api"
        echo   (removido: app/api/)
    )
)

:: Copia outras pastas
if exist "components" (
    echo Copiando: components/
    xcopy /E /I /Y "components" "%MOBILE_DIR%\components"
)

if exist "constants" (
    echo Copiando: constants/
    xcopy /E /I /Y "constants" "%MOBILE_DIR%\constants"
)

if exist "hooks" (
    echo Copiando: hooks/
    xcopy /E /I /Y "hooks" "%MOBILE_DIR%\hooks"
)

if exist "lib" (
    echo Copiando: lib/
    xcopy /E /I /Y "lib" "%MOBILE_DIR%\lib"
)

if exist "stores" (
    echo Copiando: stores/
    xcopy /E /I /Y "stores" "%MOBILE_DIR%\stores"
)

if exist "types" (
    echo Copiando: types/
    xcopy /E /I /Y "types" "%MOBILE_DIR%\types"
)

if exist "public" (
    echo Copiando: public/
    xcopy /E /I /Y "public" "%MOBILE_DIR%\public"
)

if exist "styles" (
    echo Copiando: styles/
    xcopy /E /I /Y "styles" "%MOBILE_DIR%\styles"
)

if exist "utils" (
    echo Copiando: utils/
    xcopy /E /I /Y "utils" "%MOBILE_DIR%\utils"
)

:: ========================================
:: COPIA ARQUIVOS DE CONFIGURAÇÃO
:: ========================================

echo.
echo Copiando arquivos de configuração...
echo.

if exist "next.config.js" (
    echo Copiando: next.config.js
    copy /Y "next.config.js" "%MOBILE_DIR%\"
)

if exist "tsconfig.json" (
    echo Copiando: tsconfig.json
    copy /Y "tsconfig.json" "%MOBILE_DIR%\"
)

if exist "postcss.config.mjs" (
    echo Copiando: postcss.config.mjs
    copy /Y "postcss.config.mjs" "%MOBILE_DIR%\"
)

if exist "tailwind.config.js" (
    echo Copiando: tailwind.config.js
    copy /Y "tailwind.config.js" "%MOBILE_DIR%\"
)

if exist "tailwind.config.ts" (
    echo Copiando: tailwind.config.ts
    copy /Y "tailwind.config.ts" "%MOBILE_DIR%\"
)

if exist ".env.local" (
    echo Copiando: .env.local
    copy /Y ".env.local" "%MOBILE_DIR%\"
)

:: ========================================
:: VERIFICAÇÃO FINAL
:: ========================================

echo.
echo ========================================
echo   SYNC CONCLUÍDO!
echo ========================================
echo.
echo Verifique se os arquivos foram copiados corretamente:
echo.
echo 1. Entre na pasta mobile: cd mobile
echo 2. Verifique se NÃO existe api: dir app\api
echo 3. Instale as dependências: npm install
echo 4. Build: npm run build
echo 5. Capacitor: npx cap sync android
echo 6. Abrir Android Studio: npx cap open android
echo.
pause