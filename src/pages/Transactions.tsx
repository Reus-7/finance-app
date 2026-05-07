import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

export default function Transactions() {
  const { transactions, categories } = useStore();

  const groupedTransactions = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const groups: Record<string, typeof sorted> = {};
    sorted.forEach((t) => {
      const dateKey = t.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });
    return groups;
  }, [transactions]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return '今天';
    }
    if (dateStr === yesterday.toISOString().split('T')[0]) {
      return '昨天';
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const getCategory = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">账单</h1>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-md text-center">
          <span className="text-5xl mb-4 block">📭</span>
          <p className="text-gray-500">还没有账单记录</p>
          <Link
            to="/add"
            className="inline-block mt-4 px-6 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors"
          >
            去记账
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-gray-500 text-sm font-medium mb-2 px-1">
                {formatDate(date)}
              </h2>
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {items.map((t, index) => {
                  const category = getCategory(t.categoryId);
                  return (
                    <Link
                      key={t.id}
                      to={`/edit/${t.id}`}
                      className={`flex items-center p-4 hover:bg-pink-50 transition-colors ${
                        index !== items.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-3"
                        style={{ backgroundColor: category?.color + '20' }}
                      >
                        {category?.icon || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium truncate">
                          {category?.name || '未知分类'}
                        </p>
                        <p className="text-gray-400 text-sm truncate">
                          {t.merchant || t.note || '无备注'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            t.type === 'income' ? 'text-green-500' : 'text-gray-800'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}
                        </p>
                        {t.photo && <span className="text-xs text-gray-400">📷</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}