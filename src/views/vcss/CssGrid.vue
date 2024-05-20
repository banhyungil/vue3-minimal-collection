<script lang="ts" setup>
const rowCnt = ref(1)

defineProps<{
  name: string
}>()
</script>

<template>
  <div class="c-grid">
    <div>
      <span>행</span>
      <input type="number" v-model="rowCnt" />
    </div>
    <div
      class="grid"
      :style="{ gridTemplateRows: rowCnt, width: `calc(100% - ${(rowCnt - 1) * 100}px)` }"
    >
      <div v-for="num in rowCnt" :key="num" class="item"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.c-grid {
  height: 100%;

  .grid {
    display: grid;
    gap: 4px;
    height: 100%;
    transition: all 0.3s ease;

    .item {
      background-color: rgb(190 189 189);
      transition: all 0.3s ease;
    }
  }
}
</style>
