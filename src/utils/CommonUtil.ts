import { getDistance as _getDistance, getCenter as _getCenter } from 'geolib'
import type { Map, Overlay } from 'ol'
import type { Coordinate } from 'ol/coordinate'

export function getKeys<T extends Object>(obj: T) {
  return Object.keys(obj) as Array<keyof T>
}

/**
 * openalyer Coord -> GeolibInputCoordinates 변환
 */
export function convertToGeoCoord(olCoord: Coordinate) {
  return { lat: olCoord[0], lng: olCoord[1] }
}
export function convertToOlCoord(geoCoord: { lat: number; lng: number }) {
  return [geoCoord.lat, geoCoord.lng]
}
// export function getCenter(coords: Coordinate[]) {
//   const geoCoords = coords.map((coord) => convertToGeoCoord(coord))
//   const center = _getCenter(geoCoords)
//   if (center === false) return null
//   return [center.latitude, center.longitude]
// }

export function getDistance(from: Coordinate, to: Coordinate) {
  const oFrom = convertToGeoCoord(from)
  const oTo = convertToGeoCoord(to)
  return _getDistance(oFrom, oTo)
}

export function removeOverlay(ol: Overlay) {
  const map = ol.getMap()
  if (map) map.removeOverlay(ol)
  ol.setMap(null)
}
