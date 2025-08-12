<template>
    <div role="alert" :class="`alert alert-${type}`">
        <span>{{ message }}</span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    message: string,
    type?: 'info' | 'success' | 'warning' | 'error'
}>()
</script>