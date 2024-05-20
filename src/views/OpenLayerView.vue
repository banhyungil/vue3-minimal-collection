<script setup lang="ts">
import { onMounted } from 'vue'
import { XYZ } from 'ol/source'
import { Map, View } from 'ol'
import TileGrid from 'ol/tilegrid/TileGrid'
import proj4 from 'proj4'
import { register } from 'ol/proj/proj4'
import TileLayer from 'ol/layer/Tile'
import { DoubleClickZoom } from 'ol/interaction'
import tileInfo from '@/resources/data/tileInfo'

const map = ref<Map>()
onMounted(async () => {
  proj4.defs(
    'EPSG:5179',
    '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  )
  register(proj4)

  // Todo
  const minZoom = 6
  const maxZoom = 18

  const tilesSource = 'http://10.3.192.242:89/tiles/'
  const center = [127.86798354320298, 36.80626244117022]
  const zoom = 14
  map.value = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: `${tilesSource}{z}/{x}/{y}.png`,
          projection: 'EPSG:5179',
          tileGrid: new TileGrid({
            origin: tileInfo.origin,
            resolutions: tileInfo.lods.map((lod) => lod.resolution),
          }),
        }),
      }),
    ],
    view: new View({
      projection: 'EPSG:4326',
      center: center,
      zoom: zoom,
      minZoom,
      maxZoom,
    }),
    controls: [],
  })

  // const dblzInteraction = map
  //   .getInteractions()
  //   .getArray()
  //   .find((interaction) => interaction instanceof DoubleClickZoom)!
  // map.removeInteraction(dblzInteraction)

  // const view = map.getView()
})
</script>
<template>
  <div class="ol-view">
    <div id="map"></div>
    <OlDraw v-if="map" :map="map"></OlDraw>
  </div>
</template>

<style lang="scss" scoped>
.ol-view {
  position: relative;
  height: 100%;

  #map {
    width: 100vw;
    height: 100%;
  }
}
</style>
