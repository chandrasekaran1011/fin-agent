import { format, formatDistanceToNow } from "date-fns";

export function formatCurrency(amountInr: number): string {
  const absAmount = Math.abs(amountInr);
  const sign = amountInr < 0 ? "-" : "";

  if (absAmount >= 1_00_00_000) {
    const crores = absAmount / 1_00_00_000;
    return `${sign}₹${crores.toFixed(2)} Cr`;
  }
  if (absAmount >= 1_00_000) {
    const lakhs = absAmount / 1_00_000;
    return `${sign}₹${lakhs.toFixed(2)} L`;
  }

  return `${sign}₹${absAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCurrencyFull(amountInr: number): string {
  return `₹${amountInr.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy, HH:mm");
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-IN");
}
