import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  ALL_MODULES,
  DEFAULT_ENABLED_MODULES,
  getModulePreferences,
  updateModulePreferences
} from '../services/modulePreferenceService'

const ModuleContext = createContext()

export const ModuleProvider = ({ children }) => {
  const { user } = useAuth()
  const [enabledModules, setEnabledModules] = useState(DEFAULT_ENABLED_MODULES)
  const [loadingPreferences, setLoadingPreferences] = useState(true)

  // Load preferences whenever user changes
  const loadPreferences = useCallback(async () => {
    if (!user) {
      setEnabledModules(DEFAULT_ENABLED_MODULES)
      setLoadingPreferences(false)
      return
    }

    setLoadingPreferences(true)
    try {
      const prefs = await getModulePreferences(user.id)
      setEnabledModules(prefs)
    } catch (err) {
      console.error('Failed to load module preferences:', err)
      setEnabledModules(DEFAULT_ENABLED_MODULES)
    } finally {
      setLoadingPreferences(false)
    }
  }, [user])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  const isModuleEnabled = useCallback(
    (moduleId) => {
      if (moduleId === 'money') return true // Always enabled
      return enabledModules.includes(moduleId)
    },
    [enabledModules]
  )

  const toggleModule = async (moduleId) => {
    if (moduleId === 'money') return // Cannot disable money

    const isCurrentlyEnabled = enabledModules.includes(moduleId)
    let updated = []

    if (isCurrentlyEnabled) {
      updated = enabledModules.filter((id) => id !== moduleId)
    } else {
      updated = [...enabledModules, moduleId]
    }

    // Always keep 'money' included
    if (!updated.includes('money')) {
      updated.push('money')
    }

    setEnabledModules(updated)

    if (user?.id) {
      try {
        await updateModulePreferences(user.id, updated)
      } catch (err) {
        console.error('Error saving updated module preferences:', err)
      }
    }
  }

  const saveModulePreferences = async (newModulesList) => {
    const sanitized = Array.from(new Set([...newModulesList, 'money']))
    setEnabledModules(sanitized)

    if (user?.id) {
      try {
        await updateModulePreferences(user.id, sanitized)
      } catch (err) {
        console.error('Error saving module preferences:', err)
      }
    }
  }

  const resetToDefaults = async () => {
    setEnabledModules(DEFAULT_ENABLED_MODULES)
    if (user?.id) {
      try {
        await updateModulePreferences(user.id, DEFAULT_ENABLED_MODULES)
      } catch (err) {
        console.error('Error resetting module preferences:', err)
      }
    }
  }

  return (
    <ModuleContext.Provider
      value={{
        allModules: ALL_MODULES,
        enabledModules,
        isModuleEnabled,
        toggleModule,
        saveModulePreferences,
        resetToDefaults,
        loadingPreferences,
        reloadPreferences: loadPreferences
      }}
    >
      {children}
    </ModuleContext.Provider>
  )
}

export const useModulePreferences = () => {
  const context = useContext(ModuleContext)
  if (!context) {
    throw new Error('useModulePreferences must be used within a ModuleProvider')
  }
  return context
}
