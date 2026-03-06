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
        <div className="w-full space-y-1.5">
            <div className="flex justify-between items-end">
                <span className="label-small text-[8px] text-muted">{label}</span>
                <span className="text-[10px] font-black text-ink">{value.toFixed(0)}g <span className="text-muted font-bold">/ {total.toFixed(0)}g</span></span>
            </div>
            <div className="w-full bg-warm rounded-full h-2 overflow-hidden border border-border/20">
                <div className={`${color} h-full rounded-full transition-all duration-700 ease-out`} style={{ width: `${safePercentage}%` }}></div>
            </div>
        </div>
    );
};

export default ProgressBar;