# Script para corrigir erros de TypeScript nos controllers

$controllersPath = "c:\Projetos\Web\InnoCore\server\src\controllers"

# Corrigir .errors para .issues em todos os controllers
Get-ChildItem -Path $controllersPath -Filter "*.controller.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Corrigir error.errors para error.issues
    $content = $content -replace 'error\.errors', 'error.issues'
    $content = $content -replace '\(error as z\.ZodError\)\.errors', '(error as z.ZodError).issues'
    
    Set-Content -Path $_.FullName -Value $content -NoNewline
    Write-Host "Corrigido: $($_.Name)"
}

Write-Host "`nArquivos corrigidos com sucesso!"
