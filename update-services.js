// Script to update all service files to use centralized API config
const fs = require('fs');
const path = require('path');

const services = [
    { file: 'user.service.ts', endpoint: 'USERS' },
    { file: 'sale.service.ts', endpoint: 'SALES' },
    { file: 'purchase.service.ts', endpoint: 'PURCHASES' },
    { file: 'product.service.ts', endpoint: 'PRODUCTS' },
    { file: 'partner.service.ts', endpoint: 'PARTNERS' },
    { file: 'inventory.service.ts', endpoint: 'INVENTORY' },
    { file: 'financial.service.ts', endpoint: 'FINANCIAL' },
    { file: 'dashboard.service.ts', endpoint: 'DASHBOARD' },
    { file: 'company.service.ts', endpoint: 'COMPANY' },
    { file: 'category.service.ts', endpoint: 'CATEGORIES' },
    { file: 'chartOfAccounts.service.ts', endpoint: 'CHART_OF_ACCOUNTS' },
    { file: 'fiscal.service.ts', endpoint: 'FISCAL', isBase: true },
    { file: 'accountsReceivable.service.ts', endpoint: 'ACCOUNTS_RECEIVABLE', isBase: true },
    { file: 'accountsPayable.service.ts', endpoint: 'ACCOUNTS_PAYABLE', isBase: true },
];

const servicesDir = path.join(__dirname, 'client', 'src', 'services');

services.forEach(({ file, endpoint, isBase }) => {
    const filePath = path.join(servicesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add import if not present
    if (!content.includes('API_CONFIG')) {
        const importLine = "import { API_CONFIG } from '../config/api.config';\n";
        content = importLine + content;
    }

    // Replace hardcoded URL
    const varName = isBase ? 'API_BASE_URL' : 'API_URL';
    const regex = new RegExp(`const ${varName} = 'http://localhost:3001[^']*';`, 'g');
    content = content.replace(regex, `const ${varName} = API_CONFIG.ENDPOINTS.${endpoint};`);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${file}`);
});

console.log('\n🎉 All services updated!');
