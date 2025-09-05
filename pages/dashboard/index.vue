<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTheme } from '~/composables/useTheme'
import useTransactionRange from '~/composables/useTransactionRange'
import type { Transaction, ChartData, CategoryData } from '~/types'

definePageMeta({
    title: 'Dashboard',
    layout: 'dashboard',
})

const supabase = useSupabaseClient()
const { dateRange, selectedRange } = useTransactionRange()

// Data refs
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

// Stats
const stats = computed(() => {
    const filteredTransactions = transactions.value.filter(t => {
        if (selectedRange.value === 'custom' && dateRange.value.start && dateRange.value.end) {
            const transDate = new Date(t.transaction_at)
            const start = new Date(dateRange.value.start)
            const end = new Date(dateRange.value.end)
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            return transDate >= start && transDate <= end
        }
        return true
    })

    return filteredTransactions.reduce((acc, t) => {
        if (t.type === 'income') {
            acc.totalIncome += t.amount
        } else {
            acc.totalExpense += t.amount
        }
        return acc
    }, {
        totalIncome: 0,
        totalExpense: 0
    })
})

// Chart data preparation
const chartData = computed<ChartData>(() => {
    const data = useTransactionRange().groupTransactionsByRange(transactions.value, selectedRange.value)

    return {
        dates: data.map((d: { date: Date }) => {
            if (selectedRange.value === 'daily' || selectedRange.value === 'custom') {
                return new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            } else if (selectedRange.value === 'weekly') {
                return `Minggu ${new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
            } else {
                return new Date(d.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
            }
        }),
        income: data.map((d: { income: number }) => d.income),
        expense: data.map((d: { expense: number }) => d.expense)
    }
})

// Category distribution
const categoryData = computed<CategoryData[]>(() => {
    const categories = new Map<string, number>()
    const filteredTransactions = useTransactionRange().filterTransactionsByRange(transactions.value, selectedRange.value)

    // Only process expense transactions
    const expenses = filteredTransactions.filter((t: Transaction) => t.type === 'expense')

    // Group by category and sum amounts
    expenses.forEach((transaction: Transaction) => {
        const categoryName = transaction.categories.name
        categories.set(
            categoryName,
            (categories.get(categoryName) || 0) + transaction.amount
        )
    })

    // Convert to array and sort by amount
    return Array.from(categories.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
})

// Initialize data fetching
onMounted(() => {
    fetchTransactions()
})
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
            <!-- AI Summary Button -->
            <div>
                <AISummarize />
            </div>

            <!-- Stats Overview -->
            <div class="grid sm:grid-cols-2 gap-6">
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
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 gap-6">
                <!-- Income vs Expenses Chart -->
                <div class="bg-base-100 p-6 rounded-box shadow">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h3 class="text-lg font-semibold">Income vs Expense</h3>
                        <DateRangeSelector v-model:selectedRange="selectedRange" v-model:dateRange="dateRange" />
                    </div>
                    <ClientOnly>
                        <ExpenseIncomeChart :data="chartData" />
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
                        <CategoryDistributionChart :data="categoryData" />
                    </ClientOnly>
                </div>
            </div>
        </template>
    </div>
</template>