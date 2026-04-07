import { type ReactNode } from 'react';

interface BadgeProps {
    children: ReactNode;
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
}

const variants = {
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-700',
};

export const Badge = ({ children, variant = 'default' }: BadgeProps) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
        {children}
    </span>
);