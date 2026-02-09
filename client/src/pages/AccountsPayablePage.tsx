import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, Input, EmptyState } from '../components/ui';
import { TrendingDown, Plus, DollarSign, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, Filter, X, Save } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { accountsPayableService, type AccountsPayable, type AccountsPayableStats } from '../services/accountsPayable.service';
import { partnerService } from '../services/partner.service';
import { chartOfAccountsService } from '../services/chartOfAccounts.service';

const AccountsPayablePage = () => {
    usePageTitle('Contas a Pagar');
    const dialog = useDialog();

    const [payables, setPayables] = useState<AccountsPayable[]>([]);
    const [stats, setStats] = useState<AccountsPayableStats | null>(null);
    const [partners, setPartners] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPayable, setSelectedPayable] = useState<AccountsPayable | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [partnerFilter, setPartnerFilter] = useState<string>('all');
    const [issueDateFrom, setIssueDateFrom] = useState<string>('');
    const [issueDateTo, setIssueDateTo] = useState<string>('');
    const [dueDateFrom, setDueDateFrom] = useState<string>('');
    const [dueDateTo, setDueDateTo] = useState<string>('');

    const [formData, setFormData] = useState({
        description: '',
        partnerId: '',
        accountId: '',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const [paymentData, setPaymentData] = useState({
        paidAmount: 0,
        paymentMethod: 'PIX' as 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX',
    });

    useEffect(() => {
        loadData();
    }, [currentPage, itemsPerPage, statusFilter, partnerFilter, issueDateFrom, issueDateTo, dueDateFrom, dueDateTo]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params: any = { page: currentPage, limit: itemsPerPage };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (partnerFilter !== 'all') params.partnerId = partnerFilter;
            if (issueDateFrom) params.issueDateFrom = issueDateFrom;
            if (issueDateTo) params.issueDateTo = issueDateTo;
            if (dueDateFrom) params.dueDateFrom = dueDateFrom;
            if (dueDateTo) params.dueDateTo = dueDateTo;

            const [payablesRes, statsRes, partnersRes, accountsRes] = await Promise.all([
                accountsPayableService.getAll(params),
                accountsPayableService.getStats(),
                partnerService.getAll(),
                chartOfAccountsService.getAll(true),
            ]);

            setPayables(payablesRes.data);
            setTotalItems(payablesRes.meta.total);
            setTotalPages(payablesRes.meta.totalPages);
            setStats(statsRes);
            setPartners(partnersRes.data);
            setAccounts(accountsRes.data);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar os dados.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            description: '',
            partnerId: '',
            accountId: '',
            amount: 0,
            dueDate: new Date().toISOString().split('T')[0],
            notes: '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await accountsPayableService.create({
                ...formData,
                dueDate: new Date(formData.dueDate).toISOString(),
            });
            dialog.success({
                title: 'Conta Criada!',
                message: 'A conta a pagar foi criada com sucesso.',
            });
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            dialog.error({
                title: 'Erro ao Salvar',
                message: 'Não foi possível criar a conta a pagar.',
            });
        }
    };

    const handleOpenPaymentModal = (payable: AccountsPayable) => {
        setSelectedPayable(payable);
        setPaymentData({
            paidAmount: Number(payable.amount),
            paymentMethod: 'PIX',
        });
        setIsPaymentModalOpen(true);
    };

    const handleRegisterPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayable) return;

        try {
            await accountsPayableService.pay(selectedPayable.id, paymentData);
            dialog.success({
                title: 'Pagamento Registrado!',
                message: 'O pagamento foi registrado com sucesso.',
            });
            setIsPaymentModalOpen(false);
            loadData();
        } catch (error) {
            dialog.error({
                title: 'Erro ao Registrar',
                message: 'Não foi possível registrar o pagamento.',
            });
        }
    };

    const getStatusBadge = (status: AccountsPayable['status']) => {
        const badges = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            PAID: 'bg-green-100 text-green-700',
            OVERDUE: 'bg-red-100 text-red-700',
            CANCELLED: 'bg-slate-100 text-slate-700',
        };
        const labels = {
            PENDING: 'Pendente',
            PAID: 'Pago',
            OVERDUE: 'Vencido',
            CANCELLED: 'Cancelado',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Carregando contas a pagar...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <TrendingDown className="w-7 h-7 text-primary" />
                        <h1 className="text-2xl font-bold text-slate-900">Contas a Pagar</h1>
                    </div>
                    <p className="text-slate-600 mt-1">Gestão de pagamentos</p>
                </div>
                <Button onClick={handleOpenModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Conta
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Pendente</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        R$ {Number(stats.pending.amount).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-slate-500">{stats.pending.count} contas</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-yellow-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Vencido</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        R$ {Number(stats.overdue.amount).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-slate-500">{stats.overdue.count} contas</p>
                                </div>
                                <TrendingDown className="w-8 h-8 text-red-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Pago</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        R$ {Number(stats.paid.amount).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-slate-500">{stats.paid.count} contas</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        R$ {Number(stats.total.amount).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-slate-500">{stats.total.count} contas</p>
                                </div>
                                <TrendingDown className="w-8 h-8 text-blue-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" />
                            Contas Cadastradas
                        </CardTitle>
                        <Button onClick={loadData} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Atualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="space-y-4 mb-4 p-4 bg-slate-50 rounded-lg">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">
                                    <Filter className="w-4 h-4 inline mr-1" />
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="all">Todos</option>
                                    <option value="PENDING">Pendente</option>
                                    <option value="PAID">Pago</option>
                                    <option value="OVERDUE">Vencido</option>
                                    <option value="CANCELLED">Cancelado</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">
                                    <Filter className="w-4 h-4 inline mr-1" />
                                    Parceiro
                                </label>
                                <select
                                    value={partnerFilter}
                                    onChange={(e) => {
                                        setPartnerFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="all">Todos</option>
                                    {partners.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Data de Emissão</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={issueDateFrom}
                                        onChange={(e) => {
                                            setIssueDateFrom(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="De"
                                        className="flex-1"
                                    />
                                    <Input
                                        type="date"
                                        value={issueDateTo}
                                        onChange={(e) => {
                                            setIssueDateTo(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Até"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Data de Vencimento</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={dueDateFrom}
                                        onChange={(e) => {
                                            setDueDateFrom(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="De"
                                        className="flex-1"
                                    />
                                    <Input
                                        type="date"
                                        value={dueDateTo}
                                        onChange={(e) => {
                                            setDueDateTo(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Até"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {payables.length === 0 ? (
                        <EmptyState
                            title="Nenhuma conta a pagar encontrada"
                            description="Tente ajustar os filtros ou adicione uma nova conta."
                            icon={TrendingDown}
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4">Descrição</th>
                                            <th className="text-left p-4">Parceiro</th>
                                            <th className="text-left p-4">Valor</th>
                                            <th className="text-left p-4">Vencimento</th>
                                            <th className="text-left p-4">Status</th>
                                            <th className="text-left p-4">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payables.map((payable) => (
                                            <tr key={payable.id} className="border-b hover:bg-slate-50">
                                                <td className="p-4">{payable.description}</td>
                                                <td className="p-4">{payable.partner.name}</td>
                                                <td className="p-4">R$ {Number(payable.amount).toFixed(2)}</td>
                                                <td className="p-4">{new Date(payable.dueDate).toLocaleDateString('pt-BR')}</td>
                                                <td className="p-4">{getStatusBadge(payable.status)}</td>
                                                <td className="p-4">
                                                    {payable.status === 'PENDING' && (
                                                        <Button
                                                            onClick={() => handleOpenPaymentModal(payable)}
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-9 p-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            title="Pagar"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Pagar
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
                                            size="sm"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} icon={<TrendingDown size={24} />} title="Nova Conta a Pagar">
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Parceiro</label>
                        <select
                            value={formData.partnerId}
                            onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            required
                        >
                            <option value="">Selecione...</option>
                            {partners.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Conta Contábil</label>
                        <select
                            value={formData.accountId}
                            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            required
                        >
                            <option value="">Selecione...</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Valor</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Data de Vencimento</label>
                        <Input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Observações</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} leftIcon={<X size={18} />}>
                            Cancelar
                        </Button>
                        <Button type="submit" leftIcon={<Save size={18} />}>Criar</Button>
                    </div>
                </form>
            </Modal>

            {/* Payment Modal */}
            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} icon={<CheckCircle size={24} />} title="Registrar Pagamento">
                <form onSubmit={handleRegisterPayment} className="space-y-4">

                    {selectedPayable && (
                        <div className="bg-slate-50 p-4 rounded">
                            <p className="text-sm text-slate-600">Descrição</p>
                            <p className="font-medium">{selectedPayable.description}</p>
                            <p className="text-sm text-slate-600 mt-2">Valor Original</p>
                            <p className="font-medium">R$ {Number(selectedPayable.amount).toFixed(2)}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Valor Pago</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={paymentData.paidAmount}
                            onChange={(e) => setPaymentData({ ...paymentData, paidAmount: Number(e.target.value) })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                        <select
                            value={paymentData.paymentMethod}
                            onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value as any })}
                            className="w-full border rounded px-3 py-2"
                            required
                        >
                            <option value="CASH">Dinheiro</option>
                            <option value="CREDIT_CARD">Cartão de Crédito</option>
                            <option value="DEBIT_CARD">Cartão de Débito</option>
                            <option value="PIX">PIX</option>
                        </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)} leftIcon={<X size={18} />}>
                            Cancelar
                        </Button>
                        <Button type="submit" leftIcon={<CheckCircle size={18} />}>Registrar Pagamento</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AccountsPayablePage;
