import React, { useState } from 'react';
import { FinancialGoal } from '../types';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { OwlMascot, OwlTipCard } from './OwlMascot';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  PiggyBank,
  ShieldCheck,
  Palmtree,
  Laptop,
  Car,
  Home,
  X,
} from 'lucide-react';

interface GoalsViewProps {
  goals: FinancialGoal[];
  onAddGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  onUpdateGoal: (goal: FinancialGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddDepositToGoal: (goalId: string, amount: number) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddDepositToGoal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Segurança & Reserva');
  const [notes, setNotes] = useState('');

  // Calculations
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const globalProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleOpenAdd = () => {
    setSelectedGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setTargetDate(nextYear.toISOString().split('T')[0]);
    setCategory('Segurança');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setTargetDate(goal.targetDate);
    setCategory(goal.category);
    setNotes(goal.notes || '');
    setIsModalOpen(true);
  };

  const handleOpenDeposit = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setDepositAmount('');
    setIsDepositModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount.replace(',', '.'));
    const parsedCurrent = parseFloat(currentAmount.replace(',', '.')) || 0;
    if (!title.trim() || isNaN(parsedTarget) || parsedTarget <= 0) return;

    if (selectedGoal && isModalOpen) {
      onUpdateGoal({
        ...selectedGoal,
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        targetDate,
        category,
        notes: notes.trim(),
      });
    } else {
      onAddGoal({
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        targetDate,
        category,
        notes: notes.trim(),
      });
    }
    setIsModalOpen(false);
  };

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    const parsed = parseFloat(depositAmount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;

    onAddDepositToGoal(selectedGoal.id, parsed);
    setIsDepositModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" /> Metas Financeiras
          </h2>
          <p className="text-xs text-slate-500">
            Defina objetivos claros e acompanhe o progresso de cada conquista
          </p>
        </div>
        <button
          id="add-goal-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nova Meta
        </button>
      </div>

      {/* Global Progress Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Patrimônio em Metas
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatCurrency(totalSaved)}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                de {formatCurrency(totalTarget)} previsto
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
              {globalProgress}% concluído no geral
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(globalProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Owl Tip for Goals */}
      <OwlTipCard
        title="Sabedoria da Coruja para Metas"
        message="Guardar um valor fixo assim que o salário cai é muito mais eficaz do que tentar poupar 'o que sobrar' no fim do mês. Comece pela sua Reserva de Emergência!"
        mood="saving"
        variant="info"
      />

      {/* Goals Grid - 1-col mobile, 2-col tablet, 3-col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-8 text-center border border-slate-200">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Nenhuma meta cadastrada</p>
            <p className="text-xs text-slate-400 mt-1">
              Crie metas como Reserva de Emergência, Viagem, Troca de Celular ou Carro.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
            >
              + Criar Primeira Meta
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-2xs ${
                  isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top line: title & category */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        {goal.category}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                        {goal.title}
                        {isCompleted && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            Alcançada! 🎉
                          </span>
                        )}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(goal)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition"
                        title="Editar meta"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir a meta "${goal.title}"?`)) {
                            onDeleteGoal(goal.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Excluir meta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Guardado até agora</p>
                      <p className="text-xl font-extrabold text-emerald-600">
                        {formatCurrency(goal.currentAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Meta final</p>
                      <p className="text-sm font-bold text-slate-800">
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>{progress}% alcançado</span>
                      <span>
                        {isCompleted ? 'Meta atingida!' : `Faltam ${formatCurrency(remaining)}`}
                      </span>
                    </div>
                  </div>

                  {/* Target date & notes */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Prazo: {formatDateBR(goal.targetDate)}
                    </span>
                    {goal.notes && (
                      <span className="truncate max-w-[150px] italic text-slate-400" title={goal.notes}>
                        {goal.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Deposit Button */}
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => handleOpenDeposit(goal)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <PiggyBank className="w-4 h-4 text-emerald-600" /> + Guardar Dinheiro nesta Meta
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add / Edit Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {selectedGoal ? 'Editar Meta Financeira' : 'Criar Nova Meta'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Objetivo / Meta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reserva de Emergência, Troca de Carro, Viagem"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Alvo (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0,00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Já Guardado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data Limite (Prazo)
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Segurança, Viagem, Bens"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivação ou Observações (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Não resgatar antes de completar 6 meses de contas"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
                >
                  {selectedGoal ? 'Salvar Alterações' : 'Criar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quick Deposit to Goal */}
      {isDepositModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 text-base mb-1">
              Guardar Dinheiro na Meta
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Meta: <strong>{selectedGoal.title}</strong>
            </p>

            <form onSubmit={handleConfirmDeposit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor a Guardar (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  autoFocus
                  required
                  placeholder="0,00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-xl font-bold text-center py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Quick shortcuts */}
              <div className="flex justify-center gap-2">
                {[50, 100, 200, 500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDepositAmount(val.toString())}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    + R${val}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
