-- ZELO Expense Manager Redesign & Real Money Accounts System Migration
-- Run this script in the Supabase SQL Editor (https://app.supabase.com -> Project -> SQL Editor)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ACCOUNTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'bank', -- 'cash', 'bank', 'upi', 'wallet', 'other'
  bank_name TEXT,
  account_number TEXT,
  account_number_last4 TEXT,
  account_holder_name TEXT,
  nickname TEXT,
  opening_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  current_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  currency TEXT DEFAULT 'INR',
  is_active BOOLEAN DEFAULT TRUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was previously created
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='accounts' AND column_name='bank_name') THEN
    ALTER TABLE public.accounts ADD COLUMN bank_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='accounts' AND column_name='account_number') THEN
    ALTER TABLE public.accounts ADD COLUMN account_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='accounts' AND column_name='account_number_last4') THEN
    ALTER TABLE public.accounts ADD COLUMN account_number_last4 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='accounts' AND column_name='account_holder_name') THEN
    ALTER TABLE public.accounts ADD COLUMN account_holder_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='accounts' AND column_name='nickname') THEN
    ALTER TABLE public.accounts ADD COLUMN nickname TEXT;
  END IF;
END $$;

-- Enable RLS for Accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own accounts" ON public.accounts;
CREATE POLICY "Users can manage their own accounts" 
  ON public.accounts FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. MONEY TRANSACTIONS TABLE (Deposits / Income & Account Transfers)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.money_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL, -- used for transfers
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  category TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Money Transactions
ALTER TABLE public.money_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own money transactions" ON public.money_transactions;
CREATE POLICY "Users can manage their own money transactions" 
  ON public.money_transactions FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. UPDATE EXPENSES TABLE WITH ACCOUNT RELATIONSHIP
-- -----------------------------------------------------------------------------
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'expenses' 
    AND column_name = 'account_id'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS for Expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own expenses" ON public.expenses;
CREATE POLICY "Users can manage their own expenses" 
  ON public.expenses FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON public.accounts (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_money_transactions_user_date ON public.money_transactions (user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_money_transactions_account ON public.money_transactions (account_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_account ON public.expenses (user_id, account_id);
CREATE INDEX IF NOT EXISTS idx_expenses_spent_at ON public.expenses (user_id, spent_at);
