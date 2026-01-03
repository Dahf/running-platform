"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Trash2, RotateCcw, Navigation, Maximize2 } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface LatLng {
  lat: number
  lng: number
}

interface InteractiveMapProps {
  onRouteChange?: (waypoints: LatLng[], distance: number, polyline: string) => void
  initialCenter?: LatLng
  initialZoom?: number
  showHeatmap?: boolean
}

// Encode coordinates to polyline format
function encodePolyline(coordinates: LatLng[]): string {
  let encoded = ""
  let prevLat = 0
  let prevLng = 0

  for (const coord of coordinates) {
    const lat = Math.round(coord.lat * 1e5)
    const lng = Math.round(coord.lng * 1e5)

    encoded += encodeNumber(lat - prevLat)
    encoded += encodeNumber(lng - prevLng)

    prevLat = lat
    prevLng = lng
  }

  return encoded
}

function encodeNumber(num: number): string {
  let encoded = ""
  let value = num < 0 ? ~(num << 1) : num << 1

  while (value >= 0x20) {
    encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63)
    value >>= 5
  }

  encoded += String.fromCharCode(value + 63)
  return encoded
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate total route distance
function calculateTotalDistance(waypoints: LatLng[]): number {
  let total = 0
  for (let i = 1; i < waypoints.length; i++) {
    total += calculateDistance(waypoints[i - 1].lat, waypoints[i - 1].lng, waypoints[i].lat, waypoints[i].lng)
  }
  return total
}

export function InteractiveMap({
  onRouteChange,
  initialCenter = { lat: 40.7128, lng: -74.006 },
  initialZoom = 13,
  showHeatmap = false,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)
  const heatmapLayerRef = useRef<L.Layer | null>(null)

  const [waypoints, setWaypoints] = useState<LatLng[]>([])
  const [isMapReady, setIsMapReady] = useState(false)
  const [totalDistance, setTotalDistance] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Sample heatmap data (in production, this would come from aggregated activity data)
  const heatmapData = [
    { lat: 40.7128, lng: -74.006, intensity: 0.8 },
    { lat: 40.7135, lng: -74.008, intensity: 0.6 },
    { lat: 40.7142, lng: -74.004, intensity: 0.9 },
    { lat: 40.7118, lng: -74.002, intensity: 0.7 },
    { lat: 40.7155, lng: -74.007, intensity: 0.5 },
    { lat: 40.7165, lng: -74.003, intensity: 0.8 },
    { lat: 40.7108, lng: -74.009, intensity: 0.6 },
  ]

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: initialZoom,
        zoomControl: true,
      })

      // Add dark-themed tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map)

      // Add click handler for adding waypoints
      map.on("click", (e: L.LeafletMouseEvent) => {
        const newWaypoint = { lat: e.latlng.lat, lng: e.latlng.lng }
        setWaypoints((prev) => [...prev, newWaypoint])
      })

      mapInstanceRef.current = map
      setIsMapReady(true)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [initialCenter.lat, initialCenter.lng, initialZoom])

  // Update markers and polyline when waypoints change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return

    const updateMap = async () => {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Clear existing polyline
      if (polylineRef.current) {
        polylineRef.current.remove()
        polylineRef.current = null
      }

      // Add new markers
      waypoints.forEach((wp, index) => {
        const isStart = index === 0
        const isEnd = index === waypoints.length - 1 && waypoints.length > 1

        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `<div class="flex items-center justify-center w-8 h-8 rounded-full ${
            isStart ? "bg-green-500" : isEnd ? "bg-red-500" : "bg-orange-500"
          } text-white text-xs font-bold border-2 border-white shadow-lg">${index + 1}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const marker = L.marker([wp.lat, wp.lng], { icon: customIcon, draggable: true }).addTo(mapInstanceRef.current!)

        marker.on("dragend", (e: L.DragEndEvent) => {
          const newLatLng = e.target.getLatLng()
          setWaypoints((prev) => prev.map((w, i) => (i === index ? { lat: newLatLng.lat, lng: newLatLng.lng } : w)))
        })

        markersRef.current.push(marker)
      })

      // Draw polyline if we have at least 2 points
      if (waypoints.length >= 2) {
        const latlngs = waypoints.map((wp) => [wp.lat, wp.lng] as [number, number])
        polylineRef.current = L.polyline(latlngs, {
          color: "#f97316",
          weight: 4,
          opacity: 0.8,
          smoothFactor: 1,
        }).addTo(mapInstanceRef.current!)
      }

      // Calculate and update distance
      const distance = calculateTotalDistance(waypoints)
      setTotalDistance(distance)

      // Notify parent of route change
      if (onRouteChange && waypoints.length > 0) {
        const polyline = encodePolyline(waypoints)
        onRouteChange(waypoints, distance, polyline)
      }
    }

    updateMap()
  }, [waypoints, isMapReady, onRouteChange])

  // Add heatmap layer
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !showHeatmap) return

    const addHeatmap = async () => {
      // Remove existing heatmap
      if (heatmapLayerRef.current) {
        mapInstanceRef.current!.removeLayer(heatmapLayerRef.current)
      }

      // Create circle markers for heatmap effect
      const heatGroup = L.layerGroup()
      heatmapData.forEach((point) => {
        L.circle([point.lat, point.lng], {
          radius: 100,
          fillColor: "#f97316",
          fillOpacity: point.intensity * 0.4,
          stroke: false,
        }).addTo(heatGroup)
      })

      heatGroup.addTo(mapInstanceRef.current!)
      heatmapLayerRef.current = heatGroup
    }

    addHeatmap()
  }, [isMapReady, showHeatmap])

  const handleClearRoute = useCallback(() => {
    setWaypoints([])
  }, [])

  const handleUndoLastPoint = useCallback(() => {
    setWaypoints((prev) => prev.slice(0, -1))
  }, [])

  const handleGetLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 15)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize()
    }, 100)
  }, [])

  return (
    <Card className={isFullscreen ? "fixed inset-4 z-50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-chart-1" />
            <CardTitle>Interactive Route Builder</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {totalDistance > 0 && (
              <Badge variant="secondary" className="text-sm">
                {(totalDistance / 1000).toFixed(2)} km
              </Badge>
            )}
            <Badge variant="outline" className="text-sm">
              {waypoints.length} points
            </Badge>
          </div>
        </div>
        <CardDescription>Click on the map to add waypoints. Drag markers to adjust.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleGetLocation}>
            <Navigation className="h-4 w-4 mr-2" />
            My Location
          </Button>
          <Button variant="outline" size="sm" onClick={handleUndoLastPoint} disabled={waypoints.length === 0}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearRoute} disabled={waypoints.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4 mr-2" />
            {isFullscreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>

        <div
          ref={mapRef}
          className={`rounded-lg border border-border overflow-hidden ${isFullscreen ? "h-[calc(100vh-200px)]" : "h-[400px]"}`}
          style={{ background: "#1a1a2e" }}
        />

        {waypoints.length > 0 && (
          <div className="rounded-lg border border-border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Route Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Distance</p>
                <p className="font-semibold">{(totalDistance / 1000).toFixed(2)} km</p>
              </div>
              <div>
                <p className="text-muted-foreground">Waypoints</p>
                <p className="font-semibold">{waypoints.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Est. Time</p>
                <p className="font-semibold">{Math.round((totalDistance / 1000 / 10) * 60)} min</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
