import { type ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
}

export const Card = ({ children, className = '', title }: CardProps) => (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
        {title && (
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);