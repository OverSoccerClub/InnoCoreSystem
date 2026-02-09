import { useEffect, useState } from 'react';
import { purchaseService } from '../services/purchase.service';
import type { Purchase } from '../services/purchase.service';
import { partnerService } from '../services/partner.service';
import type { Partner } from '../types/partner';
import { productService } from '../services/product.service';
import type { Product } from '../types/product';
import { Card, CardHeader, CardTitle, CardContent, Button, Table, Modal, Input, EmptyState } from '../components/ui';
import { Plus, Trash2, Save, ShoppingCart, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';

const PurchasesPage = () => {
    usePageTitle('Compras');
    const dialog = useDialog();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Form State
    const [selectedPartnerId, setSelectedPartnerId] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceSeries, setInvoiceSeries] = useState('');
    const [invoiceKey, setInvoiceKey] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

    // Items State
    const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);
    const [currentItem, setCurrentItem] = useState({ productId: '', quantity: 1, unitPrice: 0 });

    useEffect(() => {
        loadData();
    }, [currentPage, itemsPerPage]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [purchasesData, partnersData, productsData] = await Promise.all([
                purchaseService.getAll({ page: currentPage, limit: itemsPerPage }),
                partnerService.getAll({ limit: 1000 }),
                productService.getAll({ limit: 1000 })
            ]);
            setPurchases(purchasesData.data || []);
            setTotalItems(purchasesData.meta?.total || 0);
            setTotalPages(purchasesData.meta?.totalPages || 0);
            // Filter suppliers from paginated response
            const allPartners = Array.isArray(partnersData.data) ? partnersData.data : [];
            setPartners(allPartners.filter(p => p.type === 'SUPPLIER'));
            setProducts(Array.isArray(productsData.data) ? productsData.data : []);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar os dados.'
            });
            setPartners([]);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        if (!currentItem.productId || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
            dialog.error({
                title: 'Dados Inválidos',
                message: 'Preencha os dados do item corretamente.'
            });
            return;
        }
        setItems([...items, currentItem]);
        setCurrentItem({ productId: '', quantity: 1, unitPrice: 0 });
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPartnerId || items.length === 0) {
            dialog.error({
                title: 'Dados Incompletos',
                message: 'Selecione um fornecedor e adicione itens.'
            });
            return;
        }

        try {
            await purchaseService.create({
                partnerId: selectedPartnerId,
                invoiceNumber,
                invoiceSeries,
                invoiceKey,
                issueDate: new Date(issueDate).toISOString(),
                items
            });
            dialog.success({
                title: 'Entrada Registrada!',
                message: 'A entrada de mercadoria foi registrada com sucesso.'
            });
            setIsModalOpen(false);
            // Reset form
            setSelectedPartnerId('');
            setInvoiceNumber('');
            setInvoiceSeries('');
            setInvoiceKey('');
            setItems([]);
            loadData();
        } catch (error: any) {
            dialog.error({
                title: 'Erro ao Registrar',
                message: error.message || 'Não foi possível registrar a entrada.'
            });
        }
    };

    const total = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="w-7 h-7 text-primary" />
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Entrada de Mercadoria</h2>
                    </div>
                    <p className="text-[var(--text-secondary)]">Registre compras e alimente o estoque</p>
                </div>
                <Button leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>Nova Entrada</Button>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b border-border flex flex-col space-y-1.5">
                    <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                        <ShoppingCart size={20} /> Histórico de Entradas
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table
                        data={purchases}
                        isLoading={loading}
                        columns={[
                            { header: 'Data', accessor: (p) => new Date(p.createdAt).toLocaleDateString() },
                            { header: 'Fornecedor', accessor: (p) => p.partner?.name || '-' },
                            { header: 'NF', accessor: (p) => p.invoiceNumber ? `${p.invoiceNumber}/${p.invoiceSeries}` : '-' },
                            { header: 'Total', accessor: (p) => `R$ ${Number(p.total).toFixed(2)}` },
                            { header: 'Itens', accessor: (p) => p.items.length },
                        ]}
                    />

                    {purchases.length === 0 && !loading && (
                        <EmptyState
                            title="Nenhuma compra registrada"
                            description="As entradas de mercadoria aparecerão aqui."
                            icon={ShoppingCart}
                        />
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t">
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
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Entrada de Nota"
                width="800px"
                icon={<ShoppingCart size={24} />}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">Fornecedor</label>
                            <select
                                className="input-field h-10"
                                value={selectedPartnerId}
                                onChange={e => setSelectedPartnerId(e.target.value)}
                                required
                            >
                                <option value="">Selecione...</option>
                                {partners.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Data de Emissão"
                            type="date"
                            value={issueDate}
                            onChange={e => setIssueDate(e.target.value)}
                            fullWidth
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="Número NF"
                            value={invoiceNumber}
                            onChange={e => setInvoiceNumber(e.target.value)}
                            fullWidth
                        />
                        <Input
                            label="Série"
                            value={invoiceSeries}
                            onChange={e => setInvoiceSeries(e.target.value)}
                            fullWidth
                        />
                        <Input
                            label="Chave de Acesso"
                            value={invoiceKey}
                            onChange={e => setInvoiceKey(e.target.value)}
                            fullWidth
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-bold mb-3">Itens da Nota</h4>
                        <div className="grid grid-cols-12 gap-3 items-end mb-4">
                            <div className="col-span-5 flex flex-col gap-1">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">Produto</label>
                                <select
                                    className="input-field h-10"
                                    value={currentItem.productId}
                                    onChange={e => setCurrentItem({ ...currentItem, productId: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <Input
                                    label="Qtd"
                                    type="number"
                                    value={currentItem.quantity}
                                    onChange={e => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="col-span-3">
                                <Input
                                    label="Valor Unit."
                                    type="number"
                                    step="0.01"
                                    value={currentItem.unitPrice}
                                    onChange={e => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="col-span-2">
                                <Button type="button" onClick={addItem} fullWidth leftIcon={<Plus size={16} />}>Add</Button>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="bg-gray-50 rounded-md p-2 max-h-40 overflow-y-auto mb-2">
                            {items.length === 0 && <p className="text-center text-sm text-gray-500 py-4">Nenhum item adicionado</p>}
                            {items.map((item, idx) => {
                                const product = products.find(p => p.id === item.productId);
                                return (
                                    <div key={idx} className="flex justify-between items-center text-sm p-2 border-b last:border-0">
                                        <span>{product?.sku} - {product?.name}</span>
                                        <div className="flex items-center gap-4">
                                            <span>{item.quantity} x R$ {item.unitPrice.toFixed(2)}</span>
                                            <span className="font-bold">R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                                            <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="text-right font-bold text-lg">
                            Total Nota: R$ {total.toFixed(2)}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} leftIcon={<X size={18} />}>Cancelar</Button>
                        <Button type="submit" leftIcon={<Save size={18} />}>Registrar Entrada</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PurchasesPage;
