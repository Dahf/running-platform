"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface RouteMapViewProps {
  polyline: string
  name: string
  distance: number
  elevation?: number
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

export function RouteMapView({ polyline, name, distance, elevation }: RouteMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return

    const coordinates = decodePolyline(polyline)
    if (coordinates.length === 0) return

    // Fix default marker icons
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    })

    const map = L.map(mapRef.current, {
      center: coordinates[0],
      zoom: 13,
      zoomControl: true,
    })

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Draw the route
    const routeLine = L.polyline(coordinates, {
      color: "#f97316",
      weight: 4,
      opacity: 0.9,
    }).addTo(map)

    // Add start marker
    const startIcon = L.divIcon({
      className: "custom-marker",
      html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold border-2 border-white shadow-lg">S</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
    L.marker(coordinates[0], { icon: startIcon }).addTo(map)

    // Add end marker
    const endIcon = L.divIcon({
      className: "custom-marker",
      html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white shadow-lg">E</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
    L.marker(coordinates[coordinates.length - 1], { icon: endIcon }).addTo(map)

    // Fit map to route
    map.fitBounds(routeLine.getBounds(), { padding: [20, 20] })

    mapInstanceRef.current = map
    setIsReady(true)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [polyline])

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{(distance / 1000).toFixed(2)} km</Badge>
            {elevation && <Badge variant="outline">{elevation}m elev</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={mapRef}
          className="h-[300px] rounded-lg border border-border overflow-hidden"
          style={{ background: "#1a1a2e" }}
        />
      </CardContent>
    </Card>
  )
}
