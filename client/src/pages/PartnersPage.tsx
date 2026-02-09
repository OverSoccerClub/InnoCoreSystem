import React, { useEffect, useState } from 'react';
import { partnerService } from '../services/partner.service';
import type { Partner } from '../types/partner';
import { Card, CardHeader, CardTitle, CardContent, Button, Table, Modal, Input, EmptyState } from '../components/ui';
import { Plus, Pencil, Trash2, Search, Save, Users, Truck, Info, MapPin, Tablet, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePermission } from '../hooks/usePermission';
import { PermissionGate } from '../components/auth/PermissionGate';

const PartnersPage = () => {
    usePageTitle('Parceiros');
    const { can } = usePermission();
    const dialog = useDialog();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [activeTab, setActiveTab] = useState<'CLIENT' | 'SUPPLIER'>('CLIENT');
    const [formTab, setFormTab] = useState<'GENERAL' | 'ADDRESS' | 'DETAILS'>('GENERAL');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<Partial<Partner>>({
        name: '',
        fantasyName: '',
        email: '',
        phone: '',
        mobile: '',
        document: '',
        type: 'CLIENT',
        ie: '',
        im: '',
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        notes: '',
        active: true
    });

    useEffect(() => {
        loadPartners();
    }, [activeTab, currentPage, itemsPerPage, searchTerm]);

    const loadPartners = async () => {
        setLoading(true);
        try {
            const response = await partnerService.getAll({
                type: activeTab,
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm
            });
            setPartners(response.data);
            setTotalItems(response.meta.total);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar os parceiros.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (partner?: Partner) => {
        setFormTab('GENERAL');
        if (partner) {
            setEditingPartner(partner);
            setFormData({
                ...partner,
                name: partner.name,
                type: partner.type
            });
        } else {
            setEditingPartner(null);
            setFormData({
                name: '',
                fantasyName: '',
                email: '',
                phone: '',
                mobile: '',
                document: '',
                type: activeTab,
                ie: '',
                im: '',
                zipCode: '',
                street: '',
                number: '',
                complement: '',
                neighborhood: '',
                city: '',
                state: '',
                notes: '',
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        dialog.confirm({
            title: 'Confirmar Exclusão',
            message: 'Tem certeza que deseja excluir este parceiro? Esta ação não pode ser desfeita.',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                try {
                    await partnerService.delete(id);
                    dialog.success({
                        title: 'Parceiro Excluído!',
                        message: 'O parceiro foi excluído com sucesso.'
                    });
                    loadPartners();
                } catch (error) {
                    dialog.error({
                        title: 'Erro ao Excluir',
                        message: 'Não foi possível excluir o parceiro.'
                    });
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Clean undefined/empty fields before submit if needed, or backend handles it
            if (editingPartner) {
                await partnerService.update(editingPartner.id, formData);
                dialog.success({
                    title: 'Parceiro Atualizado!',
                    message: 'O parceiro foi atualizado com sucesso.'
                });
            } else {
                await partnerService.create(formData);
                dialog.success({
                    title: 'Parceiro Criado!',
                    message: 'O novo parceiro foi criado com sucesso.'
                });
            }
            setIsModalOpen(false);
            setCurrentPage(1);
            loadPartners();
        } catch (error: any) {
            dialog.error({
                title: 'Erro ao Salvar',
                message: error.message || 'Não foi possível salvar o parceiro.'
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

    // Helper to find address by CEP (Optional: could implement via ViaCEP API later)
    const handleCepBlur = async () => {
        if (formData.zipCode?.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${formData.zipCode}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf,
                        complement: data.complemento
                    }));
                }
            } catch (error) {
                console.error('Erro ao buscar CEP', error);
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Users className="w-7 h-7 text-primary" />
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Parceiros</h2>
                    </div>
                    <p className="text-[var(--text-secondary)]">Gerencie seus Clientes e Fornecedores</p>
                </div>
                <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setActiveTab('CLIENT')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'CLIENT' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Users size={16} /> Clientes
                    </button>
                    <button
                        onClick={() => setActiveTab('SUPPLIER')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'SUPPLIER' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Truck size={16} /> Fornecedores
                    </button>
                </div>
                <PermissionGate resource="partners" action="create">
                    <Button leftIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>Novo {activeTab === 'CLIENT' ? 'Cliente' : 'Fornecedor'}</Button>
                </PermissionGate>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b border-border">
                    <div className="flex flex-row justify-between items-center">
                        <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                            <Users size={20} /> Listagem de {activeTab === 'CLIENT' ? 'Clientes' : 'Fornecedores'}
                        </CardTitle>
                        <div className="w-64">
                            <Input
                                placeholder="Buscar por nome ou doc..."
                                leftIcon={<Search size={16} />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table
                        data={partners}
                        isLoading={loading}
                        columns={[
                            { header: 'Nome / Razão Social', accessor: 'name' },
                            { header: 'Nome Fantasia', accessor: (p) => p.fantasyName || '-' },
                            { header: 'Documento', accessor: 'document' },
                            { header: 'Cidade/UF', accessor: (p) => p.city ? `${p.city}/${p.state}` : '-' },
                            { header: 'Telefone', accessor: (p) => p.phone || p.mobile || '-' },
                        ]}
                        actions={(partner) => (
                            <>
                                <PermissionGate resource="partners" action="edit">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenModal(partner)}
                                        className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        title="Editar"
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                </PermissionGate>
                                <PermissionGate resource="partners" action="delete">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(partner.id)}
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
                                title="Nenhum parceiro encontrado"
                                description={`Tente ajustar sua busca ou adicione um novo ${activeTab === 'CLIENT' ? 'cliente' : 'fornecedor'}.`}
                                icon={Users}
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
                                Mostrando {partners.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
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
                title={editingPartner ? `Editar ${activeTab === 'CLIENT' ? 'Cliente' : 'Fornecedor'}` : `Novo ${activeTab === 'CLIENT' ? 'Cliente' : 'Fornecedor'}`}
                width="800px"
                icon={<Users size={24} />}
            >
                <div className="flex flex-col gap-6">
                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            type="button"
                            onClick={() => setFormTab('GENERAL')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === 'GENERAL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center gap-2"><Info size={16} /> Dados Gerais</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormTab('ADDRESS')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === 'ADDRESS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center gap-2"><MapPin size={16} /> Endereço</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormTab('DETAILS')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === 'DETAILS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center gap-2"><Tablet size={16} /> Detalhes</div>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {formTab === 'GENERAL' && (
                            <>
                                <Input
                                    label="Razão Social / Nome Completo"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    fullWidth
                                    placeholder="Ex: Minha Empresa LTDA"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Nome Fantasia"
                                        value={formData.fantasyName}
                                        onChange={e => setFormData({ ...formData, fantasyName: e.target.value })}
                                        fullWidth
                                        placeholder="Ex: Loja do João"
                                    />
                                    <Input
                                        label={activeTab === 'CLIENT' ? "CPF/CNPJ" : "CNPJ"}
                                        value={formData.document}
                                        onChange={e => setFormData({ ...formData, document: e.target.value })}
                                        fullWidth
                                        placeholder="Digite apenas números"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Inscrição Estadual"
                                        value={formData.ie}
                                        onChange={e => setFormData({ ...formData, ie: e.target.value })}
                                        fullWidth
                                    />
                                    <Input
                                        label="Inscrição Municipal"
                                        value={formData.im}
                                        onChange={e => setFormData({ ...formData, im: e.target.value })}
                                        fullWidth
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        fullWidth
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            label="Telefone Fixo"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            fullWidth
                                        />
                                        <Input
                                            label="Celular/WhatsApp"
                                            value={formData.mobile}
                                            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                            fullWidth
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {formTab === 'ADDRESS' && (
                            <>
                                <div className="grid grid-cols-4 gap-4 items-end">
                                    <div className="col-span-1">
                                        <Input
                                            label="CEP"
                                            value={formData.zipCode}
                                            onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                            onBlur={handleCepBlur}
                                            fullWidth
                                            placeholder="00000-000"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            label="Logradouro (Rua, Av...)"
                                            value={formData.street}
                                            onChange={e => setFormData({ ...formData, street: e.target.value })}
                                            fullWidth
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-1">
                                        <Input
                                            label="Número"
                                            value={formData.number}
                                            onChange={e => setFormData({ ...formData, number: e.target.value })}
                                            fullWidth
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <Input
                                            label="Complemento"
                                            value={formData.complement}
                                            onChange={e => setFormData({ ...formData, complement: e.target.value })}
                                            fullWidth
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            label="Bairro"
                                            value={formData.neighborhood}
                                            onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                                            fullWidth
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-3">
                                        <Input
                                            label="Cidade"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            fullWidth
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <Input
                                            label="UF"
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                                            maxLength={2}
                                            fullWidth
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {formTab === 'DETAILS' && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">Observações</label>
                                    <textarea
                                        className="input-field min-h-[150px]"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Informações adicionais sobre o parceiro..."
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="active" className="text-sm font-medium text-gray-700">Cadastro Ativo</label>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} leftIcon={<X size={18} />}>Cancelar</Button>
                            <Button type="submit" leftIcon={<Save size={18} />}>Salvar Parceiro</Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div >
    );
};

export default PartnersPage;
