import { useEffect } from 'react';

/**
 * Hook customizado para definir o título da página dinamicamente
 * Padrão: "InnoCore - Nome da Página"
 * 
 * @param pageTitle - Título específico da página (ex: "Produtos", "Vendas")
 */
export const usePageTitle = (pageTitle: string) => {
    useEffect(() => {
        // Define o título completo
        document.title = `InnoCore - ${pageTitle}`;

        // Cleanup: restaura o título padrão ao desmontar
        return () => {
            document.title = 'InnoCore';
        };
    }, [pageTitle]);
};
