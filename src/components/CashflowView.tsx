import React, { useState } from 'react';
import { Transaction, TransactionCategory, TransactionType } from '../types';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { OwlTipCard } from './OwlMascot';
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  DollarSign,
  Utensils,
  Car,
  HeartPulse,
  Briefcase,
  Home,
  GraduationCap,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  X,
} from 'lucide-react';

interface CashflowViewProps {
  currentMonth: string;
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (txId: string) => void;
}

const CATEGORY_MAP: Record<TransactionCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  salario: { label: 'Salário', icon: Briefcase, color: 'text-emerald-600 bg-emerald-50' },
  freelance: { label: 'Freelance / Extra', icon: Sparkles, color: 'text-cyan-600 bg-cyan-50' },
  alimentacao: { label: 'Alimentação', icon: Utensils, color: 'text-orange-600 bg-orange-50' },
  mercado: { label: 'Supermercado', icon: ShoppingBag, color: 'text-amber-600 bg-amber-50' },
  moradia: { label: 'Moradia', icon: Home, color: 'text-blue-600 bg-blue-50' },
  transporte: { label: 'Transporte', icon: Car, color: 'text-indigo-600 bg-indigo-50' },
  saude: { label: 'Saúde', icon: HeartPulse, color: 'text-rose-600 bg-rose-50' },
  lazer: { label: 'Lazer & Cultura', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
  educacao: { label: 'Educação', icon: GraduationCap, color: 'text-teal-600 bg-teal-50' },
  investimento: { label: 'Investimentos', icon: TrendingUp, color: 'text-sky-600 bg-sky-50' },
  outros: { label: 'Outros', icon: DollarSign, color: 'text-slate-600 bg-slate-100' },
};

export const CashflowView: React.FC<CashflowViewProps> = ({
  currentMonth,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('despesa');
  const [category, setCategory] = useState<TransactionCategory>('alimentacao');
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today.startsWith(currentMonth) ? today : `${currentMonth}-01`;
  });
  const [notes, setNotes] = useState('');

  // Month transactions
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));

  const totalIncome = monthTransactions
    .filter((t) => t.type === 'receita')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter((t) => t.type === 'despesa')
    .reduce((acc, t) => acc + t.amount, 0);

  const netCashflow = totalIncome - totalExpenses;

  // Filtered list
  const filteredList = monthTransactions.filter((tx) => {
    if (filterType !== 'todos' && tx.type !== filterType) return false;
    if (categoryFilter !== 'todas' && tx.category !== categoryFilter) return false;
    if (
      searchQuery.trim() &&
      !tx.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(tx.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Sort descending by date
  filteredList.sort((a, b) => b.date.localeCompare(a.date));

  const handleOpenAdd = (defaultType?: TransactionType) => {
    if (defaultType) {
      setType(defaultType);
      setCategory(defaultType === 'receita' ? 'salario' : 'alimentacao');
    }
    setDesc('');
    setAmount('');
    setNotes('');
    const today = new Date().toISOString().split('T')[0];
    setDate(today.startsWith(currentMonth) ? today : `${currentMonth}-01`);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!desc.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      description: desc.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      notes: notes.trim() || undefined,
      source: 'manual',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-600" /> Fluxo de Caixa
          </h2>
          <p className="text-xs text-slate-500">
            Registro diário de receitas e despesas avulsas em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="add-income-btn"
            onClick={() => handleOpenAdd('receita')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" /> + Receita
          </button>
          <button
            id="add-expense-btn"
            onClick={() => handleOpenAdd('despesa')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" /> + Despesa
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Entradas
            </span>
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {monthTransactions.filter((t) => t.type === 'receita').length} lançamentos de entrada
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Saídas
            </span>
            <span className="p-1.5 rounded-xl bg-rose-50 text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {monthTransactions.filter((t) => t.type === 'despesa').length} lançamentos de saída
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Resultado do Mês
            </span>
            <span className={`p-1.5 rounded-xl ${netCashflow >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className={`text-2xl font-black mt-1 ${netCashflow >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatCurrency(netCashflow)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {netCashflow >= 0 ? 'Superávit no período' : 'Déficit no período'}
          </p>
        </div>
      </div>

      {/* Owl Tip for Cashflow */}
      <OwlTipCard
        title="Dica de Registro Diário"
        message="Anotar na hora aquele café, lanche ou transporte faz toda a diferença no fim do mês. É assim que evitamos o famoso 'para onde foi o meu dinheiro?'."
        mood="saving"
        variant="info"
      />

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição ou observação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setFilterType('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('receita')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === 'receita' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFilterType('despesa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === 'despesa' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Saídas
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Categoria:
          </span>
          <button
            onClick={() => setCategoryFilter('todas')}
            className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
              categoryFilter === 'todas'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                categoryFilter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <ArrowLeftRight className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Nenhum lançamento encontrado</p>
            <p className="text-xs text-slate-400 mt-1">
              Registre suas receitas ou despesas diárias para acompanhar o saldo.
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={() => handleOpenAdd('receita')}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                + Registrar Receita
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => handleOpenAdd('despesa')}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                + Registrar Despesa
              </button>
            </div>
          </div>
        ) : (
          filteredList.map((tx) => {
            const cat = CATEGORY_MAP[tx.category] || CATEGORY_MAP.outros;
            const Icon = cat.icon;
            const isIncome = tx.type === 'receita';

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {tx.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-700">{cat.label}</span>
                      <span>•</span>
                      <span>{formatDateBR(tx.date)}</span>
                      {tx.source === 'mercado' && (
                        <span className="px-1.5 py-0.2 rounded-sm bg-amber-100 text-amber-800 font-semibold text-[10px]">
                          🛒 Compra de Mercado
                        </span>
                      )}
                      {tx.notes && (
                        <span className="italic text-slate-400 truncate max-w-[150px]">
                          {tx.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span
                    className={`text-sm sm:text-base font-extrabold ${
                      isIncome ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isIncome ? '+ ' : '- '}
                    {formatCurrency(tx.amount)}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir o lançamento "${tx.description}"?`)) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Excluir lançamento"
                    aria-label="Excluir lançamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {type === 'receita' ? 'Nova Entrada (Receita)' : 'Nova Saída (Despesa)'}
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
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setType('receita');
                    setCategory('salario');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                    type === 'receita'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Receita (+)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('despesa');
                    setCategory('alimentacao');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                    type === 'despesa'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Despesa (-)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  required
                  placeholder={type === 'receita' ? 'Ex: Salário, Freelance, Pix recebido' : 'Ex: Almoço restaurante, Uber, Farmácia'}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {type === 'receita' ? (
                    <>
                      <option value="salario">Salário Mensal</option>
                      <option value="freelance">Freelance / Serviços Extras</option>
                      <option value="investimento">Rendimentos / Dividendos</option>
                      <option value="outros">Outras Entradas</option>
                    </>
                  ) : (
                    <>
                      <option value="alimentacao">Alimentação / Restaurante</option>
                      <option value="mercado">Supermercado & Feira</option>
                      <option value="transporte">Transporte / Combustível / Aplicativo</option>
                      <option value="moradia">Moradia & Manutenção</option>
                      <option value="saude">Saúde & Cuidados</option>
                      <option value="lazer">Lazer, Cinema & Passeios</option>
                      <option value="educacao">Educação & Livros</option>
                      <option value="outros">Outras Despesas</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pago via Pix, nota fiscal guardada"
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
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition ${
                    type === 'receita' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
