<template>
  <div class="min-h-screen bg-base-200">
    <!-- Top Navigation -->
    <div class="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div class="navbar-start">
        <UButton
          icon="i-heroicons-bars-3"
          color="neutral"
          variant="ghost"
          class="lg:hidden"
          @click="sidebarOpen = !sidebarOpen"
        />
        <div class="flex items-center gap-3 ml-4 lg:ml-0">
          <UIcon name="i-heroicons-shield-check" class="text-warning w-8 h-8" />
          <div>
            <h1 class="text-xl font-bold">Admin Panel</h1>
            <p class="text-sm text-base-content/70 hidden md:block">
              Stroke-BEFAST Management System
            </p>
          </div>
        </div>
      </div>

      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <li v-for="item in menuItems" :key="item.path">
            <button
              v-if="!item.adminOnly || adminStore.isAdmin()"
              :class="['flex items-center gap-2', item.active ? 'active' : '']"
              @click="navigateTo(item.path)"
            >
              <UIcon :name="item.icon" class="w-5 h-5" />
              {{ item.label }}
            </button>
          </li>
        </ul>
      </div>

      <div class="navbar-end">
        <UDropdownMenu :items="userMenuItems">
          <UButton color="neutral" variant="ghost" class="flex items-center gap-2">
            <UAvatar
              :text="adminStore.adminUser?.name?.charAt(0) || 'A'"
              size="sm"
              class="bg-warning text-warning-content"
            />
            <span class="hidden md:inline">{{ adminStore.adminUser?.name }}</span>
          </UButton>
        </UDropdownMenu>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Mobile Sidebar -->
    <div
      class="fixed left-0 top-16 h-full w-64 bg-base-100 shadow-lg z-40 lg:hidden transition-transform duration-300"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-4">
        <ul class="menu">
          <li v-for="item in menuItems" :key="item.path">
            <button
              v-if="!item.adminOnly || adminStore.isAdmin()"
              :class="['flex items-center gap-3', item.active ? 'active' : '']"
              @click="() => { navigateTo(item.path); sidebarOpen = false }"
            >
              <UIcon :name="item.icon" class="w-5 h-5" />
              {{ item.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Main Content -->
    <main class="min-h-[calc(100vh-4rem)]">
      <slot />
    </main>

    <footer class="footer footer-center p-4 bg-base-300 text-base-content">
      <p>© 2024 Stroke-BEFAST Admin System.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "AdminLayout" });

const route = useRoute();
const adminStore = useAdminStore();
const sidebarOpen = ref(false);

const menuItems = computed(() => [
  {
    icon: "i-heroicons-chart-bar",
    label: "ภาพรวม",
    path: "/admin",
    active: route.path === "/admin" || route.path === "/admin/overview",
  },
  {
    icon: "i-heroicons-users",
    label: "ข้อมูลผู้ป่วย",
    path: "/admin/dashboard",
    active: route.path === "/admin/dashboard",
  },
  {
    icon: "i-heroicons-cog-6-tooth",
    label: "จัดการผู้ใช้งาน",
    path: "/admin/users",
    active: route.path === "/admin/users",
    adminOnly: true,
  },
]);

const userMenuItems = computed(() => [
  [
    {
      label: adminStore.adminUser?.name || "",
      slot: "info",
      disabled: true,
    },
  ],
  [
    {
      label: "กลับสู่หน้าผู้ใช้",
      icon: "i-heroicons-home",
      onSelect: () => navigateTo("/login"),
    },
    {
      label: "ออกจากระบบ",
      icon: "i-heroicons-arrow-right-on-rectangle",
      onSelect: () => {
        adminStore.adminLogout();
        navigateTo("/admin/login");
      },
    },
  ],
]);
</script>
