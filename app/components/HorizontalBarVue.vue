<template>
  <div>
    <h4 class="font-medium text-sm mb-3 text-base-content">{{ title }}</h4>

    <template v-if="data.length === 0">
      <div class="text-center py-4 text-base-content/60 text-sm">ไม่มีข้อมูลในระบบ</div>
    </template>

    <template v-else>
      <div class="space-y-2">
        <div v-for="(item, i) in data.slice(0, 10)" :key="i" class="flex items-center text-sm">
          <div class="w-28 text-xs text-base-content/60 truncate">{{ item.label }}</div>
          <div class="flex-1 mx-2">
            <div class="bg-base-200 rounded-full h-2">
              <div
                class="rounded-full h-2 transition-all duration-300"
                :class="barColors[i % barColors.length]"
                :style="{ width: `${maxValue > 0 ? Math.max((item.value / maxValue) * 100, item.value > 0 ? 2 : 0) : 0}%` }"
              ></div>
            </div>
          </div>
          <div class="w-8 text-xs font-medium text-base-content text-right">{{ item.value }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface BarItem {
  label: string;
  value: number;
}

const props = defineProps<{
  data: BarItem[];
  title: string;
}>();

const barColors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-info', 'bg-success', 'bg-warning'];

const maxValue = computed(() => Math.max(...props.data.map(d => d.value), 1));
</script>
