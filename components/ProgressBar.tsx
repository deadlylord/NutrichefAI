import React from 'react';

interface ProgressBarProps {
    label: string;
    color: string;
    value: number;
    total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, color, value, total }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const safePercentage = Math.min(100, Math.max(0, percentage));
    
    return (
        <div className="w-full">
            <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">{label}</span>
                <span className="text-xs font-medium text-gray-500">{value.toFixed(0)}g / {total.toFixed(0)}g</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${color} h-2 rounded-full`} style={{ width: `${safePercentage}%` }}></div>
            </div>
        </div>
    );
};

export default ProgressBar;