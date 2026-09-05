import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Plus, Eye, Pencil, Trash2, X, Play,
  Dumbbell, Activity, Wrench, Gauge,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../config/api';

type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string;
  video_url: string | null;
};

export default function Workout() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('Muscle Groups');
  const [equipmentFilter, setEquipmentFilter] = useState('Equipment');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [newExercise, setNewExercise] = useState({
    name: '', muscle_group: 'Chest', equipment: 'Barbell',
    difficulty: 'Beginner' as Exercise['difficulty'], instructions: '',
  });

  const loadExercises = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (muscleFilter !== 'Muscle Groups') params.muscle_group = muscleFilter;
      if (equipmentFilter !== 'Equipment') params.equipment = equipmentFilter;

      const res = await api.get('/workouts', { params });
      setExercises(res.data.exercises);
    } catch (err) {
      console.error('Load exercises error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, muscleFilter, equipmentFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadExercises();
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadExercises]);

  // Dynamic breakdown counts computed from the currently loaded full list
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await api.get('/workouts');
        setAllExercises(res.data.exercises);
      } catch (err) {
        console.error('Load all exercises error:', err);
      }
    };
    loadAll();
  }, []);

  const refreshAllExercises = async () => {
    try {
      const res = await api.get('/workouts');
      setAllExercises(res.data.exercises);
    } catch (err) {
      console.error('Refresh all exercises error:', err);
    }
  };

  const countBy = (key: 'muscle_group' | 'equipment' | 'difficulty') => {
    const counts = allExercises.reduce((acc: Record<string, number>, e) => {
      acc[e[key]] = (acc[e[key]] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const muscleGroupCounts = countBy('muscle_group');
  const equipmentCounts = countBy('equipment');
  const difficultyCounts = countBy('difficulty');

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Beginner') return 'bg-green-50 text-green-600';
    if (difficulty === 'Intermediate') return 'bg-orange-50 text-orange-500';
    return 'bg-red-50 text-red-500';
  };

  const handleAdd = async () => {
    if (!newExercise.name) return;
    setSaving(true);
    try {
      await api.post('/workouts', newExercise);
      setNewExercise({ name: '', muscle_group: 'Chest', equipment: 'Barbell', difficulty: 'Beginner', instructions: '' });
      setShowAddModal(false);
      loadExercises();
      refreshAllExercises();
    } catch (err) {
      console.error('Add exercise error:', err);
      alert('Unable to add exercise. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this exercise?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      setExercises((prev) => prev.filter((e) => e.id !== id));
      setAllExercises((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Delete exercise error:', err);
      alert('Unable to delete exercise. Please try again.');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedExercise) return;
    setSaving(true);
    try {
      await api.put(`/workouts/${selectedExercise.id}`, {
        name: selectedExercise.name,
        muscle_group: selectedExercise.muscle_group,
        equipment: selectedExercise.equipment,
        instructions: selectedExercise.instructions,
      });
      setExercises((prev) => prev.map((e) => (e.id === selectedExercise.id ? selectedExercise : e)));
      setAllExercises((prev) => prev.map((e) => (e.id === selectedExercise.id ? selectedExercise : e)));
      setShowEditModal(false);
      refreshAllExercises();
    } catch (err) {
      console.error('Update exercise error:', err);
      alert('Unable to update exercise. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedExercise) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }

    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('video', file);

      const res = await api.post(`/upload/exercise-video/${selectedExercise.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedExercise = { ...selectedExercise, video_url: res.data.video_url };
      setSelectedExercise(updatedExercise);
      setExercises((prev) => prev.map((ex) => (ex.id === selectedExercise.id ? updatedExercise : ex)));
      setAllExercises((prev) => prev.map((ex) => (ex.id === selectedExercise.id ? updatedExercise : ex)));
      alert('Video uploaded successfully!');
    } catch (err) {
      console.error('Upload video error:', err);
      alert('Unable to upload video. Please try again.');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
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

        {/* Main content: table on the left, breakdown stats stacked on the right */}
        <div className="flex gap-6 items-start">
          {/* Exercise Table */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-0">
            {/* Table Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-wrap gap-3">
              <h2 className="text-base font-bold text-gray-800">Exercise</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50">
                  <Search size={16} className="text-gray-400" />
                  <input
                    className="py-2.5 bg-transparent outline-none text-sm text-gray-700 w-64"
                    placeholder="Search exercises, muscle groups, equipment..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
                  value={muscleFilter}
                  onChange={(e) => setMuscleFilter(e.target.value)}
                >
                  <option>Muscle Groups</option>
                  <option>Chest</option>
                  <option>Back</option>
                  <option>Legs</option>
                  <option>Glutes</option>
                  <option>Calves</option>
                  <option>Shoulders</option>
                  <option>Biceps</option>
                  <option>Triceps</option>
                  <option>Core</option>
                  <option>Full Body</option>
                </select>
                <select
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-gray-50 outline-none cursor-pointer"
                  value={equipmentFilter}
                  onChange={(e) => setEquipmentFilter(e.target.value)}
                >
                  <option>Equipment</option>
                  <option>Barbell</option>
                  <option>Dumbbell</option>
                  <option>Bodyweight</option>
                  <option>Machine</option>
                  <option>Bench</option>
                </select>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Add new exercise
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Exercise Name', 'Muscle Groups', 'Equipment', 'Difficulty', 'Action'].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">Loading exercises...</td>
                    </tr>
                  ) : exercises.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No exercises found.</td>
                    </tr>
                  ) : (
                    exercises.map((exercise) => (
                      <tr key={exercise.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                              <Dumbbell size={18} className="text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{exercise.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{exercise.muscle_group}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{exercise.equipment}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
                            {exercise.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setSelectedExercise(exercise); setShowDetailModal(true); }}
                              className="text-green-500 hover:bg-green-50 p-1.5 rounded-lg transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => { setSelectedExercise({ ...exercise }); setShowEditModal(true); }}
                              className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(exercise.id)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            >
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

          {/* Right column: Total + breakdowns, stacked */}
          <div className="w-72 flex flex-col gap-4 flex-shrink-0">
            {/* Total Exercise */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={22} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-green-500">{allExercises.length}</p>
                  <p className="text-xs text-gray-500">Total Exercise</p>
                </div>
              </div>
            </div>

            {/* Muscle Groups breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-orange-500" />
                <h3 className="text-sm font-bold text-gray-800">Muscle Groups</h3>
              </div>
              <div className="flex flex-col gap-2">
                {muscleGroupCounts.length === 0 ? (
                  <p className="text-xs text-gray-400">No data yet.</p>
                ) : (
                  muscleGroupCounts.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{name}</span>
                      <span className="text-xs font-semibold text-orange-500">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Equipment breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wrench size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-gray-800">Equipment</h3>
              </div>
              <div className="flex flex-col gap-2">
                {equipmentCounts.length === 0 ? (
                  <p className="text-xs text-gray-400">No data yet.</p>
                ) : (
                  equipmentCounts.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{name}</span>
                      <span className="text-xs font-semibold text-blue-500">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Gauge size={16} className="text-purple-500" />
                <h3 className="text-sm font-bold text-gray-800">Difficulty</h3>
              </div>
              <div className="flex flex-col gap-2">
                {difficultyCounts.length === 0 ? (
                  <p className="text-xs text-gray-400">No data yet.</p>
                ) : (
                  difficultyCounts.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{name}</span>
                      <span className="text-xs font-semibold text-purple-500">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-8 w-[480px] shadow-xl my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Add New Exercise</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Exercise Name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                  placeholder="e.g. Bench Press"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Muscle Group</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    value={newExercise.muscle_group}
                    onChange={(e) => setNewExercise((p) => ({ ...p, muscle_group: e.target.value }))}
                  >
                    <option>Chest</option>
                    <option>Back</option>
                    <option>Legs</option>
                    <option>Glutes</option>
                    <option>Calves</option>
                    <option>Shoulders</option>
                    <option>Biceps</option>
                    <option>Triceps</option>
                    <option>Core</option>
                    <option>Full Body</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Equipment</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    value={newExercise.equipment}
                    onChange={(e) => setNewExercise((p) => ({ ...p, equipment: e.target.value }))}
                  >
                    <option>Barbell</option>
                    <option>Dumbbell</option>
                    <option>Bodyweight</option>
                    <option>Machine</option>
                    <option>Bench</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Difficulty</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                  value={newExercise.difficulty}
                  onChange={(e) => setNewExercise((p) => ({ ...p, difficulty: e.target.value as Exercise['difficulty'] }))}
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
                  onChange={(e) => setNewExercise((p) => ({ ...p, instructions: e.target.value }))}
                />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-600">
                💡 Video upload is available after saving — open this exercise again via the Edit (pencil) button.
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
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {showDetailModal && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-8 w-[420px] shadow-xl my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">{selectedExercise.name}</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Muscle Group</p>
                  <p className="text-sm font-semibold text-gray-700">{selectedExercise.muscle_group}</p>
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
              {selectedExercise.video_url ? (
                <video
                  src={selectedExercise.video_url}
                  controls
                  className="w-full rounded-xl bg-black"
                  style={{ maxHeight: 220 }}
                />
              ) : (
                <div className="bg-gray-900 rounded-xl p-8 flex flex-col items-center justify-center text-white gap-2">
                  <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center">
                    <Play size={26} fill="white" />
                  </div>
                  <p className="text-sm font-medium">Video Demonstration</p>
                  <p className="text-xs text-gray-400">No video uploaded yet</p>
                </div>
              )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-8 w-[480px] shadow-xl my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Edit Exercise</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Exercise Name</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                  value={selectedExercise.name}
                  onChange={(e) => setSelectedExercise((p) => (p ? { ...p, name: e.target.value } : p))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Muscle Group</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    value={selectedExercise.muscle_group}
                    onChange={(e) => setSelectedExercise((p) => (p ? { ...p, muscle_group: e.target.value } : p))}
                  >
                    <option>Chest</option>
                    <option>Back</option>
                    <option>Legs</option>
                    <option>Glutes</option>
                    <option>Calves</option>
                    <option>Shoulders</option>
                    <option>Biceps</option>
                    <option>Triceps</option>
                    <option>Core</option>
                    <option>Full Body</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Equipment</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                    value={selectedExercise.equipment}
                    onChange={(e) => setSelectedExercise((p) => (p ? { ...p, equipment: e.target.value } : p))}
                  >
                    <option>Barbell</option>
                    <option>Dumbbell</option>
                    <option>Bodyweight</option>
                    <option>Machine</option>
                    <option>Bench</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Instructions</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none min-h-24 resize-none"
                  value={selectedExercise.instructions}
                  onChange={(e) => setSelectedExercise((p) => (p ? { ...p, instructions: e.target.value } : p))}
                />
              </div>

              {/* Video Upload Section */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Exercise Video</label>
                {selectedExercise.video_url && (
                  <video
                    src={selectedExercise.video_url}
                    controls
                    className="w-full rounded-xl bg-black mb-3"
                    style={{ maxHeight: 180 }}
                  />
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoFileChange}
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 flex flex-col items-center gap-2 text-gray-400 text-sm cursor-pointer hover:border-green-400 transition-colors disabled:opacity-60"
                >
                  <Play size={22} />
                  {uploadingVideo
                    ? 'Uploading video...'
                    : selectedExercise.video_url
                    ? 'Click to replace video'
                    : 'Click to upload video'}
                </button>
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