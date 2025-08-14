<script setup lang="ts">
import { ref, onMounted } from 'vue'
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';

// Import bar charts, all suffixed with Chart
import { LineChart, PieChart } from 'echarts/charts';

// Import the tooltip, rectangular coordinate system and dataset components
import {
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    LegendComponent,
} from 'echarts/components';

// Features like Universal Transition and Label Layout
import { LabelLayout, UniversalTransition } from 'echarts/features';

// Register the required components
echarts.use([
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    LabelLayout,
    UniversalTransition,
    LegendComponent,
    LineChart,
    PieChart
]);


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
const selectedRange = ref<'today' | 'last7days' | 'daily' | 'weekly' | 'monthly'>('daily')

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

// Function to filter transactions by date range
const filterTransactionsByRange = (transactions: Transaction[], range: string) => {
    const now = new Date()
    now.setHours(23, 59, 59, 999) // End of today

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0) // Start of today

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(now.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    return transactions.filter(t => {
        const transactionDate = new Date(t.transaction_at)

        switch (range) {
            case 'today':
                return transactionDate >= startOfToday && transactionDate <= now
            case 'last7days':
                return transactionDate >= sevenDaysAgo && transactionDate <= now
            default:
                return true
        }
    })
}

// Function to group transactions by date range
const groupTransactionsByRange = (range: 'today' | 'last7days' | 'daily' | 'weekly' | 'monthly') => {
    const grouped = new Map()
    const now = new Date()
    let numberOfPeriods = 1 // default for today

    // Set number of periods based on range
    switch (range) {
        case 'today':
            numberOfPeriods = 1
            break
        case 'last7days':
            numberOfPeriods = 7
            break
        case 'daily':
            numberOfPeriods = 30
            break
        case 'weekly':
            numberOfPeriods = 12
            break
        case 'monthly':
            numberOfPeriods = 12
            break
    }

    // Initialize periods
    for (let i = 0; i < numberOfPeriods; i++) {
        let date = new Date()
        if (range === 'today') {
            // Only today
            date = new Date(now)
        } else if (range === 'last7days') {
            date.setDate(now.getDate() - i)
        } else if (range === 'daily') {
            date.setDate(now.getDate() - i)
        } else if (range === 'weekly') {
            date.setDate(now.getDate() - (i * 7))
        } else {
            date.setMonth(now.getMonth() - i)
        }

        grouped.set(date.toISOString().split('T')[0], {
            date,
            income: 0,
            expense: 0
        })
    }

    // Group transactions
    transactions.value.forEach(transaction => {
        const date = new Date(transaction.transaction_at)
        let key = date.toISOString().split('T')[0]

        if (range === 'weekly') {
            // Get the monday of the week
            const day = date.getDay()
            const diff = date.getDate() - day + (day === 0 ? -6 : 1)
            key = new Date(date.setDate(diff)).toISOString().split('T')[0]
        } else if (range === 'monthly') {
            key = date.toISOString().slice(0, 7)
        }

        if (grouped.has(key)) {
            const amount = transaction.amount
            if (transaction.type === 'income') {
                grouped.get(key).income += amount
            } else {
                grouped.get(key).expense += amount
            }
        }
    })

    return Array.from(grouped.values()).reverse()
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

// Stats
const stats = computed(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const totals = transactions.value.reduce((acc, t) => {
        // All time stats
        if (t.type === 'income') {
            acc.totalIncome += t.amount
        } else {
            acc.totalExpense += t.amount
        }

        // This month stats
        const transDate = new Date(t.transaction_at)
        if (transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear) {
            if (t.type === 'income') {
                acc.thisMonthIncome += t.amount
            } else {
                acc.thisMonthExpense += t.amount
            }
        }

        return acc
    }, {
        totalIncome: 0,
        totalExpense: 0,
        thisMonthIncome: 0,
        thisMonthExpense: 0
    })

    return {
        ...totals,
        balance: totals.totalIncome - totals.totalExpense,
        thisMonthBalance: totals.thisMonthIncome - totals.thisMonthExpense
    }
})

// Chart options
const chartData = computed(() => {
    const data = groupTransactionsByRange(selectedRange.value)
    return {
        dates: data.map(d => {
            if (selectedRange.value === 'daily') {
                return new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            } else if (selectedRange.value === 'weekly') {
                return `Minggu ${new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
            } else {
                return new Date(d.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
            }
        }),
        income: data.map(d => d.income),
        expense: data.map(d => d.expense)
    }
})

const expenseVsIncomeOption = computed(() => ({
    tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: any) => {
            const date = chartData.value.dates[params[0].dataIndex]
            return `${date}<br/>${params.map((param: any) => {
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
        data: ['Expense', 'Income'],
        top: 0,
        textStyle: {
            // red
            color: '#333'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        top: 30
    },
    xAxis: {
        type: 'category',
        data: chartData.value.dates,
        axisLabel: {
            rotate: selectedRange.value === 'monthly' ? 0 : 45
        }
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
            name: 'Expense',
            type: 'line',
            data: chartData.value.expense,
            itemStyle: { color: '#ef4444' }
        },
        {
            name: 'Income',
            type: 'line',
            data: chartData.value.income,
            itemStyle: { color: '#22c55e' }
        }
    ]
}))

// const option = ref<ECOption>({
//     dataset: {
//         dimensions: ['Product', '2015', '2016', '2017'],
//         source: [
//             {
//                 Product: 'Matcha Latte',
//                 2015: 54,
//                 2016: 42,
//                 2017: 23,
//             },
//         ],
//     },
//     xAxis: { type: 'category' },
//     yAxis: {},
//     series: [{ type: 'bar' }],
// })

// Compute category distribution
const categoryDistribution = computed(() => {
    const categories = new Map()

    // Filter transactions based on selected range
    const filteredTransactions = filterTransactionsByRange(transactions.value, selectedRange.value)

    // Only process expense transactions
    const expenses = filteredTransactions.filter(t => t.type === 'expense')

    // Group by category and sum amounts
    expenses.forEach(transaction => {
        const categoryName = transaction.categories.name
        if (!categories.has(categoryName)) {
            categories.set(categoryName, 0)
        }
        categories.set(categoryName, categories.get(categoryName) + transaction.amount)
    })

    // Convert to array and sort by amount
    return Array.from(categories.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
})

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
        left: 'left',
        top: 'center',
        textStyle: {
            color: '#333'
        }
    },
    series: [
        {
            name: 'Expense Categories',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 16,
                    fontWeight: 'bold'
                },
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            labelLine: {
                show: false
            },
            data: categoryDistribution.value
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
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Total Balance -->
                <div class="stat bg-base-100 rounded-box shadow">
                    <div class="stat-title">Saldo Total</div>
                    <div class="stat-value" :class="stats.balance >= 0 ? 'text-success' : 'text-error'">
                        {{ stats.balance.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }) }}
                    </div>
                    <div class="stat-desc">Seluruh Waktu</div>
                </div>

                <!-- This Month Balance -->
                <div class="stat bg-base-100 rounded-box shadow">
                    <div class="stat-title">Saldo Bulan Ini</div>
                    <div class="stat-value" :class="stats.thisMonthBalance >= 0 ? 'text-success' : 'text-error'">
                        {{ stats.thisMonthBalance.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }) }}
                    </div>
                    <div class="stat-desc">{{ new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }) }}
                    </div>
                </div>

                <!-- Total Income -->
                <div class="stat bg-base-100 rounded-box shadow">
                    <div class="stat-title">Total Income</div>
                    <div class="stat-value text-success">
                        {{ stats.totalIncome.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }) }}
                    </div>
                    <div class="stat-desc">
                        Bulan Ini: {{ stats.thisMonthIncome.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }) }}
                    </div>
                </div>

                <!-- Total Expense -->
                <div class="stat bg-base-100 rounded-box shadow">
                    <div class="stat-title">Total Expense</div>
                    <div class="stat-value text-error">
                        {{ stats.totalExpense.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }) }}
                    </div>
                    <div class="stat-desc">
                        Bulan Ini: {{ stats.thisMonthExpense.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }) }}
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 gap-6">
                <!-- Income vs Expenses Chart -->
                <div class="bg-base-100 p-6 rounded-box shadow">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-semibold">Income vs Expense</h3>

                        <!-- Range selector -->
                        <select v-model="selectedRange" class="select select-bordered select-sm w-40">
                            <option value="today">Today</option>
                            <option value="last7days">Last 7 Days</option>
                            <option value="daily">Last 30 days</option>
                            <option value="weekly">Last 12 weeks</option>
                            <option value="monthly">Last 12 months</option>
                        </select>
                    </div>
                    <ClientOnly>
                        <v-chart class="w-full h-[400px]" :option="expenseVsIncomeOption" autoresize />
                    </ClientOnly>
                </div>

                <!-- Category Distribution Chart -->
                <div class="bg-base-100 p-6 rounded-box shadow">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-semibold">Expense Categories</h3>
                        <div class="text-sm text-base-content/60">
                            Based on selected time range
                        </div>
                    </div>
                    <ClientOnly>
                        <v-chart class="w-full h-[400px]" :option="categoryDistributionOption" autoresize />
                    </ClientOnly>
                </div>
            </div>
        </template>
    </div>
</template>