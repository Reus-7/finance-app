export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  date: string;
  merchant: string;
  location: string;
  note: string;
  photo: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Budget {
  id: string;
  type: 'monthly' | 'category';
  amount: number;
  categoryId: string | null;
  period: string;
}

export const defaultCategories: Category[] = [
  { id: 'salary', name: '工资', type: 'income', icon: '💰', color: '#10b981' },
  { id: 'bonus', name: '奖金', type: 'income', icon: '🎁', color: '#6366f1' },
  { id: 'investment', name: '投资收益', type: 'income', icon: '📈', color: '#8b5cf6' },
  { id: 'food', name: '餐饮', type: 'expense', icon: '🍜', color: '#f97316' },
  { id: 'transport', name: '交通', type: 'expense', icon: '🚗', color: '#3b82f6' },
  { id: 'shopping', name: '购物', type: 'expense', icon: '🛍️', color: '#ec4899' },
  { id: 'entertainment', name: '娱乐', type: 'expense', icon: '🎮', color: '#8b5cf6' },
  { id: 'housing', name: '居住', type: 'expense', icon: '🏠', color: '#14b8a6' },
  { id: 'health', name: '医疗', type: 'expense', icon: '💊', color: '#ef4444' },
  { id: 'education', name: '教育', type: 'expense', icon: '📚', color: '#f59e0b' },
  { id: 'beauty', name: '美容', type: 'expense', icon: '💅', color: '#db2777' },
  { id: 'other-expense', name: '其他', type: 'expense', icon: '📦', color: '#6b7280' },
];

export const categoryColors = [
  '#f97316', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6',
  '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#db2777',
  '#6b7280', '#84cc16', '#06b6d4', '#f43f5e', '#8d4db5'
];