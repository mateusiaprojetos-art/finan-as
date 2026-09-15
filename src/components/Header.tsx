import React, { useState } from 'react';
import { OwlMascot } from './OwlMascot';
import { formatMonthYearHeader } from '../utils/formatters';
import { AppTab, UserProfile } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Download,
  RotateCcw,
  Bell,
  Settings,
  Plus,
  LayoutDashboard,
  CalendarClock,
  ShoppingCart,
  Target,
  TrendingUp,
  Cloud,
  LogOut,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  currentMonth: string; // YYYY-MM
  onChangeMonth: (newMonth: string) => void;
  urgentBillsCount: number;
  onOpenUrgentAlert: () => void;
  onExportData: () => void;
  onResetData: () => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  pendingBillsCount?: number;
  marketItemsCount?: number;
  isShoppingModeActive?: boolean;
  onOpenQuickAdd?: (type: 'despesa' | 'receita' | 'conta') => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onChangeMonth,
  urgentBillsCount,
  onOpenUrgentAlert,
  onExportData,
  onResetData,
  activeTab,
  onSelectTab,
  pendingBillsCount = 0,
  marketItemsCount = 0,
  isShoppingModeActive = false,
  onOpenQuickAdd,
  currentUser,
  onLogout,
  isSyncing = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handlePrevMonth = () => {
    const [yearStr, monthStr] = currentMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    onChangeMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yearStr, monthStr] = currentMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    onChangeMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  const navTabs: {
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'contas',
      label: 'Contas',
      icon: CalendarClock,
      badge: pendingBillsCount > 0 ? pendingBillsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'mercado',
      label: 'Mercado',
      icon: ShoppingCart,
      badge: isShoppingModeActive ? '🛒' : marketItemsCount > 0 ? marketItemsCount : undefined,
      badgeColor: isShoppingModeActive ? 'bg-emerald-600 text-white animate-pulse' : 'bg-emerald-600 text-white',
    },
    { id: 'metas', label: 'Metas', icon: Target },
    { id: 'investimentos', label: 'Investimentos', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#fafcf9]/95 backdrop-blur-md border-b border-emerald-900/10 px-3.5 sm:px-6 py-2.5 sm:py-3 w-full shadow-2xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="relative shrink-0">
            <OwlMascot size="sm" mood="wise" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight leading-tight truncate">
              Coruja Finanças
            </h1>
            <p className="text-[10px] text-emerald-800/80 font-medium flex items-center gap-1">
              <Cloud className="w-2.5 h-2.5 text-emerald-600" />
              <span>Nuvem em Tempo Real</span>
            </p>
          </div>
        </div>

        {/* Center: Desktop / Tablet Navigation Bar (hidden on mobile, visible on md+) */}
        <nav className="hidden md:flex items-center gap-1 bg-emerald-950/5 p-1 rounded-2xl border border-emerald-950/10">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`desktop-nav-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-white text-emerald-900 shadow-xs border border-emerald-950/10'
                    : 'text-slate-600 hover:text-emerald-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 min-w-[17px] text-[9px] font-black rounded-full shadow-2xs ${
                      tab.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Month selector, Notifications, Quick Add, Settings & User Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Month Selector for Tablet & Desktop (hidden on mobile screen, shown on sm+) */}
          <div className="hidden sm:flex items-center bg-emerald-50/70 rounded-2xl border border-emerald-200/60 px-1 py-0.5 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl text-emerald-900 hover:bg-emerald-100/80 active:scale-95 transition min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
              title="Mês anterior"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-emerald-950 capitalize tracking-tight px-2 min-w-[110px] text-center">
              {formatMonthYearHeader(currentMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl text-emerald-900 hover:bg-emerald-100/80 active:scale-95 transition min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
              title="Próximo mês"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Primary Action: + Novo Lançamento */}
          {onOpenQuickAdd && (
            <button
              id="desktop-header-quick-add"
              onClick={() => onOpenQuickAdd('despesa')}
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Lançamento</span>
            </button>
          )}

          {/* Urgent Alert Bell */}
          <button
            id="urgent-alert-bell"
            onClick={onOpenUrgentAlert}
            className={`relative p-2 rounded-2xl transition active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer ${
              urgentBillsCount > 0
                ? 'text-rose-700 bg-rose-50 border border-rose-200/80 hover:bg-rose-100'
                : 'text-emerald-800/70 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/60'
            }`}
            title={urgentBillsCount > 0 ? `${urgentBillsCount} contas urgentes` : 'Sem pendências urgentes'}
            aria-label="Alertas de vencimento"
          >
            <Bell className="w-4 h-4" />
            {urgentBillsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white shadow-2xs animate-pulse">
                {urgentBillsCount}
              </span>
            )}
          </button>

          {/* User Profile & Settings Menu Button */}
          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/70 transition active:scale-95 min-h-[40px] flex items-center gap-2 cursor-pointer shadow-2xs"
              title="Perfil e Configurações"
              aria-label="Perfil e Configurações"
            >
              <div className="w-6 h-6 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                {currentUser?.displayName
                  ? currentUser.displayName.charAt(0).toUpperCase()
                  : 'C'}
              </div>
              <span className="hidden sm:inline text-xs font-bold max-w-[90px] truncate text-emerald-950">
                {currentUser?.displayName?.split(' ')[0] || 'Minha Conta'}
              </span>
              <Settings className="w-3.5 h-3.5 text-emerald-700/80 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-emerald-900/10 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  {/* Current User Info */}
                  <div className="px-4 pb-3 border-b border-emerald-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-sm font-black shrink-0">
                        {currentUser?.displayName
                          ? currentUser.displayName.charAt(0).toUpperCase()
                          : 'C'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {currentUser?.displayName || 'Usuário Coruja'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {currentUser?.email || 'Autenticado'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Sincronização:</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Cloud className="w-3 h-3 text-emerald-600" /> Ativa na Nuvem
                      </span>
                    </div>

                    {currentUser?.uid && (
                      <div className="mt-1 text-[9px] text-slate-400 truncate">
                        UID: <code className="text-slate-600 font-mono">{currentUser.uid}</code>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onExportData();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-emerald-50/80 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Baixar Cópia dos Dados (JSON)</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Deseja restaurar os dados de exemplo da Coruja no seu banco na nuvem? Seus dados atuais serão substituídos pelos exemplos.')) {
                          onResetData();
                          setShowMenu(false);
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-emerald-50/80 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-emerald-600" />
                      <span>Restaurar Dados de Exemplo</span>
                    </button>
                  </div>

                  {/* Logout Section */}
                  {onLogout && (
                    <div className="mt-2 pt-2 border-t border-slate-100 px-2">
                      <button
                        id="user-logout-btn"
                        onClick={() => {
                          setShowMenu(false);
                          onLogout();
                        }}
                        className="w-full px-3 py-2 rounded-2xl text-left text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sair da Conta (Logout)</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-only Month Navigation Strip */}
      <div className="sm:hidden mt-2 pt-2 border-t border-emerald-900/5 flex items-center justify-between bg-emerald-50/60 rounded-2xl px-2 py-1 border border-emerald-200/50">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-xl text-emerald-900 hover:bg-emerald-100/80 active:scale-95 transition min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
          title="Mês anterior"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-bold text-emerald-950 capitalize tracking-tight">
          {formatMonthYearHeader(currentMonth)}
        </span>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-xl text-emerald-900 hover:bg-emerald-100/80 active:scale-95 transition min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
          title="Próximo mês"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
