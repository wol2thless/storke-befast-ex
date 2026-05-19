<template>
  <div class="max-w-md mx-auto p-4">
    <!-- BEFAST -->
    <div class="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-amber-600 text-xl">🚨</span>
        <h2 class="text-lg font-bold text-primary">อาการของโรคหลอดเลือดสมองตีบ (BEFAST)</h2>
      </div>
      <div class="bg-white rounded-lg p-3 border">
        <BefastForm :pid="pid" @saved="onBefastSaved" />
      </div>
    </div>

    <!-- ADL -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-blue-600 text-xl">📊</span>
        <h2 class="text-lg font-bold text-primary">การประเมินภาวะสุขภาพ - กิจวัตรประจำวัน (ADL)</h2>
      </div>
      <div class="bg-white rounded-lg p-3 border">
        <AdlForm :pid="pid" />
      </div>
    </div>

    <!-- Exercise -->
    <div class="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-green-600 text-xl">🏃‍♂️</span>
        <h2 class="text-lg font-bold text-primary">บันทึกการออกกำลังกาย การทำกายภาพต่อเนื่อง</h2>
      </div>
      <div class="bg-white rounded-lg p-3 border">
        <ExerciseForm :pid="pid" />
      </div>
    </div>

    <!-- Nutrition -->
    <div class="bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-4 mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-orange-600 text-xl">🍽️</span>
        <h2 class="text-lg font-bold text-primary">บันทึกการรับประทานอาหารและโภชนาการ</h2>
      </div>
      <div class="bg-white rounded-lg p-3 border">
        <NutritionForm :pid="pid" />
      </div>
    </div>

    <!-- Medication -->
    <div class="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-red-600 text-xl">💊</span>
        <h2 class="text-lg font-bold text-primary">บันทึกการรับประทานยาอย่างต่อเนื่อง</h2>
      </div>
      <div class="bg-white rounded-lg p-3 border">
        <MedicationForm :pid="pid" />
      </div>
    </div>

    <!-- Stroke Videos -->
    <div class="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-red-600 text-xl">🧠</span>
        <h2 class="text-lg font-bold text-primary">วิดีโอความรู้เกี่ยวกับโรคหลอดเลือดสมอง</h2>
      </div>
      <VideoSection category="stroke" :pid="pid" />
    </div>

    <!-- Exercise Videos -->
    <div class="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-green-600 text-xl">💪</span>
        <h2 class="text-lg font-bold text-primary">วิดีโอการออกกำลังกายและกายภาพบำบัด</h2>
      </div>
      <VideoSection category="exercise" :pid="pid" />
    </div>

    <!-- Nutrition Videos -->
    <div class="bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-4 mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-orange-600 text-xl">🥗</span>
        <h2 class="text-lg font-bold text-primary">วิดีโอความรู้ด้านโภชนาการ</h2>
      </div>
      <VideoSection category="nutrition" :pid="pid" />
    </div>

    <!-- Medication Videos -->
    <div class="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-red-600 text-xl">💊</span>
        <h2 class="text-lg font-bold text-primary">วิดีโอความรู้เรื่องยา</h2>
      </div>
      <VideoSection category="medication" :pid="pid" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const authStore = useAuthStore();
const pid = computed(() => authStore.getPid());

function onBefastSaved() {
  // trigger home refresh if needed
}
</script>
