<template>
  <div class="max-w-md w-full mx-auto p-4">
    <div class="text-center mb-8">
      <h1 class="text-xl font-bold text-primary mb-3">👤 ข้อมูลผู้ใช้งาน</h1>
      <p class="text-gray-600">ข้อมูลส่วนตัวและข้อมูลการติดต่อ</p>
    </div>

    <div v-if="!user" class="flex flex-col items-center justify-center min-h-[60vh]">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <template v-else>
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Profile Header -->
        <div class="bg-primary p-6 text-white">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span class="text-2xl">👤</span>
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-xl font-bold mb-2">{{ user.name_th || user.name || "ไม่ระบุชื่อ" }}</h2>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-white/80 text-sm">เลขบัตรประชาชน: {{ formatCid(pid || '', !showFullCid) }}</span>
                <button v-if="pid" class="btn btn-xs btn-ghost" type="button" @click="showFullCid = !showFullCid">
                  <span v-if="showFullCid">🙈</span><span v-else>👁</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 gap-6">
            <div class="space-y-4">
              <!-- อายุ -->
              <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span class="text-blue-600 text-lg">🎂</span>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-700">อายุ</div>
                    <div class="text-2xl font-bold text-blue-600">{{ getAge(user.birthdate || '') }} ปี</div>
                  </div>
                </div>
              </div>
              <!-- เพศ -->
              <div class="bg-pink-50 rounded-lg p-4 border border-pink-200">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <span class="text-pink-600 text-lg">{{ genderEmoji }}</span>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-700">เพศ</div>
                    <div class="text-xl font-bold text-gray-900">{{ genderLabel }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- อาชีพ -->
            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span class="text-green-600 text-lg">💼</span>
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-700 mb-2">อาชีพ</div>
                  <template v-if="editMode">
                    <select v-model="form.occupation" class="select select-bordered w-full">
                      <option value="">เลือกอาชีพ</option>
                      <option v-for="opt in occupationOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <input v-if="form.occupation === 'อื่น ๆ'" v-model="form.otherOccupation"
                      class="input input-bordered w-full mt-2" type="text" placeholder="โปรดระบุอาชีพ" maxlength="50" />
                  </template>
                  <div v-else class="text-xl font-bold text-gray-900">
                    <template v-if="user.occupation === 'อื่น ๆ'">
                      <div>อื่น ๆ</div>
                      <div v-if="user.otherOccupation" class="text-sm font-normal text-gray-600">{{ user.otherOccupation }}</div>
                    </template>
                    <span v-else-if="user.occupation">{{ user.occupation }}</span>
                    <span v-else class="text-gray-400">ไม่ระบุ</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- เบอร์ติดต่อ -->
            <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span class="text-orange-600 text-lg">📞</span>
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-700 mb-2">เบอร์ติดต่อ</div>
                  <input v-if="editMode" v-model="form.phone" class="input input-bordered w-full" type="tel"
                    placeholder="กรอกเบอร์โทร" maxlength="20"
                    @input="form.phone = (form.phone).replace(/[^0-9]/g, '').slice(0, 20)" />
                  <div v-else class="flex items-center gap-2">
                    <div class="text-xl font-bold text-gray-900">
                      <template v-if="user.phone">{{ showFullPhone ? user.phone : maskPhoneNumber(user.phone) }}</template>
                      <span v-else class="text-gray-400">ไม่ระบุ</span>
                    </div>
                    <button v-if="user.phone" type="button" class="btn btn-ghost btn-sm"
                      @click="showFullPhone = !showFullPhone">
                      <span v-if="showFullPhone">🙈</span><span v-else>👁</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ระดับการศึกษา -->
            <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-purple-600 text-lg">🎓</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-gray-700 mb-2">ระดับการศึกษา</div>
                  <select v-if="editMode" v-model="form.education" class="select select-bordered w-full">
                    <option value="">เลือกระดับการศึกษา</option>
                    <option v-for="opt in educationOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                  <div v-else class="text-xl font-bold text-gray-900 break-words">
                    <template v-if="user.education">{{ user.education }}</template>
                    <span v-else class="text-gray-400">ไม่ระบุ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 flex justify-center gap-3">
            <template v-if="!editMode">
              <button class="btn btn-primary" @click="startEdit">✏️ แก้ไขข้อมูล</button>
            </template>
            <template v-else>
              <button class="btn btn-success" :disabled="saving" @click="handleSave">
                <span v-if="saving" class="loading loading-spinner loading-sm"></span>
                💾 บันทึก
              </button>
              <button class="btn btn-ghost" @click="editMode = false">❌ ยกเลิก</button>
            </template>
          </div>
        </div>
      </div>

      <!-- Emergency -->
      <div class="mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
        <div class="text-center">
          <div class="text-3xl mb-3">🚨</div>
          <h3 class="text-xl font-bold text-red-700 mb-3">เบอร์โทรศัพท์ติดต่อหากพบอาการผิดปกติ</h3>
          <div class="flex flex-col items-center gap-3">
            <div class="text-lg font-semibold text-red-600">สายด่วนฉุกเฉิน</div>
            <a href="tel:1669" class="btn btn-error btn-lg text-xl font-bold px-8 py-4" style="letter-spacing:2px">1669</a>
            <div class="text-sm text-gray-600">กดเพื่อโทรออก (เฉพาะมือถือ)</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { maskPhoneNumber, formatCid, getAge } from "~/utils/pdpa";

definePageMeta({ middleware: "auth" });

const authStore = useAuthStore();

const user = ref<Record<string, string> | null>(null);
const pid = computed(() => authStore.getPid());
const editMode = ref(false);
const saving = ref(false);
const showFullCid = ref(false);
const showFullPhone = ref(false);
const form = reactive({ occupation: "", otherOccupation: "", education: "", phone: "" });

const occupationOptions = ["รับราชการ","พนักงานบริษัท","ค้าขาย","เกษตรกร","นักเรียน/นักศึกษา","ว่างงาน","อื่น ๆ"];
const educationOptions = ["ไม่ได้ศึกษา","ประถมศึกษา","มัธยมศึกษา","ปวช./ปวส.","ปริญญาตรี","สูงกว่าปริญญาตรี"];

const genderLabel = computed(() => {
  const g = String(user.value?.gender || "").toLowerCase();
  if (["male","m","ชาย"].includes(g)) return "ชาย";
  if (["female","f","หญิง"].includes(g)) return "หญิง";
  return "ไม่ระบุ";
});
const genderEmoji = computed(() => {
  const g = String(user.value?.gender || "").toLowerCase();
  if (["male","m","ชาย"].includes(g)) return "👨";
  if (["female","f","หญิง"].includes(g)) return "👩";
  return "❓";
});

onMounted(async () => {
  const baseUser = authStore.user as Record<string, string> | null;
  if (!baseUser) return;
  const u = { ...baseUser };
  user.value = u;

  try {
    const res = await $fetch<{ success: boolean; data?: Record<string, string> }>(
      `/api/personinfo?pid=${encodeURIComponent(pid.value)}`
    );
    if (res.success && res.data) {
      Object.assign(u, {
        occupation: res.data.occupation || u.occupation || "",
        otherOccupation: res.data.otherOccupation || u.otherOccupation || "",
        education: res.data.education || u.education || "",
        phone: res.data.phone || u.phone || "",
      });
      user.value = { ...u };
    }
  } catch { /* ใช้ข้อมูลจาก ThaiD token */ }

  if (!user.value.occupation || !user.value.education || !user.value.phone) {
    startEdit();
    setTimeout(() => alert("กรุณาอัปเดตข้อมูล อาชีพ เบอร์ติดต่อ และระดับการศึกษาให้ครบถ้วนก่อนใช้งาน"), 300);
  }
});

function startEdit() {
  form.occupation = user.value?.occupation || "";
  form.otherOccupation = user.value?.otherOccupation || "";
  form.education = user.value?.education || "";
  form.phone = user.value?.phone || "";
  editMode.value = true;
}

async function handleSave() {
  saving.value = true;
  const u = user.value!;
  const payload = {
    pid: pid.value,
    name_th: u.name_th || u.name || "",
    name_en: u.name_en || "",
    gender: u.gender || "",
    birthdate: u.birthdate || "",
    occupation: form.occupation,
    otherOccupation: form.occupation === "อื่น ๆ" ? form.otherOccupation : "",
    education: form.education,
    phone: form.phone,
    address: typeof u.address === "object" && (u.address as Record<string, string>)?.formatted
      ? (u.address as Record<string, string>).formatted : u.address || "",
  };
  try {
    await $fetch("/api/personinfo", { method: "POST", body: payload });
    Object.assign(u, { occupation: payload.occupation, otherOccupation: payload.otherOccupation, education: payload.education, phone: payload.phone });
    user.value = { ...u };
    editMode.value = false;
    useState('personInfoComplete').value = true;
    alert("บันทึกข้อมูลสำเร็จ");
  } catch (err) {
    alert("บันทึกไม่สำเร็จ: " + (err instanceof Error ? err.message : "เกิดข้อผิดพลาด"));
  } finally {
    saving.value = false;
  }
}
</script>
