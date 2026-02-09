
const API_URL = 'http://localhost:3001/api/dashboard';

export interface DashboardStats {
    salesToday: number;
    monthlyRevenue: number;
    monthlyExpense: number;
    lowStockItems: number;
    recentSales: any[];
    recentFinancials: any[];
}

export const dashboardService = {
    async getStats(): Promise<DashboardStats> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar dados do dashboard');
        }

        return response.json();
    }
};
