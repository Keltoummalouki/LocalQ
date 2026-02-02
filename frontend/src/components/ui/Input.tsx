'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const [hasValue, setHasValue] = useState(false);

        const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="relative w-full">
                <motion.div
                    initial={false}
                    animate={{
                        y: isFocused || hasValue ? -24 : 0,
                        scale: isFocused || hasValue ? 0.85 : 1,
                    }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute left-0 top-4 origin-left pointer-events-none"
                >
                    <label
                        htmlFor={inputId}
                        className={cn(
                            'text-[var(--antigrafity-text-muted)] transition-colors duration-200',
                            (isFocused || hasValue) && 'text-[var(--antigrafity-text-secondary)]',
                            isFocused && 'text-[var(--antigrafity-accent)]'
                        )}
                    >
                        {label}
                    </label>
                </motion.div>

                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'w-full bg-transparent border-0 border-b border-[var(--antigrafity-border)]',
                        'pt-6 pb-3 text-[var(--antigrafity-text)]',
                        'focus:outline-none focus:border-[var(--antigrafity-accent)]',
                        'transition-colors duration-300',
                        'placeholder:text-transparent',
                        error && 'border-[var(--antigrafity-error)]',
                        className
                    )}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        setHasValue(e.target.value.length > 0);
                        props.onBlur?.(e);
                    }}
                    onChange={(e) => {
                        setHasValue(e.target.value.length > 0);
                        props.onChange?.(e);
                    }}
                    {...props}
                />

                {/* Focus underline animation */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isFocused ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--antigrafity-accent)] origin-left"
                />

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-[var(--antigrafity-error)]"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
