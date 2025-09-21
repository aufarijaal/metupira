<script setup lang="tsx">
import {
    useVueTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    FlexRender,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { ref, onMounted, computed, watch } from 'vue'

interface Transaction {
    id: number
    type: 'income' | 'expense'
    amount: number
    category_id: number
    category_name: string
    note: string
    transaction_at: string
}

// Table state
const transactions = ref<Transaction[]>([])
const loading = ref(true)
const error = ref('')
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const typeFilter = ref<'all' | 'income' | 'expense'>('all')
const editForm = ref({
    type: '',
    amount: 0,
    category_id: null as number | null,
    note: ''
})

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

        transactions.value = (data || []).map((t: any) => ({
            ...t,
            category_name: t.categories.name,
            transaction_at: new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
            }).format(new Date(t.transaction_at))
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
        header: 'Date',
        cell: (row: any) => row.getValue(),
        sortingFn: (rowA: any, rowB: any) => {
            return new Date(rowA.original.transaction_at).getTime() - new Date(rowB.original.transaction_at).getTime()
        }
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: (row: any) => (
            <span class={row.getValue() === 'income' ? 'text-success' : 'text-error'}>
                {row.getValue() === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </span>
        )
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: (row: any) => {
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
        },
        sortingFn: (rowA: any, rowB: any) => Number(rowA.original.amount) - Number(rowB.original.amount)
    },
    {
        accessorKey: 'category_name',
        header: 'Category'
    },
    {
        accessorKey: 'note',
        header: 'Note',
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: (row: any) => (
            <div class="flex gap-2">
                <button
                    class="btn btn-xs btn-success"
                    onClick={() => openEditModal(row.row.original)}
                >
                    Edit
                </button>
                <button
                    class="btn btn-xs btn-error"
                    onClick={() => openDeleteModal(row.row.original)}
                >
                    Delete
                </button>
            </div>
        )
    }
]

// Computed filtered data
const filteredTransactions = computed(() => {
    return typeFilter.value === 'all'
        ? transactions.value
        : transactions.value.filter(t => t.type === typeFilter.value)
})

// Create table instance
const table = useVueTable<Transaction>({
    get data() {
        return filteredTransactions.value
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
        pagination: {
            pageSize: 10
        }
    }
})

// Reset to first page when filter changes
watch(typeFilter, () => {
    table.setPageIndex(0)
})// Fetch categories
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

const openEditModal = (transaction: Transaction) => {
    selectedTransaction.value = transaction
    editForm.value = {
        type: transaction.type,
        amount: transaction.amount,
        category_id: transaction.category_id,
        note: transaction.note,
        // transaction_at: new Date(transaction.transaction_at).toISOString().split('T')[0]
    }
    isEditModalOpen.value = true
}

const openDeleteModal = (transaction: Transaction) => {
    selectedTransaction.value = transaction
    isDeleteModalOpen.value = true
}

const handleEdit = async () => {
    if (!selectedTransaction.value) return

    try {
        loading.value = true
        const { error: updateError } = await supabase
            .from('transactions')
            .update({
                type: editForm.value.type,
                amount: editForm.value.amount,
                category_id: editForm.value.category_id,
                note: editForm.value.note
            })
            .eq('id', selectedTransaction.value.id)

        if (updateError) throw updateError

        await fetchTransactions()
        isEditModalOpen.value = false
        selectedTransaction.value = null
    } catch (e: any) {
        error.value = 'Failed to update transaction: ' + e.message
    } finally {
        loading.value = false
    }
}

const handleDelete = async () => {
    if (!selectedTransaction.value) return

    try {
        loading.value = true
        const { error: deleteError } = await supabase
            .from('transactions')
            .delete()
            .eq('id', selectedTransaction.value.id)

        if (deleteError) throw deleteError

        await fetchTransactions()
        isDeleteModalOpen.value = false
        selectedTransaction.value = null
    } catch (e: any) {
        error.value = 'Failed to delete transaction: ' + e.message
    } finally {
        loading.value = false
    }
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
        <h1 class="text-2xl font-bold mb-6">All Transactions</h1>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-error mb-4">
            {{ error }}
        </div>

        <!-- Table Controls -->
        <div class="flex flex-wrap gap-4 mb-4">
            <div class="form-control">
                <label class="label">Type Filter</label>
                <select v-model="typeFilter" class="select select-bordered w-[200px]">
                    <option value="all">All Transactions</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expenses Only</option>
                </select>
            </div>

            <div class="form-control">
                <label class="label">Sort By</label>
                <select class="select select-bordered w-[200px]" :value="table.getState().sorting[0]?.id || ''" @change="e => {
                    const value = e.target.value
                    if (value) {
                        table.setSorting([{ id: value, desc: table.getState().sorting[0]?.desc ?? false }])
                    } else {
                        table.setSorting([])
                    }
                }">
                    <option value="">None</option>
                    <option value="transaction_at">Date</option>
                    <option value="amount">Amount</option>
                </select>
            </div>

            <div class="form-control">
                <label class="label">Sort Order</label>
                <select class="select select-bordered w-[200px]"
                    :value="table.getState().sorting[0]?.desc ? 'desc' : 'asc'" @change="e => {
                        const currentSort = table.getState().sorting[0]
                        if (currentSort) {
                            table.setSorting([{ ...currentSort, desc: e.target.value === 'desc' }])
                        }
                    }" :disabled="!table.getState().sorting[0]">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto bg-base-100 rounded-lg shadow">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th v-for="column in table.getHeaderGroups()[0].headers" :key="column.id">
                            {{ column.column.columnDef.header }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="hover" v-for="row in table.getRowModel().rows" :key="row.id">
                        <td v-for="cell in row.getVisibleCells()" :key="cell.id">
                            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div class="flex items-center justify-between p-4 border-t">
                <div class="flex items-center gap-2">
                    <select :value="table.getState().pagination.pageSize"
                        @change="e => table.setPageSize(Number(e.target.value))"
                        class="select select-bordered select-sm">
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                    </select>
                    <span class="text-sm">
                        Page {{ table.getState().pagination.pageIndex + 1 }} of {{ table.getPageCount() }}
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

        <!-- Edit Modal -->
        <dialog class="modal" :class="{ 'modal-open': isEditModalOpen }">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">Edit Transaction</h3>
                <form @submit.prevent="handleEdit">
                    <div class="form-control w-full mb-4">
                        <label class="label">Type</label>
                        <select v-model="editForm.type" class="select select-bordered w-full">
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </select>
                    </div>

                    <div class="form-control w-full mb-4">
                        <label class="label">Amount</label>
                        <input type="number" v-model="editForm.amount" class="input input-bordered w-full" required />
                    </div>

                    <div class="form-control w-full mb-4">
                        <label class="label">Category</label>
                        <select v-model="editForm.category_id" class="select select-bordered w-full" required>
                            <option v-for="category in categories" :key="category.id" :value="category.id">
                                {{ category.name }}
                            </option>
                        </select>
                    </div>

                    <div class="form-control w-full mb-4">
                        <label class="label">Note</label>
                        <textarea v-model="editForm.note" class="textarea textarea-bordered w-full" rows="3"></textarea>
                    </div>

                    <div class="modal-action">
                        <button type="button" class="btn" @click="isEditModalOpen = false">Cancel</button>
                        <button type="submit" class="btn btn-primary" :disabled="loading">Save Changes</button>
                    </div>
                </form>
            </div>
            <form method="dialog" class="modal-backdrop" @click="isEditModalOpen = false">
                <button>close</button>
            </form>
        </dialog>

        <!-- Delete Confirmation Modal -->
        <dialog class="modal" :class="{ 'modal-open': isDeleteModalOpen }">
            <div class="modal-box">
                <h3 class="font-bold text-lg">Confirm Delete</h3>
                <p class="py-4">Are you sure you want to delete this transaction? This action cannot be undone.</p>
                <div class="modal-action">
                    <button class="btn" @click="isDeleteModalOpen = false">Cancel</button>
                    <button class="btn btn-error" @click="handleDelete" :disabled="loading">Delete</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop" @click="isDeleteModalOpen = false">
                <button>close</button>
            </form>
        </dialog>
    </div>
</template>
