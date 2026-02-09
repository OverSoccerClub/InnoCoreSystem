
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionGate } from '../components/auth/PermissionGate';

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
                    <Route index element={<PermissionGate resource="dashboard" action="view"><DashboardPage /></PermissionGate>} />
                    <Route path="products" element={<PermissionGate resource="products" action="view"><ProductsPage /></PermissionGate>} />
                    <Route path="categories" element={<PermissionGate resource="categories" action="view"><CategoriesPage /></PermissionGate>} />
                    <Route path="purchases" element={<PermissionGate resource="purchases" action="view"><PurchasesPage /></PermissionGate>} />
                    <Route path="partners" element={<PermissionGate resource="partners" action="view"><PartnersPage /></PermissionGate>} />
                    <Route path="sales" element={<PermissionGate resource="sales" action="view"><SalesPage /></PermissionGate>} />
                    <Route path="inventory" element={<PermissionGate resource="inventory" action="view"><InventoryPage /></PermissionGate>} />
                    <Route path="financial" element={<PermissionGate resource="financial" action="view"><FinancialPage /></PermissionGate>} />
                    <Route path="accounts/chart" element={<PermissionGate resource="chart_of_accounts" action="view"><ChartOfAccountsPage /></PermissionGate>} />
                    <Route path="accounts/receivable" element={<PermissionGate resource="accounts_receivable" action="view"><AccountsReceivablePage /></PermissionGate>} />
                    <Route path="accounts/payable" element={<PermissionGate resource="accounts_payable" action="view"><AccountsPayablePage /></PermissionGate>} />
                    <Route path="fiscal" element={<PermissionGate resource="fiscal" action="view"><FiscalPage /></PermissionGate>} />
                    <Route path="users" element={<PermissionGate resource="users" action="view"><UsersPage /></PermissionGate>} />
                    <Route path="settings/company" element={<PermissionGate resource="company" action="view"><CompanySettingsPage /></PermissionGate>} />
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
