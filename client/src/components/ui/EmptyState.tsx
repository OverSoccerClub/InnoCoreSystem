import React from 'react';
import { type LucideIcon, Package } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon = Package,
    title,
    description
}) => {
    return (
        <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-3 rounded-full mb-1">
                <Icon size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
    );
};
