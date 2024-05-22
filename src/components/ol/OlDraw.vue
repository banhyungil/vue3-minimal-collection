<script setup lang="ts">
import { Map } from 'ol'
import useOlDraw, { type DrawType } from '@/composable/useOlDraw'

interface Props {
  map: Map
}
const props = defineProps<Props>()

const { drawType } = useOlDraw(props.map)

function onToggleDrawing(type: DrawType) {
  if (drawType.value == type) drawType.value = null
  else drawType.value = type
}
</script>

<template>
  <div
    style="
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      column-gap: 10px;
    "
  >
    <button @click="onToggleDrawing('LineString')">선 그리기</button>
    <button @click="onToggleDrawing('Circle')">원 그리기</button>
    <button @click="onToggleDrawing('Box')">사각형 그리기</button>
    <button @click="onToggleDrawing('Polygon')">다각형 그리기</button>
    <!-- <button @click="onModifyLine">선 수정</button> -->
    <!-- <button @click="onSplit">Split</button> -->
    <!-- <UlControlBar></UlControlBar> -->
  </div>
</template>

<style lang="scss">
.a {
  color: rgb(0 0 255);
}

.measure {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 'fit-content';
  height: '30px';
  background-color: lightblue;
  color: #fff;
  padding: 10px;
  transform: translate(60%, -60%);

  &.center {
    transform: none;
  }
}
</style>
