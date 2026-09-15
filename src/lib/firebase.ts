import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
  Unsubscribe,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  MonthlyBill,
  Transaction,
  ShoppingItem,
  FinancialGoal,
  InvestmentItem,
  UserProfile,
} from '../types';
import {
  INITIAL_BILLS,
  INITIAL_TRANSACTIONS,
  INITIAL_SHOPPING_ITEMS,
  INITIAL_GOALS,
  INITIAL_INVESTMENTS,
} from '../data/mockData';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Helper to translate Firebase Auth errors into friendly Portuguese
export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.';
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido. Verifique se digitou corretamente.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Ela deve conter pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos. Verifique suas credenciais.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Aguarde alguns instantes e tente novamente.';
    case 'auth/network-request-failed':
      return 'Erro de conexão com a internet. Verifique sua rede e tente novamente.';
    default:
      return 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
  }
}

// -------------------------------------------------------------
// AUTHENTICATION METHODS
// -------------------------------------------------------------

export async function registerUser(name: string, email: string, pass: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (name.trim()) {
    await updateProfile(cred.user, { displayName: name.trim() });
  }

  // Create user profile document in Firestore: usuarios/{uid}
  const userDocRef = doc(db, 'usuarios', cred.user.uid);
  await setDoc(
    userDocRef,
    {
      uid: cred.user.uid,
      displayName: name.trim() || 'Usuário Coruja',
      email: cred.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  // Initialize new user with rich demo financial data
  await seedInitialDataForUser(cred.user.uid);

  return cred.user;
}

export async function loginUser(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// -------------------------------------------------------------
// FIRESTORE REAL-TIME SUBSCRIPTIONS
// -------------------------------------------------------------

export function subscribeToBills(
  uid: string,
  onUpdate: (bills: MonthlyBill[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const billsRef = collection(db, 'usuarios', uid, 'contas');
  return onSnapshot(
    billsRef,
    (snapshot) => {
      const items: MonthlyBill[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as MonthlyBill), id: d.id });
      });
      // Sort by dueDay ascending
      items.sort((a, b) => a.dueDay - b.dueDay);
      onUpdate(items);
    },
    (err) => {
      console.error('Erro na sincronização de contas:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToTransactions(
  uid: string,
  onUpdate: (txs: Transaction[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const txRef = collection(db, 'usuarios', uid, 'fluxo');
  return onSnapshot(
    txRef,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as Transaction), id: d.id });
      });
      // Sort by date descending
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(items);
    },
    (err) => {
      console.error('Erro na sincronização de fluxo de caixa:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToShopping(
  uid: string,
  onUpdate: (items: ShoppingItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const shopRef = collection(db, 'usuarios', uid, 'mercado');
  return onSnapshot(
    shopRef,
    (snapshot) => {
      const items: ShoppingItem[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as ShoppingItem), id: d.id });
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Erro na sincronização da lista de mercado:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToGoals(
  uid: string,
  onUpdate: (goals: FinancialGoal[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const goalsRef = collection(db, 'usuarios', uid, 'metas');
  return onSnapshot(
    goalsRef,
    (snapshot) => {
      const items: FinancialGoal[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as FinancialGoal), id: d.id });
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Erro na sincronização de metas:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToInvestments(
  uid: string,
  onUpdate: (invs: InvestmentItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const invRef = collection(db, 'usuarios', uid, 'investimentos');
  return onSnapshot(
    invRef,
    (snapshot) => {
      const items: InvestmentItem[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as InvestmentItem), id: d.id });
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(items);
    },
    (err) => {
      console.error('Erro na sincronização de investimentos:', err);
      if (onError) onError(err);
    }
  );
}

// -------------------------------------------------------------
// FIRESTORE CRUD OPERATIONS
// -------------------------------------------------------------

export async function saveBillToFirestore(uid: string, bill: MonthlyBill): Promise<void> {
  const billId = bill.id || `bill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const billRef = doc(db, 'usuarios', uid, 'contas', billId);
  await setDoc(billRef, { ...bill, id: billId }, { merge: true });
}

export async function deleteBillFromFirestore(uid: string, billId: string): Promise<void> {
  const billRef = doc(db, 'usuarios', uid, 'contas', billId);
  await deleteDoc(billRef);
}

export async function saveTransactionToFirestore(uid: string, tx: Transaction): Promise<void> {
  const txId = tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const txRef = doc(db, 'usuarios', uid, 'fluxo', txId);
  await setDoc(txRef, { ...tx, id: txId }, { merge: true });
}

export async function deleteTransactionFromFirestore(uid: string, txId: string): Promise<void> {
  const txRef = doc(db, 'usuarios', uid, 'fluxo', txId);
  await deleteDoc(txRef);
}

export async function saveShoppingItemToFirestore(uid: string, item: ShoppingItem): Promise<void> {
  const itemId = item.id || `shop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const itemRef = doc(db, 'usuarios', uid, 'mercado', itemId);
  await setDoc(itemRef, { ...item, id: itemId }, { merge: true });
}

export async function deleteShoppingItemFromFirestore(uid: string, itemId: string): Promise<void> {
  const itemRef = doc(db, 'usuarios', uid, 'mercado', itemId);
  await deleteDoc(itemRef);
}

export async function clearBoughtShoppingItemsFromFirestore(uid: string, itemIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  itemIds.forEach((id) => {
    const itemRef = doc(db, 'usuarios', uid, 'mercado', id);
    batch.delete(itemRef);
  });
  await batch.commit();
}

export async function saveGoalToFirestore(uid: string, goal: FinancialGoal): Promise<void> {
  const goalId = goal.id || `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const goalRef = doc(db, 'usuarios', uid, 'metas', goalId);
  await setDoc(goalRef, { ...goal, id: goalId }, { merge: true });
}

export async function deleteGoalFromFirestore(uid: string, goalId: string): Promise<void> {
  const goalRef = doc(db, 'usuarios', uid, 'metas', goalId);
  await deleteDoc(goalRef);
}

export async function saveInvestmentToFirestore(uid: string, inv: InvestmentItem): Promise<void> {
  const invId = inv.id || `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const invRef = doc(db, 'usuarios', uid, 'investimentos', invId);
  await setDoc(invRef, { ...inv, id: invId }, { merge: true });
}

export async function deleteInvestmentFromFirestore(uid: string, invId: string): Promise<void> {
  const invRef = doc(db, 'usuarios', uid, 'investimentos', invId);
  await deleteDoc(invRef);
}

// -------------------------------------------------------------
// SEEDING & RESET FUNCTIONS
// -------------------------------------------------------------

export async function seedInitialDataForUser(uid: string): Promise<void> {
  const batch = writeBatch(db);

  // Check if user already has data to avoid overwriting
  const billsRef = collection(db, 'usuarios', uid, 'contas');
  const existing = await getDocs(billsRef);
  if (!existing.empty) {
    return;
  }

  // Seed Bills
  INITIAL_BILLS.forEach((b) => {
    const billRef = doc(db, 'usuarios', uid, 'contas', b.id);
    batch.set(billRef, b);
  });

  // Seed Transactions
  INITIAL_TRANSACTIONS.forEach((t) => {
    const txRef = doc(db, 'usuarios', uid, 'fluxo', t.id);
    batch.set(txRef, t);
  });

  // Seed Shopping
  INITIAL_SHOPPING_ITEMS.forEach((s) => {
    const shopRef = doc(db, 'usuarios', uid, 'mercado', s.id);
    batch.set(shopRef, s);
  });

  // Seed Goals
  INITIAL_GOALS.forEach((g) => {
    const goalRef = doc(db, 'usuarios', uid, 'metas', g.id);
    batch.set(goalRef, g);
  });

  // Seed Investments
  INITIAL_INVESTMENTS.forEach((i) => {
    const invRef = doc(db, 'usuarios', uid, 'investimentos', i.id);
    batch.set(invRef, i);
  });

  await batch.commit();
}

export async function resetUserDataInFirestore(uid: string): Promise<void> {
  // Delete all existing documents in subcollections
  const subcollections = ['contas', 'fluxo', 'mercado', 'metas', 'investimentos'];

  for (const sub of subcollections) {
    const colRef = collection(db, 'usuarios', uid, sub);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }

  // Re-seed with initial data
  await seedInitialDataForUser(uid);
}
