<template>
  <div class="p-6 max-w-lg">
    <div class="flex items-center gap-3 mb-6">
      <button class="btn btn-ghost btn-sm" @click="navigateTo('/admin/users')">← กลับ</button>
      <h2 class="text-2xl font-bold">เพิ่มเจ้าหน้าที่</h2>
    </div>

    <div class="card bg-base-100 shadow">
      <div class="card-body space-y-4">
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Provider ID</span></label>
          <input v-model="form.provider_id" type="text" class="input input-bordered" placeholder="กรอก Provider ID" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">ชื่อ</span></label>
          <input v-model="form.name" type="text" class="input input-bordered" placeholder="กรอกชื่อ" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">รหัสผ่าน</span></label>
          <input v-model="form.password" type="password" class="input input-bordered" placeholder="กรอกรหัสผ่าน" />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text font-medium">บทบาท</span></label>
          <select v-model="form.role" class="select select-bordered">
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div v-if="msg" :class="['alert', msgError ? 'alert-error' : 'alert-success']">
          <span>{{ msg }}</span>
        </div>
        <button class="btn btn-primary w-full" :disabled="saving" @click="handleCreate">
          <span v-if="saving" class="loading loading-spinner loading-sm"></span>
          สร้างบัญชี
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const form = reactive({ provider_id: "", name: "", password: "", role: "staff" });
const saving = ref(false);
const msg = ref("");
const msgError = ref(false);

async function handleCreate() {
  if (!form.provider_id || !form.name || !form.password) { msg.value = "กรุณากรอกข้อมูลให้ครบ"; msgError.value = true; return; }
  if (form.password.length < 6) { msg.value = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"; msgError.value = true; return; }
  saving.value = true; msg.value = ""; msgError.value = false;
  try {
    const res = await $fetch<{ success: boolean; message?: string }>("/api/admin/users", { method: "POST", body: form });
    if (res.success) {
      msg.value = "สร้างบัญชีสำเร็จ"; msgError.value = false;
      form.provider_id = ""; form.name = ""; form.password = ""; form.role = "staff";
    } else { msg.value = res.message || "เกิดข้อผิดพลาด"; msgError.value = true; }
  } catch { msg.value = "เกิดข้อผิดพลาด"; msgError.value = true; }
  finally { saving.value = false; }
}
</script>
