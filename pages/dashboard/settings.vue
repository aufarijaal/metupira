<script setup lang="ts">
definePageMeta({
    layout: "dashboard",
});

useHead({
    title: "Settings",
    meta: [{ name: "description", content: "User settings page" }],
});

const { locales, setLocale, locale } = useI18n();
</script>

<template>
    <div class="min-h-screen p-6 space-y-6">
        <!-- Enable Notifications -->
        <div class="bg-base-100 p-6 rounded-box shadow">
            <h2 class="text-2xl font-bold mb-4">{{ $t('settings.enableNotifications') }}</h2>
            <client-only>
                <button-notification-enablement />
            </client-only>
        </div>

        <!-- Language switcher -->
        <div class="bg-base-100 p-6 rounded-box shadow">
            <h2 class="text-2xl font-bold mb-4">{{ $t('settings.language') }}</h2>
            <select v-model="locale" @change="setLocale(locale)" class="select select-bordered w-full max-w-xs">
                <option v-for="lang in locales" :key="lang.code" :value="lang.code">
                    {{ lang.name }}
                </option>
            </select>
        </div>

        <!-- Delete Account -->
        <div class="bg-base-100 p-6 rounded-box shadow">
            <h2 class="text-2xl font-bold mb-4">{{ $t('settings.deleteAccount') }}</h2>
            <p class="mb-4">{{ $t('settings.deleteAccountWarning') }}</p>
            <button class="btn btn-error">{{ $t('settings.deleteAccount') }}</button>
        </div>
    </div>
</template>
