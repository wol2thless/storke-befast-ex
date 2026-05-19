<template>
  <div class="flex items-center justify-center min-h-screen">
    <p class="text-base-content/70">กำลังออกจากระบบ...</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const authStore = useAuthStore();

onMounted(() => {
  authStore.logout();
  navigateTo("/login");
});
</script>
