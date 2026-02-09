import React, { useEffect, useState } from 'react';
import { userService } from '../services/user.service';
import type { User } from '../types/auth'; // Ensure type-only import
import { Card, CardHeader, CardTitle, CardContent, Button, Table, Modal, Input, EmptyState } from '../components/ui';
import { Plus, Pencil, Trash2, Search, Save, UserCog, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';

const UsersPage = () => {
    usePageTitle('Usuários');
    const dialog = useDialog();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER' as any,
        permissions: [] as string[]
    });

    const PERMISSION_GROUPS = [
        {
            title: 'Gestão',
            permissions: [
                { id: 'dashboard.view', label: 'Visualizar Dashboard' },
            ]
        },
        {
            title: 'Vendas (PDV)',
            permissions: [
                { id: 'sales.view', label: 'Visualizar Vendas' },
                { id: 'sales.create', label: 'Realizar Vendas' },
            ]
        },
        {
            title: 'Logística',
            permissions: [
                { id: 'products.view', label: 'Visualizar Produtos' },
                { id: 'products.manage', label: 'Gerenciar Produtos' },
                { id: 'categories.view', label: 'Visualizar Categorias' },
                { id: 'categories.manage', label: 'Gerenciar Categorias' },
                { id: 'inventory.view', label: 'Visualizar Estoque' },
                { id: 'inventory.manage', label: 'Gerenciar Estoque' },
                { id: 'purchases.view', label: 'Visualizar Compras' },
                { id: 'purchases.manage', label: 'Gerenciar Compras' },
            ]
        },
        {
            title: 'Financeiro',
            permissions: [
                { id: 'financial.view', label: 'Visualizar Fluxo de Caixa' },
                { id: 'financial.manage', label: 'Gerenciar Lançamentos' },
                { id: 'accounts.receivable.view', label: 'Visualizar Contas a Receber' },
                { id: 'accounts.receivable.manage', label: 'Gerenciar Contas a Receber' },
                { id: 'accounts.payable.view', label: 'Visualizar Contas a Pagar' },
                { id: 'accounts.payable.manage', label: 'Gerenciar Contas a Pagar' },
            ]
        },
        {
            title: 'Fiscal',
            permissions: [
                { id: 'fiscal.view', label: 'Visualizar Notas Fiscais' },
                { id: 'fiscal.manage', label: 'Emitir/Gerenciar Notas' },
            ]
        },
        {
            title: 'Sistema',
            permissions: [
                { id: 'users.view', label: 'Visualizar Usuários' },
                { id: 'users.manage', label: 'Gerenciar Usuários' },
                { id: 'settings.view', label: 'Configurações da Empresa' },
            ]
        }
    ];

    const togglePermission = (permissionId: string) => {
        setFormData(prev => {
            const current = prev.permissions || [];
            if (current.includes(permissionId)) {
                return { ...prev, permissions: current.filter(p => p !== permissionId) };
            } else {
                return { ...prev, permissions: [...current, permissionId] };
            }
        });
    };

    useEffect(() => {
        loadUsers();
    }, [currentPage, itemsPerPage]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getAll({ page: currentPage, limit: itemsPerPage });
            setUsers(response.data || []);
            setTotalItems(response.meta?.total || 0);
            setTotalPages(response.meta?.totalPages || 0);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar os usuários.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Don't show password
                role: user.role,
                permissions: user.permissions || []
            });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'USER' as any, permissions: [] });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        dialog.confirm({
            title: 'Confirmar Exclusão',
            message: 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                try {
                    await userService.delete(id);
                    dialog.success({
                        title: 'Usuário Excluído!',
                        message: 'O usuário foi excluído com sucesso.'
                    });
                    loadUsers();
                } catch (error) {
                    dialog.error({
                        title: 'Erro ao Excluir',
                        message: 'Não foi possível excluir o usuário.'
                    });
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userService.update(editingUser.id, formData);
                dialog.success({
                    title: 'Usuário Atualizado!',
                    message: 'O usuário foi atualizado com sucesso.'
                });
            } else {
                if (!formData.password) {
                    dialog.error({
                        title: 'Senha Obrigatória',
                        message: 'A senha é obrigatória para novos usuários.'
                    });
                    return;
                }
                await userService.create(formData);
                dialog.success({
                    title: 'Usuário Criado!',
                    message: 'O novo usuário foi criado com sucesso.'
                });
            }
            setIsModalOpen(false);
            loadUsers();
        } catch (error: any) {
            dialog.error({
                title: 'Erro ao Salvar',
                message: error.message || 'Não foi possível salvar o usuário.'
            });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <UserCog className="w-7 h-7 text-primary" />
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Usuários</h2>
                    </div>
                    <p className="text-[var(--text-secondary)]">Gerencie o acesso ao sistema</p>
                </div>
                <Button leftIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>Novo Usuário</Button>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b border-border">
                    <div className="flex flex-row justify-between items-center">
                        <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                            <UserCog size={20} /> Listagem
                        </CardTitle>
                        <div className="w-64">
                            <Input
                                placeholder="Buscar usuário..."
                                leftIcon={<Search size={16} />}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table
                        data={users}
                        isLoading={loading}
                        columns={[
                            { header: 'Nome', accessor: 'name' },
                            { header: 'Email', accessor: 'email' },
                            {
                                header: 'Função',
                                accessor: (user) => (
                                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-blue' : 'badge-gray'}`}>
                                        {user.role}
                                    </span>
                                )
                            },
                        ]}
                        actions={(user) => (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenModal(user)}
                                    className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="Editar"
                                >
                                    <Pencil size={16} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(user.id)}
                                    className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </>
                        )}

                        emptyState={
                            <EmptyState
                                title="Nenhum usuário encontrado"
                                description="Tente ajustar sua busca ou adicione um novo usuário."
                                icon={UserCog}
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
                title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                icon={<UserCog size={24} />}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Nome Completo"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        fullWidth
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                        fullWidth
                    />
                    <Input
                        label={editingUser ? "Nova Senha (opcional)" : "Senha"}
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        fullWidth
                    />

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Função</label>
                        <select
                            className="input-field"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                        >
                            <option value="USER">Usuário Padrão</option>
                            <option value="MANAGER">Gerente</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>

                    {formData.role !== 'ADMIN' && (
                        <div className="space-y-3 pt-2 border-t border-slate-100 mt-2">
                            <h4 className="font-semibold text-sm text-slate-800">Permissões de Acesso</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {PERMISSION_GROUPS.map((group) => (
                                    <div key={group.title} className="space-y-2">
                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1 mb-1">{group.title}</h5>
                                        <div className="space-y-1">
                                            {group.permissions.map((perm) => (
                                                <label key={perm.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer transition-colors group">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions?.includes(perm.id)}
                                                        onChange={() => togglePermission(perm.id)}
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 select-none">{perm.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} leftIcon={<X size={18} />}>Cancelar</Button>
                        <Button type="submit" leftIcon={<Save size={18} />}>Salvar</Button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};

export default UsersPage;
