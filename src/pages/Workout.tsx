import { useState } from 'react';
import Sidebar from '../components/Sidebar';

type Exercise = {
  id: number;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string;
  image: string;
};

const initialExercises: Exercise[] = [
  { id: 1, name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate', instructions: '1. Lie on bench\n2. Lower the bar\n3. Push the bar back up', image: '🏋️' },
  { id: 2, name: 'Squats', muscleGroup: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', instructions: '1. Stand with feet shoulder-width\n2. Lower hips\n3. Push through heels', image: '🦵' },
  { id: 3, name: 'Pull Ups', muscleGroup: 'Lats', equipment: 'Bodyweight', difficulty: 'Intermediate', instructions: '1. Hang from bar\n2. Pull chest to bar\n3. Lower slowly', image: '💪' },
  { id: 4, name: 'Shoulder Press', muscleGroup: 'Triceps', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: '1. Hold dumbbells at shoulders\n2. Press overhead\n3. Lower slowly', image: '🏋️' },
  { id: 5, name: 'Bicep Curl', muscleGroup: 'Bicep', equipment: 'Dumbbell', difficulty: 'Beginner', instructions: '1. Hold dumbbells at sides\n2. Curl to shoulders\n3. Lower slowly', image: '💪' },
  { id: 6, name: 'Leg Press', muscleGroup: 'Legs', equipment: '45-Degree/Incline Leg Press', difficulty: 'Beginner', instructions: '1. Sit in machine\n2. Push platform away\n3. Return slowly', image: '🦵' },
  { id: 7, name: 'Deadlift', muscleGroup: 'Glutes', equipment: 'Barbell', difficulty: 'Advanced', instructions: '1. Stand with feet hip-width\n2. Bend and grip bar\n3. Drive hips forward', image: '🏋️' },
];

const stats = [
  { label: 'Total Exercise', value: '128', icon: '💪', color: 'text-green-500', bg: 'bg-green-50', change: '+10 this week' },
  { label: 'Workout Templates', value: '24', icon: '📋', color: 'text-blue-500', bg: 'bg-blue-50', change: 'Active' },
  { label: 'Muscle Groups', value: '8', icon: '🏃', color: 'text-orange-500', bg: 'bg-orange-50', change: 'Categories' },
  { label: 'Most Used Exercise', value: 'Squats', icon: '⭐', color: 'text-yellow-500', bg: 'bg-yellow-50', change: 'Top exercise' },
];

const muscleGroups = [
  { name: 'Chest', count: 32 },
  { name: 'Leg', count: 25 },
  { name: 'Back', count: 20 },
  { name: 'Shoulder', count: 15 },
  { name: 'Bicep', count: 18 },
];

export default function Workout() {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All Groups');
  const [equipmentFilter, setEquipmentFilter] = useState('All Levels');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [newExercise, setNewExercise] = useState({
    name: '', muscleGroup: 'Chest', equipment: 'Barbell',
    difficulty: 'Beginner' as Exercise['difficulty'], instructions: '',
  });

  const filtered = exercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = muscleFilter === 'All Groups' || e.muscleGroup === muscleFilter;
    const matchEquip = equipmentFilter === 'All Levels' || e.equipment === equipmentFilter;
    return matchSearch && matchMuscle && matchEquip;
  });

  const handleAdd = () => {
    if (!newExercise.name) return;
    const exercise: Exercise = {
      id: exercises.length + 1,
      name: newExercise.name,
      muscleGroup: newExercise.muscleGroup,
      equipment: newExercise.equipment,
      difficulty: newExercise.difficulty,
      instructions: newExercise.instructions,
      image: '💪',
    };
    setExercises(prev => [...prev, exercise]);
    setNewExercise({ name: '', muscleGroup: 'Chest', equipment: 'Barbell', difficulty: 'Beginner', instructions: '' });
    setShowAddModal(false);
  };

  const handleDelete = (id: number) => {
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Beginner') return 'bg-green-50 text-green-600';
    if (difficulty === 'Intermediate') return 'bg-orange-50 text-orange-500';
    return 'bg-red-50 text-red-500';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active="Workout" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Workout Management</h1>
            <p className="text-sm text-gray-400 mt-1">Manage workout and exercise templates for the system</p>
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

        <div className="flex gap-6">
          {/* Exercise Table */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Table Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Exercise</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50">
                  <span className="text-gray-400 text-sm">🔍</span>
                  <input
                    className="py-2.5 bg-transparent outline-none text-sm text-gray-700 w-36"
                    placeholder="Search exercises..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
                  value={muscleFilter}
                  onChange={e => setMuscleFilter(e.target.value)}
                >
                  <option>All Groups</option>
                  <option>Chest</option>
                  <option>Legs</option>
                  <option>Lats</option>
                  <option>Triceps</option>
                  <option>Bicep</option>
                  <option>Glutes</option>
                </select>
                <select
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
                  value={equipmentFilter}
                  onChange={e => setEquipmentFilter(e.target.value)}
                >
                  <option>All Levels</option>
                  <option>Barbell</option>
                  <option>Dumbbell</option>
                  <option>Bodyweight</option>
                </select>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  + Add new exercise
                </button>
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Exercise Name', 'Muscle Groups', 'Equipment', 'Action'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(exercise => (
                  <tr key={exercise.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl">
                          {exercise.image}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{exercise.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{exercise.muscleGroup}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{exercise.equipment}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedExercise(exercise); setShowDetailModal(true); }}
                          className="text-green-500 hover:bg-green-50 p-1.5 rounded-lg transition-colors text-sm"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => { setSelectedExercise(exercise); setShowEditModal(true); }}
                          className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(exercise.id)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-400">Showing {filtered.length} of {exercises.length} exercises</p>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 text-sm">‹</button>
                {[1, 2, 3, 4].map(p => (
                  <button key={p} className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    p === 1 ? 'bg-green-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}>{p}</button>
                ))}
                <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 text-sm">›</button>
              </div>
            </div>
          </div>

          {/* Top Muscle Groups */}
          <div className="w-56 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Top Muscle Groups</h3>
            <div className="flex flex-col gap-3">
              {muscleGroups.map((mg, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{mg.name}</span>
                  <span className="text-xs font-semibold text-green-500">{mg.count} exercise</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[480px] shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Add New Exercise</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Exercise Name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                  placeholder="e.g. Bench Press"
                  value={newExercise.name}
                  onChange={e => setNewExercise(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Muscle Group</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    value={newExercise.muscleGroup}
                    onChange={e => setNewExercise(p => ({ ...p, muscleGroup: e.target.value }))}
                  >
                    <option>Chest</option>
                    <option>Legs</option>
                    <option>Back</option>
                    <option>Shoulders</option>
                    <option>Bicep</option>
                    <option>Triceps</option>
                    <option>Glutes</option>
                    <option>Core</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Equipment</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    value={newExercise.equipment}
                    onChange={e => setNewExercise(p => ({ ...p, equipment: e.target.value }))}
                  >
                    <option>Barbell</option>
                    <option>Dumbbell</option>
                    <option>Bodyweight</option>
                    <option>Machine</option>
                    <option>Resistance Band</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Difficulty</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                  value={newExercise.difficulty}
                  onChange={e => setNewExercise(p => ({ ...p, difficulty: e.target.value as Exercise['difficulty'] }))}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Instructions</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 min-h-24 resize-none"
                  placeholder="Step by step instructions..."
                  value={newExercise.instructions}
                  onChange={e => setNewExercise(p => ({ ...p, instructions: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Upload Video</label>
                <div className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-center text-gray-400 text-sm cursor-pointer hover:border-green-400 transition-colors">
                  📹 Click to upload video
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
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {showDetailModal && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[420px] shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">{selectedExercise.name}</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Muscle Group</p>
                  <p className="text-sm font-semibold text-gray-700">{selectedExercise.muscleGroup}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Equipment</p>
                  <p className="text-sm font-semibold text-gray-700">{selectedExercise.equipment}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Difficulty</p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyColor(selectedExercise.difficulty)}`}>
                  {selectedExercise.difficulty}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">Instructions</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{selectedExercise.instructions}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-8 flex flex-col items-center justify-center text-white gap-2">
                <span className="text-4xl">▶️</span>
                <p className="text-sm font-medium">Video Demonstration</p>
                <p className="text-xs text-gray-400">Available in full version</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[480px] shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Edit Exercise</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Exercise Name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                  value={selectedExercise.name}
                  onChange={e => setSelectedExercise(p => p ? { ...p, name: e.target.value } : p)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Muscle Group</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    value={selectedExercise.muscleGroup}
                    onChange={e => setSelectedExercise(p => p ? { ...p, muscleGroup: e.target.value } : p)}
                  >
                    <option>Chest</option>
                    <option>Legs</option>
                    <option>Back</option>
                    <option>Shoulders</option>
                    <option>Bicep</option>
                    <option>Triceps</option>
                    <option>Glutes</option>
                    <option>Core</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Equipment</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    value={selectedExercise.equipment}
                    onChange={e => setSelectedExercise(p => p ? { ...p, equipment: e.target.value } : p)}
                  >
                    <option>Barbell</option>
                    <option>Dumbbell</option>
                    <option>Bodyweight</option>
                    <option>Machine</option>
                    <option>Resistance Band</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Instructions</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none min-h-24 resize-none"
                  value={selectedExercise.instructions}
                  onChange={e => setSelectedExercise(p => p ? { ...p, instructions: e.target.value } : p)}
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
                  onClick={() => {
                    setExercises(prev => prev.map(e => e.id === selectedExercise.id ? selectedExercise : e));
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