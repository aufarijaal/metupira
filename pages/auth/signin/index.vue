<script setup lang="ts">
import { ref } from 'vue';
const supabase = useSupabaseClient()
const loading = ref(false)
const errorMsg = ref("")
const signInWithOAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'http://localhost:3000/auth/callback',
        },
    })
    if (error) console.log(error)
}

const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.log(error)
}

definePageMeta({
    middleware: ["auth"],
})
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-50">
        <div class="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
            <h2 class="text-2xl font-bold text-center">Welcome</h2>
            <button @click="signInWithOAuth" :disabled="loading"
                class="w-full py-2 flex items-center justify-center gap-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                <Icon name="flat-color-icons:google" size="24px" />
                <span v-if="loading">Authenticating...</span>
                <span v-else>Continue with Google</span>
            </button>
            <div v-if="errorMsg" class="mt-4 text-red-600 text-center">{{ errorMsg }}</div>
        </div>
    </div>
</template>
