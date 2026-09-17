/**
 * Utility function to dispatch cross-module synchronization events in ZELO.
 * Triggers background SWR refresh of relevant Home dashboard cards upon successful CRUD mutations.
 *
 * @param {string} module - The target module name (e.g. 'tasks', 'calendar', 'remember', 'reminders', 'meals', 'workouts', 'water', 'sleep', 'goals', 'expenses', 'money', 'profile', 'settings')
 * @param {string} action - The action performed (e.g. 'created', 'updated', 'deleted', 'completed')
 * @param {object} [data] - Optional payload of the mutated record
 */
export const notifyDataUpdated = (module, action = 'updated', data = null) => {
  if (typeof window === 'undefined') return
  try {
    const event = new CustomEvent('zelo_data_updated', {
      detail: {
        module: (module || '').toLowerCase().trim(),
        action: (action || 'updated').toLowerCase().trim(),
        data,
        timestamp: Date.now()
      }
    })
    window.dispatchEvent(event)
  } catch (err) {
    console.warn('Failed to dispatch zelo_data_updated event:', err)
  }
}
