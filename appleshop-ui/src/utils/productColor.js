const COLOR_NAME_MAP = [
    { keys: ['trang', 'white', 'starlight'], value: '#f8fafc', borderColor: '#cbd5e1' },
    { keys: ['den', 'black', 'midnight', 'space black', 'titan den', 'jet black'], value: '#111827', borderColor: '#111827' },
    { keys: ['xanh duong', 'blue'], value: '#60a5fa', borderColor: '#3b82f6' },
    { keys: ['xanh la', 'green'], value: '#4ade80', borderColor: '#22c55e' },
    { keys: ['do', 'red'], value: '#ef4444', borderColor: '#dc2626' },
    { keys: ['tim', 'purple'], value: '#a78bfa', borderColor: '#8b5cf6' },
    { keys: ['vang', 'gold'], value: '#fbbf24', borderColor: '#f59e0b' },
    { keys: ['hong', 'pink'], value: '#f9a8d4', borderColor: '#ec4899' },
    { keys: ['bac', 'silver'], value: '#d1d5db', borderColor: '#9ca3af' },
    { keys: ['xam', 'gray', 'grey', 'space gray', 'slate', 'natural titanium', 'titan tu nhien'], value: '#9ca3af', borderColor: '#6b7280' },
];

const normalize = (value) =>
    (value || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const isHexColor = (value) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test((value || '').trim());

export function resolveProductColor(color) {
    const colorName = normalize(color?.color);
    const colorCode = (color?.code || '').toString().trim();

    const byName = COLOR_NAME_MAP.find((item) => item.keys.some((key) => colorName.includes(key)));
    const backgroundColor = byName?.value || (isHexColor(colorCode) ? colorCode : '#e5e7eb');
    const borderColor = byName?.borderColor || (isHexColor(colorCode) ? colorCode : '#d1d5db');

    return {
        backgroundColor,
        border: `1px solid ${borderColor}`,
    };
}
