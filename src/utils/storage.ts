import { MonthlyBill, Transaction, ShoppingItem, FinancialGoal, InvestmentItem } from '../types';
import {
  INITIAL_BILLS,
  INITIAL_TRANSACTIONS,
  INITIAL_SHOPPING_ITEMS,
  INITIAL_GOALS,
  INITIAL_INVESTMENTS,
} from '../data/mockData';

const STORAGE_KEYS = {
  BILLS: 'coruja_financas_bills',
  TRANSACTIONS: 'coruja_financas_transactions',
  SHOPPING: 'coruja_financas_shopping',
  GOALS: 'coruja_financas_goals',
  INVESTMENTS: 'coruja_financas_investments',
};

export function loadStoredData() {
  let bills: MonthlyBill[] = INITIAL_BILLS;
  let transactions: Transaction[] = INITIAL_TRANSACTIONS;
  let shopping: ShoppingItem[] = INITIAL_SHOPPING_ITEMS;
  let goals: FinancialGoal[] = INITIAL_GOALS;
  let investments: InvestmentItem[] = INITIAL_INVESTMENTS;

  try {
    const rawBills = localStorage.getItem(STORAGE_KEYS.BILLS);
    if (rawBills) bills = JSON.parse(rawBills);

    const rawTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (rawTx) transactions = JSON.parse(rawTx);

    const rawShop = localStorage.getItem(STORAGE_KEYS.SHOPPING);
    if (rawShop) shopping = JSON.parse(rawShop);

    const rawGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (rawGoals) goals = JSON.parse(rawGoals);

    const rawInv = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    if (rawInv) investments = JSON.parse(rawInv);
  } catch (err) {
    console.error('Erro ao carregar dados do LocalStorage:', err);
  }

  return { bills, transactions, shopping, goals, investments };
}

export function saveBills(bills: MonthlyBill[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  } catch (e) {
    console.error(e);
  }
}

export function saveTransactions(transactions: Transaction[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error(e);
  }
}

export function saveShopping(shopping: ShoppingItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(shopping));
  } catch (e) {
    console.error(e);
  }
}

export function saveGoals(goals: FinancialGoal[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error(e);
  }
}

export function saveInvestments(investments: InvestmentItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
  } catch (e) {
    console.error(e);
  }
}

export function exportAllData() {
  const data = loadStoredData();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `coruja_financas_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function resetAllDataToDefaults() {
  localStorage.removeItem(STORAGE_KEYS.BILLS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.SHOPPING);
  localStorage.removeItem(STORAGE_KEYS.GOALS);
  localStorage.removeItem(STORAGE_KEYS.INVESTMENTS);
  return {
    bills: INITIAL_BILLS,
    transactions: INITIAL_TRANSACTIONS,
    shopping: INITIAL_SHOPPING_ITEMS,
    goals: INITIAL_GOALS,
    investments: INITIAL_INVESTMENTS,
  };
}
