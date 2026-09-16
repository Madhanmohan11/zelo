import { supabase, isSupabaseConfigured } from '../lib/supabase'

// LocalStorage helpers
const getLocalData = (key, defaultVal = []) => {
  try {
    const raw = localStorage.getItem(`zelo_${key}`)
    return raw ? JSON.parse(raw) : defaultVal
  } catch (e) {
    console.error('LocalStorage read error:', e)
    return defaultVal
  }
}

const setLocalData = (key, data) => {
  try {
    localStorage.setItem(`zelo_${key}`, JSON.stringify(data))
  } catch (e) {
    console.error('LocalStorage write error:', e)
  }
}

// -----------------------------------------------------------------------------
// HELPER FOR MASKING ACCOUNT NUMBERS FOR PRIVACY & SECURITY
// -----------------------------------------------------------------------------
export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return ''
  const cleanStr = String(accountNumber).trim()
  if (cleanStr.length <= 4) return cleanStr
  const last4 = cleanStr.slice(-4)
  return `•••• ${last4}`
}

export const getAccountDisplayLabel = (acc) => {
  if (!acc) return ''
  const nameStr = acc.nickname || acc.bank_name || acc.name || 'Account'
  const maskedNumber = acc.account_number_last4
    ? `•••• ${acc.account_number_last4}`
    : acc.account_number
    ? maskAccountNumber(acc.account_number)
    : ''

  if (maskedNumber) {
    return `${nameStr} • ${maskedNumber}`
  }
  return nameStr
}

// -----------------------------------------------------------------------------
// GET ALL USER ACCOUNTS (Exclusively from Real User Database Data)
// -----------------------------------------------------------------------------
export const getAccounts = async (userId) => {
  if (!userId) return []

  let accounts = []

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('Error fetching accounts from Supabase:', error)
    } else {
      accounts = data || []
    }
  } else {
    accounts = getLocalData(`accounts_${userId}`, [])
  }

  // Recalculate balances dynamically from transactions & expenses
  const accountsWithCalculatedBalances = await recalculateAllAccountBalances(userId, accounts)
  return accountsWithCalculatedBalances
}

// -----------------------------------------------------------------------------
// CREATE NEW MONEY ACCOUNT
// -----------------------------------------------------------------------------
export const createAccount = async (userId, accountData) => {
  const openingBalance = Math.max(0, parseFloat(accountData.opening_balance) || 0)

  // Extract last 4 digits for masked display
  let last4 = ''
  if (accountData.account_number) {
    const cleanNum = String(accountData.account_number).replace(/\D/g, '')
    if (cleanNum.length >= 4) {
      last4 = cleanNum.slice(-4)
    } else if (cleanNum.length > 0) {
      last4 = cleanNum
    }
  }

  const accountName =
    accountData.nickname ||
    accountData.bank_name ||
    accountData.name ||
    (accountData.account_type === 'cash'
      ? 'Cash'
      : accountData.account_type === 'upi'
      ? 'UPI / Digital Wallet'
      : 'Bank Account')

  const newAccount = {
    id: crypto.randomUUID(),
    user_id: userId,
    name: accountName,
    account_type: accountData.account_type || 'bank',
    bank_name: accountData.bank_name || null,
    account_number: accountData.account_number || null,
    account_number_last4: last4 || null,
    account_holder_name: accountData.account_holder_name || null,
    nickname: accountData.nickname || null,
    opening_balance: openingBalance,
    current_balance: openingBalance,
    currency: accountData.currency || 'INR',
    is_active: true,
    icon: accountData.account_type === 'cash' ? 'Wallet' : accountData.account_type === 'upi' ? 'Smartphone' : 'Building2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('accounts').insert([newAccount]).select().single()
    if (error) throw error
    return data
  }

  const allAccounts = getLocalData(`accounts_${userId}`, [])
  allAccounts.push(newAccount)
  setLocalData(`accounts_${userId}`, allAccounts)
  return newAccount
}

// -----------------------------------------------------------------------------
// ENSURE DEFAULT CASH ACCOUNT ("Cash in Hand")
// -----------------------------------------------------------------------------
export const ensureDefaultCashAccount = async (userId, existingAccounts = []) => {
  if (!userId) return null

  // Check if a cash account already exists (by account_type === 'cash' or name containing 'Cash')
  const existingCashAccount = existingAccounts.find(
    (a) => a.is_active !== false && (a.account_type === 'cash' || (a.name || '').toLowerCase().includes('cash'))
  )

  if (existingCashAccount) {
    return existingCashAccount
  }

  // Create default "Cash in Hand" account safely
  const defaultCashData = {
    account_type: 'cash',
    name: 'Cash in Hand',
    nickname: 'Cash in Hand',
    opening_balance: 0,
    currency: 'INR',
    notes: 'Default cash wallet for tracking physical currency'
  }

  try {
    return await createAccount(userId, defaultCashData)
  } catch (err) {
    console.error('Error auto-creating default cash account:', err)
    return null
  }
}


// -----------------------------------------------------------------------------
// UPDATE ACCOUNT
// -----------------------------------------------------------------------------
export const updateAccount = async (userId, accountId, updates) => {
  let last4 = updates.account_number_last4
  if (updates.account_number) {
    const cleanNum = String(updates.account_number).replace(/\D/g, '')
    if (cleanNum.length >= 4) {
      last4 = cleanNum.slice(-4)
    }
  }

  const payload = {
    ...updates,
    account_number_last4: last4,
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('accounts')
      .update(payload)
      .eq('id', accountId)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const allAccounts = getLocalData(`accounts_${userId}`, [])
  const index = allAccounts.findIndex((a) => a.id === accountId)
  if (index !== -1) {
    allAccounts[index] = { ...allAccounts[index], ...payload }
    setLocalData(`accounts_${userId}`, allAccounts)
    return allAccounts[index]
  }
  throw new Error('Account not found')
}

// -----------------------------------------------------------------------------
// DEACTIVATE ACCOUNT (Safely preserves historical records)
// -----------------------------------------------------------------------------
export const deactivateAccount = async (userId, accountId) => {
  return updateAccount(userId, accountId, { is_active: false })
}

// -----------------------------------------------------------------------------
// DELETE ACCOUNT PERMANENTLY (For removing unused or redundant accounts)
// -----------------------------------------------------------------------------
export const deleteAccount = async (userId, accountId) => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', userId)

    if (error) throw error
    return true
  }

  const allAccounts = getLocalData(`accounts_${userId}`, [])
  const filtered = allAccounts.filter((a) => a.id !== accountId)
  setLocalData(`accounts_${userId}`, filtered)
  return true
}

// -----------------------------------------------------------------------------
// DYNAMIC ACCOUNT BALANCE CALCULATION ENGINE
// -----------------------------------------------------------------------------
export const recalculateAllAccountBalances = async (userId, accounts) => {
  if (!accounts || accounts.length === 0) return []

  let expenses = []
  let moneyTx = []

  if (isSupabaseConfigured && supabase) {
    const [expRes, txRes] = await Promise.all([
      supabase.from('expenses').select('id, amount, account_id').eq('user_id', userId),
      supabase.from('money_transactions').select('*').eq('user_id', userId)
    ])
    expenses = expRes.data || []
    moneyTx = txRes.data || []
  } else {
    expenses = getLocalData(`expenses_${userId}`, [])
    moneyTx = getLocalData(`money_transactions_${userId}`, [])
  }

  return accounts.map((acc) => {
    const opening = parseFloat(acc.opening_balance) || 0

    // Deduct expenses associated with this account
    const totalSpent = expenses
      .filter((e) => e.account_id === acc.id)
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

    // Add Income / Deposits into this account
    const totalIncome = moneyTx
      .filter((tx) => tx.account_id === acc.id && tx.transaction_type === 'income')
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)

    // Transfers OUT of this account
    const totalTransfersOut = moneyTx
      .filter((tx) => tx.account_id === acc.id && tx.transaction_type === 'transfer')
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)

    // Transfers IN to this account
    const totalTransfersIn = moneyTx
      .filter((tx) => tx.to_account_id === acc.id && tx.transaction_type === 'transfer')
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)

    const calculatedBalance = opening + totalIncome + totalTransfersIn - totalSpent - totalTransfersOut

    return {
      ...acc,
      current_balance: Math.max(0, calculatedBalance)
    }
  })
}

// -----------------------------------------------------------------------------
// MONEY TRANSACTIONS (ADD MONEY & TRANSFERS)
// -----------------------------------------------------------------------------
export const getMoneyTransactions = async (userId, accountId = null) => {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('money_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })

    if (accountId) {
      query = query.or(`account_id.eq.${accountId},to_account_id.eq.${accountId}`)
    }

    const { data, error } = await query
    if (error) {
      console.warn('Error fetching money transactions:', error)
      return []
    }
    return data || []
  }

  let txs = getLocalData(`money_transactions_${userId}`, [])
  if (accountId) {
    txs = txs.filter((t) => t.account_id === accountId || t.to_account_id === accountId)
  }
  return txs.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
}

// ADD MONEY / DEPOSIT TO EXISTING ACCOUNT
export const addMoney = async (userId, { account_id, amount, description, category, date, notes }) => {
  const numericAmount = parseFloat(amount)
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Please enter a valid deposit amount greater than 0')
  }

  if (!account_id) {
    throw new Error('Please select an existing account to deposit into')
  }

  const transaction = {
    id: crypto.randomUUID(),
    user_id: userId,
    account_id,
    to_account_id: null,
    transaction_type: 'income',
    amount: numericAmount,
    description: description || 'Deposit / Add Money',
    category: category || 'Salary',
    transaction_date: date ? new Date(date).toISOString() : new Date().toISOString(),
    notes: notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('money_transactions').insert([transaction]).select().single()
    if (error) throw error
    return data
  }

  const allTx = getLocalData(`money_transactions_${userId}`, [])
  allTx.push(transaction)
  setLocalData(`money_transactions_${userId}`, allTx)
  return transaction
}

// TRANSFER MONEY BETWEEN EXISTING ACCOUNTS
export const transferMoney = async (userId, { from_account_id, to_account_id, amount, description, date, notes }) => {
  const numericAmount = parseFloat(amount)
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Please enter a valid transfer amount greater than 0')
  }

  if (from_account_id === to_account_id) {
    throw new Error('Source and destination accounts must be different')
  }

  const transaction = {
    id: crypto.randomUUID(),
    user_id: userId,
    account_id: from_account_id,
    to_account_id,
    transaction_type: 'transfer',
    amount: numericAmount,
    description: description || 'Account Transfer',
    category: 'Transfer',
    transaction_date: date ? new Date(date).toISOString() : new Date().toISOString(),
    notes: notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('money_transactions').insert([transaction]).select().single()
    if (error) throw error
    return data
  }

  const allTx = getLocalData(`money_transactions_${userId}`, [])
  allTx.push(transaction)
  setLocalData(`money_transactions_${userId}`, allTx)
  return transaction
}
