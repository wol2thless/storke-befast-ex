<template>
  <div>
    <!-- Last record -->
    <div v-if="lastDate" class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-amber-600">📅</span>
        <span class="text-sm text-gray-700 font-semibold">
          <span v-if="alreadySavedToday">วันนี้คุณบันทึกข้อมูลแล้ว ({{ formatDate(lastDate) }})</span>
          <span v-else>บันทึกล่าสุด: {{ formatDate(lastDate) }}</span>
        </span>
      </div>
      <div v-if="lastSymptoms" class="bg-white rounded-lg p-3 border text-center">
        <div class="text-xs text-gray-600 mb-1">ผลการประเมินครั้งล่าสุด</div>
        <div class="flex flex-wrap gap-1 justify-center mt-1">
          <span v-for="s in (lastSymptoms || '').split(',')" :key="s"
            class="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
            {{ SYMPTOM_LABELS[s] || s }}
          </span>
        </div>
      </div>
    </div>

    <div class="w-full max-w-md mx-auto mb-2">
      <div class="bg-base-200 text-amber-500 rounded px-3 py-2 text-center">
        เลือกอาการที่พบ (เลือกได้มากกว่า 1 อาการ)
      </div>
    </div>

    <div class="flex flex-col gap-3 mb-4">
      <div v-for="s in SYMPTOMS" :key="s.key" class="w-full max-w-md mx-auto">
        <div class="bg-base-100 rounded-t-lg px-3 py-2 font-bold border-b border-base-200 flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center mr-2 text-lg font-bold">{{ s.key }}</span>
          <span class="text-base">{{ s.label }}</span>
        </div>
        <label :class="['flex items-start gap-2 p-3 rounded-b-lg shadow bg-base-100 border border-base-200 border-t-0 cursor-pointer', selected.includes(s.key) ? 'ring-2 ring-primary' : '']">
          <input type="checkbox" class="checkbox checkbox-primary mt-1"
            :checked="selected.includes(s.key)"
            :disabled="noSymptom"
            @change="toggleSymptom(s.key)" />
          <div class="text-sm text-red-500 font-bold mt-0.5">{{ s.desc }}</div>
        </label>
      </div>
    </div>

    <div class="flex items-center gap-2 mb-4">
      <input type="checkbox" class="checkbox checkbox-success" id="no-symptom"
        :checked="noSymptom" @change="toggleNoSymptom" />
      <label for="no-symptom" class="font-semibold text-success cursor-pointer">
        อาการทั่วไปปกติ<br />
        <span class="text-xs text-base-content/60">ไม่พบอาการสัญญาณเตือนของโรคหลอดเลือดสมองตีบ</span>
      </label>
    </div>

    <div class="flex flex-col items-center">
      <button class="btn btn-primary" type="button"
        :disabled="(!noSymptom && !selected.length) || alreadySavedToday || saving"
        @click="handleSubmit">
        {{ saving ? "กำลังบันทึก..." : "บันทึกอาการ" }}
      </button>
      <div v-if="alreadySavedToday" class="text-warning text-center mt-2">วันนี้คุณบันทึกข้อมูลแล้ว (วันละ 1 ครั้ง)</div>
    </div>
    <div v-if="msg" :class="['text-center mt-2', msgError ? 'text-error' : 'text-success']">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ pid: string }>();
const emit = defineEmits(["saved"]);

const SYMPTOM_LABELS: Record<string, string> = {
  B: "Balance (ทรงตัวไม่ได้)", E: "Eyes (ตามัว)", F: "Face (หน้าเบี้ยว)",
  A: "Arm (แขนขาอ่อนแรง)", S: "Speech (พูดลำบาก)", T: "Time (รีบไป รพ.)", NONE: "อาการทั่วไปปกติ"
};
const SYMPTOMS = [
  { key: "B", label: "Balance", desc: "เวียนศีรษะ ทรงตัวไม่ได้ เดินเซ" },
  { key: "E", label: "Eyes", desc: "ตามัวมองไม่เห็น เห็นภาพซ้อน ตามืดบอดข้างเดียวหรือ2ข้างทันที" },
  { key: "F", label: "Face", desc: "ปากเบี้ยว หน้าเบี้ยว ด้านใดด้านหนึ่ง น้ำลายไหล มุมปากตก กลืนลำบาก" },
  { key: "A", label: "Arm", desc: "แขนขาอ่อนแรง ชา หรืออ่อนแรงทันทีทันใด ด้านใดด้านหนึ่ง" },
  { key: "S", label: "Speech", desc: "พูดลำบาก พูดไม่ชัด นึกคำพูดไม่ออก เสียงเปลี่ยน พูดไม่รู้เรื่อง" },
  { key: "T", label: "Time", desc: "รีบไปโรงพยาบาลให้เร็วที่สุด ภายใน4.5ชั่วโมงเริ่มตั้งแต่มีอาการ" },
];

const selected = ref<string[]>([]);
const noSymptom = ref(false);
const saving = ref(false);
const msg = ref("");
const msgError = ref(false);
const lastDate = ref("");
const lastSymptoms = ref("");
const alreadySavedToday = ref(false);

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}

function toggleSymptom(key: string) {
  if (selected.value.includes(key)) selected.value = selected.value.filter(k => k !== key);
  else { selected.value = [...selected.value, key]; noSymptom.value = false; }
}
function toggleNoSymptom() {
  noSymptom.value = !noSymptom.value;
  if (noSymptom.value) selected.value = [];
}

async function fetchLast() {
  if (!props.pid) return;
  const res = await $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/befast?pid=${encodeURIComponent(props.pid)}`);
  if (res.success && res.data?.length) {
    const sorted = [...res.data].sort((a, b) => (b.record_date || b.created_at || "").localeCompare(a.record_date || a.created_at || ""));
    lastDate.value = sorted[0]?.record_date || sorted[0]?.created_at || "";
    lastSymptoms.value = sorted[0]?.symptoms || "";
    alreadySavedToday.value = lastDate.value.slice(0, 10) === new Date().toISOString().slice(0, 10);
  }
}

async function handleSubmit() {
  if (!props.pid) { msg.value = "ไม่พบรหัสผู้ใช้งาน"; msgError.value = true; return; }
  saving.value = true; msg.value = ""; msgError.value = false;
  try {
    const res = await $fetch<{ success: boolean; message?: string }>("/api/befast", {
      method: "POST",
      body: { pid: props.pid, symptoms: noSymptom.value ? "NONE" : selected.value.join(","), note: "" }
    });
    if (res.success) {
      msg.value = "บันทึกข้อมูลสำเร็จ"; msgError.value = false;
      selected.value = []; noSymptom.value = false;
      await fetchLast();
      emit("saved");
    } else { msg.value = res.message || "เกิดข้อผิดพลาด"; msgError.value = true; }
  } catch { msg.value = "เกิดข้อผิดพลาด"; msgError.value = true; }
  finally { saving.value = false; }
}

onMounted(fetchLast);
</script>
