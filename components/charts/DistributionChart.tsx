import React, { useMemo } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import { TransactionType } from '../../types';

interface CategoryData {
    name: string;
    value: number;
    percentage: number;
    color: string;
}

export const DistributionChart: React.FC = () => {
    const { transactions } = useFinancial();

    const categoryData = useMemo(() => {
        const investments = transactions.filter(t => t.type === TransactionType.INVESTMENT);
        const total = investments.reduce((sum, t) => sum + Number(t.amount), 0);

        if (total === 0) return [];

        const categoryMap = new Map<string, number>();
        investments.forEach(t => {
            const current = categoryMap.get(t.category) || 0;
            categoryMap.set(t.category, current + Number(t.amount));
        });

        const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'];
        let colorIndex = 0;

        const data: CategoryData[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
            name,
            value,
            percentage: (value / total) * 100,
            color: colors[colorIndex++ % colors.length]
        }));

        return data.sort((a, b) => b.value - a.value);
    }, [transactions]);

    const totalInvestments = useMemo(() => {
        return transactions
            .filter(t => t.type === TransactionType.INVESTMENT)
            .reduce((sum, t) => sum + Number(t.amount), 0);
    }, [transactions]);

    // Calculate SVG donut chart paths
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    let currentAngle = -90; // Start from top

    const slices = categoryData.map(cat => {
        const angle = (cat.percentage / 100) * 360;
        const slice = {
            ...cat,
            startAngle: currentAngle,
            endAngle: currentAngle + angle
        };
        currentAngle += angle;
        return slice;
    });

    const polarToCartesian = (angle: number) => {
        const rad = (angle * Math.PI) / 180;
        return {
            x: 100 + radius * Math.cos(rad),
            y: 100 + radius * Math.sin(rad)
        };
    };

    const createArc = (startAngle: number, endAngle: number) => {
        const start = polarToCartesian(startAngle);
        const end = polarToCartesian(endAngle);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `M 100 100 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    };

    if (categoryData.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Distribuição</h3>
                <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                    Nenhum investimento registrado
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Distribuição</h3>

            <div className="flex flex-col items-center gap-6">
                {/* Donut Chart */}
                <div className="relative">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        {slices.map((slice, idx) => (
                            <path
                                key={idx}
                                d={createArc(slice.startAngle, slice.endAngle)}
                                fill={slice.color}
                                className="transition-opacity hover:opacity-80"
                            />
                        ))}
                        {/* Center white circle for donut effect */}
                        <circle cx="100" cy="100" r="55" fill="white" />
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-slate-800">
                            R$ {totalInvestments.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-slate-400 uppercase">Total</p>
                    </div>
                </div>

                {/* Legend */}
                <div className="w-full space-y-2">
                    {categoryData.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <span className="text-slate-700">{cat.name}</span>
                            </div>
                            <span className="font-semibold text-slate-800">{cat.percentage.toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
