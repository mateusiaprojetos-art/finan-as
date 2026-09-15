import React from 'react';
import { MonthlyBill } from '../types';
import { formatCurrency, getDaysRemainingInMonth } from '../utils/formatters';
import { OwlMascot } from './OwlMascot';
import { AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';

interface AlertBannerProps {
  urgentBills: MonthlyBill[];
  targetMonth: string;
  onPayBill: (billId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  urgentBills,
  targetMonth,
  onPayBill,
  onClose,
  isOpen,
}) => {
  if (!isOpen) return null;

  const overdueCount = urgentBills.filter((b) => {
    const info = getDaysRemainingInMonth(b.dueDay, targetMonth);
    return info.isOverdue;
  }).length;

  const todayCount = urgentBills.filter((b) => {
    const info = getDaysRemainingInMonth(b.dueDay, targetMonth);
    return info.isToday;
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <OwlMascot size="sm" mood={overdueCount > 0 ? 'alert' : 'wise'} />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Lembretes de Vencimento
              </h3>
              <p className="text-xs text-slate-500">
                {overdueCount > 0
                  ? `${overdueCount} conta(s) com vencimento expirado!`
                  : todayCount > 0
                  ? `${todayCount} conta(s) vencendo hoje!`
                  : `${urgentBills.length} conta(s) vencendo nos próximos dias`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
            aria-label="Fechar lembretes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="py-3 flex-1 overflow-y-auto space-y-2.5">
          {urgentBills.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">Tudo em dia!</p>
              <p className="text-xs text-slate-500">
                Nenhuma conta pendente vencendo nos próximos 3 dias neste mês.
              </p>
            </div>
          ) : (
            urgentBills.map((bill) => {
              const statusInfo = getDaysRemainingInMonth(bill.dueDay, targetMonth);
              return (
                <div
                  key={bill.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    statusInfo.isOverdue
                      ? 'bg-rose-50/70 border-rose-200'
                      : statusInfo.isToday
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {bill.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusInfo.badgeColor}`}
                      >
                        {statusInfo.statusText}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(bill.amount)}
                      </span>
                      <span>•</span>
                      <span>Vencimento dia {bill.dueDay}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onPayBill(bill.id);
                    }}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pagar
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer wise owl message */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 italic">
            "Organização em dia traz noites tranquilas." 🦉
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
