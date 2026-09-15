import React, { useState } from 'react';
import { InvestmentItem, InvestmentType } from '../types';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { OwlTipCard } from './OwlMascot';
import {
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  PieChart,
  ShieldCheck,
  Building,
  Landmark,
  Coins,
  FileSpreadsheet,
  Briefcase,
  X,
} from 'lucide-react';

interface InvestmentsViewProps {
  investments: InvestmentItem[];
  onAddInvestment: (inv: Omit<InvestmentItem, 'id'>) => void;
  onUpdateInvestment: (inv: InvestmentItem) => void;
  onDeleteInvestment: (invId: string) => void;
}

const TYPE_CONFIG: Record<
  InvestmentType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; barColor: string }
> = {
  renda_fixa: {
    label: 'Renda Fixa / CDB',
    icon: ShieldCheck,
    color: 'text-blue-600 bg-blue-50',
    barColor: 'bg-blue-600',
  },
  tesouro_direto: {
    label: 'Tesouro Direto',
    icon: Landmark,
    color: 'text-emerald-600 bg-emerald-50',
    barColor: 'bg-emerald-600',
  },
  fundos_imobiliarios: {
    label: 'Fundos Imobiliários (FIIs)',
    icon: Building,
    color: 'text-purple-600 bg-purple-50',
    barColor: 'bg-purple-600',
  },
  acoes: {
    label: 'Ações & ETFs',
    icon: TrendingUp,
    color: 'text-cyan-600 bg-cyan-50',
    barColor: 'bg-cyan-600',
  },
  cripto: {
    label: 'Criptomoedas',
    icon: Coins,
    color: 'text-amber-600 bg-amber-50',
    barColor: 'bg-amber-600',
  },
  previdencia: {
    label: 'Previdência Privada',
    icon: Briefcase,
    color: 'text-teal-600 bg-teal-50',
    barColor: 'bg-teal-600',
  },
  outros: {
    label: 'Outros Investimentos',
    icon: FileSpreadsheet,
    color: 'text-slate-600 bg-slate-100',
    barColor: 'bg-slate-600',
  },
};

export const InvestmentsView: React.FC<InvestmentsViewProps> = ({
  investments,
  onAddInvestment,
  onUpdateInvestment,
  onDeleteInvestment,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<InvestmentItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<InvestmentType>('renda_fixa');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [institution, setInstitution] = useState('');
  const [notes, setNotes] = useState('');

  // Total
  const totalInvested = investments.reduce((acc, inv) => acc + inv.amountInvested, 0);

  // Distribution by type
  const distributionByType = Object.keys(TYPE_CONFIG).map((key) => {
    const invType = key as InvestmentType;
    const items = investments.filter((i) => i.type === invType);
    const amountInvested = items.reduce((acc, i) => acc + i.amountInvested, 0);
    const percentage = totalInvested > 0 ? Math.round((amountInvested / totalInvested) * 100) : 0;
    return {
      type: invType,
      config: TYPE_CONFIG[invType],
      count: items.length,
      amountInvested,
      percentage,
    };
  }).filter((item) => item.count > 0);

  const handleOpenAdd = () => {
    setEditingInv(null);
    setName('');
    setAmount('');
    setType('renda_fixa');
    setDate(new Date().toISOString().split('T')[0]);
    setInstitution('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inv: InvestmentItem) => {
    setEditingInv(inv);
    setName(inv.name);
    setAmount(inv.amountInvested.toString());
    setType(inv.type);
    setDate(inv.date);
    setInstitution(inv.institution || '');
    setNotes(inv.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (editingInv) {
      onUpdateInvestment({
        ...editingInv,
        name: name.trim(),
        amountInvested: parsedAmount,
        type,
        date,
        institution: institution.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddInvestment({
        name: name.trim(),
        amountInvested: parsedAmount,
        type,
        date,
        institution: institution.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" /> Registro de Investimentos
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhamento simplificado dos seus aportes e patrimônio acumulado
          </p>
        </div>
        <button
          id="add-investment-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Registrar Aporte
        </button>
      </div>

      {/* Portfolio Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Total Investido (Patrimônio)
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-0.5">
              {formatCurrency(totalInvested)}
            </h3>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-xl bg-white/10 text-indigo-200 border border-white/10 text-xs font-medium">
              {investments.length} {investments.length === 1 ? 'ativo registrado' : 'ativos registrados'}
            </span>
          </div>
        </div>

        {/* Multi-color distribution bar */}
        {totalInvested > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/10">
              {distributionByType.map((item) => (
                <div
                  key={item.type}
                  className={`${item.config.barColor} transition-all`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.config.label}: ${item.percentage}%`}
                />
              ))}
            </div>

            {/* Legend pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {distributionByType.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg"
                >
                  <span className={`w-2 h-2 rounded-full ${item.config.barColor}`} />
                  <span className="font-medium text-white">{item.config.label}:</span>
                  <span>{formatCurrency(item.amountInvested)} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Owl Tip for Investments */}
      <OwlTipCard
        title="Conselho da Coruja Investidora"
        message="Investir com consistência mês a mês supera tentar adivinhar a hora perfeita do mercado. Mantenha a diversificação entre renda fixa e outros ativos conforme seus objetivos."
        mood="wise"
        variant="info"
      />

      {/* Investments List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Meus Ativos & Aportes ({investments.length})
        </h3>

        {investments.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Nenhum investimento registrado</p>
            <p className="text-xs text-slate-400 mt-1">
              Guarde o histórico simples dos seus aportes em CDBs, Tesouro, Ações ou FIIs.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              + Registrar Primeiro Aporte
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {investments.map((inv) => {
              const config = TYPE_CONFIG[inv.type] || TYPE_CONFIG.outros;
              const Icon = config.icon;

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-slate-300 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {inv.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{config.label}</span>
                        <span>•</span>
                        <span>Aporte em {formatDateBR(inv.date)}</span>
                        {inv.institution && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">{inv.institution}</span>
                          </>
                        )}
                        {inv.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400 truncate max-w-[180px]">
                              {inv.notes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(inv.amountInvested)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(inv)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                        title="Editar investimento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir o registro de "${inv.name}"?`)) {
                            onDeleteInvestment(inv.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Excluir investimento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add / Edit Investment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingInv ? 'Editar Registro de Investimento' : 'Registrar Aporte em Investimento'}
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
                  Nome do Ativo / Aplicação *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tesouro Selic 2029, CDB 110% CDI, FII HGLG11, IVVB11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Aportado (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data do Aporte
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Ativo
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as InvestmentType)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="renda_fixa">🛡️ Renda Fixa / CDB / LCI / LCA</option>
                  <option value="tesouro_direto">🏛️ Tesouro Direto (Selic, IPCA, Prefixado)</option>
                  <option value="fundos_imobiliarios">🏢 Fundos Imobiliários (FIIs)</option>
                  <option value="acoes">📈 Ações & ETFs</option>
                  <option value="cripto">🪙 Criptomoedas (Bitcoin, etc.)</option>
                  <option value="previdencia">💼 Previdência Privada (PGBL / VGBL)</option>
                  <option value="outros">📦 Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instituição / Corretora (Apenas texto informativo)
                </label>
                <input
                  type="text"
                  placeholder="Ex: NuInvest, Inter, XP, Sofisa, Mercado Pago"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas / Rentabilidade Estimada (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Liquidez diária, foco em dividendos mensais"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
                >
                  {editingInv ? 'Salvar Alterações' : 'Registrar Aporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
