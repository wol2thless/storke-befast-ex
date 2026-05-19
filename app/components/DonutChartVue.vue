<template>
  <div>
    <h4 class="font-medium text-sm mb-3 text-base-content">{{ title }}</h4>

    <template v-if="data.length === 0">
      <div class="flex flex-col items-center py-6">
        <div class="w-32 h-32 bg-base-200 rounded-full flex items-center justify-center mb-4">
          <div class="text-center">
            <div class="text-2xl text-base-content/30">📊</div>
            <div class="text-xs text-base-content/60 mt-1">ไม่มีข้อมูล</div>
          </div>
        </div>
        <div class="text-center text-sm text-base-content/60">ยังไม่มีข้อมูลในระบบ</div>
      </div>
    </template>

    <template v-else>
      <!-- SVG Donut -->
      <div class="flex justify-center mb-4">
        <div class="relative">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="12" />
            <circle
              v-for="(seg, i) in segments"
              :key="i"
              cx="60" cy="60" r="50"
              fill="none"
              :stroke="seg.color"
              stroke-width="12"
              :stroke-dasharray="`${seg.length} ${circumference - seg.length}`"
              :stroke-dashoffset="-seg.offset"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-lg font-bold text-base-content">{{ total }}</div>
              <div class="text-xs text-base-content/60">ทั้งหมด</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="space-y-2">
        <div v-for="(item, i) in data.slice(0, 6)" :key="i" class="flex items-center justify-between text-sm">
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: hexColors[i % hexColors.length] }"></div>
            <span class="text-base-content/70 text-xs">{{ item.label }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="font-medium text-base-content">{{ item.count }}</span>
            <span class="text-xs text-base-content/60">({{ total > 0 ? ((item.count / total) * 100).toFixed(1) : 0 }}%)</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface DonutItem {
  label: string;
  count: number;
}

const props = defineProps<{
  data: DonutItem[];
  title: string;
  type?: string;
}>();

const circumference = 2 * Math.PI * 50;

const hexColors = computed(() => {
  if (props.type === 'gender') {
    return props.data.map(item => {
      if (item.label === 'ชาย' || item.label === 'M') return '#2563eb';
      if (item.label === 'หญิง' || item.label === 'F') return '#ec4899';
      return '#9ca3af';
    });
  }
  return ['#6366f1', '#8b5cf6', '#f59e0b', '#3b82f6', '#22c55e', '#eab308'];
});

const total = computed(() => props.data.reduce((s, d) => s + d.count, 0));

const segments = computed(() => {
  let offset = 0;
  return props.data.slice(0, 6).map((item, i) => {
    const pct = total.value > 0 ? item.count / total.value : 0;
    const length = circumference * pct;
    const seg = { color: hexColors.value[i % hexColors.value.length], length, offset };
    offset += length;
    return seg;
  });
});
</script>
