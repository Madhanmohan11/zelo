import React, { useState, useEffect, useCallback } from 'react'
import { Utensils, Plus, Clock, CheckCircle2, XCircle, Trash2, Edit2 } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getMeals, createMeal, updateMeal, deleteMeal } from '../services/dataService'

export const FoodPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'pending', 'completed'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [title, setTitle] = useState('')
  const [mealType, setMealType] = useState('breakfast')
  const [scheduledTime, setScheduledTime] = useState('08:30')
  const [description, setDescription] = useState('')
  const [calories, setCalories] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete Confirm Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingMealId, setDeletingMealId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const openDeleteModal = (mealId) => {
    setDeletingMealId(mealId)
    setIsDeleteModalOpen(true)
  }

  const handleExecuteDelete = async () => {
    if (!deletingMealId || !user) return
    setIsDeleting(true)
    try {
      await deleteMeal(user.id, deletingMealId)
      setMeals((prev) => prev.filter((m) => m.id !== deletingMealId))
      showToast('Meal deleted', 'info')
      setIsDeleteModalOpen(false)
      setDeletingMealId(null)
    } catch (e) {
      showToast('Failed to delete meal', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const loadMeals = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getMeals(user.id, selectedDate)
      setMeals(data)
    } catch (err) {
      showToast('Failed to load meals', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, selectedDate, showToast])

  useEffect(() => {
    loadMeals()
  }, [loadMeals])

  const openAddModal = () => {
    setEditingMeal(null)
    setTitle('')
    setMealType('breakfast')
    setScheduledTime('08:30')
    setDescription('')
    setCalories('')
    setIsModalOpen(true)
  }

  const openEditModal = (meal) => {
    setEditingMeal(meal)
    setTitle(meal.title)
    setMealType(meal.meal_type)
    setScheduledTime(meal.scheduled_time || '12:00')
    setDescription(meal.description || '')
    setCalories(meal.calories ? String(meal.calories) : '')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      showToast('Please enter a meal title', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingMeal) {
        await updateMeal(user.id, editingMeal.id, {
          title,
          meal_type: mealType,
          scheduled_time: scheduledTime,
          description,
          calories: calories ? parseInt(calories) : null
        })
        showToast('Meal updated successfully', 'success')
      } else {
        await createMeal(user.id, {
          title,
          meal_type: mealType,
          scheduled_time: scheduledTime,
          scheduled_date: selectedDate,
          description,
          calories: calories ? parseInt(calories) : null
        })
        showToast('Meal added successfully', 'success')
      }
      setIsModalOpen(false)
      loadMeals()
    } catch (err) {
      showToast(err.message || 'Failed to save meal', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (meal, status) => {
    try {
      await updateMeal(user.id, meal.id, { status })
      setMeals(prev => prev.map(m => m.id === meal.id ? { ...m, status } : m))
      showToast(`Marked as ${status}`, 'success')
    } catch (e) {
      showToast('Failed to update status', 'error')
    }
  }

  const filteredMeals = meals.filter(m => {
    if (activeTab === 'pending') return m.status === 'pending'
    if (activeTab === 'completed') return m.status === 'completed'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-600" />
            <span>Food Schedule & Tracker</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Plan and track your daily meals & diet</p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="py-2 text-xs"
          />
          <Button onClick={openAddModal} variant="primary" icon={Plus}>
            Add Meal
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        {['all', 'pending', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab
                ? 'bg-amber-100 text-amber-900 border border-amber-300/60 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Meals Content */}
      {loading ? (
        <LoadingState message="Fetching meals..." />
      ) : filteredMeals.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No meals found"
          description={`No ${activeTab !== 'all' ? activeTab : ''} meals for ${selectedDate}`}
          actionLabel="Add Meal"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeals.map((meal) => (
            <Card key={meal.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">
                      {meal.meal_type?.replace('_', ' ')}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900">{meal.title}</h3>
                  </div>
                  <Badge status={meal.status} />
                </div>

                {meal.description && (
                  <p className="text-xs font-medium text-slate-500 mb-3">{meal.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {meal.scheduled_time || 'Not set'}
                  </span>
                  {meal.calories && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700">
                      {meal.calories} kcal
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStatusChange(meal, 'completed')}
                    title="Mark Completed"
                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                      meal.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Done</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(meal, 'skipped')}
                    title="Mark Skipped"
                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                      meal.status === 'skipped'
                        ? 'bg-slate-200 text-slate-700'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Skip</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(meal)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(meal.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Meal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMeal ? 'Edit Meal' : 'Add New Meal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Meal Title"
            placeholder="e.g. Grilled Chicken Salad"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Meal Type"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              options={[
                { value: 'breakfast', label: 'Breakfast' },
                { value: 'morning_snack', label: 'Morning Snack' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'evening_snack', label: 'Evening Snack' },
                { value: 'dinner', label: 'Dinner' }
              ]}
            />

            <Input
              label="Time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <Input
            label="Calories (Optional)"
            type="number"
            placeholder="e.g. 450"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />

          <Input
            label="Notes / Description"
            placeholder="e.g. Extra olive oil dressing"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
              {editingMeal ? 'Update Meal' : 'Create Meal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingMealId(null)
        }}
        onConfirm={handleExecuteDelete}
        title="Delete Meal Log?"
        message="Are you sure you want to delete this meal log? This action cannot be undone."
        confirmText="Delete Meal"
        isLoading={isDeleting}
      />
    </div>
  )
}
