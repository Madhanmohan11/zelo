import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Droplet,
  Plus,
  Trash2,
  ArrowLeft,
  Target,
  X,
  Clock,
  CheckCircle2,
  Check
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useDashboard } from '../context/DashboardContext'
import {
  getWaterLogs,
  addWaterLog,
  deleteWaterLog,
  getWaterTarget,
  saveWaterTarget
} from '../services/dataService'

export const WaterPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const dashboard = useDashboard()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [targetMl, setTargetMl] = useState(2500)

  // Modals
  const [showAddWaterModal, setShowAddWaterModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showTargetModal, setShowTargetModal] = useState(false)

  // Modal State
  const [selectedPreset, setSelectedPreset] = useState(250) // 250 | 500 | 750 | 'custom'
  const [customAmount, setCustomAmount] = useState('250')
  const [quickNote, setQuickNote] = useState('')
  const [lastAddedMl, setLastAddedMl] = useState(250)
  const [newTargetInput, setNewTargetInput] = useState('2500')

  const todayStr = new Date().toISOString().split('T')[0]

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [todayLogs, userTarget] = await Promise.all([
        getWaterLogs(user.id, todayStr),
        getWaterTarget(user.id)
      ])
      setLogs(todayLogs || [])
      setTargetMl(userTarget || 2500)
      setNewTargetInput(String(userTarget || 2500))
    } catch (e) {
      console.error('Failed to load water logs:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const totalIntakeMl = logs.reduce((sum, log) => sum + (parseInt(log.amount_ml) || 0), 0)
  const progressRatio = Math.min(totalIntakeMl / targetMl, 1)
  const remainingMl = Math.max(targetMl - totalIntakeMl, 0)
  const isGoalAchieved = totalIntakeMl >= targetMl

  // Primary Add Water Handler
  const handleAddWaterSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    let amt = selectedPreset === 'custom' ? parseInt(customAmount) : parseInt(selectedPreset)
    if (isNaN(amt) || amt <= 0) return

    try {
      await addWaterLog(user.id, {
        amount_ml: amt,
        logged_date: todayStr,
        notes: quickNote
      })

      setLastAddedMl(amt)
      setShowAddWaterModal(false)
      setShowSuccessModal(true)
      setQuickNote('')

      loadData()
      if (dashboard?.refreshWaterSummary) {
        dashboard.refreshWaterSummary()
      }
    } catch (err) {
      showToast('Failed to add water log', 'error')
    }
  }

  // Quick Direct Add Handler
  const handleQuickAdd = async (amt) => {
    if (!user) return
    try {
      await addWaterLog(user.id, {
        amount_ml: amt,
        logged_date: todayStr
      })
      setLastAddedMl(amt)
      setShowSuccessModal(true)
      loadData()
      if (dashboard?.refreshWaterSummary) {
        dashboard.refreshWaterSummary()
      }
    } catch (err) {
      showToast('Failed to add water log', 'error')
    }
  }

  const handleDeleteLog = async (logId) => {
    if (!user) return
    try {
      await deleteWaterLog(user.id, logId)
      showToast('Water log removed', 'success')
      loadData()
      if (dashboard?.refreshWaterSummary) {
        dashboard.refreshWaterSummary()
      }
    } catch (err) {
      showToast('Failed to delete water log', 'error')
    }
  }

  const handleSaveTarget = async (e) => {
    e.preventDefault()
    if (!user) return
    const newTarget = parseInt(newTargetInput)
    if (isNaN(newTarget) || newTarget < 500) {
      showToast('Target must be at least 500 ml', 'error')
      return
    }

    try {
      await saveWaterTarget(user.id, newTarget)
      setTargetMl(newTarget)
      setShowTargetModal(false)
      showToast('Water target updated!', 'success')
      if (dashboard?.refreshWaterSummary) {
        dashboard.refreshWaterSummary()
      }
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
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200/60"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Droplet className="w-5 h-5 text-cyan-500 fill-cyan-500" />
              Water Tracker
            </h1>
            <p className="text-xs font-semibold text-slate-500">Track hydration & daily water goal</p>
          </div>
        </div>

        <Button
          onClick={() => setShowTargetModal(true)}
          variant="outline"
          size="sm"
          className="rounded-2xl text-xs font-extrabold border-cyan-200 bg-cyan-50/50 text-cyan-800 hover:bg-cyan-100/60 shadow-2xs"
        >
          <Target className="w-3.5 h-3.5 mr-1 text-cyan-600" />
          Target: {(targetMl / 1000).toFixed(1)} L
        </Button>
      </div>

      {/* TODAY'S PROGRESS HERO CARD */}
      <Card className="p-6 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-600 text-white rounded-3xl shadow-lg border border-cyan-400/30 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-100 bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Today's Hydration
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
              {(totalIntakeMl / 1000).toFixed(1)} L <span className="text-lg font-extrabold text-cyan-100">/ {(targetMl / 1000).toFixed(1)} L</span>
            </h2>
            <p className="text-xs font-semibold text-cyan-100 mt-1">
              {isGoalAchieved ? '🎉 Daily hydration goal completed!' : `Remaining: ${(remainingMl / 1000).toFixed(1)} L`}
            </p>
          </div>

          {/* Progress Ring Graphic */}
          <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-cyan-950/35"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-white transition-all duration-700 ease-out"
                strokeDasharray={`${Math.round(progressRatio * 100)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-black text-white">
              {Math.round(progressRatio * 100)}%
            </span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-cyan-950/40 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/15">
          <div
            className="bg-white h-full rounded-full transition-all duration-700 ease-out shadow-xs"
            style={{ width: `${Math.min(progressRatio * 100, 100)}%` }}
          />
        </div>
      </Card>

      {/* QUICK ADD WATER BUTTONS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Quick Add Water
          </h3>
          <button
            type="button"
            onClick={() => {
              setSelectedPreset(250)
              setShowAddWaterModal(true)
            }}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> More Options
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickAdd(250)}
            className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center hover:border-cyan-400 hover:bg-cyan-50/50 transition-all cursor-pointer shadow-2xs group"
          >
            <Droplet className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform mb-1 fill-cyan-500/20" />
            <span className="text-xs font-black text-slate-900">+250 ml</span>
            <span className="text-[10px] font-semibold text-slate-400">Glass</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAdd(500)}
            className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center hover:border-cyan-400 hover:bg-cyan-50/50 transition-all cursor-pointer shadow-2xs group"
          >
            <Droplet className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform mb-1 fill-cyan-500/30" />
            <span className="text-xs font-black text-slate-900">+500 ml</span>
            <span className="text-[10px] font-semibold text-slate-400">Small Bottle</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAdd(750)}
            className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center hover:border-cyan-400 hover:bg-cyan-50/50 transition-all cursor-pointer shadow-2xs group"
          >
            <Droplet className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform mb-1 fill-cyan-500/50" />
            <span className="text-xs font-black text-slate-900">+750 ml</span>
            <span className="text-[10px] font-semibold text-slate-400">Large Bottle</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedPreset('custom')
              setShowAddWaterModal(true)
            }}
            className="p-3.5 bg-cyan-50/80 border border-cyan-200 rounded-2xl flex flex-col items-center justify-center hover:bg-cyan-100/80 transition-all cursor-pointer shadow-2xs group"
          >
            <Plus className="w-5 h-5 text-cyan-700 group-hover:scale-110 transition-transform mb-1 stroke-[2.5]" />
            <span className="text-xs font-black text-cyan-900">Custom</span>
            <span className="text-[10px] font-semibold text-cyan-700">Enter ml</span>
          </button>
        </div>
      </div>

      {/* TODAY'S WATER INTAKE HISTORY */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
          Today's Entries ({logs.length})
        </h3>

        {logs.length === 0 ? (
          <Card className="p-6 bg-white border border-slate-200/80 rounded-3xl text-center space-y-2">
            <Droplet className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-extrabold text-slate-700">No water logged today yet</p>
            <p className="text-[11px] text-slate-500">Tap a quick add button above to record your water intake.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card
                key={log.id}
                className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                    <Droplet className="w-4 h-4 fill-cyan-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{log.amount_ml} ml</h4>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {log.logged_time || new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteLog(log.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* MODERN ADD WATER MODAL */}
      {showAddWaterModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Card className="w-full max-w-sm bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-y-auto pb-16 sm:pb-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-cyan-500 fill-cyan-500" />
                Add Water
              </h3>
              <button
                type="button"
                onClick={() => setShowAddWaterModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWaterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-800 mb-2">Select Amount</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPreset(250)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedPreset === 250
                        ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500/20 text-cyan-950 font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs font-black">250 ml</span>
                    <span className="text-[10px] text-slate-400 font-medium">Glass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPreset(500)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedPreset === 500
                        ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500/20 text-cyan-950 font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs font-black">500 ml</span>
                    <span className="text-[10px] text-slate-400 font-medium">Small Bottle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPreset(750)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedPreset === 750
                        ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500/20 text-cyan-950 font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs font-black">750 ml</span>
                    <span className="text-[10px] text-slate-400 font-medium">Large Bottle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPreset('custom')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedPreset === 'custom'
                        ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500/20 text-cyan-950 font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs font-black">Custom</span>
                    <span className="text-[10px] text-slate-400 font-medium">Enter amount</span>
                  </button>
                </div>
              </div>

              {selectedPreset === 'custom' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block font-extrabold text-slate-700 mb-1">Custom Amount (ml)</label>
                  <input
                    type="number"
                    required
                    min="50"
                    max="3000"
                    step="50"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 font-black text-slate-900 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Quick Note (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., after workout, meal, etc."
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddWaterModal(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold px-5"
                >
                  Add Water
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-xs bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 bg-cyan-50 border-2 border-cyan-200 text-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Droplet className="w-8 h-8 fill-cyan-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Water Added!</h3>
              <p className="text-xs font-semibold text-slate-500">
                {lastAddedMl} ml added to your daily intake
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl py-2.5 text-xs shadow-md shadow-emerald-600/20"
            >
              OK
            </Button>
          </Card>
        </div>
      )}

      {/* UPDATE TARGET MODAL */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Card className="w-full max-w-sm bg-white border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl p-5 space-y-4 shadow-xl animate-in zoom-in-95 h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-y-auto pb-16 sm:pb-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-600" />
                Set Daily Water Target
              </h3>
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Daily Goal (ml)</label>
                <input
                  type="number"
                  required
                  min="500"
                  max="10000"
                  step="100"
                  value={newTargetInput}
                  onChange={(e) => setNewTargetInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 font-black text-slate-900 text-sm"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                  Default target is 2500 ml (2.5 Liters per day).
                </p>
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
                  className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold"
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
