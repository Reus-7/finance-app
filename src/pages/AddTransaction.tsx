import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../store';

export default function AddTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } = useStore();

  const isEditing = Boolean(id);
  const existingTransaction = id ? transactions.find((t) => t.id === id) : null;

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState('');

  useEffect(() => {
    if (existingTransaction) {
      setType(existingTransaction.type);
      setAmount(existingTransaction.amount.toString());
      setCategoryId(existingTransaction.categoryId);
      setDate(existingTransaction.date);
      setMerchant(existingTransaction.merchant);
      setLocation(existingTransaction.location);
      setNote(existingTransaction.note);
      setPhoto(existingTransaction.photo);
    }
  }, [existingTransaction]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    const transactionData = {
      type,
      amount: parseFloat(amount),
      categoryId,
      date,
      merchant,
      location,
      note,
      photo,
    };

    if (isEditing && id) {
      updateTransaction(id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    navigate('/');
  };

  const handleDelete = () => {
    if (id && window.confirm('确定要删除这条记录吗？')) {
      deleteTransaction(id);
      navigate('/');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="text-pink-500 text-2xl">←</Link>
        <h1 className="text-xl font-bold text-gray-800">{isEditing ? '编辑账单' : '记一笔'}</h1>
        <div className="w-8" />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => { setType('expense'); setCategoryId(''); }}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            type === 'expense'
              ? 'bg-pink-500 text-white shadow-md'
              : 'bg-pink-50 text-pink-500'
          }`}
        >
          💸 支出
        </button>
        <button
          type="button"
          onClick={() => { setType('income'); setCategoryId(''); }}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            type === 'income'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-green-50 text-green-500'
          }`}
        >
          💰 收入
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <label className="block text-gray-600 text-sm mb-2">金额</label>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-pink-500">¥</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-3xl font-bold w-full outline-none"
              required
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <label className="block text-gray-600 text-sm mb-2">分类</label>
          <div className="grid grid-cols-4 gap-2">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`p-3 rounded-xl flex flex-col items-center transition-all ${
                  categoryId === cat.id
                    ? 'bg-pink-100 ring-2 ring-pink-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs mt-1 text-gray-600">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <label className="block text-gray-600 text-sm mb-2">日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full outline-none text-gray-800"
            required
          />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <label className="block text-gray-600 text-sm mb-2">商家</label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="输入商家名称"
            className="w-full outline-none text-gray-800"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <label className="block text-gray-600 text-sm mb-2">地点</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="输入地点"
            className="w-full outline-none text-gray-800"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <label className="block text-gray-600 text-sm mb-2">备注</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加备注..."
            rows={2}
            className="w-full outline-none resize-none text-gray-800"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <label className="block text-gray-600 text-sm mb-2">照片</label>
          <div className="flex items-center gap-4">
            {photo ? (
              <div className="relative">
                <img src={photo} alt="preview" className="w-20 h-20 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setPhoto('')}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="w-20 h-20 bg-pink-50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-pink-100 transition-colors">
                <span className="text-2xl">📷</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-semibold hover:bg-red-100 transition-colors"
            >
              删除
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            {isEditing ? '保存' : '记一笔'}
          </button>
        </div>
      </form>
    </div>
  );
}