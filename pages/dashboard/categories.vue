<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Category {
    id: number
    name: string
    type: 'income' | 'expense'
}

interface CategoryForm {
    name: string
    type: 'income' | 'expense'
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref('')

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Form state
const form = ref<CategoryForm>({
    name: '',
    type: 'expense'
})

// Selected category for edit/delete
const selectedCategory = ref<Category | null>(null)

// Fetch all categories
const fetchCategories = async () => {
    loading.value = true
    error.value = ''

    try {
        const { data, error: fetchError } = await supabase
            .from('categories')
            .select('*')
            .order('type')
            .order('name')
            .eq('user_id', user.value?.id)

        if (fetchError) throw fetchError
        categories.value = data || []
    } catch (e: any) {
        error.value = 'Failed to load categories: ' + e.message
    } finally {
        loading.value = false
    }
}

// Add new category
const handleAdd = async () => {
    loading.value = true
    error.value = ''

    try {
        const user = useSupabaseUser()
        if (!user.value) throw new Error('User not authenticated')

        const { error: addError } = await supabase
            .from('categories')
            .insert({
                name: form.value.name,
                type: form.value.type,
                user_id: user.value.id
            } as any)

        if (addError) throw addError

        await fetchCategories()
        showAddModal.value = false
        resetForm()
    } catch (e: any) {
        error.value = 'Failed to add category: ' + e.message
    } finally {
        loading.value = false
    }
}

// Update category
const handleEdit = async () => {
    if (!selectedCategory.value) return

    loading.value = true
    error.value = ''

    try {
        const user = useSupabaseUser()
        if (!user.value) throw new Error('User not authenticated')

        const { error: updateError } = await supabase
            .from('categories')
            .update({
                name: form.value.name,
                type: form.value.type,
                user_id: user.value.id
            } as never)
            .eq('id', selectedCategory.value.id)

        if (updateError) throw updateError

        await fetchCategories()
        showEditModal.value = false
        resetForm()
    } catch (e: any) {
        error.value = 'Failed to update category: ' + e.message
    } finally {
        loading.value = false
    }
}

// Delete category
const handleDelete = async () => {
    if (!selectedCategory.value) return

    loading.value = true
    error.value = ''

    try {
        const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .eq('id', selectedCategory.value.id)

        if (deleteError) throw deleteError

        await fetchCategories()
        showDeleteModal.value = false
        selectedCategory.value = null
    } catch (e: any) {
        error.value = 'Failed to delete category: ' + e.message
    } finally {
        loading.value = false
    }
}

// Open edit modal
const openEditModal = (category: Category) => {
    selectedCategory.value = category
    form.value = {
        name: category.name,
        type: category.type
    }
    showEditModal.value = true
}

// Open delete modal
const openDeleteModal = (category: Category) => {
    selectedCategory.value = category
    showDeleteModal.value = true
}

// Reset form
const resetForm = () => {
    form.value = {
        name: '',
        type: 'expense'
    }
    selectedCategory.value = null
}

// Initialize
onMounted(() => {
    fetchCategories()
})

definePageMeta({
    layout: 'dashboard'
})
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">{{ $t('category.categories') }}</h1>
            <button class="btn btn-primary" @click="showAddModal = true">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ $t('category.addCategory') }}
            </button>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-error mb-4">
            {{ error }}
        </div>

        <!-- Categories Table -->
        <div class="bg-base-100 rounded-lg shadow overflow-hidden">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>{{ $t('common.name') }}</th>
                        <th>{{ $t('common.type') }}</th>
                        <th>{{ $t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading">
                        <td colspan="3" class="text-center py-4">{{ $t('common.loading') }}</td>
                    </tr>
                    <tr v-else-if="categories.length === 0">
                        <td colspan="3" class="text-center py-4">{{ $t('category.noCategoriesFound') }}</td>
                    </tr>
                    <tr v-for="category in categories" :key="category.id">
                        <td>{{ category.name }}</td>
                        <td>
                            <span :class="[
                                'badge',
                                category.type === 'income' ? 'badge-success' : 'badge-error'
                            ]">
                                {{ $t(`common.${category.type}`) }}
                            </span>
                        </td>
                        <td class="flex gap-2">
                            <button class="btn btn-sm btn-ghost" @click="openEditModal(category)">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button class="btn btn-sm btn-ghost text-error" @click="openDeleteModal(category)">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Add Category Modal -->
        <dialog class="modal" :class="{ 'modal-open': showAddModal }">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">{{ $t('category.addNewCategory') }}</h3>
                <form @submit.prevent="handleAdd">
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">{{ $t('common.name') }}</span>
                        </label>
                        <input v-model="form.name" type="text" class="input input-bordered" required />
                    </div>
                    <div class="form-control mb-6">
                        <label class="label">
                            <span class="label-text">{{ $t('common.type') }}</span>
                        </label>
                        <select v-model="form.type" class="select select-bordered" required>
                            <option value="expense">{{ $t('common.expense') }}</option>
                            <option value="income">{{ $t('common.income') }}</option>
                        </select>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" @click="showAddModal = false">{{ $t('common.cancel')
                        }}</button>
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            {{ loading ? $t('category.adding') : $t('category.addCategory') }}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showAddModal = false">{{ $t('common.close') }}</button>
            </form>
        </dialog>

        <!-- Edit Category Modal -->
        <dialog class="modal" :class="{ 'modal-open': showEditModal }">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">{{ $t('category.editCategory') }}</h3>
                <form @submit.prevent="handleEdit">
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">{{ $t('common.name') }}</span>
                        </label>
                        <input v-model="form.name" type="text" class="input input-bordered" required />
                    </div>
                    <div class="form-control mb-6">
                        <label class="label">
                            <span class="label-text">{{ $t('common.type') }}</span>
                        </label>
                        <select v-model="form.type" class="select select-bordered" required>
                            <option value="expense">{{ $t('common.expense') }}</option>
                            <option value="income">{{ $t('common.income') }}</option>
                        </select>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" @click="showEditModal = false">{{ $t('common.cancel')
                        }}</button>
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            {{ loading ? $t('category.saving') : $t('common.saveChanges') }}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showEditModal = false">{{ $t('common.close') }}</button>
            </form>
        </dialog>

        <!-- Delete Category Modal -->
        <dialog class="modal" :class="{ 'modal-open': showDeleteModal }">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">{{ $t('category.deleteCategory') }}</h3>
                <p>{{ $t('category.confirmDeleteMessage', { name: selectedCategory?.name }) }}</p>
                <p class="text-sm text-error mt-2">{{ $t('category.actionCannotBeUndone') }}</p>
                <div class="modal-action">
                    <button class="btn" @click="showDeleteModal = false">{{ $t('common.cancel') }}</button>
                    <button class="btn btn-error" @click="handleDelete" :disabled="loading">
                        {{ loading ? $t('category.deleting') : $t('common.delete') }}
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showDeleteModal = false">{{ $t('common.close') }}</button>
            </form>
        </dialog>
    </div>
</template>
