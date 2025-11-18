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
    transaction_at_raw: string
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
    note: '',
    transaction_at: ''
})

const categories = ref<{ id: number; name: string }[]>([])
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t } = useI18n()
const localePath = useLocalePath()

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
            .eq('user_id', user.value?.id)

        if (dbError) throw dbError

        transactions.value = (data || []).map((t: any) => ({
            ...t,
            category_name: t.categories.name,
            transaction_at_raw: t.transaction_at,
            transaction_at: new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
            }).format(new Date(t.transaction_at))
        }))
    } catch (e: any) {
        error.value = t('error.failedToLoad', { resource: t('transaction.transactions').toLowerCase(), message: e.message })
    } finally {
        loading.value = false
    }
}

// Define columns
const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: 'transaction_at',
        header: 'Transaction date',
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
        error.value = t('error.failedToLoad', { resource: t('category.categories').toLowerCase(), message: e.message })
    }
}

const openEditModal = (transaction: Transaction) => {
    selectedTransaction.value = transaction
    editForm.value = {
        type: transaction.type,
        amount: transaction.amount,
        category_id: transaction.category_id,
        note: transaction.note,
        transaction_at: transaction.transaction_at_raw.split('T')[0]
    }
    isEditModalOpen.value = true
    console.log(editForm.value)
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
                note: editForm.value.note,
                transaction_at: editForm.value.transaction_at
            })
            .eq('id', selectedTransaction.value.id)

        if (updateError) throw updateError

        await fetchTransactions()
        isEditModalOpen.value = false
        selectedTransaction.value = null
    } catch (e: any) {
        error.value = t('error.failedToUpdate', { resource: t('transaction.transaction').toLowerCase(), message: e.message })
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
        error.value = t('error.failedToDelete', { resource: t('transaction.transaction').toLowerCase(), message: e.message })
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
        <h1 class="text-2xl font-bold mb-6">{{ $t('transaction.allTransactions') }}</h1>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-error mb-4">
            {{ error }}
        </div>

        <!-- Table Controls -->
        <div class="flex flex-wrap gap-4 mb-4">
            <div class="form-control">
                <label class="label">{{ $t('transaction.typeFilter') }}</label>
                <select v-model="typeFilter" class="select select-bordered w-[200px]">
                    <option value="all">{{ $t('transaction.allTransactions') }}</option>
                    <option value="income">{{ $t('transaction.incomeOnly') }}</option>
                    <option value="expense">{{ $t('transaction.expensesOnly') }}</option>
                </select>
            </div>

            <div class="form-control">
                <label class="label">{{ $t('transaction.sortBy') }}</label>
                <select class="select select-bordered w-[200px]" :value="table.getState().sorting[0]?.id || ''" @change="e => {
                    const value = e.target.value
                    if (value) {
                        table.setSorting([{ id: value, desc: table.getState().sorting[0]?.desc ?? false }])
                    } else {
                        table.setSorting([])
                    }
                }">
                    <option value="">{{ $t('common.none') }}</option>
                    <option value="transaction_at">{{ $t('common.date') }}</option>
                    <option value="amount">{{ $t('common.amount') }}</option>
                </select>
            </div>

            <div class="form-control">
                <label class="label">{{ $t('transaction.sortOrder') }}</label>
                <select class="select select-bordered w-[200px]"
                    :value="table.getState().sorting[0]?.desc ? 'desc' : 'asc'" @change="e => {
                        const currentSort = table.getState().sorting[0]
                        if (currentSort) {
                            table.setSorting([{ ...currentSort, desc: e.target.value === 'desc' }])
                        }
                    }" :disabled="!table.getState().sorting[0]">
                    <option value="asc">{{ $t('common.ascending') }}</option>
                    <option value="desc">{{ $t('common.descending') }}</option>
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
                    <!-- Empty State -->
                    <tr v-if="table.getRowModel().rows.length === 0">
                        <td :colspan="columns.length" class="text-center py-12">
                            <div class="flex flex-col items-center justify-center space-y-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-base-content/20"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                    <h3 class="text-lg font-semibold text-base-content/70">{{
                                        $t('transaction.noTransactionsFound') }}</h3>
                                    <p class="text-sm text-base-content/50">{{ $t('transaction.noTransactionsMessage')
                                    }}</p>
                                </div>
                                <NuxtLink :to="$localePath('/dashboard/add-transaction')"
                                    class="btn btn-primary btn-sm">
                                    {{ $t('transaction.addNewTransaction') }}
                                </NuxtLink>
                            </div>
                        </td>
                    </tr>
                    <!-- Data Rows -->
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
                        <option value="5">5 {{ $t('transaction.perPage') }}</option>
                        <option value="10">10 {{ $t('transaction.perPage') }}</option>
                        <option value="20">20 {{ $t('transaction.perPage') }}</option>
                        <option value="50">50 {{ $t('transaction.perPage') }}</option>
                    </select>
                    <span class="text-sm">
                        {{ $t('common.page') }} {{ table.getState().pagination.pageIndex + 1 }} {{ $t('common.of') }} {{
                            table.getPageCount() }}
                    </span>
                </div>
                <div class="join">
                    <button class="join-item btn btn-sm" :disabled="!table.getCanPreviousPage()"
                        @click="table.previousPage()">
                        {{ $t('common.previous') }}
                    </button>
                    <button class="join-item btn btn-sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
                        {{ $t('common.next') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Edit Modal -->
        <dialog class="modal" :class="{ 'modal-open': isEditModalOpen }">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">{{ $t('transaction.editTransaction') }}</h3>
                <form @submit.prevent="handleEdit">
                    <div class="form-control w-full mb-4">
                        <label class="label">{{ $t('common.type') }}</label>
                        <select v-model="editForm.type" class="select select-bordered w-full">
                            <option value="income">{{ $t('common.income') }}</option>
                            <option value="expense">{{ $t('common.expense') }}</option>
                        </select>
                    </div>

                    <div class="form-control w-full mb-4">
                        <label class="label">{{ $t('common.amount') }}</label>
                        <input type="number" v-model="editForm.amount" class="input input-bordered w-full" required />
                    </div>

                    <div class="form-control w-full mb-4">
                        <label class="label">{{ $t('common.category') }}</label>
                        <select v-model="editForm.category_id" class="select select-bordered w-full" required>
                            <option v-for="category in categories" :key="category.id" :value="category.id">
                                {{ category.name }}
                            </option>
                        </select>
                    </div>

                    <div class="form-control w-full mb-4">
                        <label class="label">{{ $t('common.note') }}</label>
                        <textarea v-model="editForm.note" class="textarea textarea-bordered w-full" rows="3"></textarea>
                    </div>

                    <div class="form-control w-full mb-4">
                        <label class="label">{{ $t('transaction.transactionDate') }}</label>
                        <input type="date" v-model="editForm.transaction_at" class="input input-bordered w-full"
                            required />
                    </div>

                    <div class="modal-action">
                        <button type="button" class="btn" @click="isEditModalOpen = false">{{ $t('common.cancel')
                        }}</button>
                        <button type="submit" class="btn btn-primary" :disabled="loading">{{ $t('common.saveChanges')
                        }}</button>
                    </div>
                </form>
            </div>
            <form method="dialog" class="modal-backdrop" @click="isEditModalOpen = false">
                <button>{{ $t('common.close') }}</button>
            </form>
        </dialog>

        <!-- Delete Confirmation Modal -->
        <dialog class="modal" :class="{ 'modal-open': isDeleteModalOpen }">
            <div class="modal-box">
                <h3 class="font-bold text-lg">{{ $t('transaction.confirmDelete') }}</h3>
                <p class="py-4">{{ $t('transaction.confirmDeleteMessage') }}</p>
                <div class="modal-action">
                    <button class="btn" @click="isDeleteModalOpen = false">{{ $t('common.cancel') }}</button>
                    <button class="btn btn-error" @click="handleDelete" :disabled="loading">{{ $t('common.delete')
                    }}</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop" @click="isDeleteModalOpen = false">
                <button>{{ $t('common.close') }}</button>
            </form>
        </dialog>
    </div>
</template>
