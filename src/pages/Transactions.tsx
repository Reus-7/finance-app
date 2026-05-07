import { useMemo, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

export default function Transactions() {
  const { transactions, categories, deleteTransaction } = useStore();
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

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

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('确定要删除这条账单吗？')) {
      deleteTransaction(id);
    }
    setSwipedId(null);
  }, [deleteTransaction]);

  const handleExportExcel = useCallback(() => {
    if (transactions.length === 0) {
      alert('没有账单可以导出');
      return;
    }

    const headers = ['日期', '类型', '分类', '金额', '商家', '地点', '备注'];
    const rows = transactions.map((t) => {
      const category = getCategory(t.categoryId);
      return [
        t.date,
        t.type === 'income' ? '收入' : '支出',
        category?.name || '未知分类',
        t.amount.toFixed(2),
        t.merchant || '-',
        t.location || '-',
        t.note || '-',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `账单_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [transactions, getCategory]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent, id: string) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    
    if (diff > 50) {
      setSwipedId(id);
    } else if (diff < -50) {
      setSwipedId(null);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">账单</h1>
        {transactions.length > 0 && (
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
          >
            📊 导出账单
          </button>
        )}
      </div>

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
                  const isSwiped = swipedId === t.id;
                  
                  return (
                    <div
                      key={t.id}
                      className={`relative overflow-hidden ${
                        index !== items.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-500 flex items-center justify-center">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-white font-semibold flex items-center gap-1"
                        >
                          🗑️ 删除
                        </button>
                      </div>
                      <div
                        className="relative bg-white transition-transform duration-200"
                        style={{ transform: isSwiped ? 'translateX(-96px)' : 'translateX(0)' }}
                        onTouchStart={(e) => onTouchStart(e)}
                        onTouchEnd={(e) => onTouchEnd(e, t.id)}
                        onClick={() => setSwipedId(null)}
                      >
                        <div className="flex items-center p-4">
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
                          <div className="flex items-center gap-3">
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
                            <Link
                              to={`/edit/${t.id}`}
                              className="text-gray-400 hover:text-pink-500 transition-colors"
                            >
                              ✏️
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
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