export function formatINR(n: number | null | undefined, opts?: { maximumFractionDigits?: number }) {
  const value = typeof n === 'number' ? n : 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: opts?.maximumFractionDigits ?? 0,
    }).format(value);
  } catch {
    const rounded = Math.round(value);
    return `₹${rounded.toLocaleString('en-IN')}`;
  }
}
