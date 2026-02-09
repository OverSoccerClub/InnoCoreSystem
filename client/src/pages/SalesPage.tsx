import { useEffect, useState } from 'react';
import { productService } from '../services/product.service';
import { partnerService } from '../services/partner.service';
import type { Partner } from '../types/partner';
import { saleService } from '../services/sale.service';
import type { Sale } from '../services/sale.service';
import type { Product } from '../types/product';
import { Card, CardHeader, CardTitle, CardContent, Button, Table, Input } from '../components/ui';
import { Search, ShoppingCart, Trash2, CheckCircle, Package, Printer, History, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';

const SalesPage = () => {
    usePageTitle('Vendas');
    const dialog = useDialog();
    // Data States
    const [products, setProducts] = useState<Product[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [recentSales, setRecentSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [activeTab, setActiveTab] = useState<'POS' | 'HISTORY'>('POS');

    // Cart State
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('CASH');

    // Search States
    const [productSearch, setProductSearch] = useState('');

    // History Pagination
    const [historyPage, setHistoryPage] = useState(1);
    const [historyItemsPerPage, setHistoryItemsPerPage] = useState(10);
    const [historyTotalItems, setHistoryTotalItems] = useState(0);
    const [historyTotalPages, setHistoryTotalPages] = useState(0);

    // History Filters
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'HISTORY') {
            loadHistory();
        }
    }, [activeTab, historyPage, historyItemsPerPage, filterStatus, filterStartDate, filterEndDate]);

    const loadData = async () => {
        try {
            const [prodData, partData] = await Promise.all([
                productService.getAll({ limit: 1000 }), // Get all products for POS
                partnerService.getAll({ type: 'CLIENT', limit: 1000 }) // Get all clients
            ]);
            // Ensure we always set an array
            setProducts(Array.isArray(prodData.data) ? prodData.data : []);
            setPartners(Array.isArray(partData.data) ? partData.data : []);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar os dados.'
            });
            setProducts([]);
            setPartners([]);
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            const params: any = {
                page: historyPage,
                limit: historyItemsPerPage
            };

            if (filterStatus !== 'ALL') params.status = filterStatus;
            if (filterStartDate) params.startDate = filterStartDate;
            if (filterEndDate) params.endDate = filterEndDate;

            const response = await saleService.getAll(params);
            setRecentSales(response.data);
            setHistoryTotalItems(response.meta.total);
            setHistoryTotalPages(response.meta.totalPages);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar o histórico de vendas.'
            });
        }
    };

    const addToCart = (product: Product) => {
        // Check if enough stock
        if (product.stockQuantity <= 0) {
            dialog.error({
                title: 'Sem Estoque',
                message: 'Este produto está sem estoque.'
            });
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stockQuantity) {
                    dialog.error({
                        title: 'Estoque Insuficiente',
                        message: 'Não há estoque suficiente para adicionar mais unidades.'
                    });
                    return prev;
                }
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = item.quantity + delta;
                if (newQty <= 0) return item; // Don't remove, just min 1
                if (newQty > item.product.stockQuantity) {
                    dialog.error({
                        title: 'Limite de Estoque',
                        message: 'Estoque limite atingido para este produto.'
                    });
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);

    const handleFinalizeSale = async () => {
        if (cart.length === 0) {
            dialog.error({
                title: 'Carrinho Vazio',
                message: 'Adicione produtos ao carrinho antes de finalizar a venda.'
            });
            return;
        }

        try {
            await saleService.create({
                partnerId: selectedPartnerId || undefined,
                paymentMethod,
                items: cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: Number(item.product.price)
                }))
            });

            dialog.success({
                title: 'Venda Realizada!',
                message: 'A venda foi realizada com sucesso.'
            });

            setCart([]);
            setSelectedPartnerId('');
            setPaymentMethod('CASH');
            loadData(); // Reload stock
        } catch (error: any) {
            dialog.error({
                title: 'Erro ao Finalizar',
                message: error.message || 'Não foi possível finalizar a venda.'
            });
        }
    };

    // Filter products
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );

    const handleHistoryPageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= historyTotalPages) {
            setHistoryPage(newPage);
        }
    };

    const handleHistoryItemsPerPageChange = (newLimit: number) => {
        setHistoryItemsPerPage(newLimit);
        setHistoryPage(1);
    };

    return (
        <div className="p-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="w-7 h-7 text-primary" />
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Frente de Caixa (PDV)</h2>
                    </div>
                    <p className="text-[var(--text-secondary)]">Realize vendas e emita notas</p>
                </div>
                <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setActiveTab('POS')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'POS' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Store size={16} /> Nova Venda
                    </button>
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'HISTORY' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <History size={16} /> Histórico
                    </button>
                </div>
            </div>

            {activeTab === 'POS' ? (
                <div className="grid grid-cols-12 gap-6 h-full overflow-hidden">
                    {/* Left: Product Catalog */}
                    <div className="col-span-8 flex flex-col gap-4 h-full overflow-hidden">
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <div className="flex gap-4">
                                    <div className="w-full">
                                        <Input
                                            placeholder="Buscar produto (Nome ou SKU)..."
                                            leftIcon={<Search size={16} />}
                                            value={productSearch}
                                            onChange={e => setProductSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4 content-start">
                                {loading ? (
                                    <div className="flex justify-center items-center h-full">Carregando...</div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {filteredProducts.map(product => (
                                            <div key={product.id}
                                                className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all flex flex-col gap-2 ${product.stockQuantity <= 0 ? 'opacity-50 grayscale' : 'bg-white'}`}
                                                onClick={() => addToCart(product)}
                                            >
                                                <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 mb-2">
                                                    <Package size={40} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm line-clamp-2">{product.name}</h4>
                                                    <span className="text-xs text-gray-500 font-mono">{product.sku}</span>
                                                </div>
                                                <div className="flex justify-between items-end mt-2">
                                                    <span className="font-bold text-[var(--primary)]">R$ {Number(product.price).toFixed(2)}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {product.stockQuantity} un
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Cart & Checkout */}
                    <div className="col-span-4 flex flex-col h-full gap-4">
                        <Card className="h-full flex flex-col border-l-4 border-l-[var(--primary)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart size={20} /> Carrinho de Compras
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col p-4">
                                {/* Cart Items */}
                                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                                    {cart.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                            <ShoppingCart size={48} opacity={0.2} />
                                            <p>Carrinho vazio</p>
                                        </div>
                                    ) : (
                                        cart.map(item => (
                                            <div key={item.product.id} className="flex justify-between items-center border-b pb-2">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{item.product.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.quantity} x R$ {Number(item.product.price).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button className="w-6 h-6 rounded bg-gray-100 font-bold hover:bg-gray-200" onClick={() => updateQuantity(item.product.id, -1)}>-</button>
                                                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                                                    <button className="w-6 h-6 rounded bg-gray-100 font-bold hover:bg-gray-200" onClick={() => updateQuantity(item.product.id, 1)}>+</button>
                                                    <button className="text-red-500 hover:text-red-700 ml-2" onClick={() => removeFromCart(item.product.id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Checkout Details */}
                                <div className="mt-auto pt-4 border-t space-y-4">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total</span>
                                        <span>R$ {cartTotal.toFixed(2)}</span>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Cliente (Opcional)</label>
                                        <select
                                            className="input-field w-full"
                                            value={selectedPartnerId}
                                            onChange={e => setSelectedPartnerId(e.target.value)}
                                        >
                                            <option value="">Sem cliente identificado</option>
                                            {partners.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Forma de Pagamento</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button type="button"
                                                className={`p-2 text-sm border rounded hover:bg-gray-50 ${paymentMethod === 'CASH' ? 'border-[var(--primary)] bg-blue-50 text-[var(--primary)] font-semibold' : ''}`}
                                                onClick={() => setPaymentMethod('CASH')}
                                            >Dinheiro</button>
                                            <button type="button"
                                                className={`p-2 text-sm border rounded hover:bg-gray-50 ${paymentMethod === 'CREDIT_CARD' ? 'border-[var(--primary)] bg-blue-50 text-[var(--primary)] font-semibold' : ''}`}
                                                onClick={() => setPaymentMethod('CREDIT_CARD')}
                                            >Crédito</button>
                                            <button type="button"
                                                className={`p-2 text-sm border rounded hover:bg-gray-50 ${paymentMethod === 'DEBIT_CARD' ? 'border-[var(--primary)] bg-blue-50 text-[var(--primary)] font-semibold' : ''}`}
                                                onClick={() => setPaymentMethod('DEBIT_CARD')}
                                            >Débito</button>
                                            <button type="button"
                                                className={`p-2 text-sm border rounded hover:bg-gray-50 ${paymentMethod === 'PIX' ? 'border-[var(--primary)] bg-blue-50 text-[var(--primary)] font-semibold' : ''}`}
                                                onClick={() => setPaymentMethod('PIX')}
                                            >PIX</button>
                                        </div>
                                    </div>

                                    <Button
                                        fullWidth
                                        disabled={cart.length === 0}
                                        onClick={handleFinalizeSale}
                                        leftIcon={<CheckCircle size={18} />}
                                    >
                                        Finalizar Venda
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card>
                    <CardHeader className="px-6 py-4 border-b border-border">
                        <div className="flex flex-row justify-between items-center">
                            <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                                <History size={20} /> Histórico de Vendas Recentes
                            </CardTitle>
                            <div className="flex gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Status:</label>
                                    <select
                                        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:border-[var(--primary)] dark:bg-[#1a1b1e] dark:border-gray-800 dark:text-white"
                                        value={filterStatus}
                                        onChange={(e) => { setFilterStatus(e.target.value); setHistoryPage(1); }}
                                    >
                                        <option value="ALL">Todos</option>
                                        <option value="COMPLETED">Concluída</option>
                                        <option value="PENDING">Pendente</option>
                                        <option value="CANCELLED">Cancelada</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">De:</label>
                                    <input
                                        type="date"
                                        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:border-[var(--primary)] dark:bg-[#1a1b1e] dark:border-gray-800 dark:text-white"
                                        value={filterStartDate}
                                        onChange={(e) => { setFilterStartDate(e.target.value); setHistoryPage(1); }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Até:</label>
                                    <input
                                        type="date"
                                        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:border-[var(--primary)] dark:bg-[#1a1b1e] dark:border-gray-800 dark:text-white"
                                        value={filterEndDate}
                                        onChange={(e) => { setFilterEndDate(e.target.value); setHistoryPage(1); }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table
                            data={recentSales}
                            columns={[
                                { header: 'ID', accessor: (s) => `#${s.code.toString().padStart(6, '0')}` },
                                { header: 'Data', accessor: (s) => new Date(s.createdAt).toLocaleString() },
                                { header: 'Cliente', accessor: (s) => s.partner?.name || 'Cliente Balcão' },
                                { header: 'Valor', accessor: (s) => `R$ ${Number(s.total).toFixed(2)}` },
                                { header: 'Pagamento', accessor: 'paymentMethod' },
                            ]}
                            actions={(sale) => (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`/print/invoice/${sale.id}`, '_blank')}
                                    className="h-9 w-9 p-0 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                                    title="Imprimir Nota"
                                >
                                    <Printer size={18} />
                                </Button>
                            )}
                        />

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Itens por página:</span>
                                <select
                                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:border-[var(--primary)] dark:bg-[#1a1b1e] dark:border-gray-800 dark:text-white"
                                    value={historyItemsPerPage}
                                    onChange={(e) => handleHistoryItemsPerPageChange(Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Mostrando {recentSales.length === 0 ? 0 : (historyPage - 1) * historyItemsPerPage + 1} a {Math.min(historyPage * historyItemsPerPage, historyTotalItems)} de {historyTotalItems} registros
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleHistoryPageChange(historyPage - 1)}
                                    disabled={historyPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                    Anterior
                                </Button>

                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, historyTotalPages) }, (_, i) => {
                                        let pageNum;
                                        if (historyTotalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (historyPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (historyPage >= historyTotalPages - 2) {
                                            pageNum = historyTotalPages - 4 + i;
                                        } else {
                                            pageNum = historyPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handleHistoryPageChange(pageNum)}
                                                className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${historyPage === pageNum
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
                                    onClick={() => handleHistoryPageChange(historyPage + 1)}
                                    disabled={historyPage === historyTotalPages}
                                >
                                    Próxima
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SalesPage;
