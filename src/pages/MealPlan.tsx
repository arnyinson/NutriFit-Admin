import { useState } from 'react';
import Sidebar from '../components/Sidebar';

type Meal = {
  id: number;
  name: string;
  category: string;
  calories: number;
  allergens: string[];
  protein: number;
  carbs: number;
  fats: number;
  image: string;
};

const initialMeals: Meal[] = [
  { id: 1, name: 'Chicken Adobo', category: 'Protein', calories: 600, allergens: ['Soy', 'Gluten'], protein: 36, carbs: 30, fats: 25, image: '🍗' },
  { id: 2, name: 'Pinakbet', category: 'Vegetable', calories: 200, allergens: [], protein: 8, carbs: 25, fats: 10, image: '🥦' },
  { id: 3, name: 'Tapsilog', category: 'Protein', calories: 750, allergens: ['Egg'], protein: 40, carbs: 65, fats: 22, image: '🍳' },
  { id: 4, name: 'Sinigang na Baboy', category: 'Protein', calories: 480, allergens: [], protein: 32, carbs: 35, fats: 18, image: '🍲' },
  { id: 5, name: 'Coconut Shake', category: 'Carbs', calories: 350, allergens: ['Dairy'], protein: 5, carbs: 60, fats: 12, image: '🥤' },
  { id: 6, name: 'Ginisang Munggo', category: 'Protein', calories: 280, allergens: [], protein: 15, carbs: 35, fats: 8, image: '🫘' },
  { id: 7, name: 'Champorado', category: 'Carbs', calories: 320, allergens: ['Dairy'], protein: 8, carbs: 58, fats: 10, image: '🍫' },
];

const stats = [
  { label: 'Total Meals', value: '248', icon: '🍽️', color: 'text-orange-500', bg: 'bg-orange-50', change: '+10 this week' },
  { label: 'Active Templates', value: '18', icon: '📋', color: 'text-blue-500', bg: 'bg-blue-50', change: '+3 this week' },
  { label: 'Substitution', value: '56', icon: '🔄', color: 'text-green-500', bg: 'bg-green-50', change: '+14 this week' },
  { label: 'Popular Meal', value: 'Chicken Adobo', icon: '⭐', color: 'text-yellow-500', bg: 'bg-yellow-50', change: 'Used 1,240 times' },
];

export default function MealPlan() {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [newMeal, setNewMeal] = useState({
    name: '', category: 'Protein', calories: '', protein: '', carbs: '', fats: '', allergens: '',
  });

  const filtered = meals.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All Categories' || m.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleAdd = () => {
    if (!newMeal.name || !newMeal.calories) return;
    const meal: Meal = {
      id: meals.length + 1,
      name: newMeal.name,
      category: newMeal.category,
      calories: Number(newMeal.calories),
      allergens: newMeal.allergens ? newMeal.allergens.split(',').map(a => a.trim()) : [],
      protein: Number(newMeal.protein),
      carbs: Number(newMeal.carbs),
      fats: Number(newMeal.fats),
      image: '🍽️',
    };
    setMeals(prev => [...prev, meal]);
    setNewMeal({ name: '', category: 'Protein', calories: '', protein: '', carbs: '', fats: '', allergens: '' });
    setShowAddModal(false);
  };

  const handleDelete = (id: number) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const handleEdit = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowEditModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Meal Plan" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meal Plan Management</h1>
            <p className="text-sm text-gray-400 mt-1">Manage macros and meals templates for the system</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">A</div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
              <p className="text-xs text-green-500 font-medium">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Meal Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Table Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-800">Meal table</h2>
              <p className="text-xs text-gray-400">Manage all meals available in the system</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50">
                <span className="text-gray-400 text-sm">🔍</span>
                <input
                  className="py-2.5 bg-transparent outline-none text-sm text-gray-700 w-48"
                  placeholder="Search meal name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option>All Categories</option>
                <option>Protein</option>
                <option>Carbs</option>
                <option>Vegetable</option>
              </select>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
              >
                + Add new meal
              </button>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Meal', 'Category', 'Calories', 'Allergens', 'Macros P/C/F', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(meal => (
                <tr key={meal.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">
                        {meal.image}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{meal.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      meal.category === 'Protein' ? 'bg-green-50 text-green-600' :
                      meal.category === 'Carbs' ? 'bg-orange-50 text-orange-500' :
                      'bg-blue-50 text-blue-500'
                    }`}>
                      {meal.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{meal.calories} kcal</td>
                  <td className="px-6 py-4">
                    {meal.allergens.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {meal.allergens.map((a, i) => (
                          <span key={i} className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {meal.protein}g/{meal.carbs}g/{meal.fats}g
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(meal)}
                        className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No meals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[480px] shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Add New Meal</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Meal Name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                  placeholder="e.g. Chicken Adobo"
                  value={newMeal.name}
                  onChange={e => setNewMeal(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                  value={newMeal.category}
                  onChange={e => setNewMeal(p => ({ ...p, category: e.target.value }))}
                >
                  <option>Protein</option>
                  <option>Carbs</option>
                  <option>Vegetable</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Calories (kcal)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                    placeholder="e.g. 500"
                    type="number"
                    value={newMeal.calories}
                    onChange={e => setNewMeal(p => ({ ...p, calories: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Allergens (comma separated)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                    placeholder="e.g. Soy, Gluten"
                    value={newMeal.allergens}
                    onChange={e => setNewMeal(p => ({ ...p, allergens: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Protein (g)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                    placeholder="0"
                    type="number"
                    value={newMeal.protein}
                    onChange={e => setNewMeal(p => ({ ...p, protein: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Carbs (g)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                    placeholder="0"
                    type="number"
                    value={newMeal.carbs}
                    onChange={e => setNewMeal(p => ({ ...p, carbs: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Fats (g)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                    placeholder="0"
                    type="number"
                    value={newMeal.fats}
                    onChange={e => setNewMeal(p => ({ ...p, fats: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Add Meal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Meal Modal */}
      {showEditModal && selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[480px] shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Edit Meal</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Meal Name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                  value={selectedMeal.name}
                  onChange={e => setSelectedMeal(p => p ? { ...p, name: e.target.value } : p)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    value={selectedMeal.category}
                    onChange={e => setSelectedMeal(p => p ? { ...p, category: e.target.value } : p)}
                  >
                    <option>Protein</option>
                    <option>Carbs</option>
                    <option>Vegetable</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Calories (kcal)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    type="number"
                    value={selectedMeal.calories}
                    onChange={e => setSelectedMeal(p => p ? { ...p, calories: Number(e.target.value) } : p)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Protein (g)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    type="number"
                    value={selectedMeal.protein}
                    onChange={e => setSelectedMeal(p => p ? { ...p, protein: Number(e.target.value) } : p)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Carbs (g)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    type="number"
                    value={selectedMeal.carbs}
                    onChange={e => setSelectedMeal(p => p ? { ...p, carbs: Number(e.target.value) } : p)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Fats (g)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    type="number"
                    value={selectedMeal.fats}
                    onChange={e => setSelectedMeal(p => p ? { ...p, fats: Number(e.target.value) } : p)}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setMeals(prev => prev.map(m => m.id === selectedMeal.id ? selectedMeal : m));
                    setShowEditModal(false);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}