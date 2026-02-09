import { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: 'confirm' | 'error' | 'success' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void | Promise<void>;
    confirmButtonVariant?: 'danger' | 'primary' | 'success';
}

const Dialog = ({
    isOpen,
    onClose,
    title,
    message,
    type,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    confirmButtonVariant = 'primary'
}: DialogProps) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (onConfirm) {
            await onConfirm();
        }
        onClose();
    };

    const getIcon = () => {
        switch (type) {
            case 'confirm':
                return <AlertTriangle className="w-16 h-16 text-amber-500" />;
            case 'error':
                return <XCircle className="w-16 h-16 text-red-500" />;
            case 'success':
                return <CheckCircle className="w-16 h-16 text-green-500" />;
            case 'info':
                return <Info className="w-16 h-16 text-blue-500" />;
        }
    };

    const getIconBg = () => {
        switch (type) {
            case 'confirm':
                return 'bg-amber-100';
            case 'error':
                return 'bg-red-100';
            case 'success':
                return 'bg-green-100';
            case 'info':
                return 'bg-blue-100';
        }
    };

    const getConfirmButtonClass = () => {
        const baseClass = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

        switch (confirmButtonVariant) {
            case 'danger':
                return `${baseClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
            case 'success':
                return `${baseClass} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`;
            case 'primary':
            default:
                return `${baseClass} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className={`mx-auto w-20 h-20 rounded-full ${getIconBg()} flex items-center justify-center mb-4`}>
                        {getIcon()}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3 justify-center">
                        {type === 'confirm' && (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={handleConfirm}
                            className={getConfirmButtonClass()}
                            autoFocus
                        >
                            {type === 'confirm' ? confirmText : 'OK'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dialog;
