<script setup lang="ts">
/**
 * src : js 주소
 * externals : 참조할 객체 이름
 * @param src
 * @param externals
 */
const importCdn = (src, externals = []) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', src)
    document.body.appendChild(script)
    script.addEventListener('load', () => {
      resolve(
        externals.map((key) => {
          const ext = window[key]
          typeof ext === 'undefined' && console.warn(`No external named '${key}' in window`)
          return ext
        }),
      )
    })
    script.addEventListener('error', reject)
  })
}

const mapRef = ref()
onMounted(() => {
  importCdn('/dapi.kakao.com/v2/maps/sdk.js').then(() => {
    new kakao.maps.Map(mapRef.value, {
      //   center: new kakao.maps.LatLng(centerCoord.lat, centerCoord.lng),
      //   level: zoomLevelStore.zoom,
    })
  })
})
</script>

<template>
  <div ref="mapRef"></div>
</template>

<style scoped></style>
