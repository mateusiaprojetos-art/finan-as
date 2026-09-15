export type TransactionType = 'receita' | 'despesa';

export type TransactionCategory =
  | 'salario'
  | 'freelance'
  | 'alimentacao'
  | 'mercado'
  | 'moradia'
  | 'transporte'
  | 'saude'
  | 'lazer'
  | 'educacao'
  | 'investimento'
  | 'outros';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  notes?: string;
  source?: 'manual' | 'mercado';
}

export type BillCategory =
  | 'moradia'
  | 'servicos'
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'educacao'
  | 'assinaturas'
  | 'outros';

export interface MonthlyBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 to 31
  category: BillCategory;
  isRecurring: boolean;
  status: 'pendente' | 'paga';
  paidDate?: string;
  month: string; // YYYY-MM
  notes?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  estimatedPrice: number;
  actualPrice?: number;
  isBought: boolean;
  category: 'hortifruti' | 'mercearia' | 'carnes' | 'limpeza' | 'higiene' | 'bebidas' | 'outros';
}

export interface ShoppingTrip {
  id: string;
  date: string;
  storeName?: string;
  totalSpent: number;
  itemCount: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  iconName?: string;
  notes?: string;
}

export type InvestmentType =
  | 'renda_fixa'
  | 'tesouro_direto'
  | 'acoes'
  | 'fundos_imobiliarios'
  | 'cripto'
  | 'previdencia'
  | 'outros';

export interface InvestmentItem {
  id: string;
  name: string;
  type: InvestmentType;
  amountInvested: number;
  date: string; // YYYY-MM-DD
  institution?: string; // ex: Corretora X, Banco Y (apenas nome)
  notes?: string;
}

export type AppTab = 'dashboard' | 'contas' | 'fluxo' | 'mercado' | 'metas' | 'investimentos';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt?: string;
}
