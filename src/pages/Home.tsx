import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useStore, getCurrentMonth } from '../store';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const { transactions, categories, budgets, exportData, importData } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string>('');

  const currentMonth = getCurrentMonth();

  const monthlyData = useMemo(() => {
    const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));
    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions, currentMonth]);

  const monthlyBudget = useMemo(() => {
    const budget = budgets.find(
      (b) => b.type === 'monthly' && b.period === currentMonth
    );
    return budget?.amount || 0;
  }, [budgets, currentMonth]);

  const budgetProgress = useMemo(() => {
    if (monthlyBudget === 0) return 0;
    return Math.min((monthlyData.expense / monthlyBudget) * 100, 100);
  }, [monthlyData.expense, monthlyBudget]);

  const expenseByCategory = useMemo(() => {
    const monthExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(currentMonth)
    );
    const categoryTotals: Record<string, number> = {};
    monthExpenses.forEach((t) => {
      categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
    });
    return categoryTotals;
  }, [transactions, currentMonth]);

  const pieChartData = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    Object.entries(expenseByCategory).forEach(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        labels.push(category.name);
        data.push(amount);
        colors.push(category.color);
      }
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    };
  }, [expenseByCategory, categories]);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-backup-${currentMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      setImportMessage(success ? '导入成功！' : '导入失败，请检查文件格式');
      setTimeout(() => setImportMessage(''), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center bg-gradient-to-r from-pink-100 to-pink-200 rounded-2xl px-6 py-3 shadow-md">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
            <span className="text-3xl">👧</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
              娜娜记账
            </span>
            <span className="text-xs text-pink-500">记录每一笔小确幸</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-400 to-pink-500 rounded-2xl p-5 text-white mb-4 shadow-lg">
        <p className="text-pink-100 text-sm mb-1">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}</p>
        <p className="text-3xl font-bold mb-4">¥{monthlyData.balance.toFixed(2)}</p>
        <div className="flex gap-6">
          <div>
            <p className="text-pink-100 text-xs">收入</p>
            <p className="text-lg font-semibold text-green-300">+{monthlyData.income.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-pink-100 text-xs">支出</p>
            <p className="text-lg font-semibold text-red-200">-{monthlyData.expense.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {monthlyBudget > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">本月预算</span>
            <span className="text-pink-500 font-semibold">¥{monthlyBudget.toFixed(2)}</span>
          </div>
          <div className="h-3 bg-pink-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetProgress > 90 ? 'bg-red-500' : budgetProgress > 70 ? 'bg-yellow-500' : 'bg-pink-500'
              }`}
              style={{ width: `${budgetProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            已使用 {budgetProgress.toFixed(1)}% (¥{monthlyData.expense.toFixed(2)})
          </p>
        </div>
      )}

      {pieChartData.labels.length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-md">
          <h3 className="text-gray-700 font-semibold mb-3">支出分类</h3>
          <div className="h-48">
            <Pie data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } } } }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link to="/add" className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center justify-center hover:shadow-lg transition-shadow">
          <span className="text-3xl mb-1">✏️</span>
          <span className="text-gray-700 text-sm font-medium">记一笔</span>
        </Link>
        <Link to="/categories" className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center justify-center hover:shadow-lg transition-shadow">
          <span className="text-3xl mb-1">🏷️</span>
          <span className="text-gray-700 text-sm font-medium">分类管理</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-gray-700 font-semibold">数据管理</h3>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 bg-pink-50 text-pink-500 py-2.5 rounded-xl font-medium hover:bg-pink-100 transition-colors"
          >
            📤 导出数据
          </button>
          <button
            onClick={handleImportClick}
            className="flex-1 bg-pink-50 text-pink-500 py-2.5 rounded-xl font-medium hover:bg-pink-100 transition-colors"
          >
            📥 导入数据
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {importMessage && (
          <p className="text-center text-sm mt-2 text-pink-500">{importMessage}</p>
        )}
      </div>
    </div>
  );
}