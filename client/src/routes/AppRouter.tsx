
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionGuard } from '../components/auth/PermissionGuard';

import UsersPage from '../pages/UsersPage';
import ProductsPage from '../pages/ProductsPage';
import CategoriesPage from '../pages/CategoriesPage';
import PurchasesPage from '../pages/PurchasesPage';
import PartnersPage from '../pages/PartnersPage';
import SalesPage from '../pages/SalesPage';
import InventoryPage from '../pages/InventoryPage';
import FinancialPage from '../pages/FinancialPage';
import FiscalPage from '../pages/FiscalPage';
import DashboardPage from '../pages/DashboardPage';
import PrintInvoicePage from '../pages/PrintInvoicePage';
import CompanySettingsPage from '../pages/CompanySettingsPage';
import ChartOfAccountsPage from '../pages/ChartOfAccountsPage';
import AccountsReceivablePage from '../pages/AccountsReceivablePage';
import AccountsPayablePage from '../pages/AccountsPayablePage';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<LoginPage />} />
                </Route>

                <Route
                    path="/app"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<PermissionGuard permission="dashboard.view"><DashboardPage /></PermissionGuard>} />
                    <Route path="products" element={<PermissionGuard permission="products.view"><ProductsPage /></PermissionGuard>} />
                    <Route path="categories" element={<PermissionGuard permission="categories.view"><CategoriesPage /></PermissionGuard>} />
                    <Route path="purchases" element={<PermissionGuard permission="purchases.view"><PurchasesPage /></PermissionGuard>} />
                    <Route path="partners" element={<PermissionGuard permission="partners.view"><PartnersPage /></PermissionGuard>} />
                    <Route path="sales" element={<PermissionGuard permission="sales.view"><SalesPage /></PermissionGuard>} />
                    <Route path="inventory" element={<PermissionGuard permission="inventory.view"><InventoryPage /></PermissionGuard>} />
                    <Route path="financial" element={<PermissionGuard permission="financial.view"><FinancialPage /></PermissionGuard>} />
                    <Route path="accounts/chart" element={<PermissionGuard permission="financial.view"><ChartOfAccountsPage /></PermissionGuard>} />
                    <Route path="accounts/receivable" element={<PermissionGuard permission="accounts.receivable.view"><AccountsReceivablePage /></PermissionGuard>} />
                    <Route path="accounts/payable" element={<PermissionGuard permission="accounts.payable.view"><AccountsPayablePage /></PermissionGuard>} />
                    <Route path="fiscal" element={<PermissionGuard permission="fiscal.view"><FiscalPage /></PermissionGuard>} />
                    <Route path="users" element={<PermissionGuard permission="users.view"><UsersPage /></PermissionGuard>} />
                    <Route path="settings/company" element={<PermissionGuard permission="settings.view"><CompanySettingsPage /></PermissionGuard>} />
                </Route>

                <Route path="/print/invoice/:id" element={
                    <ProtectedRoute>
                        <PrintInvoicePage />
                    </ProtectedRoute>
                } />

                <Route path="/" element={<Navigate to="/app" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
