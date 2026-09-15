import React from 'react';
import { AppTab } from '../types';
import {
  LayoutDashboard,
  CalendarClock,
  ShoppingCart,
  Target,
  TrendingUp,
} from 'lucide-react';

interface NavigationProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  pendingBillsCount?: number;
  marketItemsCount?: number;
  isShoppingModeActive?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  pendingBillsCount = 0,
  marketItemsCount = 0,
  isShoppingModeActive = false,
}) => {
  const tabs: {
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
    <nav
      id="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#fafcf9]/95 backdrop-blur-md border-t border-emerald-950/10 shadow-[0_-4px_20px_rgba(6,78,59,0.05)] safe-area-bottom md:hidden"
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition min-w-[56px] min-h-[48px] active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-emerald-900 font-bold'
                  : 'text-slate-500 hover:text-emerald-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    isActive ? 'bg-emerald-100/80 text-emerald-800' : ''
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-105 text-emerald-800' : 'text-slate-500'
                    }`}
                  />
                </div>
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 flex items-center justify-center px-1 min-w-[17px] h-[17px] text-[9px] font-black rounded-full shadow-2xs ${
                      tab.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] tracking-tight mt-0.5 leading-none transition-colors ${
                  isActive ? 'text-emerald-900 font-bold' : 'text-slate-500 font-medium'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
