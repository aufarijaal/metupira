<script setup lang="ts">
definePageMeta({
    layout: 'dashboard',
})

useHead({
    title: 'Profile',
    meta: [
        { name: 'description', content: 'User profile page' },
    ],
})
</script>

<template>
    <div>
        {{ $t('profile.profilePage') }}
    </div>
</template>
