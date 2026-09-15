import React, { useState } from 'react';
import { MonthlyBill, BillCategory } from '../types';
import { formatCurrency, getDaysRemainingInMonth } from '../utils/formatters';
import { OwlTipCard } from './OwlMascot';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Filter,
  Repeat,
  AlertCircle,
  Home,
  Zap,
  Utensils,
  Car,
  HeartPulse,
  GraduationCap,
  Tv,
  MoreHorizontal,
  X,
} from 'lucide-react';

interface BillsViewProps {
  currentMonth: string;
  bills: MonthlyBill[];
  onAddBill: (bill: Omit<MonthlyBill, 'id'>) => void;
  onUpdateBill: (bill: MonthlyBill) => void;
  onDeleteBill: (billId: string) => void;
  onToggleStatus: (billId: string) => void;
}

const CATEGORY_CONFIG: Record<BillCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  moradia: { label: 'Moradia', icon: Home, color: 'text-blue-600 bg-blue-50' },
  servicos: { label: 'Serviços (Luz/Net/Água)', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  alimentacao: { label: 'Alimentação', icon: Utensils, color: 'text-orange-600 bg-orange-50' },
  transporte: { label: 'Transporte', icon: Car, color: 'text-cyan-600 bg-cyan-50' },
  saude: { label: 'Saúde', icon: HeartPulse, color: 'text-rose-600 bg-rose-50' },
  educacao: { label: 'Educação', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
  assinaturas: { label: 'Assinaturas', icon: Tv, color: 'text-purple-600 bg-purple-50' },
  outros: { label: 'Outros', icon: MoreHorizontal, color: 'text-slate-600 bg-slate-100' },
};

export const BillsView: React.FC<BillsViewProps> = ({
  currentMonth,
  bills,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onToggleStatus,
}) => {
  const [filter, setFilter] = useState<'todas' | 'pendentes' | 'urgentes' | 'pagas'>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<MonthlyBill | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState(10);
  const [category, setCategory] = useState<BillCategory>('moradia');
  const [isRecurring, setIsRecurring] = useState(true);
  const [notes, setNotes] = useState('');

  // Month bills
  const monthBills = bills.filter((b) => b.month === currentMonth);
  const totalAmount = monthBills.reduce((acc, b) => acc + b.amount, 0);
  const paidAmount = monthBills
    .filter((b) => b.status === 'paga')
    .reduce((acc, b) => acc + b.amount, 0);
  const pendingAmount = monthBills
    .filter((b) => b.status === 'pendente')
    .reduce((acc, b) => acc + b.amount, 0);

  const percentPaid = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  const filteredBills = monthBills.filter((bill) => {
    if (filter === 'todas') return true;
    if (filter === 'pagas') return bill.status === 'paga';
    if (filter === 'pendentes') return bill.status === 'pendente';
    if (filter === 'urgentes') {
      if (bill.status === 'paga') return false;
      const info = getDaysRemainingInMonth(bill.dueDay, currentMonth);
      return info.isOverdue || info.isToday || info.daysRemaining <= 3;
    }
    return true;
  });

  // Sort by due day ascending
  filteredBills.sort((a, b) => a.dueDay - b.dueDay);

  const openAddModal = () => {
    setEditingBill(null);
    setName('');
    setAmount('');
    setDueDay(10);
    setCategory('moradia');
    setIsRecurring(true);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (bill: MonthlyBill) => {
    setEditingBill(bill);
    setName(bill.name);
    setAmount(bill.amount.toString());
    setDueDay(bill.dueDay);
    setCategory(bill.category);
    setIsRecurring(bill.isRecurring);
    setNotes(bill.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (editingBill) {
      onUpdateBill({
        ...editingBill,
        name: name.trim(),
        amount: parsedAmount,
        dueDay: Number(dueDay),
        category,
        isRecurring,
        notes: notes.trim(),
      });
    } else {
      onAddBill({
        name: name.trim(),
        amount: parsedAmount,
        dueDay: Number(dueDay),
        category,
        isRecurring,
        status: 'pendente',
        month: currentMonth,
        notes: notes.trim(),
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" /> Contas do Mês
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe boletos e compromissos fixos sem surpresas no fim do mês
          </p>
        </div>
        <button
          id="add-bill-btn"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95 min-h-[44px]"
        >
          <Plus className="w-4 h-4" /> Cadastrar Conta
        </button>
      </div>

      {/* Summary Banner with 3 stats & Progress Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-950/10 shadow-xs space-y-3.5">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Total
            </span>
            <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              {monthBills.length} contas
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
              Já Pago
            </span>
            <p className="text-base sm:text-lg font-black text-emerald-700 mt-0.5">
              {formatCurrency(paidAmount)}
            </p>
            <p className="text-[10px] text-emerald-600 mt-0.5 truncate">
              {percentPaid}% pago
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200">
            <span className="text-[10px] sm:text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
              Pendente
            </span>
            <p className="text-base sm:text-lg font-black text-amber-800 mt-0.5">
              {formatCurrency(pendingAmount)}
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5 truncate">
              {monthBills.filter((b) => b.status === 'pendente').length} restantes
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium">Progresso de quitação</span>
            <span className="font-bold text-emerald-800">{percentPaid}% concluído</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentPaid}%` }}
            />
          </div>
        </div>
      </div>

      {/* Owl Tip for bills */}
      <OwlTipCard
        title="Dica de Vencimento da Coruja"
        message="Contas verdes estão pagas, amarelas são pendências normais do mês e vermelhas exigem atenção imediata por atraso."
        mood="wise"
        variant="info"
      />

      {/* Filters Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('todas')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap min-h-[36px] ${
            filter === 'todas'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'bg-white border border-emerald-900/10 text-slate-600 hover:bg-emerald-50'
          }`}
        >
          Todas ({monthBills.length})
        </button>
        <button
          onClick={() => setFilter('pendentes')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap min-h-[36px] ${
            filter === 'pendentes'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-emerald-900/10 text-slate-600 hover:bg-emerald-50'
          }`}
        >
          Pendentes ({monthBills.filter((b) => b.status === 'pendente').length})
        </button>
        <button
          onClick={() => setFilter('urgentes')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap min-h-[36px] ${
            filter === 'urgentes'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white border border-emerald-900/10 text-slate-600 hover:bg-emerald-50'
          }`}
        >
          Urgentes / Atrasadas
        </button>
        <button
          onClick={() => setFilter('pagas')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap min-h-[36px] ${
            filter === 'pagas'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-emerald-900/10 text-slate-600 hover:bg-emerald-50'
          }`}
        >
          Pagas ({monthBills.filter((b) => b.status === 'paga').length})
        </button>
      </div>

      {/* Bills List - Card based color-coded by status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredBills.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-8 text-center border border-emerald-950/10 shadow-xs">
            <CalendarClock className="w-10 h-10 text-emerald-200 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Nenhuma conta neste filtro</p>
            <p className="text-xs text-slate-400 mt-1">
              Todas as contas selecionadas estão em dia ou não foram cadastradas.
            </p>
            <button
              onClick={openAddModal}
              className="mt-3 text-xs font-bold text-emerald-600 hover:underline min-h-[44px] inline-flex items-center"
            >
              + Cadastrar nova conta
            </button>
          </div>
        ) : (
          filteredBills.map((bill) => {
            const statusInfo = getDaysRemainingInMonth(bill.dueDay, currentMonth);
            const catInfo = CATEGORY_CONFIG[bill.category] || CATEGORY_CONFIG.outros;
            const Icon = catInfo.icon;
            const isPaid = bill.status === 'paga';
            const isOverdue = !isPaid && statusInfo.isOverdue;

            // Strict color coding as requested:
            // Green = paid, Yellow = pending, Red = overdue
            const cardColorClasses = isPaid
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
              : isOverdue
              ? 'bg-rose-50/80 border-rose-300 text-rose-950 ring-1 ring-rose-200'
              : 'bg-amber-50/70 border-amber-300 text-amber-950';

            return (
              <div
                key={bill.id}
                className={`rounded-3xl p-3.5 sm:p-4 border transition-all flex items-center justify-between gap-2.5 shadow-xs ${cardColorClasses}`}
              >
                {/* Left check toggle with 44px min touch target */}
                <button
                  onClick={() => onToggleStatus(bill.id)}
                  className="shrink-0 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition active:scale-95"
                  title={isPaid ? 'Marcar como pendente' : 'Marcar como paga'}
                  aria-label={isPaid ? 'Marcar como pendente' : 'Marcar como paga'}
                >
                  {isPaid ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : isOverdue ? (
                    <AlertCircle className="w-6 h-6 text-rose-600 hover:text-emerald-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-amber-600/70 hover:text-emerald-600" />
                  )}
                </button>

                {/* Main details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-sm font-bold tracking-tight ${
                        isPaid ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {bill.name}
                    </span>
                    {bill.isRecurring && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-md bg-white/70 text-slate-600 border border-slate-200/60"
                        title="Recorrência mensal automática"
                      >
                        <Repeat className="w-2.5 h-2.5" /> Mensal
                      </span>
                    )}
                    {isPaid ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Paga
                      </span>
                    ) : isOverdue ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        {statusInfo.statusText}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {statusInfo.statusText}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 mt-1">
                    <span className="inline-flex items-center gap-1 font-medium text-[11px]">
                      <span className={`p-1 rounded-md ${catInfo.color}`}>
                        <Icon className="w-3 h-3" />
                      </span>
                      {catInfo.label}
                    </span>
                    <span>•</span>
                    <span className="text-[11px]">Dia {bill.dueDay}</span>
                    {bill.notes && (
                      <>
                        <span>•</span>
                        <span className="italic text-slate-500 truncate max-w-[140px] text-[11px]">
                          {bill.notes}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount & actions */}
                <div className="shrink-0 text-right flex items-center gap-2">
                  <div>
                    <p
                      className={`text-sm sm:text-base font-extrabold ${
                        isPaid ? 'text-slate-500 line-through' : 'text-slate-900'
                      }`}
                    >
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <button
                      onClick={() => openEditModal(bill)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition"
                      title="Editar conta"
                      aria-label="Editar conta"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja remover a conta "${bill.name}"?`)) {
                          onDeleteBill(bill.id);
                        }
                      }}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Excluir conta"
                      aria-label="Excluir conta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Cadastrar / Editar Conta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingBill ? 'Editar Conta do Mês' : 'Cadastrar Nova Conta'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Conta / Boleto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel, Internet Fibra, Energia Elétrica"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dia do Vencimento (1 a 31) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BillCategory)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="moradia">Moradia (Aluguel, Condomínio)</option>
                  <option value="servicos">Serviços (Luz, Água, Gás, Internet)</option>
                  <option value="assinaturas">Assinaturas (Streaming, Apps)</option>
                  <option value="saude">Saúde (Plano, Farmácia regular)</option>
                  <option value="educacao">Educação (Faculdade, Cursos)</option>
                  <option value="transporte">Transporte (IPVA, Parcela veículo)</option>
                  <option value="alimentacao">Alimentação fixa</option>
                  <option value="outros">Outros compromissos</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <input
                  type="checkbox"
                  id="recurring-checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="recurring-checkbox"
                  className="text-xs text-slate-700 font-medium cursor-pointer"
                >
                  Repetir automaticamente todos os meses (Recorrência)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Código de barras salvo, débito automático, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                >
                  {editingBill ? 'Salvar Alterações' : 'Cadastrar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
