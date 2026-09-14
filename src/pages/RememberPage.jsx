import React, { useState, useEffect, useCallback } from 'react'
import { Bookmark, Plus, CheckCircle2, RotateCcw, Trash2, Edit2, MapPin } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getRememberItems, createRememberItem, updateRememberItem, deleteRememberItem } from '../services/dataService'

export const RememberPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'waiting', 'ready', 'collected', 'overdue'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('waiting')
  const [givenDate, setGivenDate] = useState(new Date().toISOString().split('T')[0])
  const [expectedDate, setExpectedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadItems = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getRememberItems(user.id)
      setItems(data)
    } catch (err) {
      showToast('Failed to load remember items', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, showToast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const openAddModal = () => {
    setEditingItem(null)
    setTitle('')
    setLocation('')
    setStatus('waiting')
    setGivenDate(new Date().toISOString().split('T')[0])
    setExpectedDate('')
    setNotes('')
    setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setTitle(item.title)
    setLocation(item.location || '')
    setStatus(item.status || 'waiting')
    setGivenDate(item.given_date || new Date().toISOString().split('T')[0])
    setExpectedDate(item.expected_date || '')
    setNotes(item.notes || '')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      showToast('Please enter an item title', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingItem) {
        await updateRememberItem(user.id, editingItem.id, {
          title,
          location,
          status,
          given_date: givenDate,
          expected_date: expectedDate || null,
          notes
        })
        showToast('Remember item updated', 'success')
      } else {
        await createRememberItem(user.id, {
          title,
          location,
          status,
          given_date: givenDate,
          expected_date: expectedDate || null,
          notes
        })
        showToast('Remember item added', 'success')
      }
      setIsModalOpen(false)
      loadItems()
    } catch (err) {
      showToast(err.message || 'Failed to save item', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await updateRememberItem(user.id, itemId, { status: newStatus })
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: newStatus } : i))
      showToast(`Status updated to ${newStatus}`, 'success')
    } catch (e) {
      showToast('Failed to update status', 'error')
    }
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this remember item?')) return
    try {
      await deleteRememberItem(user.id, itemId)
      setItems(prev => prev.filter(i => i.id !== itemId))
      showToast('Item deleted', 'info')
    } catch (e) {
      showToast('Failed to delete item', 'error')
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const filteredItems = items.filter(item => {
    const isOverdue = item.expected_date && item.expected_date < todayStr && ['waiting', 'ready'].includes(item.status)
    if (statusFilter === 'overdue') return isOverdue
    if (statusFilter === 'waiting') return item.status === 'waiting'
    if (statusFilter === 'ready') return item.status === 'ready'
    if (statusFilter === 'collected') return ['collected', 'returned'].includes(item.status)
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-purple-600" />
            <span>Remember Hub</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Track clothes given for ironing/laundry, items sent for repair, lent objects, or online pickups
          </p>
        </div>

        <Button onClick={openAddModal} variant="primary" icon={Plus}>
          Remember Something
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto hide-scrollbar">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'waiting', label: 'Waiting' },
          { id: 'ready', label: 'Ready' },
          { id: 'collected', label: 'Collected / Returned' },
          { id: 'overdue', label: 'Overdue' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? 'bg-purple-100 text-purple-900 border border-purple-300/60 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      {loading ? (
        <LoadingState message="Fetching remember items..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No remember items"
          description={
            statusFilter !== 'all'
              ? `No items found under status: ${statusFilter}`
              : 'Keep track of items you give to others or leave for repair/laundry.'
          }
          actionLabel="Add Item"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isOverdue =
              item.expected_date &&
              item.expected_date < todayStr &&
              ['waiting', 'ready'].includes(item.status)

            return (
              <Card key={item.id} className="flex flex-col justify-between relative">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-[10px] font-extrabold text-purple-700 uppercase tracking-widest">
                        REMEMBER
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900">{item.title}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge status={isOverdue ? 'overdue' : item.status}>
                        {isOverdue ? 'Overdue' : item.status}
                      </Badge>
                    </div>
                  </div>

                  {item.location && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-3">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Given Date</span>
                      <span className="text-slate-800 font-bold">{item.given_date || 'Today'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Expected Collection</span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-600 font-extrabold' : 'text-slate-800'}`}>
                        {item.expected_date || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs font-medium text-slate-500 italic mb-3">"{item.notes}"</p>
                  )}
                </div>

                {/* Quick Status Action Toolbar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-1">
                    {item.status !== 'collected' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'collected')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Collected</span>
                      </button>
                    )}

                    {item.status === 'collected' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'waiting')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add / Edit Remember Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Remember Item' : 'Remember Something'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="What did you give / leave?"
            placeholder="e.g. 2 shirts for ironing / Laptop at service center"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Location / Person Name"
            placeholder="e.g. Ironing shop near corner / Rajesh"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Current Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'waiting', label: 'Waiting' },
                { value: 'ready', label: 'Ready for Collection' },
                { value: 'collected', label: 'Collected' },
                { value: 'returned', label: 'Returned' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />

            <Input
              label="Given Date"
              type="date"
              value={givenDate}
              onChange={(e) => setGivenDate(e.target.value)}
            />
          </div>

          <Input
            label="Expected Collection / Return Date"
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
          />

          <Input
            label="Notes / Instructions"
            placeholder="e.g. Starch shirts, collect receipt"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
              {editingItem ? 'Update Item' : 'Save Remember Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
