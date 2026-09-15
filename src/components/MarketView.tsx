import React, { useState } from 'react';
import { ShoppingItem, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { OwlMascot, OwlTipCard } from './OwlMascot';
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Check,
  Store,
  Tag,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Info,
  X,
} from 'lucide-react';

interface MarketViewProps {
  shoppingItems: ShoppingItem[];
  isShoppingModeActive: boolean;
  onToggleShoppingMode: (active: boolean) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isBought'>) => void;
  onUpdateItem: (item: ShoppingItem) => void;
  onDeleteItem: (id: string) => void;
  onClearBought: () => void;
  onFinishPurchase: (purchaseData: {
    totalSpent: number;
    storeName: string;
    date: string;
    itemCount: number;
  }) => void;
}

const MARKET_CATEGORIES: Record<ShoppingItem['category'], { label: string; icon: string }> = {
  hortifruti: { label: 'Hortifrúti', icon: '🥬' },
  mercearia: { label: 'Mercearia & Grãos', icon: '🌾' },
  carnes: { label: 'Carnes & Ovos', icon: '🥩' },
  limpeza: { label: 'Limpeza', icon: '🧹' },
  higiene: { label: 'Higiene & Cuidados', icon: '🧴' },
  bebidas: { label: 'Bebidas', icon: '🧃' },
  outros: { label: 'Outros', icon: '📦' },
};

export const MarketView: React.FC<MarketViewProps> = ({
  shoppingItems,
  isShoppingModeActive,
  onToggleShoppingMode,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onClearBought,
  onFinishPurchase,
}) => {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1 un');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [category, setCategory] = useState<ShoppingItem['category']>('mercearia');

  // Finish purchase states
  const [storeName, setStoreName] = useState('Supermercado');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Price input dialog for shopping mode
  const [priceInputItemId, setPriceInputItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState('');

  // Calculations
  const boughtItems = shoppingItems.filter((i) => i.isBought);
  const unboughtItems = shoppingItems.filter((i) => !i.isBought);

  // Total in cart (based on actualPrice if set, otherwise fallback to estimatedPrice)
  const totalCartSpent = boughtItems.reduce((acc, i) => {
    return acc + (i.actualPrice !== undefined ? i.actualPrice : i.estimatedPrice);
  }, 0);

  // Total estimated for whole list
  const totalEstimated = shoppingItems.reduce((acc, i) => acc + (i.estimatedPrice || 0), 0);

  // Estimated for bought items
  const estimatedForBought = boughtItems.reduce((acc, i) => acc + (i.estimatedPrice || 0), 0);
  const priceDifference = totalCartSpent - estimatedForBought;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setQuantity('1 un');
    setEstimatedPrice('');
    setCategory('mercearia');
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedEst = parseFloat(estimatedPrice.replace(',', '.')) || 0;

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        name: name.trim(),
        quantity: quantity.trim() || '1 un',
        estimatedPrice: parsedEst,
        category,
      });
    } else {
      onAddItem({
        name: name.trim(),
        quantity: quantity.trim() || '1 un',
        estimatedPrice: parsedEst,
        category,
      });
    }
    setIsAddModalOpen(false);
  };

  // Toggle item in cart
  const handleToggleBought = (item: ShoppingItem) => {
    if (!item.isBought) {
      // Prompt for real price in shopping mode
      if (isShoppingModeActive) {
        setPriceInputItemId(item.id);
        setTempPrice(item.estimatedPrice > 0 ? item.estimatedPrice.toFixed(2) : '');
      } else {
        onUpdateItem({ ...item, isBought: true, actualPrice: item.estimatedPrice });
      }
    } else {
      onUpdateItem({ ...item, isBought: false, actualPrice: undefined });
    }
  };

  const handleConfirmPrice = (itemId: string) => {
    const item = shoppingItems.find((i) => i.id === itemId);
    if (!item) return;
    const parsed = parseFloat(tempPrice.replace(',', '.')) || item.estimatedPrice || 0;
    onUpdateItem({
      ...item,
      isBought: true,
      actualPrice: parsed,
    });
    setPriceInputItemId(null);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    onFinishPurchase({
      totalSpent: totalCartSpent,
      storeName: storeName.trim() || 'Supermercado',
      date: purchaseDate,
      itemCount: boughtItems.length,
    });
    setIsFinishModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Top Banner / Shopping Mode Toggle */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          isShoppingModeActive
            ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-lg ring-2 ring-amber-400/50'
            : 'bg-white text-slate-900 border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                isShoppingModeActive ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {isShoppingModeActive ? '🛒 Modo Compra Ativo' : 'Aba de Mercado'}
                </h2>
                {isShoppingModeActive && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white animate-pulse">
                    No Mercado
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isShoppingModeActive ? 'text-amber-950 font-medium' : 'text-slate-500'}`}>
                {isShoppingModeActive
                  ? 'Vá marcando os itens colocados no carrinho e confirme o preço real.'
                  : 'Monte sua lista antes de ir às compras com estimativas de custo.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isShoppingModeActive ? (
              <>
                <button
                  id="finish-purchase-btn"
                  onClick={() => setIsFinishModalOpen(true)}
                  disabled={boughtItems.length === 0}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" /> Finalizar Compra ({formatCurrency(totalCartSpent)})
                </button>
                <button
                  onClick={() => onToggleShoppingMode(false)}
                  className="px-3 py-2.5 rounded-2xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 transition"
                  title="Sair do modo compra"
                >
                  Voltar à Lista
                </button>
              </>
            ) : (
              <>
                <button
                  id="start-shopping-mode-btn"
                  onClick={() => onToggleShoppingMode(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" /> Ativar Modo Compra
                </button>
                <button
                  id="add-market-item-btn"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Novo Item
                </button>
              </>
            )}
          </div>
        </div>

        {/* Real-time Subtotal bar in shopping mode */}
        {isShoppingModeActive && (
          <div className="mt-4 pt-3 border-t border-amber-400/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-white/80 rounded-xl p-2">
              <span className="text-[10px] uppercase font-bold text-amber-900">Total no Carrinho</span>
              <p className="text-lg sm:text-xl font-black text-slate-900">
                {formatCurrency(totalCartSpent)}
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-2">
              <span className="text-[10px] uppercase font-bold text-amber-900">Itens Pegos</span>
              <p className="text-lg sm:text-xl font-black text-slate-900">
                {boughtItems.length} / {shoppingItems.length}
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-2">
              <span className="text-[10px] uppercase font-bold text-amber-900">Previsão dos Pegos</span>
              <p className="text-sm font-bold text-slate-700 mt-1">
                {formatCurrency(estimatedForBought)}
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-2">
              <span className="text-[10px] uppercase font-bold text-amber-900">Variação</span>
              <p
                className={`text-sm font-bold mt-1 ${
                  priceDifference > 0
                    ? 'text-rose-600'
                    : priceDifference < 0
                    ? 'text-emerald-700'
                    : 'text-slate-700'
                }`}
              >
                {priceDifference > 0 ? `+${formatCurrency(priceDifference)}` : formatCurrency(priceDifference)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pre-Shopping Info Banner */}
      {!isShoppingModeActive && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Estimativa Total</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {formatCurrency(totalEstimated)}
              </p>
            </div>
            <Tag className="w-5 h-5 text-blue-500" />
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Total de Itens</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {shoppingItems.length} itens na lista
              </p>
            </div>
            <ShoppingBag className="w-5 h-5 text-amber-500" />
          </div>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Itens Restantes</span>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">
                {unboughtItems.length} a comprar
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      )}

      {/* Owl Mascot Shopping Advice */}
      <OwlTipCard
        title="Dica de Mercado da Coruja"
        message={
          isShoppingModeActive
            ? "Conforme coloca o produto no carrinho físico, informe o valor da gôndola. Assim você não se assusta no caixa e sabe exatamente quanto vai gastar!"
            : "Ir ao mercado com uma lista fechada reduz em média 25% os gastos por impulso. Ative o 'Modo Compra' assim que entrar na loja."
        }
        mood={isShoppingModeActive ? 'alert' : 'wise'}
        variant={isShoppingModeActive ? 'warning' : 'info'}
      />

      {/* Shopping List Items - Stacked on Mobile, 2-Column on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Unbought Items Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>{isShoppingModeActive ? 'Falta Colocar no Carrinho' : 'Itens da Lista'}</span>
              <span className="px-2 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                {unboughtItems.length}
              </span>
            </h3>

            {!isShoppingModeActive && boughtItems.length > 0 && (
              <button
                onClick={onClearBought}
                className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar comprados ({boughtItems.length})
              </button>
            )}
          </div>

          {unboughtItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200">
              <p className="text-sm font-semibold text-slate-700">
                {shoppingItems.length === 0
                  ? 'Sua lista de mercado está vazia.'
                  : '🎉 Todos os itens da lista já estão no carrinho!'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {shoppingItems.length === 0
                  ? 'Adicione os produtos que você precisa comprar antes de ir ao mercado.'
                  : 'Clique no botão acima para finalizar a compra e lançar a despesa.'}
              </p>
              {shoppingItems.length === 0 && (
                <button
                  onClick={handleOpenAdd}
                  className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  + Adicionar Primeiro Item
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {unboughtItems.map((item) => {
                const catInfo = MARKET_CATEGORIES[item.category] || MARKET_CATEGORIES.outros;
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs hover:border-slate-300 transition flex items-center justify-between gap-3 ${
                      isShoppingModeActive ? 'ring-1 ring-amber-200/60' : ''
                    }`}
                  >
                    {/* Big Checkbox for easy thumb tap */}
                    <button
                      onClick={() => handleToggleBought(item)}
                      className="shrink-0 p-1 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                      title="Marcar como colocado no carrinho"
                      aria-label="Marcar como colocado no carrinho"
                    >
                      <Circle className="w-7 h-7 text-slate-300 hover:text-amber-500 transition-transform active:scale-90" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{catInfo.icon} {catInfo.label}</span>
                        {item.estimatedPrice > 0 && (
                          <>
                            <span>•</span>
                            <span>Estimado: <strong>{formatCurrency(item.estimatedPrice)}</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isShoppingModeActive ? (
                        <button
                          onClick={() => handleToggleBought(item)}
                          className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          + Pegar
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setName(item.name);
                              setQuantity(item.quantity);
                              setEstimatedPrice(item.estimatedPrice ? item.estimatedPrice.toString() : '');
                              setCategory(item.category);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                            title="Editar item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Excluir item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bought Items (In Cart) Section */}
        {boughtItems.length > 0 ? (
          <div className="pt-2 lg:pt-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-2">
              <span>No Carrinho</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                {boughtItems.length}
              </span>
              <span className="text-slate-400 font-normal ml-auto text-[11px]">
                Subtotal: <strong className="text-emerald-700 font-bold">{formatCurrency(totalCartSpent)}</strong>
              </span>
            </h3>

            <div className="space-y-2">
              {boughtItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-emerald-50/40 rounded-2xl p-3.5 border border-emerald-200 flex items-center justify-between gap-3"
                >
                  <button
                    onClick={() => handleToggleBought(item)}
                    className="shrink-0 p-1 text-emerald-600 hover:text-slate-400 transition cursor-pointer"
                    title="Devolver para a lista"
                    aria-label="Devolver para a lista"
                  >
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 line-through truncate">
                        {item.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-100/70 text-emerald-800 font-medium">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Valor no carrinho: <strong>{formatCurrency(item.actualPrice ?? item.estimatedPrice)}</strong>
                      {item.estimatedPrice > 0 && item.actualPrice !== undefined && item.actualPrice !== item.estimatedPrice && (
                        <span className="text-slate-500 ml-1">
                          (est: {formatCurrency(item.estimatedPrice)})
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => {
                        setPriceInputItemId(item.id);
                        setTempPrice((item.actualPrice ?? item.estimatedPrice).toFixed(2));
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition cursor-pointer"
                      title="Ajustar preço real"
                    >
                      Ajustar R$
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="hidden lg:block bg-white/70 rounded-3xl p-6 border border-dashed border-emerald-200 text-center">
            <ShoppingCart className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-bold text-slate-700">Carrinho Vazio</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Ao marcar os itens como comprados (ou usar o "Modo Compra"), eles aparecerão aqui com o cálculo do subtotal em tempo real.
            </p>
          </div>
        )}
      </div>

      {/* Floating Bottom Sticky Bar when Shopping Mode is active */}
      {isShoppingModeActive && (
        <div className="fixed bottom-14 md:bottom-3 left-0 right-0 z-30 px-4 max-w-lg mx-auto pointer-events-none">
          <div className="bg-slate-900 text-white rounded-3xl p-3.5 shadow-2xl border border-slate-700 flex items-center justify-between gap-3 pointer-events-auto">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Total no Carrinho</p>
              <p className="text-xl font-black text-amber-400">
                {formatCurrency(totalCartSpent)}
              </p>
            </div>
            <button
              id="sticky-finish-btn"
              onClick={() => setIsFinishModalOpen(true)}
              disabled={boughtItems.length === 0}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-black shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-slate-900" /> Finalizar Compra
            </button>
          </div>
        </div>
      )}

      {/* Inline Price Entry Dialog in Shopping Mode */}
      {priceInputItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 text-base mb-1">
              Valor Real no Carrinho
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Informe o preço da etiqueta deste produto:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preço Pago (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  placeholder="0,00"
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmPrice(priceInputItemId);
                    }
                  }}
                  className="w-full text-xl font-bold text-center py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Quick price shortcuts */}
              <div className="flex justify-center gap-2">
                {[5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTempPrice(val.toFixed(2))}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    R$ {val}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPriceInputItemId(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmPrice(priceInputItemId)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-sm transition"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Shopping Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingItem ? 'Editar Item da Lista' : 'Adicionar Item à Lista'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Item *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Leite integral, Arroz 5kg, Azeite de oliva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade / Medida
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2 un, 1kg, 500g"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seção / Categoria do Mercado
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ShoppingItem['category'])}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mercearia">🌾 Mercearia & Grãos</option>
                  <option value="hortifruti">🥬 Hortifrúti (Frutas & Legumes)</option>
                  <option value="carnes">🥩 Carnes & Ovos</option>
                  <option value="limpeza">🧹 Produtos de Limpeza</option>
                  <option value="higiene">🧴 Higiene & Cuidados</option>
                  <option value="bebidas">🧃 Bebidas & Sucos</option>
                  <option value="outros">📦 Outros</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                >
                  {editingItem ? 'Salvar Alterações' : 'Adicionar à Lista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Finalizar Compra -> Vira Despesa no Fluxo de Caixa */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="text-center pb-3 border-b border-slate-100">
              <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="font-black text-slate-900 text-lg">
                Finalizar Compra de Mercado
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                O total gasto será automaticamente lançado no seu Fluxo de Caixa.
              </p>
            </div>

            <form onSubmit={handleFinish} className="space-y-4 pt-4">
              <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Valor Total a ser Lançado
                </span>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  {formatCurrency(totalCartSpent)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {boughtItems.length} itens comprados
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Supermercado / Estabelecimento
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ex: Supermercado Pão de Açúcar, Atacadão"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data da Compra
                </label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5">
                <OwlMascot size="xs" mood="celebrate" />
                <p className="text-xs text-blue-900 leading-snug">
                  A Coruja vai registrar a despesa na categoria <strong>Supermercado</strong> e limpar os itens do carrinho para sua próxima ida às compras!
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFinishModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Continuar Comprando
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition"
                >
                  Confirmar & Lançar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
