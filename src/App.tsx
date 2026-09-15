import React, { useState, useEffect, useRef } from 'react';
import {
  AppTab,
  MonthlyBill,
  Transaction,
  ShoppingItem,
  FinancialGoal,
  InvestmentItem,
  UserProfile,
} from './types';
import {
  auth,
  subscribeToAuth,
  logoutUser,
  subscribeToBills,
  subscribeToTransactions,
  subscribeToShopping,
  subscribeToGoals,
  subscribeToInvestments,
  saveBillToFirestore,
  deleteBillFromFirestore,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  saveShoppingItemToFirestore,
  deleteShoppingItemFromFirestore,
  clearBoughtShoppingItemsFromFirestore,
  saveGoalToFirestore,
  deleteGoalFromFirestore,
  saveInvestmentToFirestore,
  deleteInvestmentFromFirestore,
  seedInitialDataForUser,
  resetUserDataInFirestore,
} from './lib/firebase';
import { getCurrentMonthYear, getDaysRemainingInMonth, formatCurrency } from './utils/formatters';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AlertBanner } from './components/AlertBanner';
import { DashboardView } from './components/DashboardView';
import { BillsView } from './components/BillsView';
import { CashflowView } from './components/CashflowView';
import { MarketView } from './components/MarketView';
import { GoalsView } from './components/GoalsView';
import { InvestmentsView } from './components/InvestmentsView';
import { QuickAddModal } from './components/QuickAddModal';
import { OwlMascot } from './components/OwlMascot';
import { AuthScreen } from './components/AuthScreen';
import { Cloud, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Global App State
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonthYear());
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // Firestore Live Data State
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);

  // UI state
  const [isShoppingModeActive, setIsShoppingModeActive] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [quickAddModal, setQuickAddModal] = useState<{
    isOpen: boolean;
    type: 'despesa' | 'receita' | 'conta';
  }>({
    isOpen: false,
    type: 'despesa',
  });

  // Owl Toast Feedback state
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    title?: string;
    mood?: 'wise' | 'happy' | 'alert' | 'celebrate' | 'saving';
    type?: 'success' | 'info' | 'warning';
  } | null>(null);

  const showToast = (
    message: string,
    title = 'Coruja Finanças',
    mood: 'wise' | 'happy' | 'alert' | 'celebrate' | 'saving' = 'happy',
    type: 'success' | 'info' | 'warning' = 'success'
  ) => {
    const id = Date.now();
    setToast({ id, message, title, mood, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4500);
  };

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Usuário Coruja',
        });
      } else {
        setCurrentUser(null);
        setBills([]);
        setTransactions([]);
        setShoppingItems([]);
        setGoals([]);
        setInvestments([]);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Firestore Subscriptions per authenticated User UID
  useEffect(() => {
    if (!currentUser?.uid) return;

    const uid = currentUser.uid;

    // Ensure user has initial data if newly registered
    seedInitialDataForUser(uid).catch((err) =>
      console.error('Erro ao verificar dados iniciais:', err)
    );

    const unsubBills = subscribeToBills(uid, (data) => setBills(data));
    const unsubTx = subscribeToTransactions(uid, (data) => setTransactions(data));
    const unsubShop = subscribeToShopping(uid, (data) => setShoppingItems(data));
    const unsubGoals = subscribeToGoals(uid, (data) => setGoals(data));
    const unsubInv = subscribeToInvestments(uid, (data) => setInvestments(data));

    return () => {
      unsubBills();
      unsubTx();
      unsubShop();
      unsubGoals();
      unsubInv();
    };
  }, [currentUser?.uid]);

  // Sync recurring bills to new month if needed in Firestore
  const clonedMonthsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!currentUser?.uid || bills.length === 0) return;
    if (clonedMonthsRef.current.has(currentMonth)) return;

    const currentMonthBills = bills.filter((b) => b.month === currentMonth);

    // If current month has no bills yet but earlier recurring bills exist, clone them into Firestore
    if (currentMonthBills.length === 0) {
      const recurringBills = bills.filter((b) => b.isRecurring);
      if (recurringBills.length > 0) {
        clonedMonthsRef.current.add(currentMonth);

        const seenNames = new Set<string>();
        for (const bill of recurringBills) {
          if (!seenNames.has(bill.name)) {
            seenNames.add(bill.name);
            const newBill: MonthlyBill = {
              ...bill,
              id: `bill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              status: 'pendente',
              paidDate: undefined,
              month: currentMonth,
            };
            saveBillToFirestore(currentUser.uid, newBill).catch(console.error);
          }
        }
      }
    }
  }, [currentMonth, bills, currentUser?.uid]);

  // Urgent bills filter for bell / alert
  const urgentBills = bills.filter((b) => {
    if (b.month !== currentMonth || b.status === 'paga') return false;
    const info = getDaysRemainingInMonth(b.dueDay, currentMonth);
    return info.isOverdue || info.isToday || info.daysRemaining <= 3;
  });

  // --- Handlers: Bills in Firestore ---
  const handleAddBill = async (newBill: Omit<MonthlyBill, 'id'>) => {
    if (!currentUser?.uid) return;
    const billWithId: MonthlyBill = {
      ...newBill,
      id: `bill-${Date.now()}`,
    };
    try {
      await saveBillToFirestore(currentUser.uid, billWithId);
      showToast(`Conta "${newBill.name}" cadastrada na nuvem!`, 'Conta Salva', 'wise');
    } catch (e) {
      console.error(e);
      showToast('Erro ao salvar conta. Verifique sua conexão.', 'Erro', 'alert', 'warning');
    }
  };

  const handleUpdateBill = async (updatedBill: MonthlyBill) => {
    if (!currentUser?.uid) return;
    try {
      await saveBillToFirestore(currentUser.uid, updatedBill);
      showToast(`Conta "${updatedBill.name}" atualizada.`, 'Conta Atualizada', 'wise');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!currentUser?.uid) return;
    try {
      await deleteBillFromFirestore(currentUser.uid, billId);
      showToast('Conta removida com sucesso.', 'Conta Removida', 'wise');
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBillStatus = async (billId: string) => {
    if (!currentUser?.uid) return;
    const target = bills.find((b) => b.id === billId);
    if (!target) return;

    const newStatus = target.status === 'paga' ? 'pendente' : 'paga';
    const today = new Date().toISOString().split('T')[0];

    const updated: MonthlyBill = {
      ...target,
      status: newStatus,
      paidDate: newStatus === 'paga' ? today : undefined,
    };

    try {
      await saveBillToFirestore(currentUser.uid, updated);
      if (newStatus === 'paga') {
        showToast(
          `Conta "${target.name}" marcada como paga! Menos uma pendência.`,
          'Boa notícia!',
          'celebrate'
        );
      } else {
        showToast(`Conta "${target.name}" retornada para pendente.`, 'Status Alterado', 'wise');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Handlers: Cashflow Transactions in Firestore ---
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    if (!currentUser?.uid) return;
    const txWithId: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
    };
    try {
      await saveTransactionToFirestore(currentUser.uid, txWithId);
      showToast(
        `${newTx.type === 'receita' ? 'Entrada' : 'Despesa'} de ${formatCurrency(newTx.amount)} registrada!`,
        'Lançamento Salvo',
        newTx.type === 'receita' ? 'happy' : 'saving'
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!currentUser?.uid) return;
    try {
      await deleteTransactionFromFirestore(currentUser.uid, txId);
      showToast('Lançamento excluído com sucesso.', 'Excluído', 'wise');
    } catch (e) {
      console.error(e);
    }
  };

  // --- Handlers: Market / Shopping in Firestore ---
  const handleAddShoppingItem = async (item: Omit<ShoppingItem, 'id' | 'isBought'>) => {
    if (!currentUser?.uid) return;
    const newItem: ShoppingItem = {
      ...item,
      id: `shop-${Date.now()}`,
      isBought: false,
    };
    try {
      await saveShoppingItemToFirestore(currentUser.uid, newItem);
      showToast(`Item "${item.name}" adicionado à lista.`, 'Lista Atualizada', 'wise');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateShoppingItem = async (updatedItem: ShoppingItem) => {
    if (!currentUser?.uid) return;
    try {
      await saveShoppingItemToFirestore(currentUser.uid, updatedItem);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteShoppingItem = async (id: string) => {
    if (!currentUser?.uid) return;
    try {
      await deleteShoppingItemFromFirestore(currentUser.uid, id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearBoughtItems = async () => {
    if (!currentUser?.uid) return;
    const boughtIds = shoppingItems.filter((i) => i.isBought).map((i) => i.id);
    if (boughtIds.length === 0) return;
    try {
      await clearBoughtShoppingItemsFromFirestore(currentUser.uid, boughtIds);
      showToast('Itens comprados foram arquivados.', 'Lista Limpa', 'wise');
    } catch (e) {
      console.error(e);
    }
  };

  // Finalize purchase -> creates an expense transaction in cashflow and clears bought items in Firestore
  const handleFinishPurchase = async (purchaseData: {
    totalSpent: number;
    storeName: string;
    date: string;
    itemCount: number;
  }) => {
    if (!currentUser?.uid) return;
    try {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        description: `Mercado: ${purchaseData.storeName} (${purchaseData.itemCount} itens)`,
        amount: purchaseData.totalSpent,
        type: 'despesa',
        category: 'mercado',
        date: purchaseData.date,
        notes: `Compra finalizada via Modo Compra da Coruja (${purchaseData.itemCount} itens)`,
        source: 'mercado',
      };

      await saveTransactionToFirestore(currentUser.uid, newTx);

      const boughtIds = shoppingItems.filter((i) => i.isBought).map((i) => i.id);
      if (boughtIds.length > 0) {
        await clearBoughtShoppingItemsFromFirestore(currentUser.uid, boughtIds);
      }

      setIsShoppingModeActive(false);

      showToast(
        `Compra de ${formatCurrency(purchaseData.totalSpent)} lançada automaticamente no seu Fluxo de Caixa!`,
        'Compra Finalizada com Sucesso! 🛒',
        'celebrate'
      );
    } catch (e) {
      console.error(e);
    }
  };

  // --- Handlers: Goals in Firestore ---
  const handleAddGoal = async (newGoal: Omit<FinancialGoal, 'id'>) => {
    if (!currentUser?.uid) return;
    const goalWithId: FinancialGoal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
    };
    try {
      await saveGoalToFirestore(currentUser.uid, goalWithId);
      showToast(`Meta "${newGoal.title}" criada! Cada passo conta.`, 'Nova Meta Criada', 'saving');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateGoal = async (updatedGoal: FinancialGoal) => {
    if (!currentUser?.uid) return;
    try {
      await saveGoalToFirestore(currentUser.uid, updatedGoal);
      showToast(`Meta "${updatedGoal.title}" atualizada.`, 'Meta Atualizada', 'wise');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!currentUser?.uid) return;
    try {
      await deleteGoalFromFirestore(currentUser.uid, goalId);
      showToast('Meta excluída.', 'Meta Removida', 'wise');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDepositToGoal = async (goalId: string, amount: number) => {
    if (!currentUser?.uid) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newCurrent = goal.currentAmount + amount;
    const updated: FinancialGoal = {
      ...goal,
      currentAmount: newCurrent,
    };

    try {
      await saveGoalToFirestore(currentUser.uid, updated);
      const isFinished = newCurrent >= goal.targetAmount;
      showToast(
        isFinished
          ? `🎉 Parabéns! Você atingiu 100% da meta "${goal.title}"!`
          : `Aporte de ${formatCurrency(amount)} guardado na meta "${goal.title}"!`,
        isFinished ? 'Meta Conquistada!' : 'Aporte Realizado',
        isFinished ? 'celebrate' : 'saving'
      );
    } catch (e) {
      console.error(e);
    }
  };

  // --- Handlers: Investments in Firestore ---
  const handleAddInvestment = async (newInv: Omit<InvestmentItem, 'id'>) => {
    if (!currentUser?.uid) return;
    const invWithId: InvestmentItem = {
      ...newInv,
      id: `inv-${Date.now()}`,
    };
    try {
      await saveInvestmentToFirestore(currentUser.uid, invWithId);
      showToast(
        `Aporte de ${formatCurrency(newInv.amountInvested)} em "${newInv.name}" registrado!`,
        'Aporte Salvo',
        'saving'
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateInvestment = async (updatedInv: InvestmentItem) => {
    if (!currentUser?.uid) return;
    try {
      await saveInvestmentToFirestore(currentUser.uid, updatedInv);
      showToast('Investimento atualizado.', 'Atualizado', 'wise');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteInvestment = async (invId: string) => {
    if (!currentUser?.uid) return;
    try {
      await deleteInvestmentFromFirestore(currentUser.uid, invId);
      showToast('Investimento removido.', 'Removido', 'wise');
    } catch (e) {
      console.error(e);
    }
  };

  // Backup data export
  const handleExportData = () => {
    const backup = {
      usuario: currentUser,
      exportadoEm: new Date().toISOString(),
      contas: bills,
      fluxo: transactions,
      mercado: shoppingItems,
      metas: goals,
      investimentos: investments,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `coruja_financas_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Cópia de segurança baixada com sucesso!', 'Backup Concluído', 'wise');
  };

  // Reset to default sample data in Firestore
  const handleResetData = async () => {
    if (!currentUser?.uid) return;
    try {
      await resetUserDataInFirestore(currentUser.uid);
      showToast('Dados de exemplo restaurados na nuvem!', 'Dados Restaurados', 'happy');
    } catch (e) {
      console.error(e);
      showToast('Erro ao restaurar dados.', 'Erro', 'alert', 'warning');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Sessão encerrada com segurança.', 'Até logo!', 'wise');
    } catch (e) {
      console.error('Erro ao sair:', e);
    }
  };

  // 1. Initial Authentication Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#edf3ef] flex flex-col items-center justify-center p-4">
        <OwlMascot size={80} mood="wise" />
        <div className="mt-4 flex items-center gap-2.5 text-xs font-bold text-emerald-950">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Carregando sua conta no Coruja Finanças...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state: display AuthScreen
  if (!currentUser) {
    return <AuthScreen onSuccess={() => showToast('Bem-vindo(a) ao Coruja Finanças!', 'Conectado', 'happy')} />;
  }

  // 3. Authenticated App UI
  return (
    <div className="min-h-screen bg-[#edf3ef] text-slate-800 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Application Header - Includes desktop tabs, user profile and quick action on md+ */}
      <Header
        currentMonth={currentMonth}
        onChangeMonth={setCurrentMonth}
        urgentBillsCount={urgentBills.length}
        onOpenUrgentAlert={() => setIsAlertOpen(true)}
        onExportData={handleExportData}
        onResetData={handleResetData}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingBillsCount={bills.filter((b) => b.month === currentMonth && b.status === 'pendente').length}
        marketItemsCount={shoppingItems.filter((i) => !i.isBought).length}
        isShoppingModeActive={isShoppingModeActive}
        onOpenQuickAdd={(type) => setQuickAddModal({ isOpen: true, type })}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main View Container - Fluid on mobile, comfortably constrained on tablet and desktop */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentMonth={currentMonth}
            bills={bills}
            transactions={transactions}
            shoppingItems={shoppingItems}
            goals={goals}
            investments={investments}
            onNavigateTab={setActiveTab}
            onPayBill={handleToggleBillStatus}
            onOpenQuickAdd={(type) => setQuickAddModal({ isOpen: true, type })}
            onOpenUrgentAlert={() => setIsAlertOpen(true)}
          />
        )}

        {activeTab === 'contas' && (
          <BillsView
            currentMonth={currentMonth}
            bills={bills}
            onAddBill={handleAddBill}
            onUpdateBill={handleUpdateBill}
            onDeleteBill={handleDeleteBill}
            onToggleStatus={handleToggleBillStatus}
          />
        )}

        {activeTab === 'fluxo' && (
          <CashflowView
            currentMonth={currentMonth}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'mercado' && (
          <MarketView
            shoppingItems={shoppingItems}
            isShoppingModeActive={isShoppingModeActive}
            onToggleShoppingMode={setIsShoppingModeActive}
            onAddItem={handleAddShoppingItem}
            onUpdateItem={handleUpdateShoppingItem}
            onDeleteItem={handleDeleteShoppingItem}
            onClearBought={handleClearBoughtItems}
            onFinishPurchase={handleFinishPurchase}
          />
        )}

        {activeTab === 'metas' && (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onAddDepositToGoal={handleAddDepositToGoal}
          />
        )}

        {activeTab === 'investimentos' && (
          <InvestmentsView
            investments={investments}
            onAddInvestment={handleAddInvestment}
            onUpdateInvestment={handleUpdateInvestment}
            onDeleteInvestment={handleDeleteInvestment}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (Mobile only - hidden on md+) */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingBillsCount={bills.filter((b) => b.month === currentMonth && b.status === 'pendente').length}
        marketItemsCount={shoppingItems.filter((i) => !i.isBought).length}
        isShoppingModeActive={isShoppingModeActive}
      />

      {/* Floating Quick Add Button on Mobile (hidden on md+) */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <button
          id="mobile-fab-quick-add"
          onClick={() => setQuickAddModal({ isOpen: true, type: 'despesa' })}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg hover:bg-emerald-800 active:scale-95 transition cursor-pointer"
          title="Lançamento Rápido"
          aria-label="Lançamento Rápido"
        >
          <span className="text-2xl font-light leading-none mb-0.5">+</span>
        </button>
      </div>

      {/* Alert Banner / Urgent Bills Modal */}
      <AlertBanner
        isOpen={isAlertOpen}
        urgentBills={urgentBills}
        targetMonth={currentMonth}
        onPayBill={handleToggleBillStatus}
        onClose={() => setIsAlertOpen(false)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddModal.isOpen}
        initialType={quickAddModal.type}
        currentMonth={currentMonth}
        onClose={() => setQuickAddModal({ isOpen: false, type: 'despesa' })}
        onAddTransaction={handleAddTransaction}
        onAddBill={handleAddBill}
      />

      {/* Owl Toast Notification */}
      {toast && (
        <div className="fixed top-18 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in fade-in slide-in-from-top-4 pointer-events-auto">
          <div className="bg-slate-900/95 text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 flex items-start gap-3 backdrop-blur-md">
            <div className="shrink-0 pt-0.5">
              <OwlMascot size="xs" mood={toast.mood || 'happy'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200">{toast.title || 'Coruja Finanças'}</p>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
