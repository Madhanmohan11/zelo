import React, { useState, useEffect, useCallback } from 'react'
import { Dumbbell, Plus, Clock, CheckCircle2, Trash2, Edit2, PlusCircle, MinusCircle } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getWorkouts, createWorkout, updateWorkout, deleteWorkout } from '../services/dataService'

export const WorkoutPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState(null)
  const [title, setTitle] = useState('')
  const [scheduledTime, setScheduledTime] = useState('18:00')
  const [durationMinutes, setDurationMinutes] = useState(45)
  const [description, setDescription] = useState('')
  const [exercises, setExercises] = useState([
    { name: 'Bench Press', sets: 4, reps: 10, weight_kg: 60 }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadWorkouts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getWorkouts(user.id, selectedDate)
      setWorkouts(data)
    } catch (err) {
      showToast('Failed to load workouts', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, selectedDate, showToast])

  useEffect(() => {
    loadWorkouts()
  }, [loadWorkouts])

  const openAddModal = () => {
    setEditingWorkout(null)
    setTitle('')
    setScheduledTime('18:00')
    setDurationMinutes(45)
    setDescription('')
    setExercises([{ name: '', sets: 3, reps: 10, weight_kg: 0 }])
    setIsModalOpen(true)
  }

  const handleAddExerciseRow = () => {
    setExercises(prev => [...prev, { name: '', sets: 3, reps: 10, weight_kg: 0 }])
  }

  const handleRemoveExerciseRow = (index) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  const handleExerciseChange = (index, field, value) => {
    const next = [...exercises]
    next[index][field] = value
    setExercises(next)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      showToast('Please enter a workout title', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const validExercises = exercises.filter(e => e.name.trim() !== '')

      if (editingWorkout) {
        await updateWorkout(user.id, editingWorkout.id, {
          title,
          scheduled_time: scheduledTime,
          duration_minutes: durationMinutes,
          description
        })
        showToast('Workout updated', 'success')
      } else {
        await createWorkout(
          user.id,
          {
            title,
            scheduled_time: scheduledTime,
            scheduled_date: selectedDate,
            duration_minutes: durationMinutes,
            description
          },
          validExercises
        )
        showToast('Workout scheduled successfully', 'success')
      }

      setIsModalOpen(false)
      loadWorkouts()
    } catch (err) {
      showToast(err.message || 'Failed to save workout', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (workout, status) => {
    try {
      await updateWorkout(user.id, workout.id, { status })
      setWorkouts(prev => prev.map(w => w.id === workout.id ? { ...w, status } : w))
      showToast(`Workout marked as ${status}`, 'success')
    } catch (e) {
      showToast('Failed to update status', 'error')
    }
  }

  // Delete Confirm Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingWorkoutId, setDeletingWorkoutId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const openDeleteModal = (workoutId) => {
    setDeletingWorkoutId(workoutId)
    setIsDeleteModalOpen(true)
  }

  const handleExecuteDelete = async () => {
    if (!deletingWorkoutId || !user) return
    setIsDeleting(true)
    try {
      await deleteWorkout(user.id, deletingWorkoutId)
      setWorkouts(prev => prev.filter(w => w.id !== deletingWorkoutId))
      showToast('Workout deleted', 'info')
      setIsDeleteModalOpen(false)
      setDeletingWorkoutId(null)
    } catch (e) {
      showToast('Failed to delete workout', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-rose-600" />
            <span>Workout Planner & Tracker</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Design routines, track sets, reps & weight</p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="py-2 text-xs"
          />
          <Button onClick={openAddModal} variant="primary" icon={Plus}>
            New Workout
          </Button>
        </div>
      </div>

      {/* Workouts Grid */}
      {loading ? (
        <LoadingState message="Fetching workout schedule..." />
      ) : workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts for this date"
          description={`No workouts logged for ${selectedDate}`}
          actionLabel="Add Workout"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map((workout) => (
            <Card key={workout.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{workout.title}</h3>
                    <div className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{workout.scheduled_time || '18:00'}</span>
                      <span>•</span>
                      <span>{workout.duration_minutes || 45} mins</span>
                    </div>
                  </div>
                  <Badge status={workout.status} />
                </div>

                {workout.description && (
                  <p className="text-xs font-medium text-slate-500 mb-3">{workout.description}</p>
                )}

                {/* Exercises list */}
                {workout.workout_exercises && workout.workout_exercises.length > 0 && (
                  <div className="my-3 space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Exercises ({workout.workout_exercises.length})
                    </span>
                    {workout.workout_exercises.map((ex) => (
                      <div key={ex.id} className="flex items-center justify-between text-xs font-semibold text-slate-800">
                        <span>{ex.name}</span>
                        <span className="text-slate-500 font-mono">
                          {ex.sets} × {ex.reps} {ex.weight_kg ? `@ ${ex.weight_kg}kg` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
                <button
                  onClick={() =>
                    handleStatusChange(
                      workout,
                      workout.status === 'completed' ? 'planned' : 'completed'
                    )
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    workout.status === 'completed'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{workout.status === 'completed' ? 'Completed' : 'Mark Complete'}</span>
                </button>

                <button
                  onClick={() => openDeleteModal(workout.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingWorkoutId(null)
        }}
        onConfirm={handleExecuteDelete}
        title="Delete Workout Session?"
        message="Are you sure you want to delete this workout session? This action cannot be undone."
        confirmText="Delete Workout"
        isLoading={isDeleting}
      />

      {/* Add Workout Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorkout ? 'Edit Workout Routine' : 'Log Workout Session'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Workout Session Name"
            placeholder="e.g. Upper Body Hypertrophy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Scheduled Time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Exercises & Targets
              </span>
              <button
                type="button"
                onClick={handleAddExerciseRow}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Exercise</span>
              </button>
            </div>

            {exercises.map((ex, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <input
                  type="text"
                  placeholder="Exercise Name"
                  value={ex.name}
                  onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                  className="flex-1 bg-transparent text-xs text-slate-900 font-bold focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Sets"
                  value={ex.sets}
                  onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)}
                  className="w-12 bg-white px-1.5 py-1 text-center text-xs text-slate-900 rounded-lg border border-slate-200 font-bold"
                />
                <span className="text-xs text-slate-400">×</span>
                <input
                  type="number"
                  placeholder="Reps"
                  value={ex.reps}
                  onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                  className="w-12 bg-white px-1.5 py-1 text-center text-xs text-slate-900 rounded-lg border border-slate-200 font-bold"
                />
                <input
                  type="number"
                  placeholder="Kg"
                  value={ex.weight_kg}
                  onChange={(e) => handleExerciseChange(idx, 'weight_kg', e.target.value)}
                  className="w-14 bg-white px-1.5 py-1 text-center text-xs text-slate-900 rounded-lg border border-slate-200 font-bold"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExerciseRow(idx)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <MinusCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
              Save Workout
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
