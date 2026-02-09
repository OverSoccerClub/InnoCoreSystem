import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { saleService } from '../services/sale.service';
import type { Sale } from '../services/sale.service';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

const PrintInvoicePage = () => {
    const { id } = useParams();
    const [sale, setSale] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadSale(id);
        }
    }, [id]);

    const loadSale = async (saleId: string) => {
        try {
            const data = await saleService.getById(saleId);
            setSale(data);
            // Optional: Auto-print when loaded
            // setTimeout(() => window.print(), 500); 
        } catch (error) {
            toast.error('Erro ao carregar venda para impressão');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    if (!sale) return <div className="flex items-center justify-center h-screen">Venda não encontrada</div>;

    const company = {
        name: "InnoCore Tech Solutions",
        cnpj: "12.345.678/0001-90",
        address: "Rua das Inovações, 1000 - Centro",
        city: "São Paulo - SP",
        phone: "(11) 99999-8888",
        email: "contato@innocore.com.br"
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
            <div className="max-w-[210mm] mx-auto bg-white shadow-lg p-8 print:shadow-none print:w-full">

                {/* Header Actions (Hidden on Print) */}
                <div className="flex justify-end mb-6 print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Printer size={18} /> Imprimir Nota
                    </button>
                </div>

                {/* Invoice Header */}
                <div className="border-b-2 border-gray-800 pb-4 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">{company.name}</h1>
                            <p className="text-sm text-gray-600">{company.address}</p>
                            <p className="text-sm text-gray-600">{company.city}</p>
                            <p className="text-sm text-gray-600">CNPJ: {company.cnpj}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800">PEDIDO DE VENDA</h2>
                            <p className="text-lg text-gray-600">#{sale.code.toString().padStart(6, '0')}</p>
                            <p className="text-sm text-gray-500 mt-1">Data: {new Date(sale.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500">Hora: {new Date(sale.createdAt).toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>

                {/* Client Info */}
                <div className="mb-8 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-2 border-b border-gray-300 pb-1">Dados do Cliente</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p><span className="font-semibold">Nome:</span> {sale.partner?.name || 'Cliente Consumidor'}</p>
                            {sale.partner?.document && <p><span className="font-semibold">CPF/CNPJ:</span> {sale.partner.document}</p>}
                            {sale.partner?.email && <p><span className="font-semibold">Email:</span> {sale.partner.email}</p>}
                        </div>
                        <div>
                            {sale.partner?.phone && <p><span className="font-semibold">Telefone:</span> {sale.partner.phone}</p>}
                            {sale.partner?.street && (
                                <p><span className="font-semibold">Endereço:</span> {`${sale.partner.street}, ${sale.partner.number || 'S/N'}`}</p>
                            )}
                            {sale.partner?.city && (
                                <p><span className="font-semibold">Cidade:</span> {`${sale.partner.city} - ${sale.partner.state || ''}`}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="text-left py-2 px-2 font-semibold text-gray-700">Item</th>
                                <th className="text-left py-2 px-2 font-semibold text-gray-700">Descrição</th>
                                <th className="text-right py-2 px-2 font-semibold text-gray-700">Qtd</th>
                                <th className="text-right py-2 px-2 font-semibold text-gray-700">Vl. Unit.</th>
                                <th className="text-right py-2 px-2 font-semibold text-gray-700">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sale.items.map((item, index) => (
                                <tr key={item.productId}>
                                    <td className="py-2 px-2 text-gray-600">{index + 1}</td>
                                    <td className="py-2 px-2 text-gray-900">{item.product?.name || 'Produto sem nome'}</td>
                                    <td className="py-2 px-2 text-right text-gray-600">{item.quantity}</td>
                                    <td className="py-2 px-2 text-right text-gray-600">R$ {Number(item.unitPrice).toFixed(2)}</td>
                                    <td className="py-2 px-2 text-right font-medium text-gray-900">R$ {(item.quantity * item.unitPrice).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-300">
                            <tr>
                                <td colSpan={4} className="py-3 px-2 text-right font-bold text-gray-800 text-lg">TOTAL GERAL:</td>
                                <td className="py-3 px-2 text-right font-bold text-gray-900 text-lg">R$ {Number(sale.total).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Payment Info */}
                <div className="mb-12">
                    <p className="text-sm text-gray-600"><span className="font-semibold">Forma de Pagamento:</span> {sale.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : sale.paymentMethod === 'DEBIT_CARD' ? 'Cartão de Débito' : sale.paymentMethod}</p>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-300 pt-8 text-center text-xs text-gray-500">
                    <p>Documento sem valor fiscal - Controle Interno</p>
                    <p>InnoCore System - www.innocore.com.br</p>
                </div>
            </div>
        </div>
    );
};

export default PrintInvoicePage;
