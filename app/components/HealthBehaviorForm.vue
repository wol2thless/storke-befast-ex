<template>
  <div class="p-2">
    <h2 class="text-lg font-bold text-primary mb-4">ประเมินพฤติกรรมสุขภาพ</h2>

    <!-- Latest -->
    <div v-if="latest" class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-purple-600">📅</span>
        <span class="text-sm font-semibold">วันที่ประเมินล่าสุด: {{ formatDate(latest.created_at || '') }}</span>
      </div>
      <div class="bg-white rounded-lg p-3 border text-center">
        <div class="text-xs text-gray-600 mb-1">ระดับพฤติกรรมสุขภาพ</div>
        <div class="font-bold" :class="behaviorColor(latest.behaviors)">{{ behaviorLevel(latest.behaviors) }}</div>
        <div v-if="latest.note" class="text-xs text-gray-600 mt-1">{{ latest.note }}</div>
      </div>
    </div>

    <!-- Form -->
    <div class="flex flex-col gap-4 mt-4">
      <div v-for="b in BEHAVIORS" :key="b.key" class="border border-base-200 rounded-lg p-3">
        <div class="font-semibold text-sm mb-2" v-html="b.label"></div>
        <div class="flex flex-col gap-1">
          <label v-for="opt in b.options" :key="opt.value"
            :class="['flex items-center gap-2 p-2 rounded border cursor-pointer', selected[b.key] === opt.value ? 'border-primary bg-primary/10' : 'border-base-200']">
            <input type="radio" :name="`b-${b.key}`" :value="opt.value" v-model="selected[b.key]"
              class="radio radio-primary radio-sm" :disabled="alreadySavedToday" />
            <span class="text-sm">{{ opt.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Current eval -->
    <div v-if="allAnswered" :class="['mt-4 p-4 rounded-lg', evalResult.bg]">
      <div class="font-bold mb-1">ผลการประเมินพฤติกรรมสุขภาพ</div>
      <div class="text-lg font-bold" :class="evalResult.color">{{ evalResult.level }}</div>
    </div>

    <textarea class="textarea textarea-bordered w-full mb-3 mt-4" rows="2"
      placeholder="เหตุผลที่ไม่สามารถปฏิบัติตามคำแนะนำได้" v-model="note" :disabled="alreadySavedToday" />

    <button class="btn btn-success w-full" :disabled="!allAnswered || saving || alreadySavedToday" @click="handleSubmit">
      {{ alreadySavedToday ? "บันทึกได้วันละ 1 ครั้ง" : saving ? "กำลังบันทึก..." : "บันทึกการประเมิน" }}
    </button>
    <div v-if="msg" :class="['text-center mt-2 text-sm', msgError ? 'text-error' : 'text-success']">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ pid: string }>();

const BEHAVIORS = [
  { key: "medication", label: "1. รับประทานยา <span class='text-red-500 font-bold'>ต่อเนื่อง</span>สม่ำเสมอ และ<span class='text-red-500 font-bold'>รีบพบแพทย์ทันที</span>ถ้ามีอาการ<span class='text-red-500 font-bold'>ผิดปกติ</span>", options: [{ value: "follow", label: "ปฏิบัติตาม" }, { value: "not_follow", label: "ไม่ปฏิบัติตาม" }] },
  { key: "control_risk", label: "2. ควบคุม<span class='text-red-500 font-bold'>ระดับความดันโลหิต ระดับไขมันและระดับน้ำตาล</span>ให้อยู่ใน<span class='text-red-500 font-bold'>เกณฑ์ปกติ</span>", options: [{ value: "follow", label: "ปฏิบัติตาม" }, { value: "not_follow", label: "ไม่ปฏิบัติตาม" }] },
  { key: "diet_control", label: "3. รับประทานอาหารให้เหมาะสมกับโรค และหลีกเลี่ยงอาหาร<span class='text-red-500 font-bold'>รส เค็ม หวาน มัน</span>", options: [{ value: "follow", label: "ปฏิบัติตาม" }, { value: "not_follow", label: "ไม่ปฏิบัติตาม" }] },
  { key: "exercise", label: "4. <span class='text-red-500 font-bold'>ออกกำลังกายสม่ำเสมอ</span> อย่างน้อย <span class='text-red-500 font-bold'>30 นาที/วัน 3 ครั้ง/สัปดาห์</span>", options: [{ value: "follow", label: "ปฏิบัติตาม" }, { value: "not_follow", label: "ไม่ปฏิบัติตาม" }] },
  { key: "avoid_smoking_alcohol", label: "5. <span class='text-red-500 font-bold'>งดสูบบุหรี่</span>หลีกเลี่ยง<span class='text-red-500 font-bold'>เครื่องดื่มแอลกอฮอล์</span>", options: [{ value: "follow", label: "ปฏิบัติตาม" }, { value: "not_follow", label: "ไม่ปฏิบัติตาม" }] },
  { key: "warning_symptoms", label: "6. ถ้ามี<span class='text-red-500 font-bold'>อาการเตือน</span>ที่แสดงว่า<span class='text-red-500 font-bold'>เลือดไปเลี้ยงสมองไม่พอ</span>ชั่วคราว ควร<span class='text-red-500 font-bold'>รีบมาพบแพทย์</span>", options: [{ value: "has_symptoms", label: "มีอาการ" }, { value: "no_symptoms", label: "ไม่มีอาการ" }] },
  { key: "sleep_enough", label: "7. <span class='text-red-500 font-bold'>พักผ่อนให้เพียงพอ</span> <span class='text-red-500 font-bold'>6-8 ชั่วโมง/วัน</span>", options: [{ value: "follow", label: "ปฏิบัติตาม" }, { value: "not_follow", label: "ไม่ปฏิบัติตาม" }] },
  { key: "manage_stress", label: "8. สามารถ<span class='text-red-500 font-bold'>จัดการความเครียด</span>ได้อย่างเหมาะสม", options: [{ value: "follow", label: "ปฏิบัติตาม" }, { value: "not_follow", label: "ไม่ปฏิบัติตาม" }] },
];

const selected = reactive<Record<string, string>>({});
const note = ref("");
const saving = ref(false);
const msg = ref("");
const msgError = ref(false);
const latest = ref<Record<string, string> | null>(null);
const allAnswered = computed(() => BEHAVIORS.every(b => selected[b.key]));
const alreadySavedToday = computed(() => !!latest.value?.created_at && latest.value.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10));

function formatDate(d: string) { return d ? new Date(d).toLocaleString("th-TH") : "-"; }

function evaluate(obj: Record<string, string>) {
  const keys = BEHAVIORS.map(b => b.key);
  const follow = keys.filter(k => obj[k] === "follow" || (k === "warning_symptoms" && obj[k] === "no_symptoms")).length;
  const pct = (follow / keys.length) * 100;
  if (pct >= 90) return { level: "ดีเยี่ยม", color: "text-green-600", bg: "bg-green-100" };
  if (pct >= 75) return { level: "ดี", color: "text-blue-600", bg: "bg-blue-100" };
  if (pct >= 50) return { level: "พอใช้", color: "text-yellow-600", bg: "bg-yellow-100" };
  return { level: "ต้องปรับปรุง", color: "text-red-600", bg: "bg-red-100" };
}
const evalResult = computed(() => evaluate(selected));
function behaviorLevel(b?: string) { if (!b) return "-"; try { return evaluate(JSON.parse(b)).level; } catch { return "-"; } }
function behaviorColor(b?: string) { if (!b) return ""; try { return evaluate(JSON.parse(b)).color; } catch { return ""; } }

async function fetchLatest() {
  if (!props.pid) return;
  const res = await $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/health-behavior?pid=${encodeURIComponent(props.pid)}`);
  if (res.success && res.data?.length) latest.value = res.data[0] ?? null;
}

async function handleSubmit() {
  if (!props.pid) { msg.value = "ไม่พบรหัสผู้ใช้งาน"; msgError.value = true; return; }
  saving.value = true; msg.value = ""; msgError.value = false;
  try {
    const res = await $fetch<{ success: boolean; message?: string }>("/api/health-behavior", {
      method: "POST", body: { pid: props.pid, behaviors: JSON.stringify(selected), note: note.value }
    });
    if (res.success) {
      msg.value = "บันทึกข้อมูลสำเร็จ"; msgError.value = false;
      BEHAVIORS.forEach(b => { delete selected[b.key]; }); note.value = "";
      await fetchLatest();
    } else { msg.value = res.message || "เกิดข้อผิดพลาด"; msgError.value = true; }
  } catch { msg.value = "เกิดข้อผิดพลาด"; msgError.value = true; }
  finally { saving.value = false; }
}

onMounted(fetchLatest);
</script>
