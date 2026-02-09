// API Configuration
// Use relative path to leverage Nginx proxy and avoid CORS
const API_BASE_URL = '';

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    ENDPOINTS: {
        AUTH: `/api/auth`,
        USERS: `/api/users`,
        PRODUCTS: `/api/products`,
        CATEGORIES: `/api/categories`,
        PARTNERS: `/api/partners`,
        SALES: `/api/sales`,
        PURCHASES: `/api/purchases`,
        INVENTORY: `/api/inventory`,
        FINANCIAL: `/api/financial`,
        FISCAL: `/api`,
        CHART_OF_ACCOUNTS: `/api/accounts/chart`,
        ACCOUNTS_PAYABLE: `/api`,
        ACCOUNTS_RECEIVABLE: `/api`,
        DASHBOARD: `/api/dashboard`,
        COMPANY: `/api/company`,
    },
};

export default API_CONFIG;
