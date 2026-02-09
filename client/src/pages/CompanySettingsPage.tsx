import { useEffect, useState } from 'react';
import { companyService } from '../services/company.service';
import type { Company } from '../types/company';
import { TaxRegime, NfeEnvironment } from '../types/company';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../components/ui';
import { Save, Building2, MapPin, FileText, Settings as SettingsIcon } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';

const CompanySettingsPage = () => {
    usePageTitle('Configurações da Empresa');
    const dialog = useDialog();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Company>>({
        legalName: '',
        tradeName: '',
        cnpj: '',
        ie: '',
        im: '',
        email: '',
        phone: '',
        website: '',
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        taxRegime: TaxRegime.SIMPLES_NACIONAL,
        cnae: '',
        nfeEnvironment: NfeEnvironment.HOMOLOGACAO,
        nfeSeries: '1',
        nfeNextNumber: 1
    });

    useEffect(() => {
        loadCompany();
    }, []);

    const loadCompany = async () => {
        try {
            const company = await companyService.getCompany();
            if (company) {
                setFormData(company);
            }
        } catch (error) {
            dialog.error({
                title: 'Erro ao Carregar',
                message: 'Não foi possível carregar os dados da empresa.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof Company, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCepBlur = async () => {
        const cep = formData.zipCode?.replace(/\D/g, '');
        if (cep && cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }));
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await companyService.saveCompany(formData);
            dialog.success({
                title: 'Dados Salvos!',
                message: 'As informações da empresa foram salvas com sucesso.'
            });
            loadCompany();
        } catch (error: any) {
            dialog.error({
                title: 'Erro ao Salvar',
                message: error.message || 'Não foi possível salvar os dados da empresa.'
            });
        } finally {
            setSaving(false);
        }
    };

    const formatCNPJ = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .slice(0, 18);
    };

    const formatCEP = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 9);
    };

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 15);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <div className="flex items-center gap-3">
                    <Building2 className="w-7 h-7 text-primary" />
                    <h2 className="text-2xl font-bold text-slate-900">Configurações da Empresa</h2>
                </div>
                <p className="text-slate-600">Gerencie os dados da sua empresa</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados Básicos */}
                <Card>
                    <CardHeader className="px-6 py-4 border-b border-border">
                        <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                            <Building2 size={20} /> Dados Básicos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Razão Social *"
                                value={formData.legalName}
                                onChange={(e) => handleChange('legalName', e.target.value)}
                                required
                                fullWidth
                            />
                            <Input
                                label="Nome Fantasia"
                                value={formData.tradeName}
                                onChange={(e) => handleChange('tradeName', e.target.value)}
                                fullWidth
                            />
                            <Input
                                label="CNPJ *"
                                value={formatCNPJ(formData.cnpj || '')}
                                onChange={(e) => handleChange('cnpj', e.target.value.replace(/\D/g, ''))}
                                required
                                fullWidth
                                placeholder="00.000.000/0000-00"
                            />
                            <Input
                                label="Inscrição Estadual"
                                value={formData.ie}
                                onChange={(e) => handleChange('ie', e.target.value)}
                                fullWidth
                            />
                            <Input
                                label="Inscrição Municipal"
                                value={formData.im}
                                onChange={(e) => handleChange('im', e.target.value)}
                                fullWidth
                            />
                            <Input
                                label="Email *"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                required
                                fullWidth
                            />
                            <Input
                                label="Telefone *"
                                value={formatPhone(formData.phone || '')}
                                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                                required
                                fullWidth
                                placeholder="(00) 00000-0000"
                            />
                            <Input
                                label="Website"
                                type="url"
                                value={formData.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                fullWidth
                                placeholder="https://"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Endereço */}
                <Card>
                    <CardHeader className="px-6 py-4 border-b border-border">
                        <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                            <MapPin size={20} /> Endereço
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="CEP *"
                                value={formatCEP(formData.zipCode || '')}
                                onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, ''))}
                                onBlur={handleCepBlur}
                                required
                                fullWidth
                                placeholder="00000-000"
                            />
                            <div></div>
                            <div className="md:col-span-2">
                                <Input
                                    label="Logradouro *"
                                    value={formData.street}
                                    onChange={(e) => handleChange('street', e.target.value)}
                                    required
                                    fullWidth
                                />
                            </div>
                            <Input
                                label="Número *"
                                value={formData.number}
                                onChange={(e) => handleChange('number', e.target.value)}
                                required
                                fullWidth
                            />
                            <Input
                                label="Complemento"
                                value={formData.complement}
                                onChange={(e) => handleChange('complement', e.target.value)}
                                fullWidth
                            />
                            <Input
                                label="Bairro *"
                                value={formData.neighborhood}
                                onChange={(e) => handleChange('neighborhood', e.target.value)}
                                required
                                fullWidth
                            />
                            <Input
                                label="Cidade *"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                required
                                fullWidth
                            />
                            <Input
                                label="UF *"
                                value={formData.state}
                                onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                                required
                                fullWidth
                                maxLength={2}
                                placeholder="SP"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Informações Fiscais */}
                <Card>
                    <CardHeader className="px-6 py-4 border-b border-border">
                        <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                            <FileText size={20} /> Informações Fiscais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-slate-700">Regime Tributário *</label>
                                <select
                                    className="input-field"
                                    value={formData.taxRegime}
                                    onChange={(e) => handleChange('taxRegime', e.target.value)}
                                    required
                                >
                                    <option value={TaxRegime.SIMPLES_NACIONAL}>Simples Nacional</option>
                                    <option value={TaxRegime.LUCRO_PRESUMIDO}>Lucro Presumido</option>
                                    <option value={TaxRegime.LUCRO_REAL}>Lucro Real</option>
                                </select>
                            </div>
                            <Input
                                label="CNAE"
                                value={formData.cnae}
                                onChange={(e) => handleChange('cnae', e.target.value)}
                                fullWidth
                                placeholder="0000-0/00"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Configurações de NF-e */}
                <Card>
                    <CardHeader className="px-6 py-4 border-b border-border">
                        <CardTitle className="font-semibold leading-none tracking-tight text-foreground flex items-center gap-2">
                            <SettingsIcon size={20} /> Configurações de NF-e
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-slate-700">Ambiente *</label>
                                <select
                                    className="input-field"
                                    value={formData.nfeEnvironment}
                                    onChange={(e) => handleChange('nfeEnvironment', e.target.value)}
                                    required
                                >
                                    <option value={NfeEnvironment.HOMOLOGACAO}>Homologação</option>
                                    <option value={NfeEnvironment.PRODUCAO}>Produção</option>
                                </select>
                            </div>
                            <Input
                                label="Série Padrão *"
                                value={formData.nfeSeries}
                                onChange={(e) => handleChange('nfeSeries', e.target.value)}
                                required
                                fullWidth
                            />
                            <Input
                                label="Próximo Número *"
                                type="number"
                                value={formData.nfeNextNumber}
                                onChange={(e) => handleChange('nfeNextNumber', parseInt(e.target.value))}
                                required
                                fullWidth
                                min={1}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Botão Salvar */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        leftIcon={<Save size={18} />}
                        disabled={saving}
                    >
                        {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CompanySettingsPage;
