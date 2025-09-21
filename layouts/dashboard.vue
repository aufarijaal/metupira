<template>
    <div class="h-screen bg-base-200 flex overflow-hidden">
        <!-- Mobile Overlay -->
        <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            @click="toggleMobileMenu"></div>

        <!-- Sidebar -->
        <aside :class="[
            'fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-base-100 shadow-lg transform transition-transform duration-300 ease-in-out flex-shrink-0',
            'lg:transform-none',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            !isSidebarOpen && 'lg:w-16'
        ]">
            <div class="flex flex-col h-full">
                <!-- Logo/Brand -->
                <div class="flex items-center justify-between p-4 border-b border-base-300">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center" v-if="isSidebarOpen">
                            <img src="~/assets/img/metupira-icon.png" />
                        </div>
                        <transition name="fade">
                            <span v-if="isSidebarOpen" class="text-xl font-bold text-base-content">
                                Dashboard
                            </span>
                        </transition>
                    </div>

                    <!-- Desktop Toggle -->
                    <button @click="toggleSidebar" class="hidden lg:flex btn btn-ghost btn-sm btn-square">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <!-- Mobile Close -->
                    <button @click="toggleMobileMenu" class="lg:hidden btn btn-ghost btn-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 p-4 space-y-2">
                    <div v-for="item in menuItems" :key="item.id" class="relative">
                        <button @click="selectMenuItem(item)" :class="[
                            'w-full flex items-center rounded-lg transition-colors duration-200',
                            'space-x-3 px-3 py-2',
                            { 'lg:justify-center lg:py-3 lg:px-0': !isSidebarOpen },
                            activeMenuItem === item.id
                                ? 'bg-primary text-primary-content'
                                : 'text-base-content hover:bg-base-200'
                        ]">
                            <div class="w-5 h-5 flex-shrink-0" v-html="item.icon"></div>
                            <transition name="fade">
                                <span :class="[
                                    'text-sm font-medium',
                                    { 'lg:hidden': !isSidebarOpen }
                                ]">
                                    {{ item.name }}
                                </span>
                            </transition>
                        </button>
                    </div>
                </nav>

                <!-- User Profile -->
                <div class="p-4 border-t border-base-300">
                    <div class="flex items-center space-x-3">
                        <div class="avatar">
                            <div class="w-10 h-10 rounded-full">
                                <ClientOnly>
                                    <img :src="user?.user_metadata.picture" alt="User Avatar">
                                </ClientOnly>
                            </div>
                        </div>
                        <transition name="fade">
                            <div :class="['flex-1 min-w-0', { 'lg:hidden': !isSidebarOpen }]">
                                <p class="text-sm font-medium text-base-content truncate">{{ user?.user_metadata.name }}
                                </p>
                                <p class="text-xs text-base-content/70 truncate">{{ user?.user_metadata.email }}</p>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <!-- Header -->
            <header
                class="bg-base-100 shadow-sm border-b border-base-300 flex-shrink-0 h-[65px] flex items-center w-full justify-between px-2">
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center space-x-4">
                        <!-- Mobile Menu Toggle -->
                        <button @click="toggleMobileMenu" class="lg:hidden btn btn-ghost btn-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <h1 class="text-2xl font-bold text-base-content">
                            {{ getCurrentPageTitle() }}
                        </h1>
                    </div>

                    <!-- Header Actions -->
                    <div class="flex items-center space-x-2">
                        <div>
                            <NotificationArea />
                        </div>
                        <ThemeController />
                        <button @click="handleSignOut" :disabled="isSigningOut" class="btn btn-ghost btn-sm">
                            <span>{{ isSigningOut ? 'Signing out...' : 'Sign out' }}</span>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Content Area -->
            <div class="flex-1 overflow-y-auto p-0 lg:p-6">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import type { MenuItem } from '~/types/menu'
import { useRouter, useRoute } from 'vue-router'

// Auth composable
const { user, signOut: handleSignOut } = useAuth()

// Reactive state
const isSidebarOpen = ref<boolean>(true)
const isMobileMenuOpen = ref<boolean>(false)
const activeMenuItem = ref<string>('dashboard')
const isSigningOut = ref(false)

// Menu items
const menuItems: MenuItem[] = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        icon: '<svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>'
    },
    {
        id: 'linked-accounts',
        name: 'Linked Accounts',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"><g fill="currentColor"><path fill-rule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0a3.75 3.75 0 0 1-7.5 0m7.5 3a3 3 0 1 1 6 0a3 3 0 0 1-6 0m-13.5 0a3 3 0 1 1 6 0a3 3 0 0 1-6 0m4.06 5.368A6.75 6.75 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498a.75.75 0 0 1-.372.568A12.7 12.7 0 0 1 12 21.75a12.7 12.7 0 0 1-6.337-1.684a.75.75 0 0 1-.372-.568a6.8 6.8 0 0 1 1.019-4.38" clip-rule="evenodd"/><path d="m5.082 14.254l-.036.055a8.3 8.3 0 0 0-1.271 5.08a9.7 9.7 0 0 1-1.765-.44l-.115-.04a.56.56 0 0 1-.373-.487l-.01-.121Q1.5 18.15 1.5 18a3.75 3.75 0 0 1 3.582-3.746m15.144 5.135a8.3 8.3 0 0 0-1.308-5.135a3.75 3.75 0 0 1 3.57 4.047l-.01.121a.56.56 0 0 1-.373.486l-.115.04q-.851.302-1.764.441"/></g></svg>'
    },
    {
        id: 'add-transaction',
        name: 'Add Transaction',
        icon: '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/></svg>'
    },
    {
        id: 'categories',
        name: 'Categories',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"><path fill="currentColor" d="M6.5 11L12 2l5.5 9zm11 11q-1.875 0-3.187-1.312T13 17.5t1.313-3.187T17.5 13t3.188 1.313T22 17.5t-1.312 3.188T17.5 22M3 21.5v-8h8v8z"/></svg>'
    },
    {
        id: 'reports',
        name: 'Reports',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"><path fill="currentColor" d="M17.45 15.18L22 7.31V21H2V3h2v12.54L9.5 6L16 9.78l4.24-7.33l1.73 1l-5.23 9.05l-6.51-3.75L4.31 19h2.26l4.39-7.56z"/></svg>'
    },
    {
        id: 'settings',
        name: 'Settings',
        icon: '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>'
    },
]

// Methods
const toggleSidebar = (): void => {
    isSidebarOpen.value = !isSidebarOpen.value
}

const toggleMobileMenu = (): void => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const router = useRouter()
const route = useRoute()

const selectMenuItem = (item: MenuItem): void => {
    activeMenuItem.value = item.id
    // Close mobile menu when item is selected
    if (isMobileMenuOpen.value) {
        isMobileMenuOpen.value = false
    }
    // Handle navigation
    const route = item.id === 'dashboard' ? '/dashboard' : `/dashboard/${item.id}`
    router.push(route)
}

const getCurrentPageTitle = (): string => {
    const item = menuItems.find(item => item.id === activeMenuItem.value)
    return item?.name || 'Dashboard'
}

const getCurrentPageIcon = (): string => {
    const item = menuItems.find(item => item.id === activeMenuItem.value)
    return item?.icon || menuItems[0].icon
}

// Watch route changes to update activeMenuItem
watch(
    () => route.fullPath,
    (newPath) => {
        // Extract the last segment after /dashboard
        const match = newPath.match(/\/dashboard(?:\/([^/?#]+))?/)
        if (match) {
            activeMenuItem.value = match[1] || 'dashboard'
        }
    },
    { immediate: true }
)

// Handle window resize
const handleResize = (): void => {
    if (window.innerWidth >= 1024) {
        isMobileMenuOpen.value = false
    }
}

// Lifecycle
onMounted(() => {
    window.addEventListener('resize', handleResize)
    // Set initial sidebar state based on screen size
    if (window.innerWidth >= 1024) {
        isSidebarOpen.value = true
    } else {
        isSidebarOpen.value = false
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Custom transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.4);
}

/* Ensure proper overflow handling */
.overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}
</style>