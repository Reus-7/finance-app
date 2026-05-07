import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore, getCurrentMonth } from '../store';

export default function Budget() {
  const { transactions, categories, budgets, addBudget, updateBudget, deleteBudget } = useStore();
  const currentMonth = getCurrentMonth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [budgetType, setBudgetType] = useState<'monthly' | 'category'>('monthly');
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const monthlyBudget = useMemo(() => {
    return budgets.find((b) => b.type === 'monthly' && b.period === currentMonth);
  }, [budgets, currentMonth]);

  const categoryBudgets = useMemo(() => {
    return budgets.filter((b) => b.type === 'category' && b.period === currentMonth);
  }, [budgets, currentMonth]);

  const currentMonthExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonth]);

  const categoryExpenses = useMemo(() => {
    const result: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach((t) => {
        result[t.categoryId] = (result[t.categoryId] || 0) + t.amount;
      });
    return result;
  }, [transactions, currentMonth]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleAddBudget = () => {
    if (!amount) return;
    if (budgetType === 'category' && !selectedCategoryId) return;

    const existingBudget = budgets.find(
      (b) =>
        b.type === budgetType &&
        b.period === currentMonth &&
        (budgetType === 'monthly' || b.categoryId === selectedCategoryId)
    );

    if (existingBudget) {
      updateBudget(existingBudget.id, { amount: parseFloat(amount) });
    } else {
      addBudget({
        type: budgetType,
        amount: parseFloat(amount),
        categoryId: budgetType === 'category' ? selectedCategoryId : null,
        period: currentMonth,
      });
    }

    setAmount('');
    setSelectedCategoryId('');
    setShowAddModal(false);
  };

  const handleDeleteBudget = (id: string) => {
    if (window.confirm('确定要删除这个预算吗？')) {
      deleteBudget(id);
    }
  };

  const getBudgetProgress = (spent: number, budgetAmount: number) => {
    if (budgetAmount === 0) return 0;
    return Math.min((spent / budgetAmount) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress > 90) return 'bg-red-500';
    if (progress > 70) return 'bg-yellow-500';
    return 'bg-pink-500';
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">预算管理</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 bg-pink-500 text-white rounded-full text-xl font-bold shadow-md hover:bg-pink-600 transition-colors"
        >
          +
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-4 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700 font-semibold">本月总预算</span>
          <span className="text-pink-500 font-bold text-lg">
            ¥{monthlyBudget?.amount.toFixed(2) || '0.00'}
          </span>
        </div>
        <div className="h-4 bg-pink-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
              getBudgetProgress(currentMonthExpenses, monthlyBudget?.amount || 0)
            )}`}
            style={{ width: `${getBudgetProgress(currentMonthExpenses, monthlyBudget?.amount || 0)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-sm">
          <span className="text-gray-500">已花费 ¥{currentMonthExpenses.toFixed(2)}</span>
          <span className="text-gray-500">
            剩余 ¥{Math.max((monthlyBudget?.amount || 0) - currentMonthExpenses, 0).toFixed(2)}
          </span>
        </div>
      </div>

      <h2 className="text-gray-600 font-medium mb-2 px-1">分类预算</h2>
      <div className="space-y-3 mb-4">
        {categoryBudgets.length === 0 && expenseCategories.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <span className="text-4xl mb-2 block">📊</span>
            <p className="text-gray-500">还没有设置分类预算</p>
          </div>
        ) : (
          expenseCategories.map((cat) => {
            const budget = categoryBudgets.find((b) => b.categoryId === cat.id);
            const spent = categoryExpenses[cat.id] || 0;
            const progress = getBudgetProgress(spent, budget?.amount || 0);

            return (
              <div key={cat.id} className="bg-white rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{cat.icon}</span>
                    <span className="text-gray-700 font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pink-500 font-semibold">
                      ¥{budget?.amount.toFixed(2) || '0.00'}
                    </span>
                    {budget && (
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-red-400 text-sm hover:text-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  已花费 ¥{spent.toFixed(2)} / 剩余 ¥{Math.max((budget?.amount || 0) - spent, 0).toFixed(2)}
                </p>
              </div>
            );
          })
        )}
      </div>

      <Link
        to="/categories"
        className="block text-center text-pink-500 font-medium py-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
      >
        🏷️ 管理分类
      </Link>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">添加预算</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 text-2xl hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setBudgetType('monthly')}
                className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                  budgetType === 'monthly'
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-50 text-pink-500'
                }`}
              >
                月度预算
              </button>
              <button
                onClick={() => setBudgetType('category')}
                className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                  budgetType === 'category'
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-50 text-pink-500'
                }`}
              >
                分类预算
              </button>
            </div>

            {budgetType === 'category' && (
              <div className="mb-4">
                <label className="block text-gray-600 text-sm mb-2">选择分类</label>
                <div className="grid grid-cols-4 gap-2">
                  {expenseCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`p-2 rounded-xl flex flex-col items-center transition-all ${
                        selectedCategoryId === cat.id
                          ? 'bg-pink-100 ring-2 ring-pink-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-xs mt-1 text-gray-600">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-600 text-sm mb-2">预算金额</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-pink-500">¥</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-2xl font-bold w-full outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleAddBudget}
              className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              保存预算
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}