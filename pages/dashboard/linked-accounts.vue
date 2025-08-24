<script setup lang="ts">
import { JsonViewer } from "vue3-json-viewer"
// if you used v1.0.5 or latster ,you should add import "vue3-json-viewer/dist/index.css"
import "vue3-json-viewer/dist/vue3-json-viewer.css";

definePageMeta({
    layout: 'dashboard'
})

const supabase = useSupabaseClient()
const router = useRouter()
const { user } = useSupabaseUser()

const linkedAccounts = ref([])
const isAddAccountModalOpen = ref(false)
const newAccountEmail = ref("")
const loading = ref(false)
const error = ref("")

async function fetchLinkedAccounts() {
    try {
        // get email from public.profiles
        const { data, error: err } = await supabase
            .from('linked_accounts')
            .select(`
                id,
                child_id,
                parent_id,
                status,
                requested_at,
                approved_at,
                revoked_at,
                child:profiles!linked_accounts_child_id_fkey(email),
                parent:profiles!linked_accounts_parent_id_fkey(email)
            `)

        if (err) throw err
        linkedAccounts.value = data || []
    } catch (e: any) {
        console.log(e)
        error.value = 'Failed to load transactions: ' + e.message
    } finally {
        loading.value = false
    }
}

const handleAddAccount = () => {
    if (!newAccountEmail.value) {
        error.value = "Please enter an email address.";
        return;
    }

    // Here you would typically call an API to add the account
    // For now, we will just log the email to be added
    console.log(`Adding account with email: ${newAccountEmail.value}`);

    // Check if email is exist
    loading.value = true;
    supabase
        .from('profiles')
        .select('id')
        .eq('email', newAccountEmail.value)
        .then(({ data, error: err }) => {
            if (err) {
                error.value = 'Failed to check email: ' + err.message;
                return;
            }

            if (data.length === 0) {
                error.value = 'Email not found in our records.';
                return;
            }

            // If email exists, proceed to add linked account
            supabase
                .from('linked_accounts')
                .insert({
                    child_id: data[0].id,
                    parent_id: user.value?.id,
                    status: 'pending'
                })
                .then(({ error: insertError }) => {
                    if (insertError) {
                        error.value = 'Failed to add linked account: ' + insertError.message;
                    } else {
                        isAddAccountModalOpen.value = false; // Close modal on success
                        newAccountEmail.value = ""; // Reset input
                        fetchLinkedAccounts(); // Refresh the list
                    }
                });
        })


    // Reset the input and close the modal
    newAccountEmail.value = "";
    isAddAccountModalOpen.value = false;
};

const removeAccount = (id: number) => {
    // Here you would typically call an API to remove the account
    // For now, we will just log the id to be removed
    console.log(`Removing account with id: ${id}`);
    // You can also filter out the account from dummyLinkedAccounts if needed
};

onMounted(() => {
    // fetchLinkedAccounts()
})
</script>
<template>
    <div class="min-h-screen p-6 space-y-6">
        <!-- <h3><span class="font-bold">Linked Accounts</span> is a feature where you able to view other people
            transactions, could be your children,
            spouse, client, etc.</h3>

        <div>
            <button class="btn btn-primary" @click="() => isAddAccountModalOpen = true">
                Add Account
            </button>
        </div> -->

        <!-- <JsonViewer :value="linkedAccounts" boxed sort theme="dark" /> -->


        <!-- list of linked accounts. contain their email, access status, and actions to delete -->
        <!-- <div class="overflow-x-auto bg-base-100">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Access Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="hover" v-for="account in linkedAccounts" :key="account.child_id">
                        <td>{{ account.child.email }}</td>
                        <td>{{ account.status }}</td>
                        <td>
                            <button class="btn btn-error btn-sm"
                                @click="removeAccount(account.child_id)">Remove</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div> -->

        <!-- Add Account Modal -->
        <!-- <dialog class="modal" :class="{ 'modal-open': isAddAccountModalOpen }">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">
                    Add New Linked Account
                </h3>

                <div v-if="error" class="text-sm text-error mb-4">
                    <span>{{ error }}</span>
                </div>

                <form @submit.prevent="handleAddAccount" class="space-y-4">
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Email</span>
                        </label>

                        <input type="email" v-model="newAccountEmail" required class="input input-bordered w-full" />
                    </div>

                    <div class="modal-action">
                        <button type="button" class="btn" @click="isAddAccountModalOpen = false">Cancel</button>
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            <span v-if="loading">Adding...</span>
                            <span v-else>Request</span>
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" class="modal-backdrop" @click="isAddAccountModalOpen = false">
                <button>close</button>
            </form>
        </dialog> -->

        <!-- Placeholder -->
        <div class="text-center py-20">
            <h2 class="text-2xl font-bold mb-4">Feature in Development</h2>
            <p class="text-base-content/70">The linked accounts feature is currently under development. Please
                check back later!</p>
        </div>
    </div>
</template>
