<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
    layout: 'dashboard'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const { t } = useI18n()
const localePath = useLocalePath()

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
    // defaulting transaction_at to immeditely show current date
    transaction_at: new Date().toISOString().slice(0, 10) // Format: YYYY-MM-DD
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
            .eq('user_id', user.value?.id)

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

        // console.log('Submitting transaction:', values)

        const { error: dbError } = await supabase
            .from('transactions')
            .insert(values)

        if (dbError) throw dbError

        alertMessage.value = t('transaction.transactionAddedSuccess')
        alertType.value = 'info'
        showAlert.value = true

        // Reset form
        form.value = {
            type: 'expense',
            amount: 0,
            category_id: 0,
            note: '',
            transaction_at: new Date().toISOString().slice(0, 10) // Format: YYYY-MM-DD
        }
    } catch (e: any) {
        error.value = e.message

        alertMessage.value = t('error.somethingWentWrong') + ': ' + e.message
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
            <h1 class="text-2xl font-bold mb-6">{{ $t('transaction.addNewTransaction') }}</h1>

            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Transaction Type -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ $t('transaction.transactionType') }}</span>
                    </label>
                    <div class="flex gap-4">
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" v-model="form.type" value="expense" class="radio" />
                            <span>{{ $t('common.expense') }}</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" v-model="form.type" value="income" class="radio" />
                            <span>{{ $t('common.income') }}</span>
                        </label>
                    </div>
                </div>

                <!-- Amount -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ $t('common.amount') }}</span>
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
                        <span class="label-text">{{ $t('common.category') }}</span>
                    </label>

                    <!-- No Categories Warning -->
                    <div v-if="filteredCategories.length === 0" class="alert alert-warning mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <div class="font-bold">{{ $t('transaction.noCategoriesAvailable') }}</div>
                            <div class="text-sm">{{ $t('transaction.noCategoriesMessage') }}</div>
                        </div>
                        <NuxtLink :to="localePath('/dashboard/categories')" class="btn btn-sm btn-primary">
                            {{ $t('transaction.goToCategories') }}
                        </NuxtLink>
                    </div>

                    <select v-model="form.category_id" class="select select-bordered w-full" required
                        :disabled="filteredCategories.length === 0">
                        <option :value="0">{{ $t('transaction.selectCategory') }}</option>
                        <option v-for="category in filteredCategories" :key="category.id" :value="category.id">
                            {{ category.name }}
                        </option>
                    </select>
                </div>

                <!-- Note -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ $t('common.note') }}</span>
                    </label>
                    <input type="text" v-model="form.note" class="input input-bordered w-full" required />
                </div>

                <!-- Transaction Date and Time -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ $t('transaction.transactionAt') }}</span>
                    </label>
                    <input type="date" v-model="form.transaction_at" class="input input-bordered w-full" required />
                </div>

                <!-- Error Message -->
                <div v-if="error" class="alert alert-error">
                    {{ error }}
                </div>

                <!-- Submit Button -->
                <div class="form-control">
                    <button type="submit" class="btn btn-primary w-full"
                        :disabled="loading || filteredCategories.length === 0">
                        <span v-if="loading">{{ $t('transaction.adding') }}</span>
                        <span v-else>{{ $t('transaction.addTransaction') }}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
