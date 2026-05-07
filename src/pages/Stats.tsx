import { useMemo, useState } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useStore } from '../store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Stats() {
  const { transactions, categories } = useStore();
  const [period, setPeriod] = useState<'month' | 'week'>('month');

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);

  const periodData = useMemo(() => {
    const startDate = period === 'month' ? monthStart : weekStart;
    const filtered = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= today;
    });

    const income = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryMap: Record<string, number> = {};
    filtered
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryMap[t.categoryId] = (categoryMap[t.categoryId] || 0) + t.amount;
      });

    const merchantMap: Record<string, number> = {};
    filtered
      .filter((t) => t.type === 'expense' && t.merchant)
      .forEach((t) => {
        merchantMap[t.merchant] = (merchantMap[t.merchant] || 0) + t.amount;
      });

    const topMerchants = Object.entries(merchantMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const dailyData: Record<string, number> = {};
    const days = period === 'month'
      ? Array.from({ length: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() }, (_, i) => {
          const d = new Date(today.getFullYear(), today.getMonth(), i + 1);
          return d.toISOString().split('T')[0];
        })
      : Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });

    days.forEach((day) => {
      dailyData[day] = 0;
    });

    filtered
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        dailyData[t.date] = (dailyData[t.date] || 0) + t.amount;
      });

    return { income, expense, categoryMap, topMerchants, dailyData, days };
  }, [transactions, period, monthStart, today]);

  const expensePieData = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    Object.entries(periodData.categoryMap).forEach(([categoryId, amount]) => {
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
  }, [periodData.categoryMap, categories]);

  const incomePieData = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    const incomeByCategory: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        incomeByCategory[t.categoryId] = (incomeByCategory[t.categoryId] || 0) + t.amount;
      });

    Object.entries(incomeByCategory).forEach(([categoryId, amount]) => {
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
  }, [transactions, categories]);

  const lineChartData = useMemo(() => {
    const labels = period === 'month'
      ? periodData.days.map((d) => {
          const date = new Date(d);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        })
      : periodData.days.map((d) => {
          const date = new Date(d);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });

    return {
      labels,
      datasets: [
        {
          label: '支出',
          data: periodData.days.map((d) => periodData.dailyData[d] || 0),
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [periodData]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">统计</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPeriod('month')}
          className={`flex-1 py-2 rounded-xl font-medium transition-all ${
            period === 'month'
              ? 'bg-pink-500 text-white'
              : 'bg-white text-gray-600'
          }`}
        >
          本月
        </button>
        <button
          onClick={() => setPeriod('week')}
          className={`flex-1 py-2 rounded-xl font-medium transition-all ${
            period === 'week'
              ? 'bg-pink-500 text-white'
              : 'bg-white text-gray-600'
          }`}
        >
          近7天
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-4 shadow-md">
        <div className="flex justify-between mb-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">收入</p>
            <p className="text-xl font-bold text-green-500">+{periodData.income.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">支出</p>
            <p className="text-xl font-bold text-red-500">-{periodData.expense.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">结余</p>
            <p className={`text-xl font-bold ${periodData.income - periodData.expense >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(periodData.income - periodData.expense).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {Object.keys(expensePieData.labels).length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-md">
          <h3 className="text-gray-700 font-semibold mb-3">支出构成</h3>
          <div className="h-48">
            <Pie data={expensePieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } } } }} />
          </div>
        </div>
      )}

      {Object.keys(incomePieData.labels).length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-md">
          <h3 className="text-gray-700 font-semibold mb-3">收入构成</h3>
          <div className="h-48">
            <Pie data={incomePieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } } } }} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 mb-4 shadow-md">
        <h3 className="text-gray-700 font-semibold mb-3">每日支出趋势</h3>
        <div className="h-48">
          <Line
            data={lineChartData}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: '#fdf2f8' } },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>
      </div>

      {periodData.topMerchants.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h3 className="text-gray-700 font-semibold mb-3">消费Top5商家</h3>
          <div className="space-y-3">
            {periodData.topMerchants.map(([merchant, amount], index) => (
              <div key={merchant} className="flex items-center">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                  index === 0 ? 'bg-yellow-400 text-white' :
                  index === 1 ? 'bg-gray-300 text-white' :
                  index === 2 ? 'bg-orange-400 text-white' :
                  'bg-pink-100 text-pink-600'
                }`}>
                  {index + 1}
                </span>
                <span className="flex-1 text-gray-700 truncate">{merchant}</span>
                <span className="text-gray-500 font-medium">¥{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}