'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
    variant?: 'default' | 'elevated' | 'glass';
    asymmetric?: boolean;
    children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ variant = 'default', asymmetric = false, className, children, ...props }, ref) => {
        const variants = {
            default: cn(
                'bg-[var(--antigrafity-surface)]',
                'border border-[var(--antigrafity-border)]'
            ),
            elevated: cn(
                'bg-[var(--antigrafity-surface-elevated)]',
                'border border-[var(--antigrafity-border)]',
                'shadow-xl shadow-black/20'
            ),
            glass: cn(
                'bg-[var(--antigrafity-surface)]/80',
                'backdrop-blur-xl',
                'border border-[var(--antigrafity-border)]'
            ),
        };

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn(
                    'rounded-2xl p-6',
                    variants[variant],
                    asymmetric && 'md:rounded-tl-3xl md:rounded-br-3xl md:rounded-tr-lg md:rounded-bl-lg',
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = 'Card';

// Card Header
interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

const CardHeader = ({ children, className }: CardHeaderProps) => (
    <div className={cn('mb-6', className)}>{children}</div>
);

// Card Title
interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

const CardTitle = ({ children, className }: CardTitleProps) => (
    <h2
        className={cn(
            'text-2xl md:text-3xl font-bold text-[var(--antigrafity-text)]',
            'font-serif',
            className
        )}
    >
        {children}
    </h2>
);

// Card Description
interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

const CardDescription = ({ children, className }: CardDescriptionProps) => (
    <p className={cn('text-[var(--antigrafity-text-secondary)] mt-2', className)}>
        {children}
    </p>
);

// Card Content
interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

const CardContent = ({ children, className }: CardContentProps) => (
    <div className={cn('space-y-4', className)}>{children}</div>
);

// Card Footer
interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

const CardFooter = ({ children, className }: CardFooterProps) => (
    <div className={cn('mt-6 pt-4 border-t border-[var(--antigrafity-border)]', className)}>
        {children}
    </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
