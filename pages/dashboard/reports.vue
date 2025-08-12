<script setup lang="tsx">
import {
    useVueTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    FlexRender,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/table-core'
import { ref, onMounted } from 'vue'

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
        header: 'Note',
    },
]

// Create table instance
const table = useVueTable({
    get data() {
        return transactions.value
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    // initialState: {
    //     pagination: {
    //         pageSize: 10
    //     }
    // }
})

// Initialize
onMounted(() => {
    fetchTransactions()
})

definePageMeta({
    layout: 'dashboard'
})
</script>

<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">All Transactions</h1>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-error mb-4">
            {{ error }}
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
            <table
                class="table table-xs table-zebra w-full border-2 border-[var(--fallback-bc,oklch(var(--bc)/0.2))] [&_td]:border [&_td]:border-[var(--fallback-bc,oklch(var(--bc)/0.2))] [&_th]:border [&_th]:border-[var(--fallback-bc,oklch(var(--bc)/0.2))]">
                <thead>
                    <tr>
                        <th v-for="column in table.getHeaderGroups()[0].headers" :key="column.id">
                            {{ column.column.columnDef.header }}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="hover" v-for="row in table.getRowModel().rows" :key="row.id">
                        <td v-for="cell in row.getVisibleCells()" :key="cell.id">
                            {{ cell.renderValue() }}
                        </td>
                        <!-- actions -->
                        <td>
                            <div class="flex gap-2">
                                <NuxtLink :to="`/dashboard/edit-transaction/${row.original.id}`"
                                    class="btn btn-xs btn-primary">
                                    Edit
                                </NuxtLink>
                                <button @click="() => { }" class="btn btn-xs btn-error">
                                    Delete
                                </button>
                            </div>

                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
