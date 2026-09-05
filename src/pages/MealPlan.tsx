import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, X, Utensils, ClipboardList, ShieldCheck, AlertTriangle, ListPlus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../config/api';

type Meal = {
  id: string;
  name: string;
  category: string;
  meal_type: string;
  calories: number;
  allergens: string[];
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  instructions: string;
};

type OutsideFoodLog = {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  weight_grams: number | null;
  logged_at: string;
  user_name: string;
  username: string;
};

export default function MealPlan() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [saving, setSaving] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '', category: 'Protein', meal_type: 'Breakfast', calories: '', protein: '', carbs: '', fats: '', allergens: '', instructions: '',
  });

  const [outsideLogs, setOutsideLogs] = useState<OutsideFoodLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const loadMeals = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (categoryFilter !== 'All Categories') params.category = categoryFilter;

      const res = await api.get('/meals', { params });
      setMeals(res.data.meals);
    } catch (err) {
      console.error('Load meals error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  const loadOutsideLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get('/meals/log/all', { params: { limit: 20 } });
      setOutsideLogs(res.data.foodLogs);
    } catch (err) {
      console.error('Load outside food logs error:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadMeals();
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadMeals]);

  useEffect(() => {
    loadOutsideLogs();
  }, [loadOutsideLogs]);

  // Live stats computed from the currently loaded meals
  const totalMeals = meals.length;
  const proteinMeals = meals.filter((m) => m.category === 'Protein').length;
  const withAllergens = meals.filter((m) => m.allergens && m.allergens.length > 0).length;
  const allergenFreeMeals = totalMeals - withAllergens;

  const stats = [
    { label: 'Total Meals', value: String(totalMeals), Icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Protein-Based Meals', value: String(proteinMeals), Icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'With Allergens', value: String(withAllergens), Icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Allergen-Free Meals', value: String(allergenFreeMeals), Icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  const formatLogTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const handleAdd = async () => {
    if (!newMeal.name || !newMeal.calories) return;
    setSaving(true);
    try {
      await api.post('/meals', {
        name: newMeal.name,
        category: newMeal.category,
        meal_type: newMeal.meal_type,
        calories: Number(newMeal.calories),
        protein: Number(newMeal.protein) || 0,
        carbs: Number(newMeal.carbs) || 0,
        fats: Number(newMeal.fats) || 0,
        allergens: newMeal.allergens ? newMeal.allergens.split(',').map((a) => a.trim()) : [],
        ingredients: [],
        instructions: newMeal.instructions,
      });
      setNewMeal({ name: '', category: 'Protein', meal_type: 'Breakfast', calories: '', protein: '', carbs: '', fats: '', allergens: '', instructions: '' });
      setShowAddModal(false);
      loadMeals();
    } catch (err) {
      console.error('Add meal error:', err);
      alert('Unable to add meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) return;
    try {
      await api.delete(`/meals/${id}`);
      setMeals((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Delete meal error:', err);
      alert('Unable to delete meal. Please try again.');
    }
  };

  const handleEdit = (meal: Meal) => {
    setSelectedMeal({ ...meal });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMeal) return;
    setSaving(true);
    try {
      await api.put(`/meals/${selectedMeal.id}`, {
        name: selectedMeal.name,
        category: selectedMeal.category,
        calories: Number(selectedMeal.calories),
        protein: Number(selectedMeal.protein),
        carbs: Number(selectedMeal.carbs),
        fats: Number(selectedMeal.fats),
        instructions: selectedMeal.instructions,
      });
      setMeals((prev) => prev.map((m) => (m.id === selectedMeal.id ? selectedMeal : m)));
      setShowEditModal(false);
    } catch (err) {
      console.error('Update meal error:', err);
      alert('Unable to update meal. Please try again.');
    } finally {
      setSaving(false);
    }
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

        {/* Main content: table on the left, stats + outside logs stacked on the right */}
        <div className="flex gap-6 items-start">
          {/* Meal Table */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-0">
            {/* Table Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-wrap gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-800">Meal table</h2>
                <p className="text-xs text-gray-400">Manage all meals available in the system</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50">
                  <Search size={16} className="text-gray-400" />
                  <input
                    className="py-2.5 bg-transparent outline-none text-sm text-gray-700 w-48"
                    placeholder="Search meal name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option>All Categories</option>
                  <option>Protein</option>
                  <option>Carbs</option>
                  <option>Vegetable</option>
                  <option>Fats</option>
                </select>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Add new meal
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Meal', 'Type', 'Category', 'Calories', 'Allergens', 'Macros P/C/F', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">Loading meals...</td>
                    </tr>
                  ) : meals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">No meals found.</td>
                    </tr>
                  ) : (
                    meals.map((meal) => (
                      <tr key={meal.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                              <Utensils size={18} className="text-orange-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{meal.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{meal.meal_type}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              meal.category === 'Protein'
                                ? 'bg-green-50 text-green-600'
                                : meal.category === 'Carbs'
                                ? 'bg-orange-50 text-orange-500'
                                : meal.category === 'Fats'
                                ? 'bg-purple-50 text-purple-500'
                                : 'bg-blue-50 text-blue-500'
                            }`}
                          >
                            {meal.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{meal.calories} kcal</td>
                        <td className="px-6 py-4">
                          {meal.allergens && meal.allergens.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {meal.allergens.map((a, i) => (
                                <span key={i} className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                                  {a}
                                </span>
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
                            <button onClick={() => handleEdit(meal)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => handleDelete(meal.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column: Stats + Outside Food Logs, stacked */}
          <div className="w-72 flex flex-col gap-4 flex-shrink-0">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <stat.Icon size={22} className={stat.color} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Outside Food Logs Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 p-5 border-b border-gray-100">
                <div className="bg-purple-50 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ListPlus size={18} className="text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Outside Food Logs</h3>
                  <p className="text-[11px] text-gray-400">User-logged meals outside the system</p>
                </div>
              </div>
              <div className="max-h-[520px] overflow-y-auto">
                {loadingLogs ? (
                  <p className="text-xs text-gray-400 text-center py-8">Loading logs...</p>
                ) : outsideLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">No outside food logs yet.</p>
                ) : (
                  outsideLogs.map((log) => (
                    <div key={log.id} className="px-5 py-3 border-b border-gray-50 last:border-b-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-medium text-gray-700 leading-tight">{log.food_name}</p>
                        <span className="text-xs font-semibold text-purple-500 whitespace-nowrap">{log.calories} kcal</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[11px] text-gray-400">
                          {log.user_name} <span className="text-gray-300">·</span> @{log.username}
                        </p>
                        <p className="text-[11px] text-gray-400">{formatLogTime(log.logged_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-8 w-[480px] shadow-xl my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Add New Meal</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Meal Name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                  placeholder="e.g. Chicken Adobo"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                    value={newMeal.category}
                    onChange={(e) => setNewMeal((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option>Protein</option>
                    <option>Carbs</option>
                    <option>Vegetable</option>
                    <option>Fats</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Meal Type</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                    value={newMeal.meal_type}
                    onChange={(e) => setNewMeal((p) => ({ ...p, meal_type: e.target.value }))}
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Calories (kcal)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                    placeholder="e.g. 500"
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal((p) => ({ ...p, calories: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Allergens (comma separated)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                    placeholder="e.g. Soy, Wheat"
                    value={newMeal.allergens}
                    onChange={(e) => setNewMeal((p) => ({ ...p, allergens: e.target.value }))}
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
                    onChange={(e) => setNewMeal((p) => ({ ...p, protein: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Carbs (g)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                    placeholder="0"
                    type="number"
                    value={newMeal.carbs}
                    onChange={(e) => setNewMeal((p) => ({ ...p, carbs: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Fats (g)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                    placeholder="0"
                    type="number"
                    value={newMeal.fats}
                    onChange={(e) => setNewMeal((p) => ({ ...p, fats: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Cooking Instructions</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 min-h-[100px] resize-none"
                  placeholder="e.g. 1. Marinate chicken in soy sauce and vinegar for 30 minutes. 2. Sauté garlic and onions..."
                  value={newMeal.instructions}
                  onChange={(e) => setNewMeal((p) => ({ ...p, instructions: e.target.value }))}
                />
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
                  disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {saving ? 'Adding...' : 'Add Meal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Meal Modal */}
      {showEditModal && selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-8 w-[480px] shadow-xl my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Edit Meal</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Meal Name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                  value={selectedMeal.name}
                  onChange={(e) => setSelectedMeal((p) => (p ? { ...p, name: e.target.value } : p))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    value={selectedMeal.category}
                    onChange={(e) => setSelectedMeal((p) => (p ? { ...p, category: e.target.value } : p))}
                  >
                    <option>Protein</option>
                    <option>Carbs</option>
                    <option>Vegetable</option>
                    <option>Fats</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Calories (kcal)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    type="number"
                    value={selectedMeal.calories}
                    onChange={(e) => setSelectedMeal((p) => (p ? { ...p, calories: Number(e.target.value) } : p))}
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
                    onChange={(e) => setSelectedMeal((p) => (p ? { ...p, protein: Number(e.target.value) } : p))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Carbs (g)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    type="number"
                    value={selectedMeal.carbs}
                    onChange={(e) => setSelectedMeal((p) => (p ? { ...p, carbs: Number(e.target.value) } : p))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Fats (g)</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    type="number"
                    value={selectedMeal.fats}
                    onChange={(e) => setSelectedMeal((p) => (p ? { ...p, fats: Number(e.target.value) } : p))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Cooking Instructions</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 min-h-[100px] resize-none"
                  placeholder="e.g. 1. Marinate chicken in soy sauce and vinegar for 30 minutes. 2. Sauté garlic and onions..."
                  value={selectedMeal.instructions || ''}
                  onChange={(e) => setSelectedMeal((p) => (p ? { ...p, instructions: e.target.value } : p))}
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}