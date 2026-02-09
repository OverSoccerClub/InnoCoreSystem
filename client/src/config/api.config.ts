// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    ENDPOINTS: {
        AUTH: `${API_BASE_URL}/api/auth`,
        USERS: `${API_BASE_URL}/api/users`,
        PRODUCTS: `${API_BASE_URL}/api/products`,
        CATEGORIES: `${API_BASE_URL}/api/categories`,
        PARTNERS: `${API_BASE_URL}/api/partners`,
        SALES: `${API_BASE_URL}/api/sales`,
        PURCHASES: `${API_BASE_URL}/api/purchases`,
        INVENTORY: `${API_BASE_URL}/api/inventory`,
        FINANCIAL: `${API_BASE_URL}/api/financial`,
        FISCAL: `${API_BASE_URL}/api`,
        CHART_OF_ACCOUNTS: `${API_BASE_URL}/api/accounts/chart`,
        ACCOUNTS_PAYABLE: `${API_BASE_URL}/api`,
        ACCOUNTS_RECEIVABLE: `${API_BASE_URL}/api`,
        DASHBOARD: `${API_BASE_URL}/api/dashboard`,
        COMPANY: `${API_BASE_URL}/api/company`,
    },
};

export default API_CONFIG;
