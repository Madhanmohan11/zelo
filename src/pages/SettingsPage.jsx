import React, { useState, useEffect } from 'react'
import { Settings, Bell, Database, Download, LogOut, Shield, CheckCircle2 } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export const SettingsPage = () => {
  const { user, logout, isSupabaseConfigured } = useAuth()
  const { showToast } = useToast()

  const [notificationPermission, setNotificationPermission] = useState('default')

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported by your current browser', 'error')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      if (permission === 'granted') {
        showToast('Notifications enabled for LifeOS reminders!', 'success')
        new Notification('LifeOS', {
          body: 'Reminders and food/workout alerts will appear here.',
          icon: '/favicon.ico'
        })
      } else if (permission === 'denied') {
        showToast('Notification permission denied in browser settings', 'error')
      }
    } catch (e) {
      showToast('Could not request notification permission', 'error')
    }
  }

  const handleExportData = () => {
    try {
      const exportObject = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('lifeos_')) {
          exportObject[key] = localStorage.getItem(key)
        }
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `lifeos_backup_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      showToast('LifeOS data exported successfully!', 'success')
    } catch (e) {
      showToast('Failed to export data', 'error')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          <span>Settings</span>
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">Configure notifications, database sync, and data exports</p>
      </div>

      {/* Notifications Card */}
      <Card className="bg-white border border-slate-200/70 p-5 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-100 text-cyan-800 font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Notifications</h3>
              <p className="text-xs font-medium text-slate-500">
                Receive reminders for meals, workouts, and collection dates on Safari / Chrome.
              </p>
            </div>
          </div>
          <Badge
            status={
              notificationPermission === 'granted'
                ? 'completed'
                : notificationPermission === 'denied'
                ? 'cancelled'
                : 'pending'
            }
          >
            {notificationPermission}
          </Badge>
        </div>

        {notificationPermission !== 'granted' ? (
          <div className="pt-1">
            <Button onClick={handleRequestNotification} variant="primary" icon={Bell} size="sm">
              Enable Reminders Permission
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold pt-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Browser notifications are active</span>
          </div>
        )}
      </Card>

      {/* Database Connection Card */}
      <Card className="bg-white border border-slate-200/70 p-5 rounded-3xl space-y-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Backend Connection</h3>
            <p className="text-xs font-medium text-slate-500">
              {isSupabaseConfigured
                ? 'Connected to live Supabase PostgreSQL server with RLS security policies enabled.'
                : 'Operating in Local Storage fallback mode. Connect Supabase credentials in .env to switch.'}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 font-bold flex items-center justify-between">
          <span className="font-mono">Engine: {isSupabaseConfigured ? 'Supabase PostgreSQL' : 'LocalStorage Offline Client'}</span>
          <Badge status={isSupabaseConfigured ? 'completed' : 'pending'}>
            {isSupabaseConfigured ? 'Live Supabase DB' : 'Local Sandbox'}
          </Badge>
        </div>
      </Card>

      {/* Data Backup Card */}
      <Card className="bg-white border border-slate-200/70 p-5 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-800 font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Data Backup & Export</h3>
            <p className="text-xs font-medium text-slate-500">Download a full JSON backup of your LifeOS records.</p>
          </div>
        </div>

        <Button onClick={handleExportData} variant="secondary" icon={Download} size="sm">
          Export JSON Backup
        </Button>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-rose-50/50 border border-rose-200/80 p-5 rounded-3xl space-y-4">
        <div className="flex items-center gap-3 text-rose-700 font-bold">
          <Shield className="w-5 h-5" />
          <h3 className="text-base">Account Security</h3>
        </div>
        <Button onClick={logout} variant="danger" icon={LogOut} size="sm">
          Log Out of LifeOS
        </Button>
      </Card>
    </div>
  )
}
