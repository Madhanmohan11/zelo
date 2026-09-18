import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target,
  Plus,
  Trash2,
  Edit3,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Tag,
  TrendingUp,
  AlertCircle,
  PauseCircle,
  PlayCircle
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
} from '../services/dataService'

const CATEGORIES = ['Personal', 'Financial', 'Health', 'Career', 'Learning', 'Other']
const STATUSES = ['In Progress', 'Not Started', 'Completed', 'Paused']

export const GoalsPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState([])
  const [activeTab, setActiveTab] = useState('Active') // 'Active' | 'Completed' | 'Overdue' | 'All'
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Personal')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [targetDate, setTargetDate] = useState('')
  const [progressPct, setProgressPct] = useState(0)
  const [status, setStatus] = useState('In Progress')

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const userGoals = await getGoals(user.id)
      setGoals(userGoals || [])
    } catch (e) {
      console.error('Failed to load goals:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const todayStr = new Date().toISOString().split('T')[0]

  // Categorize goals
  const activeGoals = useMemo(() => {
    return goals.filter((g) => g.status !== 'Completed')
  }, [goals])

  const completedGoals = useMemo(() => {
    return goals.filter((g) => g.status === 'Completed' || g.progress_percentage >= 100)
  }, [goals])

  const overdueGoals = useMemo(() => {
    return goals.filter((g) => g.target_date && g.target_date < todayStr && g.status !== 'Completed')
  }, [goals, todayStr])

  const overallAvgProgress = useMemo(() => {
    if (goals.length === 0) return 0
    const total = goals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0)
    return Math.round(total / goals.length)
  }, [goals])

  const openCreateModal = () => {
    setEditingGoal(null)
    setTitle('')
    setDescription('')
    setCategory('Personal')
    setStartDate(todayStr)
    setTargetDate('')
    setProgressPct(0)
    setStatus('In Progress')
    setShowAddModal(true)
  }

  const openEditModal = (goal) => {
    setEditingGoal(goal)
    setTitle(goal.title || '')
    setDescription(goal.description || '')
    setCategory(goal.category || 'Personal')
    setStartDate(goal.start_date || todayStr)
    setTargetDate(goal.target_date || '')
    setProgressPct(goal.progress_percentage || 0)
    setStatus(goal.status || 'In Progress')
    setShowAddModal(true)
  }

  const handleSaveGoal = async (e) => {
    e.preventDefault()
    if (!user || !title.trim()) return

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      start_date: startDate,
      target_date: targetDate || null,
      progress_percentage: parseInt(progressPct),
      status: parseInt(progressPct) >= 100 ? 'Completed' : status
    }

    try {
      if (editingGoal) {
        await updateGoal(user.id, editingGoal.id, payload)
        showToast(`Updated "${title}"!`, 'success')
      } else {
        await createGoal(user.id, payload)
        showToast(`Created new goal "${title}"!`, 'success')
      }
      setShowAddModal(false)
      loadData()
    } catch (err) {
      showToast('Failed to save goal', 'error')
    }
  }

  const handleUpdateProgress = async (goal, newPct) => {
    if (!user) return
    const pct = Math.min(Math.max(parseInt(newPct), 0), 100)
    try {
      await updateGoal(user.id, goal.id, { progress_percentage: pct })
      loadData()
    } catch (err) {
      showToast('Failed to update progress', 'error')
    }
  }

  const handleDeleteGoal = async (goalId) => {
    if (!user) return
    try {
      await deleteGoal(user.id, goalId)
      showToast('Goal removed', 'success')
      loadData()
    } catch (err) {
      showToast('Failed to delete goal', 'error')
    }
  }

  const displayedGoals = useMemo(() => {
    if (activeTab === 'Active') return activeGoals
    if (activeTab === 'Completed') return completedGoals
    if (activeTab === 'Overdue') return overdueGoals
    return goals
  }, [activeTab, activeGoals, completedGoals, overdueGoals, goals])

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300 max-w-2xl mx-auto px-4 sm:px-0 pt-2">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
              My Goals
            </h1>
            <p className="text-xs font-semibold text-slate-500">Track and achieve life milestones</p>
          </div>
        </div>

        <Button
          onClick={openCreateModal}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Create Goal
        </Button>
      </div>

      {/* OVERALL PROGRESS SUMMARY HERO CARD */}
      <Card className="p-5 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-3xl shadow-lg border border-emerald-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Overall Goal Progress
          </span>
          <span className="text-xs font-bold text-emerald-100">
            {completedGoals.length} / {goals.length} Completed
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              {overallAvgProgress}% <span className="text-sm font-bold text-emerald-200">Average Completion</span>
            </h2>
            <p className="text-xs font-semibold text-emerald-100/90 mt-0.5">
              {activeGoals.length} Active • {overdueGoals.length} Overdue
            </p>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
            <TrendingUp className="w-6 h-6 text-emerald-200" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-emerald-950/50 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${overallAvgProgress}%` }}
          />
        </div>
      </Card>

      {/* FILTER TABS */}
      <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-extrabold text-slate-600 overflow-x-auto scrollbar-none">
        {[
          { id: 'Active', label: `Active (${activeGoals.length})` },
          { id: 'Completed', label: `Completed (${completedGoals.length})` },
          { id: 'Overdue', label: `Overdue (${overdueGoals.length})` },
          { id: 'All', label: `All Goals (${goals.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-emerald-950 shadow-2xs font-black border border-slate-200/60'
                : 'hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* GOALS LIST */}
      <div className="space-y-3">
        {displayedGoals.length === 0 ? (
          <Card className="p-6 bg-white border border-slate-200/80 rounded-3xl text-center space-y-2">
            <Target className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-extrabold text-slate-700">No goals found for "{activeTab}"</p>
            <p className="text-[11px] text-slate-500">Tap "+ Create Goal" above to add a new goal.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {displayedGoals.map((goal) => {
              const isOverdue = goal.target_date && goal.target_date < todayStr && goal.status !== 'Completed'
              const isCompleted = goal.status === 'Completed' || goal.progress_percentage >= 100

              return (
                <Card
                  key={goal.id}
                  className="p-4 bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-2xs hover:border-emerald-300 transition-all"
                >
                  {/* Goal Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">{goal.title}</h3>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {goal.category || 'Personal'}
                        </span>
                        {isCompleted && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Done
                          </span>
                        )}
                        {isOverdue && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                            Overdue
                          </span>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-2">{goal.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(goal)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Edit goal"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Goal Meta info */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 border-t border-slate-100 pt-2">
                    <span>Target: {goal.target_date || 'No target date'}</span>
                    <span className="font-extrabold text-emerald-800">{goal.progress_percentage || 0}% Complete</span>
                  </div>

                  {/* Progress Bar & Slider */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-teal-600'
                        }`}
                        style={{ width: `${Math.min(goal.progress_percentage || 0, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={goal.progress_percentage || 0}
                        onChange={(e) => handleUpdateProgress(goal, e.target.value)}
                        className="w-full accent-emerald-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] font-black text-slate-600 shrink-0">
                        Drag to update
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT GOAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Card className="w-full max-w-md bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl p-5 space-y-4 shadow-xl animate-in zoom-in-95 h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-y-auto pb-16 sm:pb-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Save ₹1,00,000, Learn React Native"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your motivation and milestones..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-extrabold text-slate-700">Progress Percentage</label>
                  <span className="font-black text-emerald-700">{progressPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressPct}
                  onChange={(e) => setProgressPct(e.target.value)}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  {editingGoal ? 'Update Goal' : 'Save Goal'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
