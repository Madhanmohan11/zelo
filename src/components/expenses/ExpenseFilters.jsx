import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export const ExpenseFilters = ({
  searchQuery,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  accountFilter,
  onAccountFilterChange,
  accounts = []
}) => {
  const accountOptions = [
    { value: 'all', label: 'All Accounts' },
    ...accounts.map((acc) => ({
      value: acc.id,
      label: acc.name
    }))
  ]

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex-1">
        <Input
          icon={Search}
          placeholder="Search description, category, or account..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Select
          value={timeFilter}
          onChange={(e) => onTimeFilterChange(e.target.value)}
          options={[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' }
          ]}
        />

        <Select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          options={[
            { value: 'all', label: 'All Categories' },
            { value: 'Food', label: 'Food' },
            { value: 'Travel', label: 'Travel' },
            { value: 'Shopping', label: 'Shopping' },
            { value: 'Bills', label: 'Bills' },
            { value: 'Health', label: 'Health' },
            { value: 'Entertainment', label: 'Entertainment' },
            { value: 'Education', label: 'Education' },
            { value: 'Other', label: 'Other' }
          ]}
        />

        <Select
          value={accountFilter}
          onChange={(e) => onAccountFilterChange(e.target.value)}
          options={accountOptions}
        />
      </div>
    </div>
  )
}
