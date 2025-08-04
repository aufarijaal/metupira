<script setup lang="tsx">
import {
    useVueTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type ColumnDef
} from '@tanstack/vue-table'
import { ref, onMounted, computed } from 'vue'

interface Transaction {
    id: number
    type: 'income' | 'expense'
    amount: number
    category_id: number
    category_name: string
    note: string
    transaction_at: string
    created_at: string
}

// Table state
const transactions = ref<Transaction[]>([])
const loading = ref(true)
const error = ref('')

// Filter state
const dateRange = ref({
    start: '',
    end: ''
})
const typeFilter = ref<'all' | 'income' | 'expense'>('all')
const categoryFilter = ref<number | null>(null)
const categories = ref<{ id: number; name: string }[]>([])

const supabase = useSupabaseClient()

// Fetch transactions with their category names
const fetchTransactions = async () => {
    loading.value = true
    error.value = ''

    try {
        const { data, error: dbError } = await supabase
            .from('transactions')
            .select(`
                *,
                categories (
                    name
                )
            `)
            .order('transaction_at', { ascending: false })

        if (dbError) throw dbError

        transactions.value = (data || []).map(t => ({
            ...t,
            category_name: t.categories.name,
            transaction_at: new Date(t.transaction_at).toLocaleString(),
            created_at: new Date(t.created_at).toLocaleString()
        }))
    } catch (e: any) {
        error.value = 'Failed to load transactions: ' + e.message
    } finally {
        loading.value = false
    }
}

// Fetch categories for filter
const fetchCategories = async () => {
    try {
        const { data, error: dbError } = await supabase
            .from('categories')
            .select('id, name')
            .order('name')

        if (dbError) throw dbError
        categories.value = data || []
    } catch (e: any) {
        error.value = 'Failed to load categories: ' + e.message
    }
}

// Define columns
const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: 'transaction_at',
        header: 'Date & Time',
        cell: row => row.getValue()
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: row => (
            <span class={row.getValue() === 'income' ? 'text-success' : 'text-error'}>
                {row.getValue() === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </span>
        )
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: row => {
            const amount = Number(row.getValue())
            const type = row.row.original.type
            return (
                <span class={type === 'income' ? 'text-success' : 'text-error'}>
                    {amount.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    })}
                </span>
            )
        }
    },
    {
        accessorKey: 'category_name',
        header: 'Category'
    },
    {
        accessorKey: 'note',
        header: 'Note'
    }
]

// Create table instance
const table = useVueTable({
    get data() {
        return transactions.value
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
        pagination: {
            pageSize: 10
        }
    }
})

// Filter functions
const applyFilters = () => {
    let filtered = [...transactions.value]

    if (typeFilter.value !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter.value)
    }

    if (categoryFilter.value) {
        filtered = filtered.filter(t => t.category_id === categoryFilter.value)
    }

    if (dateRange.value.start && dateRange.value.end) {
        const start = new Date(dateRange.value.start)
        const end = new Date(dateRange.value.end)
        filtered = filtered.filter(t => {
            const date = new Date(t.transaction_at)
            return date >= start && date <= end
        })
    }

    return filtered
}

// Stats
const stats = computed(() => {
    const filtered = applyFilters()
    const totalIncome = filtered
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
    const totalExpense = filtered
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
    }
})

// Reset filters
const resetFilters = () => {
    dateRange.value = { start: '', end: '' }
    typeFilter.value = 'all'
    categoryFilter.value = null
}

// Initialize
onMounted(() => {
    fetchTransactions()
    fetchCategories()
})

definePageMeta({
    layout: 'dashboard'
})
</script>

<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">Transaction Reports</h1>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-error mb-4">
            {{ error }}
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="stat bg-base-100 shadow rounded-lg">
                <div class="stat-title">Total Income</div>
                <div class="stat-value text-success">{{ stats.totalIncome.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) }}</div>
            </div>
            <div class="stat bg-base-100 shadow rounded-lg">
                <div class="stat-title">Total Expenses</div>
                <div class="stat-value text-error">{{ stats.totalExpense.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) }}</div>
            </div>
            <div class="stat bg-base-100 shadow rounded-lg">
                <div class="stat-title">Balance</div>
                <div class="stat-value" :class="stats.balance >= 0 ? 'text-success' : 'text-error'">
                    {{ stats.balance.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }) }}
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-base-100 p-4 rounded-lg shadow mb-6">
            <div class="flex xl:flex-row flex-col items-center gap-4">
                <div class="form-control w-full">
                    <label class="label">Date Range</label>
                    <div class="flex xl:flex-row flex-col gap-2">
                        <input type="date" v-model="dateRange.start" class="input input-bordered w-full" />
                        <input type="date" v-model="dateRange.end" class="input input-bordered w-full" />
                    </div>
                </div>
                <div class="form-control w-full">
                    <label class="label">Type</label>
                    <select v-model="typeFilter" class="select select-bordered w-full">
                        <option value="all">Semua</option>
                        <option value="income">Pemasukan</option>
                        <option value="expense">Pengeluaran</option>
                    </select>
                </div>
                <div class="form-control w-full">
                    <label class="label">Category</label>
                    <select v-model="categoryFilter" class="select select-bordered w-full">
                        <option :value="null">All Categories</option>
                        <option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.name }}
                        </option>
                    </select>
                </div>
                <div class="form-control w-full">
                    <label class="label opacity-0">Actions</label>
                    <button class="btn btn-ghost" @click="resetFilters">Reset Filters</button>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-base-100 rounded-lg shadow overflow-hidden">
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th v-for="column in table.getAllColumns()" :key="column.id"
                                :class="{ 'cursor-pointer select-none': column.getCanSort() }"
                                @click="column.getToggleSortingHandler()">
                                {{ column.columnDef.header as string }}
                                <span v-if="column.getCanSort()">
                                    {{ {
                                        asc: ' 🔼',
                                        desc: ' 🔽',
                                    }[column.getIsSorted() as string] ?? ' ↕️' }}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="5" class="text-center py-4">Loading...</td>
                        </tr>
                        <tr v-else v-for="row in table.getRowModel().rows" :key="row.id">
                            <td v-for="cell in row.getVisibleCells()" :key="cell.id">
                                {{ cell.getValue() }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between p-4 border-t">
                <div class="flex items-center gap-2">
                    <select v-model="table.getState().pagination.pageSize" class="select select-bordered select-sm">
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                    </select>
                    <span class="text-sm text-gray-600">
                        Page {{ table.getState().pagination.pageIndex + 1 }} of
                        {{ table.getPageCount() }}
                    </span>
                </div>
                <div class="join">
                    <button class="join-item btn btn-sm" :disabled="!table.getCanPreviousPage()"
                        @click="table.previousPage()">
                        Previous
                    </button>
                    <button class="join-item btn btn-sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
