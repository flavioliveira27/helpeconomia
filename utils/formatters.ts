
export const formatUserName = (fullName: string): string => {
    if (!fullName) return '';
    const names = fullName.trim().split(' ');
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];

    // Return First Last
    return `${names[0]} ${names[names.length - 1]}`;
};

export const formatCurrency = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null) return 'R$ 0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

export const formatShortDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
};

export const formatCurrencyInput = (value: number | undefined): string => {
    // Always return a formatted string, default to 0,00
    const val = value || 0;
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const parseCurrencyInput = (value: string): number => {
    const numbers = value.replace(/\D/g, '');
    return Number(numbers) / 100;
};
