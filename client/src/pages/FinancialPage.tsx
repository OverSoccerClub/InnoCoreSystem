import React, { useEffect, useState } from 'react';
import { financialService } from '../services/financial.service';
import type { FinancialTransaction } from '../services/financial.service';
import { partnerService } from '../services/partner.service';
import type { Partner } from '../types/partner';
import { Card, CardHeader, CardTitle, CardContent, Button, Table, Modal, Input, EmptyState } from '../components/ui';
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2, CheckCircle, ChevronLeft, ChevronRight, Wallet, X, Save } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';

const FinancialPage = () => {
    usePageTitle('Financeiro');
    const dialog = useDialog();
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        type: 'EXPENSE',
        status: 'PENDING',
        dueDate: new Date().toISOString().split('T')[0],
        category: '',
        partnerId: ''
    });

    useEffect(() => {
        loadData();
    }, [filterType, filterStatus, currentPage, itemsPerPage]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: currentPage,
                limit: itemsPerPage
            };
            if (filterType !== 'ALL') params.type = filterType;
            if (filterStatus !== 'ALL') params.status = filterStatus;

            const [transData, partnerData] = await Promise.all([
                financialService.getTransactions(params),
                partnerService.getAll()
            ]);
            setTransactions(transData.data);
            setTotalItems(transData.meta.total);
            setTotalPages(transData.meta.totalPages);
            setPartners(partnerData.data);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar os dados financeiros.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            description: '',
            amount: 0,
            type: 'EXPENSE',
            status: 'PENDING',
            dueDate: new Date().toISOString().split('T')[0],
            category: 'Outros',
            partnerId: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await financialService.createTransaction(formData as any);
            dialog.success({
                title: 'Transação Criada!',
                message: 'A nova transação foi criada com sucesso.'
            });
            setIsModalOpen(false);
            setCurrentPage(1);
            loadData();
        } catch (error: any) {
            dialog.error({
                title: 'Erro ao Criar',
                message: error.message || 'Não foi possível criar a transação.'
            });
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1);
    };

    const handleDelete = async (id: string) => {
        dialog.confirm({
            title: 'Confirmar Exclusão',
            message: 'Tem certeza que deseja apagar esta transação? Esta ação não pode ser desfeita.',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                try {
                    await financialService.deleteTransaction(id);
                    dialog.success({
                        title: 'Transação Removida!',
                        message: 'A transação foi removida com sucesso.'
                    });
                    loadData();
                } catch (error) {
                    dialog.error({
                        title: 'Erro ao Remover',
                        message: 'Não foi possível remover a transação.'
                    });
                }
            }
        });
    };

    const handleMarkAsPaid = async (t: FinancialTransaction) => {
        try {
            await financialService.updateTransaction(t.id, {
                status: 'PAID',
                paidAt: new Date().toISOString()
            });
            dialog.success({
                title: 'Status Atualizado!',
                message: 'Transação marcada como Pago/Recebido.'
            });
            loadData();
        } catch (error) {
            dialog.error({
                title: 'Erro ao Atualizar',
                message: 'Não foi possível atualizar o status.'
            });
        }
    };

    const getBalance = () => {
        // This logic is simplified; backend aggregating is better, but this works for client-side view of loaded data
        const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0);
        const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0);
        return income - expense;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-7 h-7 text-primary" />
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Gestão Financeira</h2>
                    </div>
                    <p className="text-[var(--text-secondary)]">Contas a pagar e receber</p>
                </div>
                <Button leftIcon={<Plus size={18} />} onClick={handleOpenModal}>Nova Transação</Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-green-50 border-green-100">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-green-600">Receitas (Mês)</p>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {/* Mock calculation from stats would be better here */}
                                    R$ {transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0).toFixed(2)}
                                </h3>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full text-green-600">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-100">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-red-600">Despesas (Mês)</p>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    R$ {transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0).toFixed(2)}
                                </h3>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full text-red-600">
                                <TrendingDown size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Saldo Atual</p>
                                <h3 className={`text-2xl font-bold ${getBalance() >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                                    R$ {getBalance().toFixed(2)}
                                </h3>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                <DollarSign size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-4">
                <select className="input-field max-w-[200px]" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
                    <option value="ALL">Todas os tipos</option>
                    <option value="INCOME">Receitas</option>
                    <option value="EXPENSE">Despesas</option>
                </select>
                <select className="input-field max-w-[200px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
                    <option value="ALL">Todos os status</option>
                    <option value="PENDING">Pendentes</option>
                    <option value="PAID">Liquidados</option>
                </select>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b border-border flex flex-col space-y-1.5">
                    <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                        <Wallet size={20} /> Lançamentos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table
                        data={transactions}
                        isLoading={loading}
                        columns={[
                            { header: 'Vencimento', accessor: 'dueDate', render: (val) => new Date(val).toLocaleDateString() },
                            { header: 'Descrição', accessor: 'description' },
                            { header: 'Categoria', accessor: 'category' },
                            { header: 'Parceiro', accessor: (row) => row.partner?.name || '-' },
                            {
                                header: 'Valor', accessor: 'amount', render: (val, item) => (
                                    <span className={item.type === 'INCOME' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                        {item.type === 'INCOME' ? '+' : '-'} R$ {Number(val).toFixed(2)}
                                    </span>
                                )
                            },
                            {
                                header: 'Status', accessor: 'status', render: (val) => (
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${val === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {val === 'PAID' ? 'PAGO' : 'PENDENTE'}
                                    </span>
                                )
                            },
                        ]}
                        actions={(item) => (
                            <div className="flex gap-2">
                                {item.status === 'PENDING' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMarkAsPaid(item)}
                                        className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        title="Marcar como Pago"
                                    >
                                        <CheckCircle size={16} />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
                                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Remover"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        )}


                        emptyState={
                            <EmptyState
                                title="Nenhuma transação encontrada"
                                description="Suas receitas e despesas aparecerão aqui."
                                icon={DollarSign}
                            />
                        }
                    />

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Itens por página:</span>
                            <select
                                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:border-[var(--primary)] dark:bg-[#1a1b1e] dark:border-gray-800 dark:text-white"
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Mostrando {transactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} />
                                Anterior
                            </Button>

                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                ? 'bg-[var(--primary)] text-white'
                                                : 'bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Próxima
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Transação"
                width="600px"
                icon={<DollarSign size={24} />}
            >
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium">Tipo</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-md flex-1 hover:bg-gray-50">
                                <input type="radio" name="type" value="INCOME" checked={formData.type === 'INCOME'} onChange={() => setFormData({ ...formData, type: 'INCOME' })} />
                                <span className="text-green-600 font-bold flex items-center gap-1"><TrendingUp size={16} /> Receita</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-md flex-1 hover:bg-gray-50">
                                <input type="radio" name="type" value="EXPENSE" checked={formData.type === 'EXPENSE'} onChange={() => setFormData({ ...formData, type: 'EXPENSE' })} />
                                <span className="text-red-600 font-bold flex items-center gap-1"><TrendingDown size={16} /> Despesa</span>
                            </label>
                        </div>
                    </div>

                    <Input label="Descrição" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} fullWidth className="col-span-2" />

                    <Input label="Valor (R$)" type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} fullWidth />
                    <Input label="Vencimento" type="date" required value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} fullWidth />

                    <div className="col-span-1 space-y-1">
                        <label className="text-sm font-medium">Categoria</label>
                        <select className="input-field w-full" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                            <option value="">Selecione...</option>
                            <option value="Vendas">Vendas</option>
                            <option value="Serviços">Serviços</option>
                            <option value="Fornecedores">Fornecedores</option>
                            <option value="Salários">Salários</option>
                            <option value="Aluguel">Aluguel</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>

                    <div className="col-span-1 space-y-1">
                        <label className="text-sm font-medium">Parceiro (Opcional)</label>
                        <select className="input-field w-full" value={formData.partnerId} onChange={e => setFormData({ ...formData, partnerId: e.target.value })}>
                            <option value="">Sem parceiro</option>
                            {partners.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2 flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} leftIcon={<X size={18} />}>Cancelar</Button>
                        <Button type="submit" leftIcon={<Save size={18} />}>Salvar</Button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};

export default FinancialPage;
