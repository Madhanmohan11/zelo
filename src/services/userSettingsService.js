import { getUserSettings, updateUserSettings } from './dataService'
import { DEFAULT_SLOGAN } from '../constants/slogan'

export const saveCustomSlogan = async (userId, customSlogan) => {
  if (!userId) return null
  const cleanSlogan = (customSlogan || '').trim().slice(0, 60)
  const sloganToSave = (!cleanSlogan || cleanSlogan === DEFAULT_SLOGAN.trim()) ? null : cleanSlogan
  return await updateUserSettings(userId, { custom_slogan: sloganToSave })
}

export const saveHeroSettings = async (userId, settings) => {
  if (!userId) return null
  return await updateUserSettings(userId, {
    dynamic_hero_enabled: settings.dynamic_hero_enabled ?? true,
    auto_time_bg_enabled: settings.auto_time_bg_enabled ?? true,
    ...(settings.custom_slogan !== undefined ? { custom_slogan: settings.custom_slogan } : {})
  })
}

export const resetHeroSettings = async (userId) => {
  if (!userId) return null
  return await updateUserSettings(userId, {
    custom_slogan: null,
    dynamic_hero_enabled: true,
    auto_time_bg_enabled: true
  })
}
