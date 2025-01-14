import { getOffsetOverride, getLayoutStyles } from './dom-helper'

type fnPixelPositionOffset = (
  offsetWidth: number,
  offsetHeight: number
) => { x: number; y: number }
export function createOverlay(
  container: HTMLElement,
  pane: keyof google.maps.MapPanes,
  position?: google.maps.LatLng | google.maps.LatLngLiteral,
  bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral,
  getPixelPositionOffset?: fnPixelPositionOffset
) {
  class Overlay extends google.maps.OverlayView {
    container: HTMLElement
    pane: keyof google.maps.MapPanes
    position: google.maps.LatLng | google.maps.LatLngLiteral | undefined
    bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral | undefined

    constructor(
      container: HTMLElement,
      pane: keyof google.maps.MapPanes,
      position?: google.maps.LatLng | google.maps.LatLngLiteral,
      bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral
    ) {
      super()
      this.container = container
      this.pane = pane
      this.position = position
      this.bounds = bounds
    }

    onAdd(): void {
      const pane = this.getPanes()?.[this.pane]
      pane?.appendChild(this.container)
    }

    draw(): void {
      const projection = this.getProjection()
      const offset = {
        ...(this.container
          ? getOffsetOverride(this.container, getPixelPositionOffset)
          : {
            x: 0,
            y: 0,
          }),
        }

      const layoutStyles = getLayoutStyles(
        projection,
        offset,
        this.bounds,
        this.position
      )

      for (const [key, value] of Object.entries(layoutStyles)) {
        this.container.style[key] = value
      }

    }

    onRemove(): void {
      if (this.container.parentNode !== null) {
        this.container.parentNode.removeChild(this.container)
      }
    }
  }
  return new Overlay(container, pane, position, bounds)
}
