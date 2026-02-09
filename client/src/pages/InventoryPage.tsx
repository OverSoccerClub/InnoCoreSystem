import React, { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventory.service';
import type { StockMovement } from '../services/inventory.service';
import { productService } from '../services/product.service';
import type { Product } from '../types/product';
import { Card, CardHeader, CardTitle, CardContent, Button, Table, Modal, Input, EmptyState } from '../components/ui';
import { ClipboardList, ArrowUpCircle, ArrowDownCircle, History, Package, ChevronLeft, ChevronRight, X, Save } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';

const InventoryPage = () => {
    usePageTitle('Estoque');
    const dialog = useDialog();
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        productId: '',
        type: 'IN' as 'IN' | 'OUT',
        quantity: 0,
        reason: ''
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadData();
    }, [currentPage, itemsPerPage]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [movData, prodData] = await Promise.all([
                inventoryService.getMovements({ page: currentPage, limit: itemsPerPage }),
                productService.getAll({ limit: 1000 })
            ]);
            setMovements(movData.data);
            setTotalItems(movData.meta.total);
            setTotalPages(movData.meta.totalPages);
            setProducts(Array.isArray(prodData.data) ? prodData.data : []);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar os dados de estoque.'
            });
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            productId: products.length > 0 ? products[0].id : '',
            type: 'IN',
            quantity: 1,
            reason: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.quantity <= 0) {
            dialog.error({
                title: 'Quantidade Inválida',
                message: 'A quantidade deve ser maior que zero.'
            });
            return;
        }
        try {
            await inventoryService.adjustStock(formData);
            dialog.success({
                title: 'Estoque Ajustado!',
                message: 'O estoque foi ajustado com sucesso.'
            });
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            dialog.error({
                title: 'Erro ao Ajustar',
                message: error.message || 'Não foi possível ajustar o estoque.'
            });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <ClipboardList className="w-7 h-7 text-primary" />
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Controle de Estoque</h2>
                    </div>
                    <p className="text-[var(--text-secondary)]">Gerencie entradas, saídas e consulte o histórico.</p>
                </div>
                <Button leftIcon={<ClipboardList size={18} />} onClick={handleOpenModal}>Novo Ajuste Manual</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total de Produtos</p>
                            <h3 className="text-2xl font-bold text-gray-800">{products.length}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <ArrowUpCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Entradas (Hoje)</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {movements.filter(m => m.type === 'IN' && new Date(m.createdAt).toDateString() === new Date().toDateString()).length}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-100">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                            <ArrowDownCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Saídas (Hoje)</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {movements.filter(m => m.type === 'OUT' && new Date(m.createdAt).toDateString() === new Date().toDateString()).length}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b border-border flex flex-col space-y-1.5">
                    <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                        <History size={20} /> Histórico de Movimentações
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table
                        data={movements}
                        isLoading={loading}
                        columns={[
                            { header: 'Data/Hora', accessor: 'createdAt', render: (val) => new Date(val).toLocaleString() },
                            { header: 'Produto', accessor: (row) => row.product?.name || 'N/A' },
                            { header: 'Tipo', accessor: 'type', render: (val) => val === 'IN' ? <span className="text-green-600 font-bold flex items-center gap-1"><ArrowUpCircle size={14} /> Entrada</span> : <span className="text-red-600 font-bold flex items-center gap-1"><ArrowDownCircle size={14} /> Saída</span> },
                            { header: 'Qtd.', accessor: 'quantity' },
                            { header: 'Motivo', accessor: 'reason' },
                            { header: 'Usuário', accessor: (row) => row.user?.name || 'Sistema' },
                        ]}
                    />

                    {movements.length === 0 && !loading && (
                        <EmptyState
                            title="Nenhuma movimentação registrada"
                            description="O histórico de entradas e saídas aparecerá aqui."
                            icon={History}
                        />
                    )}

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Itens por página:</span>
                            <select
                                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:border-[var(--primary)] dark:bg-[#1a1b1e] dark:border-gray-800 dark:text-white"
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Mostrando {movements.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                                            onClick={() => setCurrentPage(pageNum)}
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
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
                title="Ajuste Manual de Estoque"
                width="500px"
                icon={<ClipboardList size={24} />}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Produto</label>
                        <select
                            className="input-field w-full"
                            value={formData.productId}
                            onChange={e => setFormData({ ...formData, productId: e.target.value })}
                            required
                        >
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Atual: {p.stockQuantity})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo de Movimentação</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-md flex-1 hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="type"
                                    value="IN"
                                    checked={formData.type === 'IN'}
                                    onChange={() => setFormData({ ...formData, type: 'IN' })}
                                />
                                <span className="text-green-600 font-bold flex items-center gap-1"><ArrowUpCircle size={16} /> Entrada</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-md flex-1 hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="type"
                                    value="OUT"
                                    checked={formData.type === 'OUT'}
                                    onChange={() => setFormData({ ...formData, type: 'OUT' })}
                                />
                                <span className="text-red-600 font-bold flex items-center gap-1"><ArrowDownCircle size={16} /> Saída</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Quantidade"
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                            required
                            fullWidth
                        />
                    </div>

                    <Input
                        label="Motivo / Observação"
                        placeholder="Ex: Compra nf 123, Ajuste de inventário..."
                        value={formData.reason}
                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        required
                        fullWidth
                    />

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} leftIcon={<X size={18} />}>Cancelar</Button>
                        <Button type="submit" leftIcon={<Save size={18} />}>Confirmar Ajuste</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InventoryPage;
