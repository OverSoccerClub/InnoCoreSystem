export interface Partner {
    id: string;
    name: string;
    fantasyName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    document?: string;
    type: 'CLIENT' | 'SUPPLIER';

    // Tax Info
    ie?: string;
    im?: string;

    // Address
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;

    notes?: string;
    active: boolean;

    createdAt: string;
    updatedAt: string;
}
