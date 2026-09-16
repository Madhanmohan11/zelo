import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Moon,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  Target,
  Clock,
  Sparkles,
  X,
  Smile,
  AlertCircle
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getSleepLogs,
  addSleepLog,
  deleteSleepLog,
  updateSleepLog,
  getSleepTarget,
  saveSleepTarget
} from '../services/dataService'

export const SleepPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [targetHours, setTargetHours] = useState(8.0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTargetModal, setShowTargetModal] = useState(false)

  // Form states
  const [sleepDate, setSleepDate] = useState(new Date().toISOString().split('T')[0])
  const [bedtime, setBedtime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality, setQuality] = useState('Good')
  const [notes, setNotes] = useState('')
  const [newTargetInput, setNewTargetInput] = useState('8.0')

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [sleepLogs, userTarget] = await Promise.all([
        getSleepLogs(user.id),
        getSleepTarget(user.id)
      ])
      setLogs(sleepLogs || [])
      setTargetHours(userTarget || 8.0)
      setNewTargetInput(String(userTarget || 8.0))
    } catch (e) {
      console.error('Failed to load sleep logs:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  // Helper to calculate sleep duration in hours from bedtime and wake_time strings
  const calculateDurationHours = (bedStr, wakeStr) => {
    if (!bedStr || !wakeStr) return 8.0
    const [bH, bM] = bedStr.split(':').map(Number)
    const [wH, wM] = wakeStr.split(':').map(Number)

    let bedMin = bH * 60 + bM
    let wakeMin = wH * 60 + wM

    // If wake time is earlier than bedtime, it crossed midnight!
    if (wakeMin <= bedMin) {
      wakeMin += 24 * 60
    }

    const diffMin = wakeMin - bedMin
    return Math.round((diffMin / 60) * 10) / 10
  }

  const latestLog = logs.length > 0 ? logs[0] : null
  const calculatedDuration = calculateDurationHours(bedtime, wakeTime)

  const handleAddSleep = async (e) => {
    e.preventDefault()
    if (!user) return

    const dur = calculateDurationHours(bedtime, wakeTime)

    try {
      await addSleepLog(user.id, {
        sleep_date: sleepDate,
        bedtime,
        wake_time: wakeTime,
        duration_hours: dur,
        quality,
        notes
      })
      showToast(`Saved sleep record (${dur} hrs)!`, 'success')
      setShowAddModal(false)
      setNotes('')
      loadData()
    } catch (err) {
      showToast('Failed to save sleep log', 'error')
    }
  }

  const handleDeleteLog = async (logId) => {
    if (!user) return
    try {
      await deleteSleepLog(user.id, logId)
      showToast('Sleep log removed', 'success')
      loadData()
    } catch (err) {
      showToast('Failed to delete sleep log', 'error')
    }
  }

  const handleSaveTarget = async (e) => {
    e.preventDefault()
    if (!user) return
    const newTarget = parseFloat(newTargetInput)
    if (isNaN(newTarget) || newTarget < 4 || newTarget > 14) {
      showToast('Please enter a target between 4 and 14 hours', 'error')
      return
    }

    try {
      await saveSleepTarget(user.id, newTarget)
      setTargetHours(newTarget)
      setShowTargetModal(false)
      showToast('Sleep target updated!', 'success')
    } catch (e) {
      showToast('Failed to update target', 'error')
    }
  }

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
              <Moon className="w-5 h-5 text-violet-600 fill-violet-600" />
              Sleep Tracker
            </h1>
            <p className="text-xs font-semibold text-slate-500">Monitor sleep duration & quality</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowTargetModal(true)}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold border-slate-200 text-violet-700 hover:bg-violet-50"
          >
            <Target className="w-3.5 h-3.5 mr-1 text-violet-600" />
            Target: {targetHours}h
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Log Sleep
          </Button>
        </div>
      </div>

      {/* LAST NIGHT SLEEP HERO CARD */}
      <Card className="p-6 bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-lg border border-violet-700/30 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-violet-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Last Night's Rest
          </span>
          <span className="text-xs font-bold text-violet-200">
            Target: {targetHours}h
          </span>
        </div>

        {latestLog ? (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black text-white tracking-tight">
                {latestLog.duration_hours || 7.5} <span className="text-xl font-bold text-violet-300">hrs</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/30 border border-violet-400/30 text-xs font-extrabold text-violet-200">
                {latestLog.quality || 'Good'} Quality
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-violet-800/80">
              <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10">
                <span className="text-[10px] text-violet-300 font-bold block uppercase">Bedtime</span>
                <span className="text-xs font-black text-white">{latestLog.bedtime || '11:00 PM'}</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10">
                <span className="text-[10px] text-violet-300 font-bold block uppercase">Wake Up</span>
                <span className="text-xs font-black text-white">{latestLog.wake_time || '06:30 AM'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-2">
            <Moon className="w-8 h-8 text-violet-400 mx-auto opacity-75" />
            <p className="text-xs font-bold text-violet-200">No sleep logged for last night yet</p>
            <p className="text-[11px] text-violet-300/80">Tap "Log Sleep" to record your rest.</p>
          </div>
        )}
      </Card>

      {/* RECENT SLEEP HISTORY */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
          Recent Sleep History ({logs.length})
        </h3>

        {logs.length === 0 ? (
          <Card className="p-6 bg-white border border-slate-200/80 rounded-3xl text-center space-y-2">
            <Moon className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-extrabold text-slate-700">No sleep records found</p>
            <p className="text-[11px] text-slate-500">Record your sleep daily to track your rest trends.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card
                key={log.id}
                className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
                    <Moon className="w-4 h-4 fill-violet-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900">
                        {log.duration_hours} hrs sleep
                      </h4>
                      <span className="text-[9px] font-extrabold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                        {log.quality || 'Good'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {log.sleep_date} • {log.bedtime} to {log.wake_time}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteLog(log.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ADD SLEEP LOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Moon className="w-4 h-4 text-violet-600 fill-violet-600" />
                Record Sleep Session
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSleep} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Sleep Date</label>
                <input
                  type="date"
                  required
                  value={sleepDate}
                  onChange={(e) => setSleepDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Bedtime</label>
                  <input
                    type="time"
                    required
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Wake Up Time</label>
                  <input
                    type="time"
                    required
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-semibold"
                  />
                </div>
              </div>

              {/* Duration Preview */}
              <div className="p-2.5 bg-violet-50 border border-violet-200 rounded-xl text-center">
                <span className="text-[11px] font-bold text-violet-700">
                  Calculated Duration: <strong className="text-violet-950">{calculatedDuration} hours</strong>
                </span>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Sleep Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-semibold"
                >
                  <option value="Excellent">Excellent 😊</option>
                  <option value="Good">Good 🙂</option>
                  <option value="Fair">Fair 😐</option>
                  <option value="Poor">Poor 😴</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Felt well-rested, no interruptions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-semibold resize-none"
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
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Record
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TARGET MODAL */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-600" />
                Set Preferred Sleep Target
              </h3>
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Target Hours per Night</label>
                <input
                  type="number"
                  required
                  min="4"
                  max="14"
                  step="0.5"
                  value={newTargetInput}
                  onChange={(e) => setNewTargetInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-extrabold text-slate-900 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTargetModal(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Target
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
