// Helper utility for formatting numbers and currency in INR (Indian Rupee)

export const formatINR = (amount) => {
  const numericAmount = parseFloat(amount) || 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numericAmount)
}

export const formatNumberINR = (num) => {
  const numericVal = parseFloat(num) || 0
  return new Intl.NumberFormat('en-IN').format(numericVal)
}
