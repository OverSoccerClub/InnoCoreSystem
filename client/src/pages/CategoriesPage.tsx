import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/category.service';
import type { Category } from '../services/category.service';
import { Card, CardHeader, CardTitle, CardContent, Button, Table, Modal, Input, EmptyState } from '../components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Plus, Pencil, Trash2, Search, Save, Tag, X } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';

const CategoriesPage = () => {
    usePageTitle('Categorias');
    const dialog = useDialog();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadCategories();
    }, [currentPage, itemsPerPage, searchTerm]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const params: any = { page: currentPage, limit: itemsPerPage };
            if (searchTerm) params.search = searchTerm;

            const response = await categoryService.getAll(params);
            setCategories(response.data || []);
            setTotalItems(response.meta?.total || 0);
            setTotalPages(response.meta?.totalPages || 0);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar as categorias.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setName(category.name);
        } else {
            setEditingCategory(null);
            setName('');
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        dialog.confirm({
            title: 'Confirmar Exclusão',
            message: 'Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                try {
                    await categoryService.delete(id);
                    dialog.success({
                        title: 'Categoria Excluída!',
                        message: 'A categoria foi excluída com sucesso.'
                    });
                    loadCategories();
                } catch (error: any) {
                    dialog.error({
                        title: 'Erro ao Excluir',
                        message: error.message || 'Não foi possível excluir a categoria.'
                    });
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.id, name);
                dialog.success({
                    title: 'Categoria Atualizada!',
                    message: 'A categoria foi atualizada com sucesso.'
                });
            } else {
                await categoryService.create(name);
                dialog.success({
                    title: 'Categoria Criada!',
                    message: 'A nova categoria foi criada com sucesso.'
                });
            }
            setIsModalOpen(false);
            loadCategories();
        } catch (error: any) {
            dialog.error({
                title: 'Erro ao Salvar',
                message: error.message || 'Não foi possível salvar a categoria.'
            });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Tag className="w-7 h-7 text-primary" />
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Categorias</h2>
                    </div>
                    <p className="text-[var(--text-secondary)]">Organize seus produtos por segmentos</p>
                </div>
                <Button leftIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>Nova Categoria</Button>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b border-border">
                    <div className="flex flex-row justify-between items-center">
                        <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                            <Tag size={20} /> Lista de Categorias
                        </CardTitle>
                        <div className="w-64">
                            <Input
                                placeholder="Buscar categoria..."
                                leftIcon={<Search size={16} />}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table
                        data={categories}
                        isLoading={loading}
                        columns={[
                            { header: 'Nome', accessor: 'name' },
                            {
                                header: 'Produtos',
                                accessor: (c) => (
                                    <span className="badge badge-blue">
                                        {c._count?.products || 0} produtos
                                    </span>
                                )
                            },
                        ]}
                        actions={(category) => (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenModal(category)}
                                    className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="Editar"
                                >
                                    <Pencil size={16} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(category.id)}
                                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </>
                        )}
                        emptyState={
                            <EmptyState
                                title="Nenhuma categoria encontrada"
                                description="Tente ajustar sua busca ou adicione uma nova categoria."
                                icon={Tag}
                            />
                        }
                    />

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
                title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                width="400px"
                icon={<Tag size={24} />}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Nome da Categoria"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        fullWidth
                        placeholder="Ex: Bebidas, Lanches..."
                        leftIcon={<Tag size={18} />}
                    />

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} leftIcon={<X size={18} />}>Cancelar</Button>
                        <Button type="submit" leftIcon={<Save size={18} />}>Salvar</Button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};

export default CategoriesPage;
