import React, { useEffect, useState } from 'react';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import type { Category } from '../services/category.service';
import type { Product } from '../types/product';
import { PermissionGate } from '../components/auth/PermissionGate';
import { usePermission } from '../hooks/usePermission';

// ... (dentro do componente)
const { can } = usePermission();

// ... (renderização)
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

// ... (colunas da tabela)
actions = {(product) => (
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
emptyState = {
                            < EmptyState
title = "Nenhum produto encontrado"
description = "Tente ajustar os filtros ou adicione um novo produto."
icon = { Package }
    />
                        }
                    />

{/* Pagination Controls */ }
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
                </CardContent >
            </Card >

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
