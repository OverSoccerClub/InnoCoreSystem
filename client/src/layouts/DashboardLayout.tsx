import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Package,
    LogOut,
    Menu,
    ShoppingCart,
    ClipboardList,
    DollarSign,
    Settings,
    Bell,
    Search,
    Building2,
    Tag,
    Receipt,
    TrendingUp,
    TrendingDown,
    FileText
} from 'lucide-react';
import logoImg from '../assets/logo.svg';
import iconImg from '../assets/icon.svg';

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuGroups = [
        {
            title: 'GESTÃO',
            items: [
                { path: '/app', icon: <LayoutDashboard size={18} />, label: 'Visão Geral', permission: 'dashboard.view' },
            ]
        },
        {
            title: 'COMERCIAL',
            items: [
                { path: '/app/sales', icon: <ShoppingCart size={18} />, label: 'PDV / Vendas', permission: 'sales.view' },
                { path: '/app/partners', icon: <Users size={18} />, label: 'Parceiros', permission: 'partners.view' },
            ]
        },
        {
            title: 'LOGÍSTICA',
            items: [
                { path: '/app/products', icon: <Package size={18} />, label: 'Produtos', permission: 'products.view' },
                { path: '/app/categories', icon: <Tag size={18} />, label: 'Categorias', permission: 'categories.view' },
                { path: '/app/purchases', icon: <ShoppingCart size={18} />, label: 'Entradas/Compras', permission: 'purchases.view' },
                { path: '/app/inventory', icon: <ClipboardList size={18} />, label: 'Estoque', permission: 'inventory.view' },
            ]
        },
        {
            title: 'FINANCEIRO',
            items: [
                { path: '/app/financial', icon: <DollarSign size={18} />, label: 'Fluxo de Caixa', permission: 'financial.view' },
                { path: '/app/accounts/receivable', icon: <TrendingUp size={18} />, label: 'Contas a Receber', permission: 'accounts.receivable.view' },
                { path: '/app/accounts/payable', icon: <TrendingDown size={18} />, label: 'Contas a Pagar', permission: 'accounts.payable.view' },
                { path: '/app/accounts/chart', icon: <Receipt size={18} />, label: 'Plano de Contas', permission: 'financial.view' },
                { path: '/app/fiscal', icon: <FileText size={18} />, label: 'Fiscal', permission: 'fiscal.view' },
            ]
        },
        {
            title: 'SISTEMA',
            items: [
                { path: '/app/users', icon: <Settings size={18} />, label: 'Usuários', permission: 'users.view' },
                { path: '/app/settings/company', icon: <Building2 size={18} />, label: 'Empresa', permission: 'settings.view' },
            ]
        }
    ];

    const hasPermission = (permission?: string) => {
        if (!permission) return true;
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        return user.permissions?.includes(permission) || false;
    };

    const filteredMenuGroups = menuGroups.map(group => ({
        ...group,
        items: group.items.filter(item => hasPermission(item.permission))
    })).filter(group => group.items.length > 0);

    const isActive = (path: string) => {
        if (path === '/app' && location.pathname !== '/app') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Corporate Dark */}
            <aside
                className={`
                    fixed md:sticky top-0 h-screen z-50
                    bg-slate-900 text-slate-300 border-r border-slate-800
                    transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-[240px] translate-x-0' : 'w-[64px] -translate-x-full md:translate-x-0 md:w-[64px]'}
                    flex flex-col shadow-xl shadow-slate-900/10
                `}
            >
                {/* Logo Area */}
                <div className="h-14 flex items-center justify-start px-4 border-b border-slate-800/50 bg-slate-900 overflow-hidden relative">
                    {isSidebarOpen ? (
                        <img
                            src={logoImg}
                            alt="InnoCore"
                            className="h-8 max-w-[180px] object-contain transition-all duration-300 animate-in fade-in"
                        />
                    ) : (
                        <img
                            src={iconImg}
                            alt="InnoCore"
                            className="h-8 w-8 object-contain transition-all duration-300"
                        />
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {filteredMenuGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="flex flex-col mb-4">
                            {/* Section Header */}
                            {isSidebarOpen && group.title && (
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-1">
                                    {group.title}
                                </h4>
                            )}

                            {/* Separator for collapsed state */}
                            {!isSidebarOpen && groupIndex > 0 && (
                                <div className="h-px w-6 mx-auto bg-slate-800 my-2" />
                            )}

                            {/* Items */}
                            {group.items.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    title={!isSidebarOpen ? item.label : ''}
                                    className={`
                                        flex items-center gap-3 px-3 py-2 rounded-[6px] transition-all duration-150 group
                                        ${isActive(item.path)
                                            ? 'bg-blue-600 text-white shadow-sm font-medium'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                                        ${!isSidebarOpen ? 'justify-center px-0 py-2' : ''}
                                    `}
                                >
                                    <span className={`shrink-0 ${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                        {/* Clone icon to enforce size if needed, or rely on passed size */}
                                        {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
                                    </span>

                                    <span className={`whitespace-nowrap text-xs font-medium transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden md:block'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-slate-800 bg-slate-900">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-3 px-2 py-2 rounded bg-slate-800/50 border border-slate-700/50">
                            <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm border border-slate-600">
                                AD
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-xs font-medium text-slate-200 truncate">Administrador</p>
                                <p className="text-[10px] text-slate-500 truncate">admin@innocore.com</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50 relative">

                {/* Topbar - Clean White */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="text-slate-500 hover:text-slate-900 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                            title={isSidebarOpen ? "Retrair menu" : "Expandir menu"}
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden md:flex items-center w-full max-w-sm group">
                            <div className="relative w-full">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar..."
                                    className="w-full h-9 pl-9 pr-4 rounded-md bg-slate-100 border border-transparent text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-slate-400 text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>

                        <div className="h-5 w-px bg-slate-200 mx-1"></div>

                        <button
                            onClick={() => {
                                logout();
                                navigate('/auth/login');
                            }}
                            className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-all text-xs font-medium px-3 py-1.5 rounded-md hover:bg-red-50 group border border-transparent hover:border-red-100"
                        >
                            <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 scroll-smooth z-10 relative">
                    <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-6">
                        <Outlet />
                    </div>

                    {/* Footer */}
                    <div className="fixed bottom-4 right-6 z-20">
                        <p className="text-xs font-medium text-slate-400 tracking-wider">
                            INNOVARE CODE
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
