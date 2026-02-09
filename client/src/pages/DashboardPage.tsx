import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from '../components/ui';
import { Button } from '../components/ui/Button';
import type { DashboardStats } from '../services/dashboard.service';
import { dashboardService } from '../services/dashboard.service';
import {
    DollarSign,
    ShoppingCart,
    TrendingUp,
    AlertTriangle,
    Activity,
    ArrowUpRight,
    Package,
    Calendar,
    LayoutDashboard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const DashboardPage = () => {
    usePageTitle('Dashboard');
    const [stats, setStats] = useState<DashboardStats>({
        salesToday: 0,
        monthlyRevenue: 0,
        monthlyExpense: 0,
        lowStockItems: 0,
        recentSales: [],
        recentFinancials: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await dashboardService.getStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Carregando dados...</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-7 h-7 text-primary" />
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visão Geral</h1>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">Acompanhe os indicadores chave do seu negócio.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm h-9 text-xs">
                        <Calendar size={14} className="mr-2" />
                        {new Date().toLocaleDateString('pt-BR')}
                    </Button>

                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Vendas Hoje"
                    value={`R$ ${stats.salesToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    change="+12% ontem"
                    trend="up"
                    icon={<ShoppingCart size={16} />}
                    isPrimary
                />
                <MetricCard
                    title="Receita Mensal"
                    value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    change="+5% mês ant."
                    trend="up"
                    icon={<TrendingUp size={16} />}
                />
                <MetricCard
                    title="Despesas"
                    value={`R$ ${stats.monthlyExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    change="-2% mês ant."
                    trend="down"
                    icon={<DollarSign size={16} />}
                />
                <MetricCard
                    title="Alerta Estoque"
                    value={stats.lowStockItems.toString()}
                    subtext="Itens Críticos"
                    icon={<AlertTriangle size={16} />}
                    isAlert
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <Card className="lg:col-span-2 border border-slate-200 shadow-sm bg-white rounded-lg">
                    <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between py-4 px-4 md:px-6">
                        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <Activity size={16} className="text-slate-400" />
                            Últimas Transações
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {stats.recentSales.length === 0 ? (
                                <EmptyState
                                    title="Nenhuma venda registrada hoje"
                                    description="As vendas realizadas aparecerão aqui."
                                    icon={Package}
                                />
                            ) : (
                                stats.recentSales.map((sale: any) => (
                                    <div key={sale.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50">
                                                <ShoppingCart size={14} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-700 text-sm">
                                                    Venda #{sale.code || 'N/A'}
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sale.user?.name || 'Sistema'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-semibold block text-emerald-600">
                                                + R$ {Number(sale.total).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Shortcuts & Meta */}
                <div className="flex flex-col gap-6">
                    <Card className="border border-slate-200 shadow-sm bg-white rounded-lg">
                        <CardHeader className="border-b border-slate-100 py-4 px-6">
                            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acesso Rápido</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-2 gap-3">
                            <Link to="/app/sales"><ShortcutButton icon={<ShoppingCart />} label="Nova Venda" /></Link>
                            <Link to="/app/products"><ShortcutButton icon={<Package />} label="Produtos" /></Link>
                            <Link to="/app/partners"><ShortcutButton icon={<Activity />} label="Clientes" /></Link>
                            <Link to="/app/financial"><ShortcutButton icon={<DollarSign />} label="Financeiro" /></Link>
                        </CardContent>
                    </Card>

                    {/* Meta Card - Simplified */}
                    <div className="rounded-lg bg-slate-900 text-white p-5 shadow-sm border border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Meta Mensal</p>
                                <h3 className="font-bold text-xl">82%</h3>
                            </div>
                            <div className="p-1.5 bg-slate-800 rounded text-slate-300">
                                <TrendingUp size={14} />
                            </div>
                        </div>

                        <p className="text-slate-400 text-xs mb-3">
                            Faltam R$ 12.400,00
                        </p>

                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: '82%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components - Professional
const MetricCard = ({ title, value, change, trend, icon, isPrimary, subtext, isAlert }: any) => (
    <div className={`rounded-lg p-4 md:p-5 border transition-all duration-200 ${isPrimary
        ? 'bg-white border-slate-200 shadow-sm'
        : 'bg-white border-slate-200 shadow-sm'}`}>

        <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
            <div className={`p-1.5 rounded ${isPrimary ? 'text-blue-600 bg-blue-50' : isAlert ? 'text-amber-600 bg-amber-50' : 'text-slate-400 bg-slate-50'}`}>
                {icon}
            </div>
        </div>

        <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>

            <div className="flex items-center gap-2 mt-2">
                {change && (
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 
                        ${trend === 'up' ? 'text-emerald-700 bg-emerald-50' : trend === 'down' ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-100'}
                    `}>
                        {trend === 'up' ? <ArrowUpRight size={10} /> : null}
                        {trend === 'down' ? <ArrowUpRight size={10} className="rotate-180" /> : null}
                        {change}
                    </span>
                )}
                {subtext && (
                    <span className="text-[11px] text-slate-500">
                        {subtext}
                    </span>
                )}
            </div>
        </div>
    </div>
);

const ShortcutButton = ({ icon, label }: any) => {
    return (
        <button className="flex flex-col items-center justify-center p-3 rounded border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-150 gap-2 group w-full text-slate-600 hover:text-blue-600">
            {React.cloneElement(icon, { size: 18 })}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
};

export default DashboardPage;
