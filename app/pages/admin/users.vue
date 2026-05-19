<template>
  <div class="p-4 md:p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">⚙️ จัดการเจ้าหน้าที่</h2>
      <button class="btn btn-primary btn-sm" @click="navigateTo('/admin/create-user')">+ เพิ่มเจ้าหน้าที่</button>
    </div>

    <!-- Filter tabs -->
    <div class="tabs tabs-box mb-4">
      <button class="tab" :class="filter === 'all' && 'tab-active'" @click="filter = 'all'">ทั้งหมด</button>
      <button class="tab" :class="filter === 'active' && 'tab-active'" @click="filter = 'active'">เปิดใช้งาน</button>
      <button class="tab" :class="filter === 'inactive' && 'tab-active'" @click="filter = 'inactive'">ปิดใช้งาน</button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="!filteredUsers.length" class="text-center py-12 text-base-content/50">ไม่มีข้อมูล</div>

    <div v-else class="space-y-3">
      <div v-for="u in filteredUsers" :key="u.id" class="card bg-base-100 shadow">
        <div class="card-body p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              {{ String(u.name || "?").charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold truncate">{{ u.name }}</div>
              <div class="text-xs text-base-content/50">{{ u.provider_id }}</div>
              <div class="flex gap-2 mt-1">
                <span class="badge badge-sm" :class="u.role === 'admin' ? 'badge-warning' : 'badge-info'">
                  {{ u.role === 'admin' ? 'ผู้ดูแล' : 'เจ้าหน้าที่' }}
                </span>
                <span class="badge badge-sm" :class="isActive(u) ? 'badge-success' : 'badge-error'">
                  {{ isActive(u) ? 'เปิด' : 'ปิด' }}
                </span>
              </div>
            </div>
            <div class="flex gap-1 shrink-0">
              <button class="btn btn-xs btn-outline" @click="openEdit(u)">✏️</button>
              <button class="btn btn-xs" :class="isActive(u) ? 'btn-error' : 'btn-success'"
                @click="toggleActive(u)">
                {{ isActive(u) ? 'ปิด' : 'เปิด' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit modal -->
  <div v-if="editUser" class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">✏️ แก้ไขข้อมูล</h3>
      <div class="form-control mb-3">
        <label class="label"><span class="label-text">ชื่อ</span></label>
        <input v-model="editForm.name" type="text" class="input input-bordered" placeholder="ชื่อ" />
      </div>
      <div class="form-control mb-3">
        <label class="label"><span class="label-text">บทบาท</span></label>
        <select v-model="editForm.role" class="select select-bordered">
          <option value="staff">เจ้าหน้าที่ (staff)</option>
          <option value="admin">ผู้ดูแล (admin)</option>
        </select>
      </div>
      <div class="form-control mb-3">
        <label class="label"><span class="label-text">รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)</span></label>
        <input v-model="editForm.password" type="password" class="input input-bordered" placeholder="รหัสผ่านใหม่" autocomplete="new-password" />
      </div>
      <div class="form-control mb-4">
        <label class="label cursor-pointer justify-start gap-3">
          <input v-model="editForm.is_active" type="checkbox" class="checkbox checkbox-success" />
          <span class="label-text">เปิดใช้งาน</span>
        </label>
      </div>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="editUser = null">ยกเลิก</button>
        <button class="btn btn-primary" :disabled="saving" @click="saveEdit">
          <span v-if="saving" class="loading loading-spinner loading-sm"></span>
          บันทึก
        </button>
      </div>
    </div>
    <div class="modal-backdrop" @click="editUser = null"></div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

type AdminUser = Record<string, string | number>;

const loading = ref(true);
const saving = ref(false);
const users = ref<AdminUser[]>([]);
const filter = ref<"all" | "active" | "inactive">("all");
const editUser = ref<AdminUser | null>(null);
const editForm = reactive({ name: "", role: "staff", password: "", is_active: true });

const filteredUsers = computed(() => {
  if (filter.value === "active") return users.value.filter(u => isActive(u));
  if (filter.value === "inactive") return users.value.filter(u => !isActive(u));
  return users.value;
});

function isActive(u: AdminUser) {
  return u.is_active === "1" || u.is_active === 1;
}

function openEdit(u: AdminUser) {
  editUser.value = u;
  editForm.name = String(u.name || "");
  editForm.role = String(u.role || "staff");
  editForm.password = "";
  editForm.is_active = isActive(u);
}

async function saveEdit() {
  if (!editUser.value) return;
  saving.value = true;
  try {
    const body: Record<string, unknown> = {
      name: editForm.name,
      role: editForm.role,
      is_active: editForm.is_active ? 1 : 0,
    };
    if (editForm.password) body.password = editForm.password;
    await $fetch(`/api/admin/users/${editUser.value.id}`, { method: "PUT", body });
    editUser.value = null;
    await fetchUsers();
  } catch (err) {
    alert("บันทึกไม่สำเร็จ: " + (err instanceof Error ? err.message : "เกิดข้อผิดพลาด"));
  } finally { saving.value = false; }
}

async function toggleActive(u: AdminUser) {
  const newActive = isActive(u) ? 0 : 1;
  await $fetch(`/api/admin/users/${u.id}`, {
    method: "PUT",
    body: { name: u.name, role: u.role, is_active: newActive },
  });
  await fetchUsers();
}

async function fetchUsers() {
  loading.value = true;
  try {
    const res = await $fetch<{ success: boolean; data?: AdminUser[] }>("/api/admin/users");
    if (res.success) users.value = res.data || [];
  } finally { loading.value = false; }
}

onMounted(fetchUsers);
</script>
