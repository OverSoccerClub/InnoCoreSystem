# Script para corrigir erros de query params nos controllers

$controllersPath = "c:\Projetos\Web\InnoCore\server\src\controllers"

# Adicionar import do helper no topo de cada arquivo que precisa
$filesToFix = @(
    "accountsPayable.controller.ts",
    "accountsReceivable.controller.ts",
    "chartOfAccounts.controller.ts",
    "fiscal.controller.ts",
    "product.controller.ts",
    "purchase.controller.ts",
    "sale.controller.ts",
    "user.controller.ts"
)

foreach ($file in $filesToFix) {
    $filePath = Join-Path $controllersPath $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Adicionar import do helper se ainda não existir
        if ($content -notmatch "getQueryParam") {
            $content = $content -replace "(import \{ Request, Response \} from 'express';)", "`$1`r`nimport { getQueryParam } from '../utils/queryParams';"
        }
        
        # Corrigir padrões comuns de query params
        $content = $content -replace "const \{ id \} = req\.query;`r`n\s+const accountId = id;", "const { id } = req.query;`r`n            const accountId = getQueryParam(id);"
        $content = $content -replace "const \{ categoryId \} = req\.query;`r`n\s+const category = categoryId;", "const { categoryId } = req.query;`r`n            const category = getQueryParam(categoryId);"
        $content = $content -replace "const \{ partnerId \} = req\.query;", "const { partnerId: partnerIdRaw } = req.query;`r`n            const partnerId = getQueryParam(partnerIdRaw);"
        
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "Corrigido: $file"
    }
}

Write-Host "`nQuery params corrigidos!"
