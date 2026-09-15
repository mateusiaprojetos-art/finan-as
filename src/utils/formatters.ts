export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function formatMonthYearHeader(monthYearStr: string): string {
  const [year, month] = monthYearStr.split('-');
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${monthNames[mIndex] || month} de ${year}`;
}

export function getDaysRemainingInMonth(dayOfMonth: number, targetMonth: string): {
  daysRemaining: number;
  isOverdue: boolean;
  isToday: boolean;
  statusText: string;
  badgeColor: string;
} {
  const now = new Date();
  const [targetYearStr, targetMonthStr] = targetMonth.split('-');
  const targetYear = parseInt(targetYearStr, 10);
  const targetMonthNum = parseInt(targetMonthStr, 10) - 1; // 0-indexed

  // Today normalized
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(targetYear, targetMonthNum, dayOfMonth);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      daysRemaining: diffDays,
      isOverdue: true,
      isToday: false,
      statusText: `Atrasada há ${Math.abs(diffDays)} dia(s)`,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    };
  } else if (diffDays === 0) {
    return {
      daysRemaining: 0,
      isOverdue: false,
      isToday: true,
      statusText: 'Vence hoje!',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold animate-pulse',
    };
  } else if (diffDays === 1) {
    return {
      daysRemaining: 1,
      isOverdue: false,
      isToday: false,
      statusText: 'Vence amanhã',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  } else if (diffDays <= 3) {
    return {
      daysRemaining: diffDays,
      isOverdue: false,
      isToday: false,
      statusText: `Vence em ${diffDays} dias`,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  } else {
    return {
      daysRemaining: diffDays,
      isOverdue: false,
      isToday: false,
      statusText: `Dia ${dayOfMonth}`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
}
