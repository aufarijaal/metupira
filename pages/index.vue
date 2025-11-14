<script setup lang="ts">
const user = useSupabaseUser()
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-base-100 relative">
        <div class="absolute inset-0 bg-black/10"></div>
        <div
            class="relative z-10 flex flex-col items-center justify-center text-center text-primary-content px-4 py-10 w-full max-w-xl">
            <img src="~/assets/img/metupira-icon.png" alt="Metu Pira" class="w-20 h-20 mb-6 rounded-lg shadow-lg">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ $t('landing.title') }}</h1>
            <p class="text-lg md:text-xl mb-8 opacity-90">{{ $t('landing.subtitle') }}</p>
            <div class="flex gap-4 justify-center">
                <NuxtLink v-if="user" :to="$localePath('dashboard')" class="btn btn-primary btn-lg">
                    {{ $t('landing.goToDashboard') }}
                </NuxtLink>
                <NuxtLink v-else :to="$localePath('/auth/signin')" class="btn btn-secondary btn-lg">
                    {{ $t('landing.signIn') }}
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* No extra styles needed for this simple layout */
</style>