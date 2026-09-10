import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Breadcrumb navigation component.
 * 
 * @param {Array} items - Array of { label, to } objects. The last item is the current page (no link).
 * @example
 * <Breadcrumb items={[
 *   { label: 'Home', to: '/superadmin/dashboard' },
 *   { label: 'Plans' }
 * ]} />
 */
export default function Breadcrumb({ items = [] }) {
    return (
        <nav className="flex items-center gap-1.5 text-xs text-gray-400" aria-label="Breadcrumb">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                        {isLast || !item.to ? (
                            <span className="font-semibold text-gray-600">{item.label}</span>
                        ) : (
                            <Link
                                to={item.to}
                                className="hover:text-gray-700 hover:underline transition-colors"
                            >
                                {item.label}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
