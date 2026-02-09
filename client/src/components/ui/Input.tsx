import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, rightIcon, onRightIconClick, fullWidth, className = '', ...props }, ref) => {
        return (
            <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''} ${className}`}>
                {label && (
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
                        {label}
                    </label>
                )}

                <div className="relative flex items-center">
                    {leftIcon && (
                        <div className="absolute left-3 text-muted-foreground pointer-events-none">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground
                            placeholder:text-muted-foreground/60
                            transition-all duration-200
                            focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10
                            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted
                            file:border-0 file:bg-transparent file:text-sm file:font-medium
                            ${leftIcon ? 'pl-10' : ''} 
                            ${rightIcon ? 'pr-10' : ''}
                            ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/10' : ''}
                        `}
                        {...props}
                    />
                    {rightIcon && (
                        <div
                            className={`absolute right-3 text-muted-foreground ${onRightIconClick ? 'cursor-pointer hover:text-foreground transition-colors' : 'pointer-events-none'}`}
                            onClick={onRightIconClick}
                        >
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-xs font-medium text-destructive">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
