export const TaxRegime = {
    SIMPLES_NACIONAL: 'SIMPLES_NACIONAL',
    LUCRO_PRESUMIDO: 'LUCRO_PRESUMIDO',
    LUCRO_REAL: 'LUCRO_REAL'
} as const;

export type TaxRegime = typeof TaxRegime[keyof typeof TaxRegime];

export const NfeEnvironment = {
    PRODUCAO: 'PRODUCAO',
    HOMOLOGACAO: 'HOMOLOGACAO'
} as const;

export type NfeEnvironment = typeof NfeEnvironment[keyof typeof NfeEnvironment];

export interface Company {
    id: string;
    legalName: string;
    tradeName?: string;
    cnpj: string;
    ie?: string;
    im?: string;
    email: string;
    phone: string;
    website?: string;
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    taxRegime: TaxRegime;
    cnae?: string;
    nfeEnvironment: NfeEnvironment;
    nfeSeries: string;
    nfeNextNumber: number;
    logoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
