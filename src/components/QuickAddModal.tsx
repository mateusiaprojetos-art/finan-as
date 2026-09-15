import React, { useState } from 'react';
import { TransactionType, TransactionCategory, BillCategory } from '../types';
import { ArrowDownLeft, ArrowUpRight, CalendarClock, X } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  initialType?: 'despesa' | 'receita' | 'conta';
  currentMonth: string;
  onClose: () => void;
  onAddTransaction: (tx: {
    description: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    date: string;
    notes?: string;
    source: 'manual';
  }) => void;
  onAddBill: (bill: {
    name: string;
    amount: number;
    dueDay: number;
    category: BillCategory;
    isRecurring: boolean;
    status: 'pendente';
    month: string;
    notes?: string;
  }) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  initialType = 'despesa',
  currentMonth,
  onClose,
  onAddTransaction,
  onAddBill,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'despesa' | 'receita' | 'conta'>(initialType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [txCategory, setTxCategory] = useState<TransactionCategory>('alimentacao');
  const [billCategory, setBillCategory] = useState<BillCategory>('moradia');
  const [dueDay, setDueDay] = useState(10);
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today.startsWith(currentMonth) ? today : `${currentMonth}-01`;
  });
  const [isRecurring, setIsRecurring] = useState(true);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (mode === 'conta') {
      onAddBill({
        name: description.trim(),
        amount: parsedAmount,
        dueDay: Number(dueDay),
        category: billCategory,
        isRecurring,
        status: 'pendente',
        month: currentMonth,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddTransaction({
        description: description.trim(),
        amount: parsedAmount,
        type: mode,
        category: txCategory,
        date,
        notes: notes.trim() || undefined,
        source: 'manual',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Novo Lançamento Rápido</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl mt-4">
          <button
            type="button"
            onClick={() => {
              setMode('despesa');
              setTxCategory('alimentacao');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
              mode === 'despesa'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Despesa
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('receita');
              setTxCategory('salario');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
              mode === 'receita'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Receita
          </button>
          <button
            type="button"
            onClick={() => setMode('conta')}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
              mode === 'conta'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" /> Conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {mode === 'conta' ? 'Nome da Conta / Boleto *' : 'Descrição do Lançamento *'}
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={
                mode === 'conta'
                  ? 'Ex: Energia Elétrica, Aluguel'
                  : mode === 'receita'
                  ? 'Ex: Salário, Pix recebido, Freelance'
                  : 'Ex: Almoço, Gasolina, Farmácia'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            {mode === 'conta' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dia do Vencimento *
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
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Categoria
            </label>
            {mode === 'conta' ? (
              <select
                value={billCategory}
                onChange={(e) => setBillCategory(e.target.value as BillCategory)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="moradia">Moradia</option>
                <option value="servicos">Serviços (Luz/Água/Net)</option>
                <option value="assinaturas">Assinaturas</option>
                <option value="saude">Saúde</option>
                <option value="educacao">Educação</option>
                <option value="transporte">Transporte</option>
                <option value="alimentacao">Alimentação</option>
                <option value="outros">Outros</option>
              </select>
            ) : (
              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value as TransactionCategory)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {mode === 'receita' ? (
                  <>
                    <option value="salario">Salário</option>
                    <option value="freelance">Freelance / Extra</option>
                    <option value="investimento">Rendimentos</option>
                    <option value="outros">Outros</option>
                  </>
                ) : (
                  <>
                    <option value="alimentacao">Alimentação</option>
                    <option value="mercado">Supermercado</option>
                    <option value="transporte">Transporte</option>
                    <option value="moradia">Moradia</option>
                    <option value="saude">Saúde</option>
                    <option value="lazer">Lazer</option>
                    <option value="educacao">Educação</option>
                    <option value="outros">Outros</option>
                  </>
                )}
              </select>
            )}
          </div>

          {mode === 'conta' && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <input
                type="checkbox"
                id="recurring-quick"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="recurring-quick" className="text-xs text-slate-700 font-medium cursor-pointer">
                Repetir mensalmente (recorrência)
              </label>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Pago no débito, nota salva"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition ${
                mode === 'despesa'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : mode === 'receita'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
