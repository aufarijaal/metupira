<script setup lang="ts">
import { JsonViewer } from "vue3-json-viewer"
// if you used v1.0.5 or latster ,you should add import "vue3-json-viewer/dist/index.css"
import "vue3-json-viewer/dist/vue3-json-viewer.css";

definePageMeta({
    layout: 'dashboard'
})

const supabase = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()

const linkedAccountsAsParent = ref([])
const linkedAccountsAsChild = ref([])
const isAddAccountModalOpen = ref(false)
const newAccountEmail = ref("")
const newAccountAlias = ref("")
const loading = ref(false)
const error = ref("")

async function fetchLinkedAccounts() {
    loading.value = true
    error.value = ""
    try {
        // Accounts where user is parent (requester)
        const { data: parentData, error: parentErr } = await supabase
            .from('linked_accounts')
            .select(`
                id,
                child_id,
                parent_id,
                status,
                requested_at,
                approved_at,
                revoked_at,
                alias,
                child:profiles!linked_accounts_child_id_fkey(email)
            `)
            .eq('parent_id', user.value?.id)
        if (parentErr) throw parentErr
        linkedAccountsAsParent.value = parentData || []

        // Accounts where user is child (requested)
        const { data: childData, error: childErr } = await supabase
            .from('linked_accounts')
            .select(`
                id,
                child_id,
                parent_id,
                status,
                requested_at,
                approved_at,
                revoked_at,
                alias,
                parent:profiles!linked_accounts_parent_id_fkey(email)
            `)
            .eq('child_id', user.value?.id)
        if (childErr) throw childErr
        linkedAccountsAsChild.value = childData || []
    } catch (e: any) {
        error.value = 'Failed to load linked accounts: ' + e.message
    } finally {
        loading.value = false
    }
}

const handleAddAccount = () => {
    if (!newAccountEmail.value) {
        error.value = "Please enter an email address.";
        return;
    }
    if (!newAccountAlias.value) {
        error.value = "Please enter an alias.";
        return;
    }

    loading.value = true;
    supabase
        .from('profiles')
        .select('id')
        .eq('email', newAccountEmail.value)
        .then(({ data, error: err }) => {
            if (err) {
                error.value = 'Failed to check email: ' + err.message;
                loading.value = false;
                return;
            }

            if (data.length === 0) {
                error.value = 'Email not found in our records.';
                loading.value = false;
                return;
            }

            supabase
                .from('linked_accounts')
                .insert({
                    child_id: data[0].id,
                    parent_id: user.value?.id,
                    status: 'pending',
                    requested_at: new Date().toISOString(),
                    alias: newAccountAlias.value // Example relation, you might want to make this dynamic
                })
                .then(({ error: insertError }) => {
                    loading.value = false;
                    if (insertError) {
                        error.value = 'Failed to add linked account: ' + insertError.message;
                    } else {
                        isAddAccountModalOpen.value = false; // Close modal on success
                        newAccountEmail.value = ""; // Reset input
                        error.value = "";
                        fetchLinkedAccounts(); // Refresh the list
                    }
                });
        })
}

const removeAccount = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this linked account?')) return;
    loading.value = true
    error.value = ""
    try {
        const { error: err } = await supabase
            .from('linked_accounts')
            .delete()
            .eq('id', id)
        if (err) throw err
        fetchLinkedAccounts()
    } catch (e: any) {
        error.value = 'Failed to remove linked account: ' + e.message
    } finally {
        loading.value = false
    }
}

const revokeLink = async (id: number) => {
    loading.value = true
    error.value = ""
    try {
        const { error: err } = await supabase
            .from('linked_accounts')
            .update({ status: 'revoked', revoked_at: new Date().toISOString() })
            .eq('id', id)
        if (err) throw err
        fetchLinkedAccounts()
    } catch (e: any) {
        error.value = 'Failed to revoke link: ' + e.message
    } finally {
        loading.value = false
    }
}

const allowLink = async (id: number) => {
    if (!window.confirm('Are you sure you want to approve this linking request?')) return;
    loading.value = true
    error.value = ""
    try {
        const { error: err } = await supabase
            .from('linked_accounts')
            .update({ status: 'approved', approved_at: new Date().toISOString() })
            .eq('id', id)
        if (err) throw err
        fetchLinkedAccounts()
    } catch (e: any) {
        error.value = 'Failed to approve link: ' + e.message
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchLinkedAccounts()
})
</script>
<template>
    <div class="min-h-screen p-6 space-y-6">
        <h3 class="text-sm"><span class="font-bold">Linked Accounts</span> lets you view or share transactions with
            others, such as children, spouse, or clients.</h3>

        <!-- Show alert if any pending linking request from requester -->
        <div class="alert alert-warning" v-if="linkedAccountsAsChild.some(acc => acc.status === 'pending')">
            <Icon name="material-symbols:warning" color="black" size="28" />
            You have pending linking requests. Please review them below.
        </div>

        <div class="flex justify-end">
            <button class="btn btn-primary" @click="() => isAddAccountModalOpen = true">
                Add Account
            </button>
        </div>

        <div v-if="error" class="text-error mb-2">{{ error }}</div>

        <!-- Accounts you linked (Requester) -->
        <div>
            <h4 class="font-semibold text-base mb-2">Accounts You Linked</h4>
            <div class="overflow-x-auto bg-base-100 rounded-lg mb-8">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Alias</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Show "No Data" rows if there is no data -->
                        <tr v-if="linkedAccountsAsParent.length === 0">
                            <td colspan="4" class="text-center text-base-content/50">No linked accounts found.</td>
                        </tr>

                        <tr v-for="account in linkedAccountsAsParent" :key="account.id" class="hover">
                            <td>{{ account.child?.email }}</td>
                            <td>{{ account.alias }}</td>
                            <td>{{ account.status }}</td>
                            <td>
                                <button class="btn btn-error btn-sm" @click="removeAccount(account.id)">Remove</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Accounts linked to you (Requested) -->
        <div>
            <h4 class="font-semibold text-base mb-2">Accounts Linked to You</h4>
            <div class="overflow-x-auto bg-base-100 rounded-lg mb-8">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Requester Email</th>
                            <th>Alias</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Show "No Data" rows if there is no data -->
                        <tr v-if="linkedAccountsAsChild.length === 0">
                            <td colspan="4" class="text-center text-base-content/50">No linked accounts found.</td>
                        </tr>

                        <tr v-for="account in linkedAccountsAsChild" :key="account.id" class="hover">
                            <td>{{ account.parent?.email }}</td>
                            <td>{{ account.alias }}</td>
                            <td>{{ account.status }}</td>
                            <td>
                                <div>
                                    <!-- Button to allow if pending -->
                                    <button v-if="account.status === 'pending'" class="btn btn-success btn-sm mr-2"
                                        @click="allowLink(account.id)">Allow</button>
                                    <!-- Button to revoke if not revoked -->
                                    <button v-if="account.status !== 'revoked'" class="btn btn-warning btn-sm"
                                        @click="revokeLink(account.id)">Revoke</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Add Account Modal -->
        <div v-if="isAddAccountModalOpen" class="fixed inset-0 z-50 overflow-y-auto">
            <!-- Modal Backdrop -->
            <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="isAddAccountModalOpen = false">
            </div>

            <!-- Modal Content -->
            <div class="flex min-h-full items-center justify-center p-4">
                <div class="relative w-full max-w-md bg-base-100 rounded-lg shadow-xl p-6">
                    <h3 class="font-bold text-lg mb-4">
                        Add New Linked Account
                    </h3>

                    <div v-if="error" class="text-sm text-error mb-4">
                        <span>{{ error }}</span>
                    </div>

                    <form class="space-y-4" @submit.prevent="handleAddAccount">
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">Email</span>
                            </label>
                            <input v-model="newAccountEmail" type="email" required class="input input-bordered w-full">
                        </div>

                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">Alias</span>
                            </label>
                            <input v-model="newAccountAlias" type="text" required class="input input-bordered w-full">
                        </div>

                        <div class="flex justify-end gap-2 mt-4">
                            <button type="button" class="btn" @click="isAddAccountModalOpen = false">Cancel</button>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading">Adding...</span>
                                <span v-else>Request</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
