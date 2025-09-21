<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
    layout: 'dashboard'
})

const supabase = useSupabaseClient()
const router = useRouter()

interface Category {
    id: number
    name: string
    type: 'income' | 'expense'
}

interface TransactionForm {
    type: 'income' | 'expense'
    amount: number
    category_id: number
    note: string
    transaction_at: string
}

const form = ref<TransactionForm>({
    type: 'expense',
    amount: 0,
    category_id: 0,
    note: '',
    transaction_at: new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
})

const loading = ref(false)
const error = ref('')
const categories = ref<Category[]>([])
const filteredCategories = computed(() =>
    categories.value.filter(cat => cat.type === form.value.type)
)
const showAlert = ref(false)
const alertMessage = ref('')
const alertType = ref<'info' | 'success' | 'warning' | 'error'>('success')
const amountRef = ref<HTMLInputElement | null>(null)

// Fetch categories on component mount
const fetchCategories = async () => {
    try {
        const { data, error: fetchError } = await supabase
            .from('categories')
            .select('id, name, type')
            .order('name')

        if (fetchError) throw fetchError
        if (data) categories.value = data
    } catch (e: any) {
        error.value = 'Failed to load categories: ' + e.message
    }
}

onMounted(() => {
    fetchCategories()
})

const handleSubmit = async () => {
    loading.value = true
    error.value = ''

    try {
        const user = useSupabaseUser()
        if (!user.value) throw new Error('User not authenticated')

        const values: any = {
            type: form.value.type,
            amount: form.value.amount,
            category_id: form.value.category_id,
            note: form.value.note,
            transaction_at: new Date(form.value.transaction_at).toISOString(),
            user_id: user.value.id
        }

        console.log('Submitting transaction:', values)

        const { error: dbError } = await supabase
            .from('transactions')
            .insert(values)

        if (dbError) throw dbError

        alertMessage.value = 'Transaction added successfully!'
        alertType.value = 'info'
        showAlert.value = true

        // Reset form
        form.value = {
            type: 'expense',
            amount: 0,
            category_id: 0,
            note: '',
            transaction_at: new Date().toISOString().slice(0, 16)
        }
    } catch (e: any) {
        error.value = e.message

        alertMessage.value = 'Error: ' + e.message
        alertType.value = 'error'
    } finally {
        loading.value = false
        amountRef.value?.focus()
        setTimeout(() => {
            showAlert.value = false
            alertMessage.value = ''
            alertType.value = 'info'
            // Optionally redirect or reset state
            // router.push('/dashboard/transactions')
        }, 3000)
    }
}
</script>

<template>
    <div class="max-w-2xl mx-auto space-y-2">
        <Alert :message="alertMessage" :type="alertType" v-if="showAlert" />

        <div class="p-6 bg-base-100 rounded-lg shadow">
            <h1 class="text-2xl font-bold mb-6">Add New Transaction</h1>

            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Transaction Type -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Transaction Type</span>
                    </label>
                    <div class="flex gap-4">
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" v-model="form.type" value="expense" class="radio" />
                            <span>Expense</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" v-model="form.type" value="income" class="radio" />
                            <span>Income</span>
                        </label>
                    </div>
                </div>

                <!-- Amount -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Amount</span>
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2">Rp.</span>
                        <input type="number" v-model="form.amount" step="0.01" min="0" required
                            class="input input-bordered pl-10 w-full" ref="amountRef" />
                    </div>
                </div>

                <!-- Category -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Category</span>
                    </label>
                    <select v-model="form.category_id" class="select select-bordered w-full" required>
                        <option :value="0">Select a category</option>
                        <option v-for="category in filteredCategories" :key="category.id" :value="category.id">
                            {{ category.name }}
                        </option>
                    </select>
                </div>

                <!-- Note -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Note</span>
                    </label>
                    <input type="text" v-model="form.note" class="input input-bordered w-full" required />
                </div>

                <!-- Transaction Date and Time -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Transaction at</span>
                    </label>
                    <input type="date" v-model="form.transaction_at" class="input input-bordered w-full" required />
                </div>

                <!-- Error Message -->
                <div v-if="error" class="alert alert-error">
                    {{ error }}
                </div>

                <!-- Submit Button -->
                <div class="form-control">
                    <button type="submit" class="btn btn-primary w-full" :disabled="loading">
                        <span v-if="loading">Adding...</span>
                        <span v-else>Add Transaction</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
