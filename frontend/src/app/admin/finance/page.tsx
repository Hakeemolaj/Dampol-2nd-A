'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import financeService, {
  BudgetData,
  RevenueRecord,
  ExpenseRecord,
  FinancialSummary,
  PaginatedResponse
} from '@/services/financeService'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

// Chart colors
const COLORS = {
  primary: '#2563eb',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899'
}

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.danger, COLORS.purple, COLORS.pink]

// Simple Tabs Components
const Tabs = ({ value, onValueChange, children, className }: any) => (
  <div className={className}>{children}</div>
)

const TabsList = ({ children, className }: any) => (
  <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}>
    {children}
  </div>
)

const TabsTrigger = ({ value, children, onClick }: any) => (
  <button
    onClick={() => onClick && onClick(value)}
    className="flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm"
  >
    {children}
  </button>
)

const TabsContent = ({ value, children, className }: any) => (
  <div className={className}>{children}</div>
)

export default function FinancePage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null)
  const [revenueData, setRevenueData] = useState<PaginatedResponse<RevenueRecord> | null>(null)
  const [expenseData, setExpenseData] = useState<PaginatedResponse<ExpenseRecord> | null>(null)

  // Form states
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [showAddRevenue, setShowAddRevenue] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)

  const [budgetForm, setBudgetForm] = useState({
    category: '',
    subcategory: '',
    allocated: '',
    description: ''
  })

  const [revenueForm, setRevenueForm] = useState({
    source: '',
    amount: '',
    payerName: '',
    description: '',
    receiptNumber: ''
  })

  const [expenseForm, setExpenseForm] = useState({
    category: '',
    subcategory: '',
    amount: '',
    vendor: '',
    description: '',
    receiptNumber: ''
  })

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      const [summaryRes, budgetRes, revenueRes, expenseRes] = await Promise.all([
        financeService.getSummary(),
        financeService.getBudget(),
        financeService.getRevenue({ limit: 10 }),
        financeService.getExpenses({ limit: 10 })
      ])

      setSummary(summaryRes)
      setBudgetData(budgetRes)
      setRevenueData(revenueRes)
      setExpenseData(expenseRes)
    } catch (error) {
      console.error('Error loading financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await financeService.createBudgetItem({
        category: budgetForm.category,
        subcategory: budgetForm.subcategory,
        allocated: Number(budgetForm.allocated),
        description: budgetForm.description
      })
      
      setBudgetForm({ category: '', subcategory: '', allocated: '', description: '' })
      setShowAddBudget(false)
      loadFinancialData()
    } catch (error) {
      console.error('Error adding budget item:', error)
    }
  }

  const handleAddRevenue = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await financeService.createRevenue({
        source: revenueForm.source,
        amount: Number(revenueForm.amount),
        payerName: revenueForm.payerName,
        description: revenueForm.description,
        receiptNumber: revenueForm.receiptNumber
      })
      
      setRevenueForm({ source: '', amount: '', payerName: '', description: '', receiptNumber: '' })
      setShowAddRevenue(false)
      loadFinancialData()
    } catch (error) {
      console.error('Error adding revenue:', error)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await financeService.createExpense({
        category: expenseForm.category,
        subcategory: expenseForm.subcategory,
        amount: Number(expenseForm.amount),
        vendor: expenseForm.vendor,
        description: expenseForm.description,
        receiptNumber: expenseForm.receiptNumber,
        expenseDate: new Date().toISOString()
      })
      
      setExpenseForm({ category: '', subcategory: '', amount: '', vendor: '', description: '', receiptNumber: '' })
      setShowAddExpense(false)
      loadFinancialData()
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const exportData = (type: 'budget' | 'revenue' | 'expenses') => {
    switch (type) {
      case 'budget':
        if (budgetData) {
          financeService.exportToCSV(budgetData.categories, `budget-${budgetData.fiscalYear}`)
        }
        break
      case 'revenue':
        if (revenueData) {
          financeService.exportToCSV(revenueData.records, 'revenue-records')
        }
        break
      case 'expenses':
        if (expenseData) {
          financeService.exportToCSV(expenseData.records, 'expense-records')
        }
        break
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">💰</div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-1">Budget tracking, revenue collection, and expense management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportData('budget')}>
            📊 Export Budget
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('revenue')}>
            💰 Export Revenue
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('expenses')}>
            📋 Export Expenses
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="government-card">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">💵</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{financeService.formatCurrency(summary.totalRevenue)}</p>
                  <p className="text-xs text-green-600">+{summary.revenueGrowth}% from last period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="government-card">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-2xl">💸</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-xl font-bold text-gray-900">{financeService.formatCurrency(summary.totalExpenses)}</p>
                  <p className="text-xs text-red-600">+{summary.expenseGrowth}% from last period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="government-card">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Income</p>
                  <p className={`text-xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {financeService.formatCurrency(summary.netIncome)}
                  </p>
                  <p className="text-xs text-gray-600">Current period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="government-card">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                  <p className="text-xl font-bold text-gray-900">{summary.budgetUtilization}%</p>
                  <p className="text-xs text-gray-600">{summary.pendingExpenses} pending expenses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="overview"
            onClick={setActiveTab}
            className={activeTab === 'overview' ? 'bg-white text-primary-600 shadow-sm' : ''}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="budget"
            onClick={setActiveTab}
            className={activeTab === 'budget' ? 'bg-white text-primary-600 shadow-sm' : ''}
          >
            Budget
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            onClick={setActiveTab}
            className={activeTab === 'revenue' ? 'bg-white text-primary-600 shadow-sm' : ''}
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            onClick={setActiveTab}
            className={activeTab === 'expenses' ? 'bg-white text-primary-600 shadow-sm' : ''}
          >
            Expenses
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
        <TabsContent value="overview" className="space-y-6">
          {summary && budgetData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budget Utilization Chart */}
              <Card className="government-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Budget Utilization by Category
                  </CardTitle>
                  <CardDescription>Current fiscal year budget allocation and usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetData.categories}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="category"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={12}
                        />
                        <YAxis tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value, name) => [
                            financeService.formatCurrency(Number(value)),
                            name === 'allocated' ? 'Allocated' : 'Utilized'
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="allocated" fill={COLORS.primary} name="Allocated" />
                        <Bar dataKey="utilized" fill={COLORS.secondary} name="Utilized" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Cash Flow Chart */}
              <Card className="government-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    Cash Flow Overview
                  </CardTitle>
                  <CardDescription>Revenue vs expenses comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Revenue', value: summary.totalRevenue, color: COLORS.secondary },
                            { name: 'Expenses', value: summary.totalExpenses, color: COLORS.danger }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Revenue', value: summary.totalRevenue, color: COLORS.secondary },
                            { name: 'Expenses', value: summary.totalExpenses, color: COLORS.danger }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => financeService.formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Revenue</span>
                      </div>
                      <p className="font-semibold text-green-600 mt-1">
                        {financeService.formatCurrency(summary.totalRevenue)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Expenses</span>
                      </div>
                      <p className="font-semibold text-red-600 mt-1">
                        {financeService.formatCurrency(summary.totalExpenses)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-lg font-semibold text-gray-900">{summary?.topRevenueSource}</div>
                <div className="text-sm text-gray-600">Top Revenue Source</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-lg font-semibold text-gray-900">{summary?.topExpenseCategory}</div>
                <div className="text-sm text-gray-600">Top Expense Category</div>
              </CardContent>
            </Card>

            <Card className="government-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">⏳</div>
                <div className="text-lg font-semibold text-gray-900">{summary?.pendingExpenses}</div>
                <div className="text-sm text-gray-600">Pending Expenses</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
        <TabsContent value="budget" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Budget Management</h2>
              <p className="text-gray-600">Fiscal Year {budgetData?.fiscalYear || 2024}</p>
            </div>
            <Button onClick={() => setShowAddBudget(true)}>
              ➕ Add Budget Item
            </Button>
          </div>

          {budgetData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="government-card">
                  <CardHeader>
                    <CardTitle>Budget Categories</CardTitle>
                    <CardDescription>
                      Total Budget: {financeService.formatCurrency(budgetData.totalBudget)} |
                      Utilized: {financeService.formatCurrency(budgetData.totalUtilized)} ({budgetData.utilizationRate}%)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Allocated</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Utilized</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Remaining</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Usage %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {budgetData.categories.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-medium text-gray-900">{item.category}</div>
                                  {item.subcategory && (
                                    <div className="text-sm text-gray-600">{item.subcategory}</div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium">
                                {financeService.formatCurrency(item.allocated)}
                              </td>
                              <td className="py-3 px-4">
                                {financeService.formatCurrency(item.utilized)}
                              </td>
                              <td className="py-3 px-4">
                                {financeService.formatCurrency(item.remaining)}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`font-medium ${financeService.getUtilizationColor(item.utilizationRate)}`}>
                                  {item.utilizationRate}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="government-card">
                  <CardHeader>
                    <CardTitle>Budget Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Allocated:</span>
                      <span className="font-semibold">{financeService.formatCurrency(budgetData.totalBudget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Utilized:</span>
                      <span className="font-semibold">{financeService.formatCurrency(budgetData.totalUtilized)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-semibold text-green-600">
                        {financeService.formatCurrency(budgetData.totalBudget - budgetData.totalUtilized)}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Utilization Rate:</span>
                        <span className={`font-semibold ${financeService.getUtilizationColor(budgetData.utilizationRate)}`}>
                          {budgetData.utilizationRate}%
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${budgetData.utilizationRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
        <TabsContent value="revenue" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Revenue Management</h2>
              <p className="text-gray-600">Track income and collections</p>
            </div>
            <Button onClick={() => setShowAddRevenue(true)}>
              ➕ Record Revenue
            </Button>
          </div>

          {revenueData && (
            <Card className="government-card">
              <CardHeader>
                <CardTitle>Revenue Records</CardTitle>
                <CardDescription>
                  Total: {financeService.formatCurrency(revenueData.summary.totalAmount)} |
                  Records: {revenueData.summary.totalRecords} |
                  Average: {financeService.formatCurrency(revenueData.summary.averageAmount)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Payer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Receipt #</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Collected By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.records.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {new Date(record.collectedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{record.source}</div>
                            {record.description && (
                              <div className="text-sm text-gray-600">{record.description}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-green-600">
                            {financeService.formatCurrency(record.amount)}
                          </td>
                          <td className="py-3 px-4">{record.payerName}</td>
                          <td className="py-3 px-4 text-sm font-mono">{record.receiptNumber}</td>
                          <td className="py-3 px-4 text-sm">{record.collectedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Expense Management</h2>
              <p className="text-gray-600">Track expenditures and payments</p>
            </div>
            <Button onClick={() => setShowAddExpense(true)}>
              ➕ Record Expense
            </Button>
          </div>

          {expenseData && (
            <Card className="government-card">
              <CardHeader>
                <CardTitle>Expense Records</CardTitle>
                <CardDescription>
                  Total: {financeService.formatCurrency(expenseData.summary.totalAmount)} |
                  Records: {expenseData.summary.totalRecords} |
                  Average: {financeService.formatCurrency(expenseData.summary.averageAmount)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Vendor</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Approved By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseData.records.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {new Date(record.expenseDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{record.category}</div>
                            {record.subcategory && (
                              <div className="text-sm text-gray-600">{record.subcategory}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-red-600">
                            {financeService.formatCurrency(record.amount)}
                          </td>
                          <td className="py-3 px-4">{record.vendor}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${financeService.getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{record.approvedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        )}
      </Tabs>

      {/* Add Budget Item Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Budget Item</h3>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <Input
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
                  placeholder="e.g., Personnel Services"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                <Input
                  value={budgetForm.subcategory}
                  onChange={(e) => setBudgetForm({...budgetForm, subcategory: e.target.value})}
                  placeholder="e.g., Salaries and Wages"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Amount *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={budgetForm.allocated}
                  onChange={(e) => setBudgetForm({...budgetForm, allocated: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  value={budgetForm.description}
                  onChange={(e) => setBudgetForm({...budgetForm, description: e.target.value})}
                  placeholder="Brief description of the budget item"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Add Budget Item</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddBudget(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Revenue Modal */}
      {showAddRevenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Record Revenue</h3>
            <form onSubmit={handleAddRevenue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Source *</label>
                <select
                  value={revenueForm.source}
                  onChange={(e) => setRevenueForm({...revenueForm, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select source</option>
                  <option value="Document Fees">Document Fees</option>
                  <option value="Business Permits">Business Permits</option>
                  <option value="Barangay ID">Barangay ID</option>
                  <option value="Other Services">Other Services</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={revenueForm.amount}
                  onChange={(e) => setRevenueForm({...revenueForm, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payer Name *</label>
                <Input
                  value={revenueForm.payerName}
                  onChange={(e) => setRevenueForm({...revenueForm, payerName: e.target.value})}
                  placeholder="Name of person/entity who paid"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                <Input
                  value={revenueForm.receiptNumber}
                  onChange={(e) => setRevenueForm({...revenueForm, receiptNumber: e.target.value})}
                  placeholder="OR-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  value={revenueForm.description}
                  onChange={(e) => setRevenueForm({...revenueForm, description: e.target.value})}
                  placeholder="Additional details"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Record Revenue</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddRevenue(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Record Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Personnel">Personnel</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                <Input
                  value={expenseForm.subcategory}
                  onChange={(e) => setExpenseForm({...expenseForm, subcategory: e.target.value})}
                  placeholder="e.g., Stationery, Electricity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
                <Input
                  value={expenseForm.vendor}
                  onChange={(e) => setExpenseForm({...expenseForm, vendor: e.target.value})}
                  placeholder="Supplier or service provider"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt/Invoice Number</label>
                <Input
                  value={expenseForm.receiptNumber}
                  onChange={(e) => setExpenseForm({...expenseForm, receiptNumber: e.target.value})}
                  placeholder="INV-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  placeholder="Details about the expense"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Record Expense</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddExpense(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
