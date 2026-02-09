import React from 'react';

interface TableColumn<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    actions?: (item: T) => React.ReactNode;
    isLoading?: boolean;
    emptyState?: React.ReactNode;
}

export function Table<T extends { id: string | number }>({
    data,
    columns,
    actions,
    isLoading,
    emptyState
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground animate-pulse">
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full relative overflow-hidden rounded-md border border-border">
            <div className="w-full overflow-auto">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            {columns.map((col, index) => (
                                <th key={index} className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${col.className || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                            {actions && <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center text-muted-foreground p-0">
                                    {emptyState}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    {columns.map((col, index) => (
                                        <td key={index} className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${col.className || ''}`}>
                                            {col.render
                                                ? col.render(typeof col.accessor !== 'function' ? item[col.accessor] : undefined, item)
                                                : (typeof col.accessor === 'function'
                                                    ? col.accessor(item)
                                                    : (item[col.accessor] as React.ReactNode))
                                            }
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                {actions(item)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
