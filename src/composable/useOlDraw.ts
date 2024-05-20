import { useEventListener } from '@vueuse/core'
import { Collection, type Map } from 'ol'
import CopyPaste from 'ol-ext/interaction/CopyPaste'
import Split from 'ol-ext/interaction/Split'
import Transform from 'ol-ext/interaction/Transform'
import type { FeatureLike } from 'ol/Feature'
import { click } from 'ol/events/condition'
import type { Type } from 'ol/geom/Geometry'
import { Draw, Modify, Select, Snap } from 'ol/interaction'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, RegularShape, Stroke, Style } from 'ol/style'
import type { StyleLike } from 'ol/style/Style'

/**
 * @TODO
 * 1. draw시 기존 line에 snap이 안되는 현상 해결 요망
 */
/**
 * 도형 그리기 composable
 * @param map
 * @param options 추후 필요시 추가
 */
export default function useOlDraw(map: Map, options?: any) {
  // drawType 변경시 활성화? drawing모드?
  // 편집이나 그리기 종료 활성화가 있어야함.
  const drawType = ref<Type | null>()

  const styleOptions = {
    stroke: {
      normal: { color: 'purple', width: 4 },
      sel: { color: 'blue', width: 4 },
    },
  }
  const style: StyleLike = function (f) {
    return [
      new Style({
        stroke: new Stroke(styleOptions.stroke.normal),
      }),
      new Style({
        image: new RegularShape({
          radius: 4,
          points: 4,
          fill: new Fill({ color: '#f00' }),
        }),
      }),
    ]
  }

  const vectorLayer = new VectorLayer({
    source: new VectorSource({ features: new Collection<any>() }),
    style,
  })
  map.addLayer(vectorLayer)

  const selStyle = new Style({
    // fill: new Fill({
    //   color: 'rgb(0, 0, 255)',
    // }),
    stroke: new Stroke({ ...styleOptions.stroke.sel }),
  })

  function selectStyle(feature: FeatureLike) {
    return selStyle
  }

  // 등록
  const oInteraction = {
    select: new Select({ condition: click, style: selectStyle }),
    draw: new Draw({
      source: vectorLayer.getSource()!,
      type: 'LineString',
      style,
    }),
    modify: {} as Modify,
    copyPaste: new CopyPaste({
      destination: vectorLayer.getSource()!,
    }),
    transform: new Transform(),
    snap: new Snap({ source: vectorLayer.getSource()!, pixelTolerance: 5 }),
    // split: new Split({ sources: [vectorLayer.getSource()!] }),
  }
  oInteraction.modify = new Modify({
    source: vectorLayer.getSource()!,
    features: oInteraction.select.getFeatures()!,
    style,
  })

  // 초기활성화 목록
  const initIntteractions = ['select', 'snap']
  // 비활성화
  Object.entries(oInteraction).forEach(([k, interaction]) => {
    map.addInteraction(interaction)
    if (!initIntteractions.includes(k)) interaction.setActive(false)
  })
  map.removeInteraction(oInteraction.snap)
  map.addInteraction(new Snap({ source: vectorLayer.getSource()!, pixelTolerance: 5 }))

  oInteraction.select.on('select', (e) => {
    oInteraction.draw.setActive(false)
    oInteraction.modify.setActive(true)
  })

  watch(drawType, () => {
    // 기존 draw 제거
    oInteraction.draw.finishDrawing()
    oInteraction.draw.setActive(false)
    map.removeInteraction(oInteraction.draw)

    if (drawType.value != null) {
      oInteraction.select.setActive(false)

      oInteraction.draw = new Draw({
        source: vectorLayer.getSource()!,
        type: drawType.value,
        style,
      })

      map.addInteraction(oInteraction.draw)
    } else {
      oInteraction.select.setActive(true)
    }
  })

  // drawin 종료
  useEventListener(document, 'contextmenu', (e) => {
    e.preventDefault()
    if (drawType.value) {
      oInteraction.draw.removeLastPoint()
      oInteraction.draw.finishDrawing()
    }

    if (drawType.value) drawType.value = null
  })

  useEventListener(document, 'keyup', (e) => {
    if (e.ctrlKey && e.key == 'z') {
      if (drawType.value) {
        oInteraction.draw.removeLastPoint()
      } else {
        vectorLayer.getSource()!.removeFeature(vectorLayer.getSource()!.getFeatures().pop())
      }
    }
  })

  return { drawType }
}
