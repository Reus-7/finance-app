import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { categoryColors } from '../types';

const emojiList = ['🍜', '🚗', '🛍️', '🎮', '🏠', '💊', '📚', '💅', '📦', '☕', '🎬', '✈️', '💐', '🎁', '🏋️', '🐱', '👶', '📱', '👗', '🎯'];

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [icon, setIcon] = useState('📦');
  const [color, setColor] = useState(categoryColors[0]);

  const defaultCategoryIds = ['salary', 'bonus', 'investment', 'food', 'transport', 'shopping', 'entertainment', 'housing', 'health', 'education', 'beauty', 'other-expense'];

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setType('expense');
    setIcon('📦');
    setColor(categoryColors[0]);
    setShowAddModal(true);
  };

  const handleOpenEdit = (category: typeof categories[0]) => {
    setEditingId(category.id);
    setName(category.name);
    setType(category.type);
    setIcon(category.icon);
    setColor(category.color);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!name) return;

    if (editingId) {
      updateCategory(editingId, { name, icon, color });
    } else {
      addCategory({ name, type, icon, color });
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (defaultCategoryIds.includes(id)) {
      alert('默认分类不能删除');
      return;
    }
    if (window.confirm('确定要删除这个分类吗？')) {
      deleteCategory(id);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="text-pink-500 text-2xl">←</Link>
        <h1 className="text-xl font-bold text-gray-800">分类管理</h1>
        <button
          onClick={handleOpenAdd}
          className="w-10 h-10 bg-pink-500 text-white rounded-full text-xl font-bold shadow-md hover:bg-pink-600 transition-colors"
        >
          +
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-gray-600 font-medium mb-2 px-1">收入分类</h2>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {incomeCategories.map((cat, index) => (
            <div
              key={cat.id}
              className={`flex items-center p-4 hover:bg-pink-50 transition-colors cursor-pointer ${
                index !== incomeCategories.length - 1 ? 'border-b border-gray-100' : ''
              } ${!defaultCategoryIds.includes(cat.id) ? '' : 'opacity-70'}`}
              onClick={() => handleOpenEdit(cat)}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-3"
                style={{ backgroundColor: cat.color + '20' }}
              >
                {cat.icon}
              </div>
              <span className="flex-1 text-gray-800 font-medium">{cat.name}</span>
              {!defaultCategoryIds.includes(cat.id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(cat.id);
                  }}
                  className="text-red-400 hover:text-red-600 px-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-gray-600 font-medium mb-2 px-1">支出分类</h2>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {expenseCategories.map((cat, index) => (
            <div
              key={cat.id}
              className={`flex items-center p-4 hover:bg-pink-50 transition-colors cursor-pointer ${
                index !== expenseCategories.length - 1 ? 'border-b border-gray-100' : ''
              } ${!defaultCategoryIds.includes(cat.id) ? '' : 'opacity-70'}`}
              onClick={() => handleOpenEdit(cat)}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-3"
                style={{ backgroundColor: cat.color + '20' }}
              >
                {cat.icon}
              </div>
              <span className="flex-1 text-gray-800 font-medium">{cat.name}</span>
              {!defaultCategoryIds.includes(cat.id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(cat.id);
                  }}
                  className="text-red-400 hover:text-red-600 px-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? '编辑分类' : '添加分类'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 text-2xl hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {!editingId && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    type === 'expense'
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-50 text-pink-500'
                  }`}
                >
                  支出
                </button>
                <button
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    type === 'income'
                      ? 'bg-green-500 text-white'
                      : 'bg-green-50 text-green-500'
                  }`}
                >
                  收入
                </button>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">分类名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入分类名称"
                className="w-full px-4 py-3 bg-pink-50 rounded-xl outline-none text-gray-800"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">选择图标</label>
              <div className="grid grid-cols-5 gap-2">
                {emojiList.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`w-full aspect-square flex items-center justify-center text-xl rounded-lg transition-all ${
                      icon === emoji
                        ? 'bg-pink-100 ring-2 ring-pink-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-600 text-sm mb-2">选择颜色</label>
              <div className="grid grid-cols-5 gap-3">
                {categoryColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-12 h-12 rounded-xl transition-all ${
                      color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {editingId && !defaultCategoryIds.includes(editingId) && (
                <button
                  onClick={() => {
                    handleDelete(editingId);
                    setShowAddModal(false);
                  }}
                  className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                >
                  删除
                </button>
              )}
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-shadow"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}