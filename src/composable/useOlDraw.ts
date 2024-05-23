import { getDistance, removeOverlay, convertToGeoCoord } from '@/utils/CommonUtil'
import { useEventListener } from '@vueuse/core'
import { getAreaOfPolygon } from 'geolib'
import { Collection, Feature, Overlay, getUid, type Map } from 'ol'
import CopyPaste from 'ol-ext/interaction/CopyPaste'
import Transform from 'ol-ext/interaction/Transform'
import type { FeatureLike } from 'ol/Feature'
import type { Coordinate } from 'ol/coordinate'
import { click } from 'ol/events/condition'
import { getCenter } from 'ol/extent'
import { Circle, Geometry, LineString, MultiPoint, Polygon } from 'ol/geom'
import type { Type } from 'ol/geom/Geometry'
import { Draw, Modify, Select, Snap } from 'ol/interaction'
import { createBox, type GeometryFunction } from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, RegularShape, Stroke, Style } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import type { StyleLike } from 'ol/style/Style'
import _ from 'lodash'

/**
 * 도형 그리기 composable
 * @param map
 * @param options 추후 필요시 추가
 */
export default function useOlDraw(map: Map, options?: any) {
  // drawType 변경시 활성화? drawing모드?
  // 편집이나 그리기 종료 활성화가 있어야함.
  const drawType = ref<DrawType | null>()
  // 수정 | 변환 | 변환중 | 그리기
  const interactionMode = ref<'modify' | 'transform' | 'transforming' | 'draw'>('modify')

  const STYLE_OPTIONS: StyleOptions = {
    LineString: {
      stroke: { color: '#FF005E', width: 4 },
    },
    Box: {
      stroke: { color: 'rgba(146, 192, 164, 1)', width: 4 },
      fill: { color: 'rgba(146, 192, 164, 0.3)' },
    },
    Circle: {
      stroke: { color: 'rgba(160, 103, 252, 1)', width: 4 },
      fill: { color: 'rgba(160, 103, 252, 0.3)' },
    },
    Polygon: {
      stroke: { color: 'rgba(103, 155, 252, 1)', width: 4 },
      fill: { color: 'rgba(103, 155, 252, 0.3)' },
    },
    Point: {
      stroke: { color: '#fff' },
      fill: { color: '#3578F9' },
    },
    Sel: {
      stroke: { color: 'grey', width: 4 },
    },
  }

  function getStyle(drawType: DrawType, isSel: boolean) {
    const stroke = new Stroke({ ...STYLE_OPTIONS[drawType].stroke, lineDash: isSel ? [5, 5] : [] })
    const fill = new Fill(STYLE_OPTIONS[drawType].fill)
    const image = new CircleStyle({
      stroke: stroke,
      fill: new Fill({ color: '#fff' }),
      radius: 6,
      ...options,
    })

    const styles = [
      new Style({
        stroke,
        fill,
        image,
      }),
    ]

    const geoTypes: DrawType[] = ['LineString', 'Box', 'Polygon']
    if (geoTypes.includes(drawType)) {
      const geoStyle = new Style({
        image,
        geometry: function (feature) {
          // return the coordinates of the first ring of the polygon
          const geo = feature.getGeometry()
          if (geo instanceof Polygon || geo instanceof LineString) {
            const coordinates = getCoords(geo)
            return new MultiPoint(coordinates)
          }
        },
      })

      styles.push(geoStyle)
    }

    return styles
  }

  type DiagramStyle = Record<DrawType, { style: Style[]; selStyle: Style[] }>
  const DIAGRAM_STYLE = (() => {
    const drawTypes: DrawType[] = ['LineString', 'Box', 'Circle', 'Polygon']
    return drawTypes.reduce((result, drawType) => {
      result[drawType] = {
        style: getStyle(drawType, false),
        selStyle: getStyle(drawType, true),
      }
      return result
    }, {} as DiagramStyle)
  })()

  const styleFn: StyleLike = function (f) {
    const fDrawType = (f.get('drawType') as DrawType) ?? drawType.value

    return DIAGRAM_STYLE[fDrawType]?.style
  }

  const vectorLayer = new VectorLayer({
    source: new VectorSource({ features: new Collection<any>() }),
    style: styleFn,
  })
  map.addLayer(vectorLayer)

  // 등록
  const oInteraction = {
    select: new Select({
      // condition: click,
      hitTolerance: 10,

      style: (f) => {
        const fDrawType = f.get('drawType') as DrawType

        return DIAGRAM_STYLE[fDrawType].selStyle
      },
    }),
    draw: new Draw({
      source: vectorLayer.getSource()!,
      type: 'LineString',
      style: styleFn,
    }),
    modify: {} as Modify,
    transform: new Transform({
      translate: true,
      translateFeature: true,
      hitTolerance: 10,
    }),
  }
  oInteraction.modify = new Modify({
    source: vectorLayer.getSource()!,
    features: oInteraction.select.getFeatures()!,
    style: styleFn,
  })
  // select, modify는 같이 활성화해도되고.
  // transform, modify는 동시에 활성화되면 안됨.
  // transform 활성화를 shift 눌렀을떄만 하자.

  // 초기활성화 목록
  // interaction 추가 및 비활성화
  Object.entries(oInteraction).forEach(([k, interaction]) => {
    map.addInteraction(interaction)
    interaction.setActive(false)
  })
  // snap은 항상 활성화
  map.addInteraction(new Snap({ source: vectorLayer.getSource()!, pixelTolerance: 5 }))

  oInteraction.transform.on('select', (e) => {
    console.log('transform:select', e)
    if (e.feature) interactionMode.value = 'transforming'
    else interactionMode.value = 'modify'
  })

  // feature 클릭시 trigger
  oInteraction.select.on('select', (e) => {
    console.log('select')
  })

  oInteraction.modify.on('modifystart', (e) => {
    console.log('modifystart')
  })

  // transform 적용
  // shift key를 통해 transform 적용
  let isEnterKeydown = false
  useEventListener(document, 'keydown', (e) => {
    if (isEnterKeydown && interactionMode.value == 'transforming') return
    isEnterKeydown = true
    console.log('keydown')
    if (e.shiftKey) {
      interactionMode.value = 'transform'
    }
  })
  useEventListener(document, 'keyup', (e) => {
    isEnterKeydown = false
    // interactionMode 변경
    if (oInteraction.transform.getActive() && interactionMode.value != 'transforming') {
      interactionMode.value = 'modify'
    }

    // undo 작업
    if (e.ctrlKey && e.key == 'z') {
      if (drawType.value) {
        oInteraction.draw.removeLastPoint()
      } else {
        vectorLayer.getSource()!.removeFeature(vectorLayer.getSource()!.getFeatures().pop())
        vectorLayer.getSource()!.dispatchEvent('')
      }
    } else if (interactionMode.value == 'transforming' && e.key == 'Delete') {
      vectorLayer.getSource()?.removeFeatures(oInteraction.transform.getFeatures().getArray())
      interactionMode.value = 'modify'
    }
  })

  // drawing 종료
  useEventListener(document, 'contextmenu', (e) => {
    e.preventDefault()
    if (drawType.value) {
      if (drawType.value == 'Box' || drawType.value == 'Circle') {
        oInteraction.draw.removeLastPoint()
      }
      oInteraction.draw.finishDrawing()
      drawType.value = null
    }
  })

  type PointGeo = LineString | Polygon
  watch(drawType, () => {
    // 기존 draw 제거
    oInteraction.draw.finishDrawing()
    oInteraction.draw.setActive(false)
    map.removeInteraction(oInteraction.draw)

    if (drawType.value != null) {
      interactionMode.value = 'draw'

      let type = drawType.value
      let geoFn
      if (drawType.value == 'Box') {
        type = 'Circle'
        geoFn = createBox()
      }
      oInteraction.draw = new Draw({
        source: vectorLayer.getSource()!,
        condition: (e) => {
          if (e.activePointers![0].buttons == 1) return true
          else return false
        },
        type: type as Type,
        style: styleFn,
        geometryFunction: geoFn,
      })

      // draw 종료시 호출 순서
      // drawend -> change:active -> propertychange
      // change, propertychange는 수정을 해도 호출되지 않음.
      const overlayDict: Record<string, { points: Overlay[]; center?: Overlay }> = {}
      oInteraction.draw.on('drawstart', (e) => {
        const fuid = getUid(e.feature)
        // Geometry.getType function으로는 구별을 할 수 가 없음
        // 별도로 feature에 저장한다.
        e.feature.set('drawType', drawType.value)

        const pointsTypes = ['LineString', 'Polygon']
        const centerTypes = ['Polygon', 'Circle', 'Box']
        if (overlayDict[fuid] == null)
          overlayDict[fuid] = {
            points: [],
          }

        // 각 coord-overlay 맵핑
        // overlay는 생성후에는 그대로 사용
        // coord길이에 맞게 overlay 배열 생성해야됨,
        e.feature.on('change', (evt) => {
          console.log('feature:change')
          const geometry = evt.target.getGeometry()! as Geometry
          const fDrawType = evt.target.get('drawType') as DrawType
          const coords = getCoords(geometry)

          const points = overlayDict[fuid].points

          if (pointsTypes.includes(fDrawType)) {
            // coords 길이 만큼 overlay 생성
            // overlay 표시가 필요없는 지점은 제외한다.
            const exceptIdx = (() => {
              if (fDrawType == 'LineString') return [0]
              else if (fDrawType == 'Polygon') return [0, coords.length - 1]
              else return []
            })()

            // coord 순환하며 overlay position, text 갱신
            coords.forEach((coord, idx) => {
              // 1. overlay가 없는 경우 생성
              if (points[idx] == null) {
                // 제외 지점은 class 없이 생성
                // 제어 편의성을 위해 coords 길이와 overlays길이를 맞춰주는 작업
                const nOl = createOvelay(coord)
                points.push(nOl)
                map.addOverlay(nOl)
                console.log('create overlay overlayDict[fuid]', overlayDict[fuid])
              }

              // 2. 갱신
              // 다각형의 경우는 insert가 발생하기 때문에 인덱스에 따른 class 갱신이 필요함
              const ol = points[idx]
              const elt = ol.getElement()!
              if (exceptIdx.includes(idx)) {
                elt.classList.remove('measure')
              } else {
                if (elt.classList.contains('measure') === false) elt.classList.add('measure')

                ol.setPosition(coord)
                ol.getElement()!.textContent = getMeasureText(
                  getDistance(coords[idx - 1], coords[idx]),
                )
              }
            })
          }

          // center
          if (centerTypes.includes(fDrawType)) {
            // center overlay 생성
            if (overlayDict[fuid].center == null) {
              // 다각형은 좌표 4개 이상 부터 표시
              if (fDrawType == 'Polygon' && getCoords(geometry).length < 4) return

              overlayDict[fuid].center = createOvelay()
              const elt = overlayDict[fuid].center?.getElement()!
              elt.classList.add('center')
              map.addOverlay(overlayDict[fuid].center!)
            }
            overlayDict[fuid].center!.setPosition(getCenter(geometry.getExtent()))

            const elt = overlayDict[fuid].center!.getElement()!
            if (fDrawType == 'Polygon' || fDrawType == 'Box') {
              const polygonGeo = geometry as Polygon
              const coords = polygonGeo.getCoordinates()[0]
              const geoCoords = coords.map((coord) => convertToGeoCoord(coord))

              if (getAreaOfPolygon(geoCoords) == 0) {
                removeOverlay(overlayDict[fuid].center!)
                overlayDict[fuid].center = undefined
                return
              }

              elt.textContent = getMeasureText(getAreaOfPolygon(geoCoords), true)
            } else if (geometry instanceof Circle) {
              if (getAriaOfCircle(geometry) == 0) {
                removeOverlay(overlayDict[fuid].center!)
                overlayDict[fuid].center = undefined
                return
              }

              elt.textContent = getMeasureText(getAriaOfCircle(geometry), true)
              console.log('radius', geometry.getRadius() * 1000 * 100 + 'm')
            }
          }
        }) // end change
      })

      vectorLayer.getSource()?.on('addfeature', (e) => {
        const fuid = getUid(e.feature)
        const fDrawType = e.feature?.get('drawType')
        const geo = e.feature?.getGeometry()
        if (geo && overlayDict[fuid]) {
          if (fDrawType == 'LineString' || fDrawType == 'Polygon') {
            const points = overlayDict[fuid].points
            const pointGeo = geo as PointGeo
            const coords = getCoords(pointGeo)

            if (fDrawType == 'Polygon' && coords.length == 2) {
              vectorLayer.getSource()!.removeFeature(e.feature)
              return
            }

            if (fDrawType == 'LineString') {
              removeOverlay(points.pop()!)
            } else {
              // polygon은 insert이기 때문에 맨 끝 이전 지점을 삭제 해준다.
              if (points.length > 2) removeOverlay(points.splice(points.length - 2, 1)[0])
            }
            console.log('addFeature: overlayDict[fuid] coords', overlayDict[fuid], coords)
          }
        }
      })
      vectorLayer.getSource()?.on('removefeature', (e) => {
        const fuid = getUid(e.feature)
        if (overlayDict[fuid]) {
          // points 제거
          if (overlayDict[fuid].points) {
            overlayDict[fuid].points.forEach((ol) => {
              removeOverlay(ol)
            })
          }

          // center 제거
          if (overlayDict[fuid].center) removeOverlay(overlayDict[fuid].center!)
          delete overlayDict[fuid]
        }
      })
      // TDrawLog(oInteraction.draw)

      map.addInteraction(oInteraction.draw)
    } else {
      interactionMode.value = 'modify'
    }
  })

  watch(interactionMode, () => {
    console.log('interactionMode:', interactionMode.value)
    if (interactionMode.value == 'draw') {
      oInteraction.transform.setActive(false)
      oInteraction.select.setActive(false)
      oInteraction.modify.setActive(false)
    } else if (interactionMode.value == 'modify') {
      oInteraction.transform.setActive(false)
      oInteraction.select.setActive(true)
      oInteraction.modify.setActive(true)
    } else if (interactionMode.value == 'transform') {
      oInteraction.transform.setActive(true)
      oInteraction.select.setActive(false)
      oInteraction.modify.setActive(false)
    }
  })

  function getCoords(geo: Geometry) {
    if (geo instanceof Polygon || geo instanceof LineString) {
      const coords = geo.getCoordinates()
      return (geo.getType() == 'Polygon' ? coords[0] : coords) as Coordinate[]
    } else {
      return []
    }
  }

  function createOvelay(coord: Coordinate = []) {
    const elt = document.createElement('div')
    elt.classList.add('measure')

    return new Overlay({
      position: coord,
      positioning: 'center-center',
      element: elt,
      stopEvent: false,
    })

    // test
    function TDrawLog(draw: Draw) {
      oInteraction.draw.on('propertychange', () => {
        console.log('draw: propertychange')
      })
      oInteraction.draw.on('change:active', () => {
        console.log('draw: change:active')
      })
      oInteraction.draw.on('change', () => {
        console.log('draw: change')
      })

      oInteraction.draw.on('drawabort', () => {
        console.log('draw: drawabort')
      })
    }
    // test
  }

  /**
   * 원의 넓이
   * @param radius
   * @return (m)
   */
  function getAriaOfCircle(circle: Circle) {
    return Math.pow(circle.getRadius() * 1000 * 100, 2) * Math.PI
  }

  /**
   * @param measure 단위(m)
   */
  function getMeasureText(measure: number, isArea: boolean = false) {
    let unit = 'm'
    let result = measure
    const threshold = isArea ? 1000 ** 2 : 1000
    if (measure > threshold) {
      unit = 'km'
      result = result / threshold
    }

    if (isArea) unit = unit + '\u00B2'

    return Number(result.toFixed(4)).toLocaleString() + unit
  }

  return { drawType }
}

export type DrawType = Extract<Type, 'LineString' | 'Polygon' | 'Circle'> | 'Box'
type ConstructorOptions<T extends abstract new (...args: any) => any> = NonNullable<
  ConstructorParameters<T>[0]
>
type StyleOptionsKeys = keyof ConstructorOptions<typeof Style>
type StrokeKeys = keyof ConstructorOptions<typeof Stroke>
type StyleOptions = Record<
  DrawType | 'Point' | 'Sel',
  { [key in StyleOptionsKeys]?: { [key in StrokeKeys]?: any } }
>
