import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, Utensils, ClipboardList, ShieldCheck, AlertTriangle,
  ListPlus, PlusCircle, MinusCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../config/api';
import { ConfirmDialog, NoticeDialog } from '../components/Dialogs';

type Ingredient = {
  name: string;
  allergens: string[];
};

type SubIngredient = Ingredient & {
  substitute_override: string | null;
};

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
  main_ingredients: Ingredient[];
  sub_ingredients: SubIngredient[];
  diet_type?: string | null;
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

// ---------- Constants & input helpers ----------

// Same allergen list the mobile app uses (Register / Profile), so names always match.
const ALLERGENS = ['Eggs', 'Peanuts', 'Tree Nuts', 'Dairy', 'Shellfish', 'Fish', 'Soy', 'Wheat', 'Sesame', 'Lupin'];

// Specific types under each category. Same names the mobile Allergen Picker uses.
// A specific type is saved together with its category, e.g. ["Fish", "Tilapia"].
const SPECIFIC_ALLERGENS: Record<string, string[]> = {
  Fish: ['Bangus', 'Tilapia', 'Tuna', 'Salmon', 'Galunggong', 'Sardines'],
  Shellfish: ['Shrimp', 'Crab', 'Squid', 'Mussel', 'Oyster'],
  Dairy: ['Milk', 'Cheese', 'Yogurt'],
  'Tree Nuts': ['Cashew', 'Almond', 'Walnut', 'Pili'],
};
const ALL_SPECIFIC = Object.values(SPECIFIC_ALLERGENS).flat();

const DIET_TYPES = ['Omnivore', 'Pescatarian', 'Vegetarian', 'Vegan'];

const dietLabel = (d?: string | null) => d || 'Omnivore';
const dietBadgeCls = (d?: string | null) =>
  d === 'Vegan'
    ? 'bg-green-50 text-green-600'
    : d === 'Vegetarian'
    ? 'bg-amber-50 text-amber-600'
    : d === 'Pescatarian'
    ? 'bg-blue-50 text-blue-600'
    : 'bg-gray-100 text-gray-500';

// Warning only (does not block saving): ingredient names that do not fit the chosen diet.
const MEAT_RE = /\b(pork|baboy|liempo|chicken|manok|beef|baka|lechon|sausage|longganisa|tocino|bacon|ham|spam|corned beef|turkey|meat|lamb|goat|kambing)\b/g;
const FISH_RE = /\b(fish|isda|tilapia|bangus|galunggong|tuna|salmon|sardines?|tuyo|dilis|shrimp|hipon|squid|pusit|crab|alimango|mussel|tahong|oyster|talaba|clam|bagoong|patis|alamang)\b/g;
const ANIMAL_RE = /\b(egg|eggs|itlog|milk|gatas|cheese|keso|butter|yogurt|cream|honey|pulot|gelatin)\b/g;
const PLANT_BASED_RE = /coconut (milk|cream)|gata|peanut butter|cocoa butter|almond milk|soy milk/g;

const dietWarning = (diet: string, names: string[]): string | null => {
  if (diet === 'Omnivore') return null;
  const text = names.map((n) => n.toLowerCase().replace(PLANT_BASED_RE, ' ')).join(' | ');
  const find = (re: RegExp) => [...new Set(text.match(re) || [])];
  const meat = find(MEAT_RE);
  const fish = find(FISH_RE);
  const animal = find(ANIMAL_RE);
  if (diet === 'Pescatarian' && meat.length) {
    return `Pescatarian meals should not contain meat. Found: ${meat.join(', ')}.`;
  }
  if (diet === 'Vegetarian' && (meat.length || fish.length)) {
    return `Vegetarian meals should not contain meat or fish. Found: ${[...meat, ...fish].join(', ')}.`;
  }
  if (diet === 'Vegan' && (meat.length || fish.length || animal.length)) {
    return `Vegan meals should not contain animal products. Found: ${[...meat, ...fish, ...animal].join(', ')}.`;
  }
  return null;
};

// Sample suggestions shown while typing a Main Ingredient.
const MAIN_SUGGESTIONS = [
  'Chicken Breast', 'Chicken Thigh', 'Beef', 'Pork', 'Egg', 'Tofu', 'Tilapia', 'Salmon', 'Tuna',
  'Shrimp', 'Squid', 'Brown Rice', 'White Rice', 'Oats', 'Sweet Potato', 'Potato', 'Corn',
  'Pasta', 'Bread', 'Broccoli', 'Cabbage', 'Carrots', 'Spinach', 'Eggplant', 'Banana', 'Avocado',
];

// Sample suggestions shown while typing a Sub Ingredient (seasonings, sauces, extras).
const SUB_SUGGESTIONS = [
  'Soy Sauce', 'Vinegar', 'Fish Sauce', 'Oyster Sauce', 'Garlic', 'Onion', 'Ginger', 'Tomato',
  'Salt', 'Black Pepper', 'Sugar', 'Cooking Oil', 'Olive Oil', 'Butter', 'Milk', 'Calamansi',
  'Lemon', 'Bay Leaf', 'Green Onion', 'Chili', 'Bell Pepper', 'Mushroom', 'Peas', 'Sesame Oil',
];

const PAGE_SIZE = 10;
const NAME_MAX = 50;
const ING_MAX = 25;
const INSTR_MAX = 1500;

const sanitizeMealName = (v: string) => v.replace(/[^a-zA-Z0-9 \-()'&,.]/g, '').slice(0, NAME_MAX);
const sanitizeIngName = (v: string) => v.replace(/[^a-zA-Z -]/g, '').slice(0, ING_MAX);

// Digits with at most one decimal point. maxInt = digits before the point, maxDec = digits after.
const sanitizeDecimal = (v: string, maxInt: number, maxDec = 1) => {
  let cleaned = v.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
  }
  const [intPart, decPart] = cleaned.split('.');
  const safeInt = (intPart || '').slice(0, maxInt);
  if (cleaned.includes('.') && maxDec > 0) return `${safeInt}.${(decPart || '').slice(0, maxDec)}`;
  return safeInt;
};

// Atwater factors: 4 kcal/g protein, 4 kcal/g carbs, 9 kcal/g fats.
const calcCalories = (protein: string, carbs: string, fats: string) =>
  Math.round((parseFloat(protein) || 0) * 4 + (parseFloat(carbs) || 0) * 4 + (parseFloat(fats) || 0) * 9);

const inputCls = (bad: boolean) =>
  `w-full border rounded-xl px-4 py-3 text-sm outline-none ${
    bad ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-green-400'
  }`;

const Req = () => <span className="text-red-500"> *</span>;

// ---------- Ingredient editor (Main & Sub) ----------

type IngredientRow = { name: string; allergens: string[]; substituteOverride?: string };

function IngredientListEditor({
  label,
  hint,
  rows,
  onChange,
  showSubstitute,
  required,
  submitted,
  suggestionsId,
}: {
  label: string;
  hint: string;
  rows: IngredientRow[];
  onChange: (rows: IngredientRow[]) => void;
  showSubstitute?: boolean;
  required?: boolean;
  submitted?: boolean;
  suggestionsId?: string;
}) {
  const updateRow = (index: number, patch: Partial<IngredientRow>) => {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };
  const addRow = () => {
    onChange([...rows, { name: '', allergens: [], substituteOverride: '' }]);
  };
  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };
  const toggleAllergen = (index: number, allergen: string) => {
    const current = rows[index].allergens;
    if (current.includes(allergen)) {
      // Turning off a category also turns off its specific types
      const specifics = SPECIFIC_ALLERGENS[allergen] || [];
      updateRow(index, { allergens: current.filter((a) => a !== allergen && !specifics.includes(a)) });
    } else {
      updateRow(index, { allergens: [...current, allergen] });
    }
  };

  const noneFilled = rows.every((r) => !r.name.trim());
  const missing = required && submitted && noneFilled;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-gray-500 block">
          {label}
          {required && <Req />}
        </label>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700"
        >
          <PlusCircle size={14} /> Add
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mb-2">{hint}</p>
      <div className={`flex flex-col gap-2 ${missing ? 'rounded-xl border border-red-400 bg-red-50 p-2' : ''}`}>
        {rows.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No ingredients added yet.</p>
        ) : (
          rows.map((row, i) => (
            <div key={i} className="border border-gray-200 bg-white rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                  placeholder="Ingredient name (e.g. soy sauce)"
                  maxLength={ING_MAX}
                  list={suggestionsId}
                  value={row.name}
                  onChange={(e) => updateRow(i, { name: sanitizeIngName(e.target.value) })}
                />
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg flex-shrink-0"
                >
                  <MinusCircle size={16} />
                </button>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Allergens (tap to select, leave empty if none)</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...ALLERGENS, ...row.allergens.filter((a) => !ALLERGENS.includes(a) && !ALL_SPECIFIC.includes(a))].map((a) => {
                    const active = row.allergens.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAllergen(i, a)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                          active
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
                {Object.keys(SPECIFIC_ALLERGENS)
                  .filter((cat) => row.allergens.includes(cat))
                  .map((cat) => (
                    <div key={cat} className="mt-2 rounded-lg border border-red-100 bg-red-50/60 p-2">
                      <p className="text-[11px] text-red-500 mb-1">Specific {cat.toLowerCase()} (optional)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {SPECIFIC_ALLERGENS[cat].map((s) => {
                          const on = row.allergens.includes(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => toggleAllergen(i, s)}
                              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                                on
                                  ? 'bg-red-500 border-red-500 text-white'
                                  : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      {!SPECIFIC_ALLERGENS[cat].some((s) => row.allergens.includes(s)) && (
                        <p className="text-[11px] text-amber-600 mt-1">
                          Pick the specific type too, so users who avoid only that type are protected.
                        </p>
                      )}
                    </div>
                  ))}
              </div>
              {showSubstitute && (
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-green-400"
                  placeholder="Substitute for THIS meal only (optional — blank uses the default substitute)"
                  maxLength={ING_MAX}
                  value={row.substituteOverride || ''}
                  onChange={(e) => updateRow(i, { substituteOverride: sanitizeIngName(e.target.value) })}
                />
              )}
            </div>
          ))
        )}
      </div>
      {missing && <p className="text-xs text-red-500 mt-1">Add at least one main ingredient.</p>}
    </div>
  );
}

const ingredientsToRows = (ingredients: Ingredient[]): IngredientRow[] =>
  (ingredients || []).map((ing) => ({ name: ing.name, allergens: ing.allergens || [] }));

const subIngredientsToRows = (ingredients: SubIngredient[]): IngredientRow[] =>
  (ingredients || []).map((ing) => ({
    name: ing.name,
    allergens: ing.allergens || [],
    substituteOverride: ing.substitute_override || '',
  }));

const rowsToIngredients = (rows: IngredientRow[]): Ingredient[] =>
  rows.filter((r) => r.name.trim()).map((r) => ({ name: r.name.trim(), allergens: r.allergens }));

const rowsToSubIngredients = (rows: IngredientRow[]): SubIngredient[] =>
  rows
    .filter((r) => r.name.trim())
    .map((r) => ({
      name: r.name.trim(),
      allergens: r.allergens,
      substitute_override: r.substituteOverride?.trim() || null,
    }));

// ---------- Shared meal form (used by Add and Edit) ----------

type MealForm = {
  name: string;
  category: string;
  meal_type: string;
  diet_type: string;
  protein: string;
  carbs: string;
  fats: string;
  instructions: string;
};

const emptyForm: MealForm = {
  name: '', category: 'Protein', meal_type: 'Breakfast', diet_type: 'Omnivore', protein: '', carbs: '', fats: '', instructions: '',
};

const formErrors = (f: MealForm, mainRows: IngredientRow[]) => ({
  name: !f.name.trim(),
  protein: f.protein === '' || f.protein === '.',
  carbs: f.carbs === '' || f.carbs === '.',
  fats: f.fats === '' || f.fats === '.',
  main: mainRows.every((r) => !r.name.trim()),
  instructions: !f.instructions.trim(),
  zeroCalories: calcCalories(f.protein, f.carbs, f.fats) <= 0,
});

function MealFormFields({
  form,
  setForm,
  mainRows,
  setMainRows,
  subRows,
  setSubRows,
  submitted,
  showMealType,
}: {
  form: MealForm;
  setForm: (patch: Partial<MealForm>) => void;
  mainRows: IngredientRow[];
  setMainRows: (rows: IngredientRow[]) => void;
  subRows: IngredientRow[];
  setSubRows: (rows: IngredientRow[]) => void;
  submitted: boolean;
  showMealType: boolean;
}) {
  const err = formErrors(form, mainRows);
  const totalCalories = calcCalories(form.protein, form.carbs, form.fats);
  const dietNote = dietWarning(form.diet_type, [...mainRows, ...subRows].map((r) => r.name));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Meal Name<Req /></label>
        <input
          className={inputCls(submitted && err.name)}
          placeholder="e.g. Chicken Adobo"
          maxLength={NAME_MAX}
          value={form.name}
          onChange={(e) => setForm({ name: sanitizeMealName(e.target.value) })}
        />
        {submitted && err.name && <p className="text-xs text-red-500 mt-1">Meal name is required.</p>}
      </div>

      <div className={`grid gap-4 ${showMealType ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
            value={form.category}
            onChange={(e) => setForm({ category: e.target.value })}
          >
            <option>Protein</option>
            <option>Carbs</option>
            <option>Vegetable</option>
            <option>Fats</option>
          </select>
        </div>
        {showMealType && (
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Meal Type</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
              value={form.meal_type}
              onChange={(e) => setForm({ meal_type: e.target.value })}
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Diet Type</label>
        <select
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
          value={form.diet_type}
          onChange={(e) => setForm({ diet_type: e.target.value })}
        >
          {DIET_TYPES.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <p className="text-[11px] text-gray-400 mt-1">
          Pescatarian = fish allowed, no meat. Vegetarian = no meat or fish. Vegan = no animal products.
          Omnivore = may contain meat.
        </p>
        {dietNote && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <p className="text-[11px] font-semibold text-amber-700">Check the diet type</p>
            <p className="text-[11px] text-amber-700">{dietNote}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {([
          ['protein', 'Protein (g)'],
          ['carbs', 'Carbs (g)'],
          ['fats', 'Fats (g)'],
        ] as const).map(([key, label]) => (
          <div key={key}>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}<Req /></label>
            <input
              className={inputCls(submitted && err[key])}
              placeholder="0"
              inputMode="decimal"
              value={form[key]}
              onChange={(e) => setForm({ [key]: sanitizeDecimal(e.target.value, 3, 1) } as Partial<MealForm>)}
            />
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 -mt-2">Max 999.9 g each. Numbers only, up to 1 decimal place.</p>

      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Total Calories (auto-computed)</label>
        <div
          className={`w-full rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-between ${
            submitted && err.zeroCalories ? 'border border-red-400 bg-red-50 text-red-500' : 'bg-gray-50 border border-gray-100 text-gray-700'
          }`}
        >
          <span>{totalCalories} kcal</span>
          <span className="text-[11px] font-normal text-gray-400">P×4 + C×4 + F×9</span>
        </div>
        {submitted && err.zeroCalories && <p className="text-xs text-red-500 mt-1">Enter at least one macro greater than 0.</p>}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <IngredientListEditor
          label="Main Ingredients"
          hint="Defines the dish (e.g. chicken, beef, tofu). If any has an allergen, the whole meal is excluded — no substitute possible."
          rows={mainRows}
          onChange={setMainRows}
          required
          submitted={submitted}
          suggestionsId="main-ingredient-suggestions"
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <IngredientListEditor
          label="Sub Ingredients"
          hint="Seasonings, sauces, extras (e.g. soy sauce, milk). If any has an allergen, a substitute will be used automatically to keep the meal on the plan."
          rows={subRows}
          onChange={setSubRows}
          showSubstitute
          suggestionsId="sub-ingredient-suggestions"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Cooking Instructions (step by step)<Req /></label>
        <textarea
          className={`${inputCls(submitted && err.instructions)} min-h-[100px] resize-none`}
          placeholder={'One step per line, e.g.\nMarinate chicken in soy sauce and vinegar for 30 minutes\nSauté garlic and onions\nSimmer until tender'}
          maxLength={INSTR_MAX}
          value={form.instructions}
          onChange={(e) => setForm({ instructions: e.target.value })}
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-red-500">{submitted && err.instructions ? 'Instructions are required.' : ''}</p>
          <p className="text-xs text-gray-400">{form.instructions.length}/{INSTR_MAX}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- Page ----------

export default function MealPlan() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [dietFilter, setDietFilter] = useState('All Diets');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Meal | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  const [newMeal, setNewMeal] = useState<MealForm>(emptyForm);
  const [newMainRows, setNewMainRows] = useState<IngredientRow[]>([]);
  const [newSubRows, setNewSubRows] = useState<IngredientRow[]>([]);
  const [addSubmitted, setAddSubmitted] = useState(false);

  const [editForm, setEditForm] = useState<MealForm>(emptyForm);
  const [editMainRows, setEditMainRows] = useState<IngredientRow[]>([]);
  const [editSubRows, setEditSubRows] = useState<IngredientRow[]>([]);
  const [editSubmitted, setEditSubmitted] = useState(false);

  const [outsideLogs, setOutsideLogs] = useState<OutsideFoodLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const loadMeals = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (categoryFilter !== 'All Categories') params.category = categoryFilter;

      const res = await api.get('/meals', { params });
      // The server does not filter by diet, so it is done here
      const list: Meal[] = res.data.meals;
      setMeals(dietFilter === 'All Diets' ? list : list.filter((m) => dietLabel(m.diet_type) === dietFilter));
    } catch (err) {
      console.error('Load meals error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, dietFilter]);

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

  // Back to page 1 whenever the filter or search changes.
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, dietFilter]);

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

  // Pagination
  const totalPages = Math.max(1, Math.ceil(meals.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageMeals = meals.slice(startIndex, startIndex + PAGE_SIZE);

  const pageNumbers = (): (number | '…')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    const from = Math.max(2, currentPage - 1);
    const to = Math.min(totalPages - 1, currentPage + 1);
    if (from > 2) pages.push('…');
    for (let p = from; p <= to; p++) pages.push(p);
    if (to < totalPages - 1) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  const formatLogTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  // Combine main + sub ingredient allergens into the flat top-level `allergens`
  // array, so the existing allergen badge display stays accurate automatically.
  const computeTopLevelAllergens = (mainRows: IngredientRow[], subRows: IngredientRow[]): string[] => {
    const all = new Set<string>();
    [...mainRows, ...subRows].forEach((r) => {
      if (r.name.trim()) r.allergens.forEach((a) => all.add(a));
    });
    return [...all];
  };

  const hasErrors = (f: MealForm, mainRows: IngredientRow[]) => {
    const e = formErrors(f, mainRows);
    return e.name || e.protein || e.carbs || e.fats || e.main || e.instructions || e.zeroCalories;
  };

  const openAddModal = () => {
    setNewMeal(emptyForm);
    setNewMainRows([]);
    setNewSubRows([]);
    setAddSubmitted(false);
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    setAddSubmitted(true);
    if (hasErrors(newMeal, newMainRows)) return;
    setSaving(true);
    try {
      await api.post('/meals', {
        name: newMeal.name.trim(),
        category: newMeal.category,
        meal_type: newMeal.meal_type,
        diet_type: newMeal.diet_type,
        calories: calcCalories(newMeal.protein, newMeal.carbs, newMeal.fats),
        protein: parseFloat(newMeal.protein) || 0,
        carbs: parseFloat(newMeal.carbs) || 0,
        fats: parseFloat(newMeal.fats) || 0,
        allergens: computeTopLevelAllergens(newMainRows, newSubRows),
        ingredients: [],
        instructions: newMeal.instructions.trim(),
        main_ingredients: rowsToIngredients(newMainRows),
        sub_ingredients: rowsToSubIngredients(newSubRows),
      });
      setNewMeal(emptyForm);
      setNewMainRows([]);
      setNewSubRows([]);
      setAddSubmitted(false);
      setShowAddModal(false);
      loadMeals();
    } catch (err) {
      console.error('Add meal error:', err);
      setNotice({ title: 'Unable to add meal', message: 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleting(true);
    try {
      await api.delete(`/meals/${id}`);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete meal error:', err);
      setDeleteTarget(null);
      setNotice({ title: 'Unable to delete meal', message: 'Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (meal: Meal) => {
    setSelectedMeal(meal);
    setEditForm({
      name: meal.name,
      category: meal.category,
      meal_type: meal.meal_type,
      diet_type: meal.diet_type || 'Omnivore',
      protein: String(meal.protein ?? ''),
      carbs: String(meal.carbs ?? ''),
      fats: String(meal.fats ?? ''),
      instructions: meal.instructions || '',
    });
    setEditMainRows(ingredientsToRows(meal.main_ingredients || []));
    setEditSubRows(subIngredientsToRows(meal.sub_ingredients || []));
    setEditSubmitted(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMeal) return;
    setEditSubmitted(true);
    if (hasErrors(editForm, editMainRows)) return;
    setSaving(true);
    try {
      const mainIngredients = rowsToIngredients(editMainRows);
      const subIngredients = rowsToSubIngredients(editSubRows);
      const computedAllergens = computeTopLevelAllergens(editMainRows, editSubRows);
      const calories = calcCalories(editForm.protein, editForm.carbs, editForm.fats);
      const protein = parseFloat(editForm.protein) || 0;
      const carbs = parseFloat(editForm.carbs) || 0;
      const fats = parseFloat(editForm.fats) || 0;

      await api.put(`/meals/${selectedMeal.id}`, {
        name: editForm.name.trim(),
        category: editForm.category,
        diet_type: editForm.diet_type,
        calories,
        protein,
        carbs,
        fats,
        instructions: editForm.instructions.trim(),
        allergens: computedAllergens,
        main_ingredients: mainIngredients,
        sub_ingredients: subIngredients,
      });
      setMeals((prev) =>
        prev.map((m) =>
          m.id === selectedMeal.id
            ? {
                ...m,
                name: editForm.name.trim(),
                category: editForm.category,
                diet_type: editForm.diet_type,
                calories,
                protein,
                carbs,
                fats,
                instructions: editForm.instructions.trim(),
                allergens: computedAllergens,
                main_ingredients: mainIngredients,
                sub_ingredients: subIngredients,
              }
            : m
        )
      );
      setEditSubmitted(false);
      setShowEditModal(false);
    } catch (err) {
      console.error('Update meal error:', err);
      setNotice({ title: 'Unable to update meal', message: 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Meal Plan Management" />

      <div className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 min-w-0 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Meal Plan Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage macros and meals templates for the system</p>
        </div>

        {/* Shared suggestions for the Main Ingredient inputs */}
        <datalist id="main-ingredient-suggestions">
          {MAIN_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <datalist id="sub-ingredient-suggestions">
          {SUB_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        {/* Main content: table stacks above stats on small screens, side by side on large.
            On large screens both columns stretch to the same height. */}
        <div className="flex flex-col xl:flex-row gap-6 items-stretch">
          {/* Meal Table */}
          <div className="w-full xl:flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-0 flex flex-col">
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row sm:items-center xl:items-stretch 2xl:items-center justify-between p-4 sm:p-6 border-b border-gray-100 gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-800">Meal table</h2>
                <p className="text-xs text-gray-400">Manage all meals available in the system</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50">
                  <Search size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    className="py-2.5 bg-transparent outline-none text-sm text-gray-700 w-full sm:w-48"
                    placeholder="Search meal name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <select
                    className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option>All Categories</option>
                    <option>Protein</option>
                    <option>Carbs</option>
                    <option>Vegetable</option>
                    <option>Fats</option>
                  </select>
                  <select
                    className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
                    value={dietFilter}
                    onChange={(e) => setDietFilter(e.target.value)}
                  >
                    <option>All Diets</option>
                    {DIET_TYPES.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <button
                    onClick={openAddModal}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={16} /> <span className="hidden sm:inline">Add new meal</span><span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Phone: stacked cards */}
            <div className="md:hidden flex-1">
              {loading ? (
                <p className="px-4 py-12 text-center text-gray-400 text-sm">Loading meals...</p>
              ) : meals.length === 0 ? (
                <p className="px-4 py-12 text-center text-gray-400 text-sm">No meals found.</p>
              ) : (
                pageMeals.map((meal) => (
                  <div key={meal.id} className="px-4 py-3 border-b border-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <Utensils size={14} className="text-orange-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-700 text-sm break-words">{meal.name}</p>
                          <p className="text-[11px] text-gray-400">{meal.meal_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(meal)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg" aria-label="Edit meal">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(meal)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg" aria-label="Delete meal">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs text-gray-500">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
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
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${dietBadgeCls(meal.diet_type)}`}>
                        {dietLabel(meal.diet_type)}
                      </span>
                      <span>{meal.calories} kcal</span>
                      <span>P/C/F {meal.protein}/{meal.carbs}/{meal.fats}g</span>
                    </div>
                    {meal.allergens && meal.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {meal.allergens.map((a, i) => (
                          <span key={i} className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Tablet/desktop: table */}
            <div className="hidden md:block overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Meal', 'Type', 'Diet', 'Category', 'Calories', 'Allergens', 'P/C/F', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-3 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">Loading meals...</td>
                    </tr>
                  ) : meals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">No meals found.</td>
                    </tr>
                  ) : (
                    pageMeals.map((meal) => (
                      <tr key={meal.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                              <Utensils size={13} className="text-orange-500" />
                            </div>
                            <span className="font-medium text-gray-700">{meal.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-500">{meal.meal_type}</td>
                        <td className="px-3 py-3">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${dietBadgeCls(meal.diet_type)}`}>
                            {dietLabel(meal.diet_type)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
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
                        <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{meal.calories} kcal</td>
                        <td className="px-3 py-3">
                          {meal.allergens && meal.allergens.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {meal.allergens.map((a, i) => (
                                <span key={i} className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">
                                  {a}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-gray-500 whitespace-nowrap text-xs">
                          {meal.protein}/{meal.carbs}/{meal.fats}g
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEdit(meal)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setDeleteTarget(meal)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && meals.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, meals.length)} of {meals.length} meals
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {pageNumbers().map((p, i) =>
                    p === '…' ? (
                      <span key={`gap-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                          p === currentPage ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right column: Stats + Outside Food Logs. The logs panel fills the remaining height
              so it lines up with the bottom of the meal table. */}
          <div className="w-full xl:w-72 flex flex-col gap-4 flex-shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-1 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <stat.Icon size={22} className={stat.color} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Outside Food Logs Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-[320px]">
              <div className="flex items-center gap-2 p-5 border-b border-gray-100">
                <div className="bg-purple-50 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ListPlus size={18} className="text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Outside Food Logs</h3>
                  <p className="text-[11px] text-gray-400">User-logged meals outside the system</p>
                </div>
              </div>
              <div className="relative flex-1 min-h-[240px]">
                <div className="absolute inset-0 overflow-y-auto">
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
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete meal?"
        message={deleteTarget ? `"${deleteTarget.name}" will be permanently removed. This can't be undone.` : ''}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Error notice */}
      <NoticeDialog
        open={!!notice}
        title={notice?.title || ''}
        message={notice?.message || ''}
        onClose={() => setNotice(null)}
      />

      {/* Add Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[520px] shadow-xl my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Add New Meal</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <MealFormFields
              form={newMeal}
              setForm={(patch) => setNewMeal((p) => ({ ...p, ...patch }))}
              mainRows={newMainRows}
              setMainRows={setNewMainRows}
              subRows={newSubRows}
              setSubRows={setNewSubRows}
              submitted={addSubmitted}
              showMealType
            />
            <div className="flex gap-3 mt-6">
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
      )}

      {/* Edit Meal Modal */}
      {showEditModal && selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[520px] shadow-xl my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Edit Meal</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <MealFormFields
              form={editForm}
              setForm={(patch) => setEditForm((p) => ({ ...p, ...patch }))}
              mainRows={editMainRows}
              setMainRows={setEditMainRows}
              subRows={editSubRows}
              setSubRows={setEditSubRows}
              submitted={editSubmitted}
              showMealType={false}
            />
            <div className="flex gap-3 mt-6">
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
      )}
    </div>
  );
}