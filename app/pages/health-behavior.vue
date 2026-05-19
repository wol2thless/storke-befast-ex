<template>
  <div class="max-w-md mx-auto p-4">
    <div class="bg-base-100 rounded shadow p-4 mb-6">
      <HealthBehaviorForm :pid="pid" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const authStore = useAuthStore();
const pid = computed(() => authStore.getPid());
</script>
