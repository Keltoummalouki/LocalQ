'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
    variant?: 'primary' | 'outline' | 'ghost' | 'underline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            isLoading = false,
            className,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = cn(
            'relative inline-flex items-center justify-center font-medium',
            'transition-all duration-300 ease-out',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--antigrafity-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--antigrafity-bg)]',
            'disabled:opacity-50 disabled:cursor-not-allowed'
        );

        const variants = {
            primary: cn(
                'bg-[var(--antigrafity-accent)] text-[var(--antigrafity-bg)]',
                'hover:bg-[var(--antigrafity-accent-hover)]',
                'active:scale-[0.98]'
            ),
            outline: cn(
                'border border-[var(--antigrafity-border)] text-[var(--antigrafity-text)]',
                'bg-transparent',
                'hover:border-[var(--antigrafity-accent)] hover:text-[var(--antigrafity-accent)]'
            ),
            ghost: cn(
                'text-[var(--antigrafity-text)] bg-transparent',
                'hover:bg-[var(--antigrafity-surface)]'
            ),
            underline: cn(
                'text-[var(--antigrafity-text)] bg-transparent',
                'after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px]',
                'after:bg-[var(--antigrafity-accent)] after:scale-x-0 after:origin-left',
                'after:transition-transform after:duration-300',
                'hover:after:scale-x-100'
            ),
        };

        const sizes = {
            sm: 'px-4 py-2 text-sm rounded-md',
            md: 'px-6 py-3 text-base rounded-lg',
            lg: 'px-8 py-4 text-lg rounded-xl',
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ y: variant === 'primary' ? -2 : 0 }}
                whileTap={{ scale: 0.98 }}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                    />
                ) : (
                    children
                )}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
