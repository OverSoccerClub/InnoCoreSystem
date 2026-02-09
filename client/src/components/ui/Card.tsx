import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding, ...props }) => {
    return (
        <div className={`bg-white dark:bg-card border border-border shadow-sm rounded-xl overflow-hidden ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`px-6 py-4 border-b border-border flex flex-col space-y-1.5 ${className}`} {...props}>{children}</div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
    <h3 className={`font-semibold leading-none tracking-tight text-foreground ${className}`} {...props}>{children}</h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`p-6 pt-0 ${className} ${!className.includes('p-0') ? 'pt-6' : ''}`} {...props}>{children}</div>
);
