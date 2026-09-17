import React, { useState, useEffect, useCallback } from 'react'
import { CheckSquare, Plus, CheckCircle2, Clock, Calendar, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getTasks, createTask, updateTask, deleteTask } from '../services/dataService'

export const TasksPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('today') // 'today', 'upcoming', 'completed', 'all'
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [category, setCategory] = useState('General')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueTime, setDueTime] = useState('18:00')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete Confirm Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingTaskId, setDeletingTaskId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const openDeleteModal = (taskId) => {
    setDeletingTaskId(taskId)
    setIsDeleteModalOpen(true)
  }

  const handleExecuteDelete = async () => {
    if (!deletingTaskId || !user) return
    setIsDeleting(true)
    try {
      await deleteTask(user.id, deletingTaskId)
      setTasks((prev) => prev.filter((t) => t.id !== deletingTaskId))
      window.dispatchEvent(new Event('zelo_data_updated'))
      showToast('Task deleted', 'info')
      setIsDeleteModalOpen(false)
      setDeletingTaskId(null)
    } catch (e) {
      showToast('Failed to delete task', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const loadTasks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getTasks(user.id)
      setTasks(data || [])
    } catch (err) {
      showToast('Failed to load tasks', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, showToast])

  useEffect(() => {
    loadTasks()

    const handleUpdate = () => loadTasks()
    window.addEventListener('zelo_data_updated', handleUpdate)
    return () => window.removeEventListener('zelo_data_updated', handleUpdate)
  }, [loadTasks])

  const openAddModal = () => {
    setEditingTask(null)
    setTitle('')
    setDescription('')
    setPriority('normal')
    setDueDate(new Date().toISOString().split('T')[0])
    setDueTime('')
    setIsModalOpen(true)
  }

  const openEditModal = (task) => {
    setEditingTask(task)
    setTitle(task.title || '')
    setDescription(task.description || '')
    setPriority(task.priority || 'normal')
    setDueDate(task.due_date || '')
    setDueTime(task.due_time || '')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    if (!title.trim()) {
      showToast('Please enter a task title', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingTask) {
        await updateTask(user.id, editingTask.id, {
          title: title.trim(),
          description: description.trim(),
          priority,
          due_date: dueDate || null,
          due_time: dueTime || null
        })
        showToast('Task updated', 'success')
      } else {
        await createTask(user.id, {
          title: title.trim(),
          description: description.trim(),
          priority,
          due_date: dueDate || null,
          due_time: dueTime || null
        })
        showToast('Task created', 'success')
      }
      setIsModalOpen(false)
      window.dispatchEvent(new Event('zelo_data_updated'))
      loadTasks()
    } catch (err) {
      showToast(err.message || 'Failed to save task', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await updateTask(user.id, task.id, { status: nextStatus })
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      )
      window.dispatchEvent(new Event('zelo_data_updated'))
      showToast(
        nextStatus === 'completed' ? 'Task marked as completed! 🎉' : 'Task reopened',
        'success'
      )
    } catch (e) {
      showToast('Failed to update task status', 'error')
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'completed') return t.status === 'completed'
    if (statusFilter === 'upcoming') return t.status !== 'completed' && t.due_date && t.due_date > todayStr
    if (statusFilter === 'today') {
      return t.status !== 'completed' && (!t.due_date || t.due_date <= todayStr)
    }
    return true
  })

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            <span>Tasks</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Manage your daily to-do items, priorities, and action list
          </p>
        </div>

        <Button onClick={openAddModal} variant="primary" icon={Plus}>
          Add Task
        </Button>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto hide-scrollbar">
        {[
          { id: 'today', label: "Today's Tasks" },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'all', label: 'All Tasks' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-blue-100 text-blue-900 border border-blue-300/60 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TASKS LIST */}
      {loading ? (
        <LoadingState message="Fetching your tasks..." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={
            statusFilter !== 'all'
              ? `No tasks found under category: ${statusFilter}`
              : 'Add your daily action items and stay organized.'
          }
          actionLabel="Add Task"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed'

            return (
              <Card
                key={task.id}
                className={`p-4 transition-all rounded-2xl flex items-start justify-between gap-3 border ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                    : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* COMPLETION CHECKBOX */}
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(task)}
                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 hover:border-blue-500 bg-white'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm font-extrabold ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.priority && (
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p
                        className={`text-xs mt-1 ${
                          isCompleted ? 'text-slate-400' : 'text-slate-600 font-medium'
                        }`}
                      >
                        {task.description}
                      </p>
                    )}

                    {/* DUE DATE & TIME */}
                    {(task.due_date || task.due_time) && (
                      <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-slate-400">
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            {task.due_date}
                          </span>
                        )}
                        {task.due_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {task.due_time}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* EDIT & DELETE ACTIONS */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(task)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(task.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingTaskId(null)
        }}
        onConfirm={handleExecuteDelete}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        isLoading={isDeleting}
      />

      {/* ADD / EDIT TASK MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title *"
            placeholder="e.g. Finish project proposal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Description / Notes"
            placeholder="e.g. Review budget numbers and send PDF"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ]}
            />

            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <Input
            label="Due Time"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
              {editingTask ? 'Update Task' : 'Save Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TasksPage
