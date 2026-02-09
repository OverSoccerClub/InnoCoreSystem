import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import Dialog from '../components/ui/Dialog';
import type { DialogProps } from '../components/ui/Dialog';

interface DialogOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void | Promise<void>;
}

interface DialogContextType {
    confirm: (options: DialogOptions) => void;
    error: (options: Omit<DialogOptions, 'onConfirm' | 'confirmText' | 'cancelText'>) => void;
    success: (options: Omit<DialogOptions, 'onConfirm' | 'confirmText' | 'cancelText'>) => void;
    info: (options: Omit<DialogOptions, 'onConfirm' | 'confirmText' | 'cancelText'>) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dialogState, setDialogState] = useState<Omit<DialogProps, 'isOpen' | 'onClose'> | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const closeDialog = () => {
        setIsOpen(false);
        setTimeout(() => setDialogState(null), 200); // Wait for animation
    };

    const confirm = (options: DialogOptions) => {
        setDialogState({
            type: 'confirm',
            title: options.title,
            message: options.message,
            confirmText: options.confirmText,
            cancelText: options.cancelText,
            onConfirm: options.onConfirm,
            confirmButtonVariant: 'danger'
        });
        setIsOpen(true);
    };

    const error = (options: Omit<DialogOptions, 'onConfirm' | 'confirmText' | 'cancelText'>) => {
        setDialogState({
            type: 'error',
            title: options.title,
            message: options.message,
            confirmButtonVariant: 'primary'
        });
        setIsOpen(true);
    };

    const success = (options: Omit<DialogOptions, 'onConfirm' | 'confirmText' | 'cancelText'>) => {
        setDialogState({
            type: 'success',
            title: options.title,
            message: options.message,
            confirmButtonVariant: 'success'
        });
        setIsOpen(true);
    };

    const info = (options: Omit<DialogOptions, 'onConfirm' | 'confirmText' | 'cancelText'>) => {
        setDialogState({
            type: 'info',
            title: options.title,
            message: options.message,
            confirmButtonVariant: 'primary'
        });
        setIsOpen(true);
    };

    return (
        <DialogContext.Provider value={{ confirm, error, success, info }}>
            {children}
            {dialogState && (
                <Dialog
                    isOpen={isOpen}
                    onClose={closeDialog}
                    {...dialogState}
                />
            )}
        </DialogContext.Provider>
    );
};

export const useDialog = (): DialogContextType => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};
