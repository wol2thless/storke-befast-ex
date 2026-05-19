<template>
  <div class="min-h-screen flex flex-col justify-center items-center px-4 bg-base-200">
    <div class="w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
      <div class="flex flex-col items-center mb-8">
        <span class="w-16 h-16 mb-4 flex items-center justify-center bg-warning rounded-full shadow">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-warning-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </span>
        <h1 class="text-2xl font-bold mb-2 text-center">Admin Dashboard</h1>
        <h2 class="text-base font-medium text-center text-base-content/80">
          ระบบจัดการข้อมูลสำหรับผู้ดูแลระบบ
        </h2>
      </div>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Provider ID</span></label>
          <input v-model="form.providerId" type="text" placeholder="กรุณากรอก Provider ID"
            class="input input-bordered w-full focus:input-primary" :disabled="adminStore.loading" />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">รหัสผ่าน</span></label>
          <div class="relative">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
              placeholder="กรุณากรอกรหัสผ่าน"
              class="input input-bordered w-full pr-12 focus:input-primary" :disabled="adminStore.loading" />
            <button type="button"
              class="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content"
              @click="showPassword = !showPassword">
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="validationError || adminStore.error" class="alert alert-error">
          <span class="text-sm">{{ validationError || adminStore.error }}</span>
        </div>

        <button type="submit" class="btn btn-primary w-full text-lg" :disabled="adminStore.loading">
          <span v-if="adminStore.loading" class="loading loading-spinner loading-sm"></span>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            เข้าสู่ระบบ
          </template>
        </button>
      </form>

      <div class="divider my-6">หรือ</div>
      <button class="btn btn-outline btn-sm w-full" :disabled="adminStore.loading" @click="navigateTo('/login')">
        กลับไปหน้าเข้าสู่ระบบผู้ใช้งาน
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const adminStore = useAdminStore();
const form = reactive({ providerId: "", password: "" });
const showPassword = ref(false);
const validationError = ref("");

function validate(): boolean {
  if (!form.providerId.trim()) { validationError.value = "กรุณากรอก Provider ID"; return false; }
  if (!form.password.trim()) { validationError.value = "กรุณากรอกรหัสผ่าน"; return false; }
  if (form.password.length < 6) { validationError.value = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"; return false; }
  return true;
}

async function handleSubmit() {
  validationError.value = "";
  adminStore.clearError();
  if (!validate()) return;
  const result = await adminStore.adminLogin(form.providerId, form.password);
  if (result.success) await navigateTo("/admin");
}
</script>
