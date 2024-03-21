import React from 'react';

const LoadingSpinner = ({ label }: { label: string}) => {
    return (
        <div className="flex items-center">
            <svg className="animate-spin mr-2 h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-50" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path className="opacity-75" d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
    );
};

export default LoadingSpinner;