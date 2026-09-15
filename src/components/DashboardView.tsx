import React from 'react';
import { MonthlyBill, Transaction, ShoppingItem, FinancialGoal, InvestmentItem, AppTab } from '../types';
import { formatCurrency, getDaysRemainingInMonth } from '../utils/formatters';
import { OwlMascot, OwlTipCard } from './OwlMascot';
import {
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Wallet,
  ShoppingCart,
  Target,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
} from 'lucide-react';

interface DashboardViewProps {
  currentMonth: string;
  bills: MonthlyBill[];
  transactions: Transaction[];
  shoppingItems: ShoppingItem[];
  goals: FinancialGoal[];
  investments: InvestmentItem[];
  onNavigateTab: (tab: AppTab) => void;
  onPayBill: (billId: string) => void;
  onOpenQuickAdd: (type: 'despesa' | 'receita' | 'conta') => void;
  onOpenUrgentAlert: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentMonth,
  bills,
  transactions,
  shoppingItems,
  goals,
  investments,
  onNavigateTab,
  onPayBill,
  onOpenQuickAdd,
  onOpenUrgentAlert,
}) => {
  // Month bills
  const monthBills = bills.filter((b) => b.month === currentMonth);
  const totalBillsAmount = monthBills.reduce((acc, b) => acc + b.amount, 0);
  const paidBillsAmount = monthBills
    .filter((b) => b.status === 'paga')
    .reduce((acc, b) => acc + b.amount, 0);
  const pendingBillsAmount = monthBills
    .filter((b) => b.status === 'pendente')
    .reduce((acc, b) => acc + b.amount, 0);

  // Month transactions
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));
  const totalIncome = monthTransactions
    .filter((t) => t.type === 'receita')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = monthTransactions
    .filter((t) => t.type === 'despesa')
    .reduce((acc, t) => acc + t.amount, 0);

  // Real-time balance = Total Income - Total direct expenses - Total paid bills
  const currentBalance = totalIncome - totalExpenses - paidBillsAmount;

  // Total invested
  const totalInvested = investments.reduce((acc, inv) => acc + inv.amountInvested, 0);

  // Urgent pending bills
  const urgentBills = monthBills.filter((b) => {
    if (b.status === 'paga') return false;
    const info = getDaysRemainingInMonth(b.dueDay, currentMonth);
    return info.isOverdue || info.isToday || info.daysRemaining <= 3;
  });

  // Dynamic Owl advice
  let owlMessage = '';
  let owlMood: 'wise' | 'happy' | 'alert' | 'saving' | 'celebrate' = 'wise';
  let owlVariant: 'info' | 'warning' | 'success' | 'celebrate' = 'info';

  if (urgentBills.length > 0) {
    const overdue = urgentBills.filter((b) => getDaysRemainingInMonth(b.dueDay, currentMonth).isOverdue);
    if (overdue.length > 0) {
      owlMood = 'alert';
      owlVariant = 'warning';
      owlMessage = `Fique atento! Você tem ${overdue.length} conta(s) com vencimento já expirado. Pague logo para evitar juros.`;
    } else {
      owlMood = 'alert';
      owlVariant = 'warning';
      owlMessage = `Atenção: você tem ${urgentBills.length} conta(s) vencendo hoje ou nos próximos 3 dias!`;
    }
  } else if (monthBills.length > 0 && pendingBillsAmount === 0) {
    owlMood = 'celebrate';
    owlVariant = 'celebrate';
    owlMessage = 'Excelente! Todas as suas contas cadastradas para este mês já estão 100% quitadas!';
  } else if (currentBalance > 1000) {
    owlMood = 'saving';
    owlVariant = 'success';
    owlMessage = `Seu saldo líquido está positivo em ${formatCurrency(currentBalance)}. Que tal aportar um valor em suas metas ou investimentos?`;
  } else if (currentBalance < 0) {
    owlMood = 'alert';
    owlVariant = 'warning';
    owlMessage = 'Seu fluxo de caixa está negativo neste mês. Tente segurar gastos supérfluos para equilibrar o controle.';
  } else {
    owlMood = 'wise';
    owlVariant = 'info';
    owlMessage = 'Mantenha seus lançamentos diários atualizados para ter clareza total de onde seu dinheiro vai.';
  }

  // Shopping list summary
  const unboughtShoppingCount = shoppingItems.filter((item) => !item.isBought).length;

  return (
    <div className="space-y-4 pb-6">
      {/* Top Banner / Urgent Alert Pill */}
      {urgentBills.length > 0 && (
        <button
          onClick={onOpenUrgentAlert}
          className="w-full p-3.5 bg-rose-50/90 border border-rose-300 rounded-3xl flex items-center justify-between gap-2.5 text-left hover:bg-rose-100/80 transition cursor-pointer active:scale-98 shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-rose-950 truncate">
                {urgentBills.length} conta(s) precisando de atenção
              </p>
              <p className="text-[11px] text-rose-700/90 truncate">
                Clique para ver vencimentos e dar baixa rápida
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-rose-800 bg-rose-200/80 px-2.5 py-1 rounded-xl shrink-0">
            Ver →
          </span>
        </button>
      )}

      {/* Main Balance Card - Soft Mint / Deep Sage Palette */}
      <div className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] rounded-3xl p-5 text-white shadow-md relative overflow-hidden border border-emerald-600/30">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-300" /> Saldo Líquido do Mês
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-emerald-100 border border-white/10 font-medium">
              Receitas - Saídas - Contas
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              {formatCurrency(currentBalance)}
            </h2>
            <div className="text-xs text-emerald-200 mt-1">
              {currentBalance >= 0 ? (
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Balanço Positivo
                </span>
              ) : (
                <span className="text-rose-300 font-semibold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Balanço Negativo
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats Grid inside balance */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/15">
            <div className="bg-white/10 rounded-2xl p-2.5">
              <p className="text-[10px] text-emerald-200 font-medium uppercase tracking-wide">Receitas</p>
              <p className="text-xs sm:text-sm font-black text-emerald-100 mt-0.5 truncate">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5">
              <p className="text-[10px] text-emerald-200 font-medium uppercase tracking-wide">Saídas Avulsas</p>
              <p className="text-xs sm:text-sm font-black text-rose-200 mt-0.5 truncate">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5">
              <p className="text-[10px] text-emerald-200 font-medium uppercase tracking-wide">Contas Pagas</p>
              <p className="text-xs sm:text-sm font-black text-amber-200 mt-0.5 truncate">
                {formatCurrency(paidBillsAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Buttons - Generous touch targets */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onOpenQuickAdd('despesa')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-rose-50/50 border border-rose-200/80 text-rose-900 shadow-2xs transition active:scale-95 min-h-[52px]"
        >
          <div className="p-1.5 rounded-xl bg-rose-100 text-rose-700 mb-1">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold">+ Despesa</span>
        </button>

        <button
          onClick={() => onOpenQuickAdd('receita')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-emerald-50/50 border border-emerald-200/80 text-emerald-950 shadow-2xs transition active:scale-95 min-h-[52px]"
        >
          <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700 mb-1">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold">+ Receita</span>
        </button>

        <button
          onClick={() => onOpenQuickAdd('conta')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-amber-50/50 border border-amber-200/80 text-amber-950 shadow-2xs transition active:scale-95 min-h-[52px]"
        >
          <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700 mb-1">
            <CalendarClock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold">+ Conta</span>
        </button>
      </div>

      {/* Dynamic Owl Feedback Card */}
      <OwlTipCard
        title="Dica da Coruja"
        message={owlMessage}
        mood={owlMood}
        variant={owlVariant}
        actionText={
          owlMood === 'alert' && urgentBills.length > 0
            ? 'Resolver contas urgentes'
            : owlMood === 'saving'
            ? 'Aportar em Metas'
            : undefined
        }
        onAction={
          owlMood === 'alert' && urgentBills.length > 0
            ? onOpenUrgentAlert
            : owlMood === 'saving'
            ? () => onNavigateTab('metas')
            : undefined
        }
      />

      {/* 4 Feature Overview Cards - 2x2 on Mobile, 4-column row on Tablet and Desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Contas Card */}
        <div
          onClick={() => onNavigateTab('contas')}
          className="bg-white rounded-3xl p-3.5 sm:p-4 border border-emerald-900/10 shadow-xs hover:border-emerald-400 transition cursor-pointer active:scale-98 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500">Contas do Mês</p>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {formatCurrency(totalBillsAmount)}
              </p>
            </div>
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-700 shrink-0">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Pagas: <strong className="text-emerald-700">{formatCurrency(paidBillsAmount)}</strong></span>
            <span className="text-amber-800 font-bold">Ver →</span>
          </div>
        </div>

        {/* Mercado Card */}
        <div
          onClick={() => onNavigateTab('mercado')}
          className="bg-white rounded-3xl p-3.5 sm:p-4 border border-emerald-900/10 shadow-xs hover:border-emerald-400 transition cursor-pointer active:scale-98 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500">Mercado</p>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {unboughtShoppingCount} {unboughtShoppingCount === 1 ? 'pendente' : 'pendentes'}
              </p>
            </div>
            <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-700 shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Modo Compra</span>
            <span className="text-emerald-800 font-bold">Abrir →</span>
          </div>
        </div>

        {/* Metas Card */}
        <div
          onClick={() => onNavigateTab('metas')}
          className="bg-white rounded-3xl p-3.5 sm:p-4 border border-emerald-900/10 shadow-xs hover:border-emerald-400 transition cursor-pointer active:scale-98 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500">Metas</p>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {goals.length} ativas
              </p>
            </div>
            <div className="p-2 rounded-2xl bg-teal-50 text-teal-700 shrink-0">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Guardado:</span>
            <strong className="text-emerald-700">
              {formatCurrency(goals.reduce((s, g) => s + g.currentAmount, 0))}
            </strong>
          </div>
        </div>

        {/* Investimentos Card */}
        <div
          onClick={() => onNavigateTab('investimentos')}
          className="bg-white rounded-3xl p-3.5 sm:p-4 border border-emerald-900/10 shadow-xs hover:border-emerald-400 transition cursor-pointer active:scale-98 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500">Investido</p>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {formatCurrency(totalInvested)}
              </p>
            </div>
            <div className="p-2 rounded-2xl bg-emerald-100/70 text-emerald-800 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>{investments.length} ativos</span>
            <span className="text-emerald-800 font-bold">Ver →</span>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Section on Desktop: Bills on Left, Recent Transactions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Contas a Pagar deste Mês - Color-coded cards */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-900/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wide">
                <CalendarClock className="w-3.5 h-3.5 text-emerald-700" /> Vencimentos do Mês
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('contas')}
              className="text-xs text-emerald-800 hover:underline font-bold cursor-pointer"
            >
              Ver todas ({monthBills.length})
            </button>
          </div>

          <div className="space-y-2">
            {monthBills.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Nenhuma conta cadastrada para este mês.
              </p>
            ) : (
              monthBills.slice(0, 5).map((bill) => {
                const info = getDaysRemainingInMonth(bill.dueDay, currentMonth);
                const isPaid = bill.status === 'paga';
                const isOverdue = !isPaid && info.isOverdue;

                const cardStyle = isPaid
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : isOverdue
                  ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                  : 'bg-amber-50/70 border-amber-300 text-amber-950';

                return (
                  <div
                    key={bill.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2 shadow-2xs ${cardStyle}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isPaid ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {bill.name}
                        </span>
                        {isPaid ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shrink-0">
                            Paga
                          </span>
                        ) : isOverdue ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200 shrink-0">
                            {info.statusText}
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200 shrink-0">
                            {info.statusText}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                        {formatCurrency(bill.amount)}
                      </p>
                    </div>

                    {!isPaid && (
                      <button
                        onClick={() => onPayBill(bill.id)}
                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-amber-800 hover:text-emerald-700 active:scale-95 transition cursor-pointer"
                        title="Dar baixa / marcar como paga"
                        aria-label="Marcar como paga"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Cashflow Transactions Preview */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-900/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wide">
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-700" /> Lançamentos Recentes
            </h3>
            <button
              onClick={() => onOpenQuickAdd('despesa')}
              className="text-xs text-emerald-800 hover:underline font-bold cursor-pointer"
            >
              + Lançar
            </button>
          </div>

          <div className="space-y-2">
            {monthTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Nenhuma movimentação registrada neste mês.
              </p>
            ) : (
              monthTransactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-2xl bg-[#f8faf8] border border-emerald-950/5 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        tx.type === 'receita'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tx.type === 'receita' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-slate-500 capitalize">
                        {tx.category} • {tx.date.split('-').reverse().slice(0, 2).join('/')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-black ${
                        tx.type === 'receita' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {tx.type === 'receita' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
