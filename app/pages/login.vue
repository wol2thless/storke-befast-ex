<template>
  <div class="min-h-[70vh] flex flex-col justify-center items-center px-4">
    <div class="w-full max-w-xs bg-base-100 rounded-xl shadow-lg p-6 flex flex-col items-center">
      <span class="w-16 h-16 mb-4 flex items-center justify-center bg-primary rounded-full shadow">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </span>
      <h1 class="text-xl font-bold mb-1 text-center">Stroke-BEFAST</h1>
      <h2 class="text-base font-medium mb-2 text-center text-base-content/80">
        ระบบจัดการข้อมูลโรคหลอดเลือดสมอง
      </h2>
      <p class="text-sm text-center mb-6 text-base-content/70">
        กรุณาเข้าสู่ระบบด้วย ThaiD เพื่อความปลอดภัยของข้อมูล
      </p>
      <button class="btn btn-primary w-full flex items-center justify-center gap-2 text-lg" @click="handleLoginThaiD">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
        </svg>
        เข้าสู่ระบบด้วย ThaiD
      </button>

      <template v-if="config.public.manualUrl">
        <div class="mt-4 w-full">
          <a :href="config.public.manualUrl" target="_blank" rel="noopener noreferrer"
            class="btn btn-outline btn-info btn-sm w-full flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            คู่มือการใช้งานและปัญหาการใช้งาน
          </a>
        </div>
      </template>

      <template v-if="config.public.assessmentFormUrl">
        <div class="mt-2 w-full">
          <a :href="config.public.assessmentFormUrl" target="_blank" rel="noopener noreferrer"
            class="btn btn-outline btn-success btn-sm w-full flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            แบบประเมินความรู้เบื้องต้น
          </a>
        </div>
      </template>

      <div class="divider my-4">หรือ</div>
      <button class="btn btn-outline btn-warning btn-sm w-full" @click="navigateTo('/admin/login')">
        เข้าสู่ระบบสำหรับเจ้าหน้าที่
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const config = useRuntimeConfig();

function handleLoginThaiD() {
  const clientId = config.public.thaidClientId;
  const basePath = config.public.basePath || "";
  const redirectUri = `${window.location.origin}${basePath}/core`;
  const scope = "openid pid address gender birthdate given_name middle_name family_name name given_name_en middle_name_en family_name_en name_en title title_en ial smartcard_code date_of_expiry date_of_issuance";
  const url = `https://imauth.bora.dopa.go.th/api/v2/oauth2/auth/?&client_id=${clientId}&scope=${scope}&state=ThaiD&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
  window.location.href = url;
}
</script>
