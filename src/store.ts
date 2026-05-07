import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, Category, Budget, defaultCategories } from './types';

interface AppState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  exportData: () => string;
  importData: (data: string) => boolean;
  resetData: () => void;
}

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: defaultCategories,
      budgets: [],

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: uuidv4(),
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...transaction } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: uuidv4(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        const defaultIds = defaultCategories.map((c) => c.id);
        if (defaultIds.includes(id)) return;
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      addBudget: (budget) => {
        const newBudget: Budget = {
          ...budget,
          id: uuidv4(),
        };
        set((state) => ({
          budgets: [...state.budgets, newBudget],
        }));
      },

      updateBudget: (id, budget) => {
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...budget } : b
          ),
        }));
      },

      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
      },

      exportData: () => {
        const state = get();
        const exportObj = {
          transactions: state.transactions,
          categories: state.categories,
          budgets: state.budgets,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importData: (data) => {
        try {
          const imported = JSON.parse(data);
          if (
            Array.isArray(imported.transactions) &&
            Array.isArray(imported.categories) &&
            Array.isArray(imported.budgets)
          ) {
            set({
              transactions: imported.transactions,
              categories: imported.categories,
              budgets: imported.budgets,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      resetData: () => {
        set({
          transactions: [],
          categories: defaultCategories,
          budgets: [],
        });
      },
    }),
    {
      name: 'finance-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { getCurrentMonth };