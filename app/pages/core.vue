<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <div class="w-full max-w-xs bg-base-200 rounded-xl shadow p-6 flex flex-col items-center">
      <div class="mb-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#2563eb" fill-opacity="0.1" />
          <path d="M7 13l3 3 7-7" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>

      <div v-if="loading" class="text-info text-lg font-semibold">
        กำลังตรวจสอบ ThaiD...
      </div>

      <template v-else-if="errorMsg">
        <div class="text-error text-lg font-semibold mb-2">เกิดข้อผิดพลาด</div>
        <div class="text-base-content/70 text-sm text-center mb-3">{{ errorMsg }}</div>
        <button class="btn btn-primary btn-sm" @click="navigateTo('/login')">กลับหน้าเข้าสู่ระบบ</button>
      </template>

      <template v-else-if="success">
        <div class="text-success text-lg font-semibold mb-2">เข้าสู่ระบบสำเร็จ</div>
        <div class="text-base-content/70">กำลังนำท่านไปยังหน้าข้อมูลผู้ใช้งาน...</div>
      </template>

      <template v-else>
        <div class="text-error text-lg font-semibold mb-2">เข้าสู่ระบบไม่สำเร็จ</div>
        <div class="text-base-content/70 mb-3">กรุณาลองใหม่อีกครั้ง</div>
        <button class="btn btn-primary btn-sm" @click="navigateTo('/login')">กลับหน้าเข้าสู่ระบบ</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const route = useRoute();
const authStore = useAuthStore();
const config = useRuntimeConfig();

const loading = ref(true);
const success = ref(false);
const errorMsg = ref<string | null>(null);

onMounted(async () => {
  const code = route.query.code as string;
  if (!code) {
    loading.value = false;
    errorMsg.value = "ไม่พบรหัสยืนยันจาก ThaiD";
    return;
  }

  const basePath = config.public.basePath || "";
  const redirectUri = `${window.location.origin}${basePath}/core`;

  try {
    const res = await $fetch<{
      success: boolean;
      message?: string;
      fetchError?: string;
      responseData?: { id_token?: string; decoded?: Record<string, unknown> };
    }>("/api/thaid-verify", {
      method: "POST",
      body: { code, redirect_uri: redirectUri },
    });

    if (res.success && res.responseData?.id_token && res.responseData?.decoded) {
      authStore.login(res.responseData.id_token, res.responseData.decoded as Parameters<typeof authStore.login>[1]);
      success.value = true;
      loading.value = false;
      await navigateTo("/person-info");
    } else {
      loading.value = false;
      errorMsg.value = res.fetchError ?? res.message ?? "ThaiD ตรวจสอบไม่สำเร็จ";
    }
  } catch (err) {
    loading.value = false;
    errorMsg.value = err instanceof Error ? err.message : "API error";
  }
});
</script>
