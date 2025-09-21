<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useTheme } from '~/composables/useTheme'
import useTransactionRange from '~/composables/useTransactionRange'
import type { Transaction, ChartData, CategoryData } from '~/types'

definePageMeta({
    title: 'Dashboard',
    layout: 'dashboard',
})

const supabase = useSupabaseClient()
const { dateRange, selectedRange, groupTransactionsByRange, filterTransactionsByRange } = useTransactionRange()
const user = useSupabaseUser()

// Account switching
const accounts = ref<{ id: string, label: string }[]>([])
const selectedAccountId = ref<string>('')

const transactions = ref<Transaction[]>([])
const loading = ref(true)
const error = ref('')

// Fetch linked accounts for switcher
const fetchAccounts = async () => {
    accounts.value = []
    // Own account
    if (user.value?.id) {
        accounts.value.push({ id: user.value.id, label: user.value.email || 'My Account' })
        selectedAccountId.value = user.value.id
    }
    // Linked accounts (as parent/requester)
    const { data, error: err } = await supabase
        .from('linked_accounts')
        .select('child_id,child:profiles!linked_accounts_child_id_fkey(email),status')
        .eq('parent_id', user.value?.id)
        .eq('status', 'approved')
    if (!err && data) {
        data.forEach((acc: any) => {
            accounts.value.push({ id: acc.child_id, label: acc.child?.email || 'Linked Account' })
        })
    }
}

// Fetch transactions for selected account
const fetchTransactions = async () => {
    loading.value = true
    error.value = ''
    try {
        const { data, error: err } = await supabase
            .from('transactions')
            .select(`*, categories ( name )`)
            .eq('user_id', selectedAccountId.value)
            .order('transaction_at', { ascending: false })
        if (err) throw err
        transactions.value = data || []
    } catch (e: any) {
        error.value = 'Failed to load transactions: ' + e.message
    } finally {
        loading.value = false
    }
}

watch(selectedAccountId, () => {
    fetchTransactions()
})

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
    const data = groupTransactionsByRange(transactions.value, selectedRange.value)

    return {
        dates: data.map((d: { date: Date }) => {
            // Always show day and month for daily and custom ranges
            if (selectedRange.value === 'daily' || selectedRange.value === 'custom' || selectedRange.value === 'last7days') {
                return new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            } else if (selectedRange.value === 'weekly') {
                return `Minggu ${new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
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
    const filteredTransactions = filterTransactionsByRange(transactions.value, selectedRange.value)

    // Only process expense transactions
    const expenses = filteredTransactions.filter((t: Transaction) => t.type === 'expense')

    // Group by category and sum amounts
    expenses.forEach((t: Transaction) => {
        const categoryName = t.categories.name
        categories.set(
            categoryName,
            (categories.get(categoryName) || 0) + t.amount
        )
    })

    // Convert to array and sort by amount
    return Array.from(categories.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
})

// Initialize data fetching
onMounted(async () => {
    await fetchAccounts()
    await fetchTransactions()
})
</script>

<template>
    <div class="min-h-screen p-6 space-y-6">
        <!-- Account Switcher -->
        <div class="mb-6 flex items-center gap-4">
            <label class="font-semibold">View as:</label>
            <select v-model="selectedAccountId" class="select select-bordered">
                <option v-for="acc in accounts" :key="acc.id" :value="acc.id">{{ acc.label }}</option>
            </select>
        </div>

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