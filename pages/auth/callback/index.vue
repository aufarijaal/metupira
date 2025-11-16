<script setup lang="ts">
import { ref } from 'vue'

const user = useSupabaseUser()
const { t } = useI18n()

// Get redirect path from cookies
const cookieName = useRuntimeConfig().public.supabase.cookieName
const redirectPath = useCookie(`${cookieName}-redirect-path`).value

const status = ref<'authenticating' | 'redirecting'>('authenticating')

watch(user, () => {
    if (user.value) {
        status.value = 'redirecting'
        // Clear cookie
        useCookie(`${cookieName}-redirect-path`).value = null
        // Add slight delay for better UX
        setTimeout(() => {
            navigateTo(redirectPath || '/dashboard')
        }, 500)
    }
}, { immediate: true })
</script>

<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10">
        <div class="text-center space-y-8 p-8">
            <!-- Animated Logo/Icon -->
            <div class="flex justify-center">
                <div class="relative">
                    <!-- Spinning outer ring -->
                    <div
                        class="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin w-24 h-24">
                    </div>
                    <!-- Pulsing inner circle -->
                    <div
                        class="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <svg v-if="status === 'authenticating'" xmlns="http://www.w3.org/2000/svg"
                            class="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-success animate-bounce"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Status Messages -->
            <div class="space-y-4">
                <div v-if="status === 'authenticating'" class="animate-fade-in">
                    <h1 class="text-3xl font-bold text-base-content mb-2">
                        {{ $t('auth.authenticating') }}
                    </h1>
                    <p class="text-base-content/70">
                        {{ $t('auth.pleaseWait') }}
                    </p>
                </div>

                <div v-else class="animate-fade-in">
                    <h1 class="text-3xl font-bold text-success mb-2">
                        {{ $t('auth.authenticationSuccess') }}
                    </h1>
                    <p class="text-base-content/70">
                        {{ $t('auth.redirecting') }}
                    </p>
                </div>

                <!-- Loading dots animation -->
                <div class="flex justify-center space-x-2">
                    <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
            </div>

            <!-- Progress bar -->
            <div class="w-64 mx-auto">
                <div class="h-1 bg-base-300 rounded-full overflow-hidden">
                    <div class="h-full bg-primary animate-progress-bar"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes progress-bar {
    0% {
        width: 0%;
    }

    100% {
        width: 100%;
    }
}

.animate-fade-in {
    animation: fade-in 0.5s ease-out;
}

.animate-progress-bar {
    animation: progress-bar 2s ease-in-out infinite;
}
</style>