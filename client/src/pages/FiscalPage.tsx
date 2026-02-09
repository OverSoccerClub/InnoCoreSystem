import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Table, EmptyState } from '../components/ui';
import { FileText, Send, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { fiscalService, type Invoice } from '../services/fiscal.service';

const FiscalPage = () => {
    usePageTitle('Fiscal');
    const dialog = useDialog();

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadInvoices();
    }, [currentPage, itemsPerPage]);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const response = await fiscalService.getAll({
                page: currentPage,
                limit: itemsPerPage,
            });
            setInvoices(response.data);
            setTotalItems(response.meta.total);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar as notas fiscais.',
            });
        } finally {
            setLoading(false);
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

    const handleTransmit = async (id: string) => {
        dialog.confirm({
            title: 'Transmitir Nota Fiscal',
            message: 'Deseja transmitir esta nota fiscal para a SEFAZ?',
            confirmText: 'Transmitir',
            cancelText: 'Cancelar',
            onConfirm: async () => {
                try {
                    await fiscalService.transmit(id);
                    dialog.success({
                        title: 'Nota Enviada!',
                        message: 'A nota fiscal foi enviada para transmissão.',
                    });
                    loadInvoices();
                } catch (error) {
                    dialog.error({
                        title: 'Erro na Transmissão',
                        message: 'Não foi possível transmitir a nota fiscal.',
                    });
                }
            }
        });
    };

    const handleDownloadXml = async (id: string) => {
        try {
            await fiscalService.downloadXml(id);
        } catch (error) {
            dialog.error({
                title: 'Erro no Download',
                message: 'Não foi possível baixar o XML da nota fiscal.',
            });
        }
    };

    const getStatusBadge = (status: Invoice['status']) => {
        const badges = {
            DRAFT: 'bg-gray-100 text-gray-700',
            PENDING: 'bg-yellow-100 text-yellow-700',
            AUTHORIZED: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700',
            CANCELLED: 'bg-slate-100 text-slate-700',
        };
        const labels = {
            DRAFT: 'Rascunho',
            PENDING: 'Pendente',
            AUTHORIZED: 'Autorizada',
            REJECTED: 'Rejeitada',
            CANCELLED: 'Cancelada',
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
                <div className="text-slate-500">Carregando notas fiscais...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <FileText className="w-7 h-7 text-primary" />
                        <h1 className="text-2xl font-bold text-slate-900">Notas Fiscais</h1>
                    </div>
                    <p className="text-slate-600 mt-1">Gestão de documentos fiscais eletrônicos</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Notas Fiscais Emitidas
                        </CardTitle>
                        <Button onClick={loadInvoices} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Atualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {invoices.length === 0 ? (
                        <EmptyState
                            title="Nenhuma nota fiscal encontrada"
                            description="Tente ajustar os filtros ou emita uma nova nota fiscal."
                            icon={FileText}
                        />
                    ) : (
                        <>
                            <Table
                                data={invoices}
                                isLoading={loading}
                                columns={[
                                    { header: 'Número', accessor: 'number' },
                                    { header: 'Série', accessor: 'series' },
                                    { header: 'Tipo', accessor: 'type' },
                                    { header: 'Parceiro', accessor: (inv) => inv.partner.name },
                                    { header: 'Valor', accessor: (inv) => `R$ ${Number(inv.amount).toFixed(2)}` },
                                    { header: 'Status', accessor: (inv) => getStatusBadge(inv.status) },
                                    { header: 'Data Emissão', accessor: (inv) => new Date(inv.issueDate).toLocaleDateString('pt-BR') },
                                ]}
                                actions={(invoice) => (
                                    <div className="flex gap-2">
                                        {invoice.status === 'DRAFT' && (
                                            <Button
                                                onClick={() => handleTransmit(invoice.id)}
                                                size="sm"
                                                variant="ghost"
                                                className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                title="Transmitir Sefaz"
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {invoice.xml && (
                                            <Button
                                                onClick={() => handleDownloadXml(invoice.id)}
                                                size="sm"
                                                variant="ghost"
                                                className="h-9 w-9 p-0 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                                                title="Baixar XML"
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            />

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-600">Itens por página:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
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
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => handlePageChange(currentPage + 1)}
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
        </div>
    );
};

export default FiscalPage;
