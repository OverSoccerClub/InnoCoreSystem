import { useState, useEffect } from 'react';

import { Receipt, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight, X, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, Input, EmptyState } from '../components/ui';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { chartOfAccountsService, type ChartOfAccount } from '../services/chartOfAccounts.service';

const ChartOfAccountsPage = () => {
    usePageTitle('Plano de Contas');
    const dialog = useDialog();

    const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [natureFilter, setNatureFilter] = useState<string>('all');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'ASSET' as ChartOfAccount['type'],
        nature: 'DEBIT' as ChartOfAccount['nature'],
        parentId: '',
    });

    useEffect(() => {
        loadAccounts();
    }, [currentPage, itemsPerPage, searchTerm, typeFilter, natureFilter]);

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const params: any = { page: currentPage, limit: itemsPerPage };
            if (searchTerm) params.search = searchTerm;
            if (typeFilter !== 'all') params.type = typeFilter;
            if (natureFilter !== 'all') params.nature = natureFilter;

            const response = await chartOfAccountsService.getAll(true, params);
            setAccounts(response.data || []);
            setTotalItems(response.meta?.total || 0);
            setTotalPages(response.meta?.totalPages || 0);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar o plano de contas.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (account?: ChartOfAccount) => {
        if (account) {
            setEditingAccount(account);
            setFormData({
                code: account.code,
                name: account.name,
                type: account.type,
                nature: account.nature,
                parentId: account.parentId || '',
            });
        } else {
            setEditingAccount(null);
            setFormData({
                code: '',
                name: '',
                type: 'ASSET',
                nature: 'DEBIT',
                parentId: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingAccount) {
                await chartOfAccountsService.update(editingAccount.id, formData);
                dialog.success({
                    title: 'Conta Atualizada!',
                    message: 'A conta foi atualizada com sucesso.',
                });
            } else {
                await chartOfAccountsService.create(formData);
                dialog.success({
                    title: 'Conta Criada!',
                    message: 'A nova conta foi criada com sucesso.',
                });
            }
            setIsModalOpen(false);
            loadAccounts();
        } catch (error) {
            dialog.error({
                title: 'Erro ao Salvar',
                message: 'Não foi possível salvar a conta.',
            });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        dialog.confirm({
            title: 'Excluir Conta',
            message: `Deseja realmente desativar a conta "${name}"?`,
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                try {
                    await chartOfAccountsService.delete(id);
                    dialog.success({
                        title: 'Conta Desativada!',
                        message: 'A conta foi desativada com sucesso.',
                    });
                    loadAccounts();
                } catch (error) {
                    dialog.error({
                        title: 'Erro ao Excluir',
                        message: 'Não foi possível desativar a conta.',
                    });
                }
            }
        });
    };

    const getTypeBadge = (type: ChartOfAccount['type']) => {
        const badges = {
            ASSET: 'bg-blue-100 text-blue-700',
            LIABILITY: 'bg-red-100 text-red-700',
            REVENUE: 'bg-green-100 text-green-700',
            EXPENSE: 'bg-orange-100 text-orange-700',
            EQUITY: 'bg-purple-100 text-purple-700',
        };
        const labels = {
            ASSET: 'Ativo',
            LIABILITY: 'Passivo',
            REVENUE: 'Receita',
            EXPENSE: 'Despesa',
            EQUITY: 'Patrimônio',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${badges[type]}`}>
                {labels[type]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Carregando plano de contas...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <Receipt className="w-7 h-7 text-primary" />
                        <h1 className="text-2xl font-bold text-slate-900">Plano de Contas</h1>
                    </div>
                    <p className="text-slate-600 mt-1">Estrutura contábil da empresa</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Conta
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="w-5 h-5" />
                            Contas Cadastradas
                        </CardTitle>
                        <Button onClick={loadAccounts} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Atualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters Section */}
                    <div className="mb-6 p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 bg-primary rounded-full"></div>
                            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Filtros de Busca</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Buscar</label>
                                <Input
                                    placeholder="Nome ou código..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    fullWidth
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Tipo de Conta</label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => {
                                        setTypeFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="h-11 border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                >
                                    <option value="all">Todos os Tipos</option>
                                    <option value="ASSET">Ativo</option>
                                    <option value="LIABILITY">Passivo</option>
                                    <option value="REVENUE">Receita</option>
                                    <option value="EXPENSE">Despesa</option>
                                    <option value="EQUITY">Patrimônio Líquido</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Natureza</label>
                                <select
                                    value={natureFilter}
                                    onChange={(e) => {
                                        setNatureFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="h-11 border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                >
                                    <option value="all">Todas as Naturezas</option>
                                    <option value="DEBIT">Débito</option>
                                    <option value="CREDIT">Crédito</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {accounts.length === 0 ? (
                        <EmptyState
                            title="Nenhuma conta encontrada"
                            description="Tente ajustar os filtros ou adicione uma nova conta."
                            icon={Receipt}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4">Código</th>
                                        <th className="text-left p-4">Nome</th>
                                        <th className="text-left p-4">Tipo</th>
                                        <th className="text-left p-4">Natureza</th>
                                        <th className="text-left p-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.map((account) => (
                                        <tr key={account.id} className="border-b hover:bg-slate-50">
                                            <td className="p-4 font-mono">{account.code}</td>
                                            <td className="p-4">{account.name}</td>
                                            <td className="p-4">{getTypeBadge(account.type)}</td>
                                            <td className="p-4">
                                                <span className="text-sm text-slate-600">
                                                    {account.nature === 'DEBIT' ? 'Devedora' : 'Credora'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleOpenModal(account)}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(account.id, account.name)}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {accounts.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t mt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">Itens por página:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border rounded px-2 py-1 text-sm"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-600">
                                    Página {currentPage} de {totalPages} ({totalItems} itens)
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        size="sm">
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        size="sm">
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                icon={<Receipt size={24} />}
                title={editingAccount ? 'Editar Conta' : 'Nova Conta'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">Código</label>
                        <Input
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Ex: 1.1.01"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Caixa"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as ChartOfAccount['type'] })}
                            className="w-full border rounded px-3 py-2"
                            required
                        >
                            <option value="ASSET">Ativo</option>
                            <option value="LIABILITY">Passivo</option>
                            <option value="REVENUE">Receita</option>
                            <option value="EXPENSE">Despesa</option>
                            <option value="EQUITY">Patrimônio Líquido</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Natureza</label>
                        <select
                            value={formData.nature}
                            onChange={(e) => setFormData({ ...formData, nature: e.target.value as ChartOfAccount['nature'] })}
                            className="w-full border rounded px-3 py-2"
                            required
                        >
                            <option value="DEBIT">Devedora</option>
                            <option value="CREDIT">Credora</option>
                        </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} leftIcon={<X size={18} />}>
                            Cancelar
                        </Button>
                        <Button type="submit" leftIcon={<Save size={18} />}>
                            {editingAccount ? 'Atualizar' : 'Criar'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ChartOfAccountsPage;
