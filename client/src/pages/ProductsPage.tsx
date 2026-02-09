import React, { useEffect, useState } from 'react';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import type { Category } from '../services/category.service';
import type { Product } from '../types/product';
import { Card, CardHeader, CardTitle, CardContent, Button, Table, Modal, Input, EmptyState } from '../components/ui';
import { Plus, Pencil, Trash2, Search, Save, Package, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePermission } from '../hooks/usePermission';
import { PermissionGate } from '../components/auth/PermissionGate';

const ProductsPage = () => {
    usePageTitle('Produtos');
    const { can } = usePermission();
    const dialog = useDialog();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        sku: '',
        price: 0,
        costPrice: 0,
        stockQuantity: 0,
        description: ''
    });

    const [categories, setCategories] = useState<Category[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [stockFilter, setStockFilter] = useState<string>('all');

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [currentPage, itemsPerPage, searchTerm, selectedCategory, stockFilter]);

    const loadCategories = async () => {
        try {
            const response = await categoryService.getAll({ limit: 1000 });
            setCategories(response.data || []);
        } catch (error) {
            console.error('Erro ao carregar categorias');
            setCategories([]);
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getAll({
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                categoryId: selectedCategory,
                stockFilter: stockFilter
            });
            setProducts(response.data);
            setTotalItems(response.meta.total);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar os produtos.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                sku: product.sku,
                categoryId: product.categoryId || '',
                price: Number(product.price),
                costPrice: Number(product.costPrice || 0),
                stockQuantity: product.stockQuantity,
                description: product.description || '',
                ncm: product.ncm || '',
                cest: product.cest || '',
                cfop: product.cfop || '',
                origin: product.origin || 0,
                icmsRate: product.icmsRate || 0
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', sku: '', categoryId: '', price: 0, costPrice: 0, stockQuantity: 0, description: '', ncm: '', cest: '', cfop: '', origin: 0, icmsRate: 0 });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        dialog.confirm({
            title: 'Confirmar Exclusão',
            message: 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                try {
                    await productService.delete(id);
                    dialog.success({
                        title: 'Produto Excluído!',
                        message: 'O produto foi excluído com sucesso.'
                    });
                    loadProducts();
                } catch (error) {
                    dialog.error({
                        title: 'Erro ao Excluir',
                        message: 'Não foi possível excluir o produto.'
                    });
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clean data: Convert empty strings to undefined to satisfy Zod optional()
        const payload = {
            ...formData,
            categoryId: formData.categoryId || undefined,
            ncm: formData.ncm || undefined,
            cest: formData.cest || undefined,
            cfop: formData.cfop || undefined,
            icmsRate: formData.icmsRate ? formData.icmsRate : undefined,
            imageUrl: formData.imageUrl || undefined // If exist
        };

        try {
            if (editingProduct) {
                await productService.update(editingProduct.id, payload);
                dialog.success({
                    title: 'Produto Atualizado!',
                    message: 'O produto foi atualizado com sucesso.'
                });
            } else {
                await productService.create(payload);
                dialog.success({
                    title: 'Produto Criado!',
                    message: 'O novo produto foi criado com sucesso.'
                });
            }
            setIsModalOpen(false);
            setCurrentPage(1); // Reset to first page after create/update
            loadProducts();
        } catch (error: any) {
            console.error(error); // Log for debugging
            dialog.error({
                title: 'Erro ao Salvar',
                message: error.message || 'Não foi possível salvar o produto.'
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
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Package className="w-7 h-7 text-primary" />
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Produtos</h2>
                    </div>
                    <p className="text-[var(--text-secondary)]">Gerencie seu catálogo de itens</p>
                </div>
                <PermissionGate resource="products" action="create">
                    <Button leftIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>Novo Produto</Button>
                </PermissionGate>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b border-border">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                            <Package size={20} /> Catálogo
                        </CardTitle>
                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="w-full md:w-64">
                                <Input
                                    placeholder="Buscar (Nome, SKU)..."
                                    leftIcon={<Search size={16} />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:border-[var(--primary)] dark:bg-[#1a1b1e] dark:border-gray-800 dark:text-white"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">Todas as Categorias</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <select
                                className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:border-[var(--primary)] dark:bg-[#1a1b1e] dark:border-gray-800 dark:text-white"
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                            >
                                <option value="all">Todo o Estoque</option>
                                <option value="in">Em Estoque ({'>'} 10)</option>
                                <option value="low">Baixo Estoque (1-10)</option>
                                <option value="out">Sem Estoque (0)</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table
                        data={products}
                        isLoading={loading}
                        columns={[
                            { header: 'SKU', accessor: 'sku', className: 'w-24 font-mono text-sm font-medium text-gray-600' },
                            {
                                header: 'Produto',
                                accessor: (p) => (
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{p.name}</span>
                                        <span className="text-xs text-gray-500">{p.category?.name || 'Sem Categoria'}</span>
                                    </div>
                                )
                            },
                            {
                                header: 'Custo',
                                accessor: (p) => <span className="text-gray-500">R$ {Number(p.costPrice || 0).toFixed(2)}</span>
                            },
                            {
                                header: 'Venda',
                                accessor: (p) => <span className="font-semibold text-gray-900 dark:text-white">R$ {Number(p.price).toFixed(2)}</span>
                            },
                            {
                                header: 'Margem',
                                accessor: (p) => {
                                    const margin = p.price && p.costPrice && p.price > 0
                                        ? ((p.price - (p.costPrice || 0)) / p.price) * 100
                                        : 0;
                                    return (
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${margin > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {margin.toFixed(1)}%
                                        </span>
                                    );
                                }
                            },
                            {
                                header: 'Estoque',
                                accessor: (p) => (
                                    <span className={`badge ${p.stockQuantity > 10 ? 'badge-green' : p.stockQuantity > 0 ? 'badge-blue' : 'badge-red'}`}>
                                        {p.stockQuantity} un
                                    </span>
                                )
                            },
                        ]}
                        actions={(product) => (
                            <>
                                <PermissionGate resource="products" action="edit">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenModal(product)}
                                        className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        title="Editar"
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                </PermissionGate>
                                <PermissionGate resource="products" action="delete">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(product.id)}
                                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </PermissionGate>
                            </>
                        )}
                        emptyState={
                            <EmptyState
                                title="Nenhum produto encontrado"
                                description="Tente ajustar os filtros ou adicione um novo produto."
                                icon={Package}
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
                                Mostrando {products.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
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
                title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
                width="1000px"
                icon={<Package size={24} />}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Top Row: Identification */}
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                            <Input
                                label="Nome do Produto"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                fullWidth
                                placeholder="Ex: Teclado Mecânico"
                            />
                        </div>
                        <div className="col-span-2">
                            <Input
                                label="SKU"
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                required
                                fullWidth
                                placeholder="TEC-001"
                            />
                        </div>
                        <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">Categoria</label>
                            <select
                                className="input-field h-11 flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 dark:bg-[#1a1b1e] dark:border-gray-800 dark:text-white"
                                value={formData.categoryId || ''}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            >
                                <option value="">Selecione...</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <Input
                                label="Estoque"
                                type="number"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                                required
                                fullWidth
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Left Column: Pricing */}
                        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                            <h4 className="text-sm font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-1 h-4 bg-[var(--primary)] rounded-full"></span>
                                Precificação
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Custo (R$)"
                                    type="number"
                                    step="0.01"
                                    value={formData.costPrice || 0}
                                    onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                                    fullWidth
                                />
                                <Input
                                    label="Venda (R$)"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    required
                                    fullWidth
                                />
                            </div>
                            <div className="flex flex-col gap-1 mt-4">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">Margem de Lucro</label>
                                <div className={`flex h-11 w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold shadow-sm transition-colors
                                    ${formData.price && formData.costPrice ?
                                        ((formData.price - formData.costPrice) / formData.price * 100) > 0 ? 'text-green-600 bg-green-50/50 border-green-200' : 'text-red-500 bg-red-50/50 border-red-200'
                                        : 'text-gray-500'}
                                `}>
                                    {formData.price && formData.costPrice && formData.price > 0
                                        ? `${(((formData.price - (formData.costPrice || 0)) / formData.price) * 100).toFixed(2)}%`
                                        : '0.00%'}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Fiscal */}
                        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                            <h4 className="text-sm font-bold mb-4 text-gray-900 dark:text-white">Dados Fiscais</h4>
                            <div className="grid grid-cols-3 gap-3">
                                <Input
                                    label="NCM"
                                    value={formData.ncm || ''}
                                    onChange={e => setFormData({ ...formData, ncm: e.target.value })}
                                    maxLength={8}
                                    placeholder="00000000"
                                    fullWidth
                                />
                                <Input
                                    label="CEST"
                                    value={formData.cest || ''}
                                    onChange={e => setFormData({ ...formData, cest: e.target.value })}
                                    fullWidth
                                    placeholder="00.000.00"
                                />
                                <Input
                                    label="CFOP"
                                    value={formData.cfop || ''}
                                    onChange={e => setFormData({ ...formData, cfop: e.target.value })}
                                    maxLength={4}
                                    fullWidth
                                    placeholder="5102"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-3">
                                <div className="col-span-2 flex flex-col gap-1">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">Origem</label>
                                    <select
                                        className="input-field h-11 flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 dark:bg-[#1a1b1e] dark:border-gray-800 dark:text-white"
                                        value={formData.origin || 0}
                                        onChange={e => setFormData({ ...formData, origin: parseInt(e.target.value) })}
                                    >
                                        <option value={0}>0 - Nacional</option>
                                        <option value={1}>1 - Estrangeira (Imp. Direta)</option>
                                        <option value={2}>2 - Estrangeira (Adq. Mercado)</option>
                                    </select>
                                </div>
                                <Input
                                    label="ICMS (%)"
                                    type="number"
                                    value={formData.icmsRate || ''}
                                    onChange={e => setFormData({ ...formData, icmsRate: parseFloat(e.target.value) })}
                                    fullWidth
                                    placeholder="18.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Descrição</label>
                        <textarea
                            className="flex min-h-[60px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1a1b1e] dark:border-gray-800 dark:text-white"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detalhes técnicos, dimensões, material, etc..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} leftIcon={<X size={18} />}>Cancelar</Button>
                        <Button type="submit" leftIcon={<Save size={18} />}>Salvar Produto</Button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};

export default ProductsPage;
