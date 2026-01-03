"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface ActivityMapProps {
  polyline: string
  className?: string
}

// Decode polyline to coordinates
function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let shift = 0
    let result = 0
    let byte: number

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    coordinates.push([lat / 1e5, lng / 1e5])
  }

  return coordinates
}

export function ActivityMap({ polyline, className = "h-[200px]" }: ActivityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current || !polyline) return

    const coordinates = decodePolyline(polyline)
    if (coordinates.length === 0) return

    const map = L.map(mapRef.current, {
      center: coordinates[0],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
    })

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map)

    const routeLine = L.polyline(coordinates, {
      color: "#f97316",
      weight: 3,
      opacity: 0.9,
    }).addTo(map)

    map.fitBounds(routeLine.getBounds(), { padding: [10, 10] })

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [polyline])

  if (!polyline) {
    return (
      <div className={`${className} rounded-lg bg-muted flex items-center justify-center`}>
        <p className="text-sm text-muted-foreground">No route data</p>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className={`${className} rounded-lg border border-border overflow-hidden`}
      style={{ background: "#1a1a2e" }}
    />
  )
}
