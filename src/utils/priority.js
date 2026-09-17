/**
 * Priority Mapping Utility for ZELO Tasks
 * Maps frontend UI priorities ("low", "normal", "high", "urgent") to database allowed values
 * ("low", "medium", "high", "urgent") to satisfy PostgreSQL tasks_priority_check constraint.
 */

/**
 * Converts UI priority value to Database allowed value.
 * "normal" -> "medium"
 * "low" -> "low"
 * "high" -> "high"
 * "urgent" -> "urgent"
 */
export const mapPriorityToDb = (priority) => {
  if (!priority) return 'medium'
  const clean = String(priority).toLowerCase().trim()
  if (clean === 'normal' || clean === 'medium') return 'medium'
  if (['low', 'high', 'urgent'].includes(clean)) return clean
  return 'medium'
}

/**
 * Converts Database priority value to UI priority value.
 * "medium" -> "normal"
 * "normal" -> "normal"
 * "low" -> "low"
 * "high" -> "high"
 * "urgent" -> "urgent"
 */
export const mapPriorityToUi = (priority) => {
  if (!priority) return 'normal'
  const clean = String(priority).toLowerCase().trim()
  if (clean === 'medium' || clean === 'normal') return 'normal'
  if (['low', 'high', 'urgent'].includes(clean)) return clean
  return 'normal'
}

/**
 * Converts Database or UI priority value to human-friendly UI display label.
 * Returns: "Low", "Normal", "High", "Urgent"
 */
export const getPriorityDisplayLabel = (priority) => {
  const uiVal = mapPriorityToUi(priority)
  switch (uiVal) {
    case 'low':
      return 'Low'
    case 'high':
      return 'High'
    case 'urgent':
      return 'Urgent'
    case 'normal':
    default:
      return 'Normal'
  }
}
