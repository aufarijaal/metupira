<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
    title: 'Dashboard',
    layout: 'dashboard',
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Initialize data fetching
onMounted(() => {
    fetchTransactions()
})

// Data refs
interface Transaction {
    id: number
    amount: number
    type: 'income' | 'expense'
    category_id: number
    categories: {
        name: string
    }
    note: string
    transaction_at: string
    created_at: string
}

const transactions = ref<Transaction[]>([])
const loading = ref(true)
const error = ref('')

// Function to fetch transactions
const fetchTransactions = async () => {
    try {
        const { data, error: err } = await supabase
            .from('transactions')
            .select(`
                *,
                categories (
                    name
                )
            `)
            .order('transaction_at', { ascending: false })

        if (err) throw err
        transactions.value = data || []
    } catch (e: any) {
        error.value = 'Failed to load transactions: ' + e.message
    } finally {
        loading.value = false
    }
}

// Computed monthly data
const monthlyData = computed(() => {
    const now = new Date()
    const monthsData = new Array(12).fill(0).map((_, i) => {
        const month = new Date(now.getFullYear(), now.getMonth() - (11 - i))
        return {
            month,
            income: 0,
            expense: 0
        }
    })

    transactions.value.forEach(transaction => {
        const date = new Date(transaction.transaction_at)
        const monthIndex = monthsData.findIndex(data =>
            data.month.getMonth() === date.getMonth() &&
            data.month.getFullYear() === date.getFullYear()
        )

        if (monthIndex !== -1) {
            if (transaction.type === 'income') {
                monthsData[monthIndex].income += transaction.amount
            } else {
                monthsData[monthIndex].expense += transaction.amount
            }
        }
    })

    return monthsData
})

const monthlyExpenses = computed(() => monthlyData.value.map(d => d.expense))
const monthlyIncome = computed(() => monthlyData.value.map(d => d.income))

// Computed category distribution
const categoryDistribution = computed(() => {
    const categories: { [key: string]: number } = {}

    transactions.value
        .filter(t => t.type === 'expense')
        .forEach(transaction => {
            const categoryName = transaction.categories?.name || 'Uncategorized'
            categories[categoryName] = (categories[categoryName] || 0) + transaction.amount
        })

    return Object.entries(categories).map(([name, value]) => ({
        name,
        value
    }))
})

// Stats
const totalBalance = computed(() => {
    return transactions.value.reduce((total, t) => {
        return total + (t.type === 'income' ? t.amount : -t.amount)
    }, 0)
})

const monthlyAverageExpense = computed(() => {
    const totalExpenses = transactions.value
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    const monthCount = monthlyData.value.filter(m => m.expense > 0).length || 1
    return Math.round(totalExpenses / monthCount)
})

const monthlyAverageIncome = computed(() => {
    const totalIncome = transactions.value
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const monthCount = monthlyData.value.filter(m => m.income > 0).length || 1
    return Math.round(totalIncome / monthCount)
})

// Chart options
const expenseVsIncomeOption = computed(() => ({
    tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: any) => {
            const date = new Date(monthlyData.value[params[0].dataIndex].month)
            const monthYear = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' })

            return `${monthYear}<br/>${params.map((param: any) => {
                const value = param.value.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                })
                return `${param.seriesName}: ${value}`
            }).join('<br/>')}`
        }
    },
    legend: {
        data: ['Pengeluaran', 'Pemasukan']
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'category',
        data: monthlyData.value.map(d =>
            new Date(d.month).toLocaleString('id-ID', { month: 'short' })
        )
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: (value: number) => {
                return value.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    notation: 'compact'
                })
            }
        }
    },
    series: [
        {
            name: 'Pengeluaran',
            type: 'line',
            data: monthlyExpenses.value,
            smooth: true,
            lineStyle: { width: 3 },
            itemStyle: { color: '#ef4444' }
        },
        {
            name: 'Pemasukan',
            type: 'line',
            data: monthlyIncome.value,
            smooth: true,
            lineStyle: { width: 3 },
            itemStyle: { color: '#22c55e' }
        }
    ]
}))

const categoryDistributionOption = computed(() => ({
    tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
            const value = params.value.toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
            return `${params.name}: ${value} (${params.percent}%)`
        }
    },
    legend: {
        orient: 'vertical',
        left: 'left'
    },
    series: [
        {
            type: 'pie',
            radius: '70%',
            data: categoryDistribution.value,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
}))
</script>

<template>
    <div class="min-h-screen p-6 space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center min-h-[200px]">
            <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-error">
            {{ error }}
        </div>

        <template v-else>
            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Total Balance -->
                <div class="stat bg-base-100 rounded-box shadow">
                    <div class="stat-title">Total Balance</div>
                    <div class="stat-value text-primary">{{ totalBalance.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                        }) }}</div>
                    <div class="stat-desc">Net balance from income and expenses</div>
                </div>

                <!-- Average Monthly Expense -->
                <div class="stat bg-base-100 rounded-box shadow">
                    <div class="stat-title">Average Monthly Expense</div>
                    <div class="stat-value text-error">{{ monthlyAverageExpense.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                        }) }}</div>
                    <div class="stat-desc">Monthly average spending</div>
                </div>

                <!-- Average Monthly Income -->
                <div class="stat bg-base-100 rounded-box shadow">
                    <div class="stat-title">Average Monthly Income</div>
                    <div class="stat-value text-success">{{ monthlyAverageIncome.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                        }) }}</div>
                    <div class="stat-desc">Monthly average earnings</div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Income vs Expenses Chart -->
                <div class="bg-base-100 p-6 rounded-box shadow">
                    <h3 class="text-lg font-semibold mb-4">Income vs Expenses</h3>
                    <ClientOnly>
                        <v-chart class="w-full h-[400px]" :option="expenseVsIncomeOption" autoresize />
                    </ClientOnly>
                </div>

                <!-- Category Distribution Chart -->
                <div class="bg-base-100 p-6 rounded-box shadow">
                    <h3 class="text-lg font-semibold mb-4">Expense Categories</h3>
                    <ClientOnly>
                        <v-chart class="w-full h-[400px]" :option="categoryDistributionOption" autoresize />
                    </ClientOnly>
                </div>
            </div>

            <!-- Recent Transactions Preview -->
            <div class="bg-base-100 p-6 rounded-box shadow">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Recent Transactions</h3>
                    <NuxtLink to="/dashboard/transactions" class="btn btn-primary btn-sm">View All</NuxtLink>
                </div>
                <!-- Add your transactions table/list here -->
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2025-08-03</td>
                                <td>Grocery Shopping</td>
                                <td>Food</td>
                                <td class="text-error">-Rp 1.285.000</td>
                            </tr>
                            <tr>
                                <td>2025-08-02</td>
                                <td>Salary Deposit</td>
                                <td>Income</td>
                                <td class="text-success">+Rp 8.500.000</td>
                            </tr>
                            <tr>
                                <td>2025-08-01</td>
                                <td>Internet Bill</td>
                                <td>Utilities</td>
                                <td class="text-error">-Rp 450.000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>
    </div>
</template>