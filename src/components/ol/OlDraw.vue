<script setup lang="ts">
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import CopyPaste from 'ol-ext/interaction/CopyPaste'
import Transform from 'ol-ext/interaction/Transform'
import Split from 'ol-ext/interaction/Split'
import Splitter from 'ol-ext/interaction/Splitter'
import DrawRegular from 'ol-ext/interaction/DrawRegular'
import Modify from 'ol/interaction/Modify'
import Select from 'ol/interaction/Select'
import Draw from 'ol/interaction/Draw'
import { LineString, MultiPoint, Polygon } from 'ol/geom'
import { Feature, Map, Geolocation, Collection } from 'ol'
import { Fill, RegularShape, Stroke, Style } from 'ol/style'
import type { FeatureLike } from 'ol/Feature'
import { getKeys } from '@/utils/CommonUtil'
import { Snap } from 'ol/interaction'
import type { Type } from 'ol/geom/Geometry'
import { useEventListener } from '@vueuse/core'
import useOlDraw from '@/composable/useOlDraw'

interface Props {
  map: Map
}
const props = defineProps<Props>()

const { drawType } = useOlDraw(props.map)

function onToggleDrawing(type: Type) {
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
    <button @click="onToggleDrawing('')">사격형 그리기</button>
    <button @click="onToggleDrawing('Polygon')">다각형 그리기</button>
    <!-- <button @click="onModifyLine">선 수정</button> -->
    <!-- <button @click="onSplit">Split</button> -->
    <!-- <UlControlBar></UlControlBar> -->
  </div>
</template>

<style scoped>
.a {
  color: rgb(0 0 255);
}
</style>
