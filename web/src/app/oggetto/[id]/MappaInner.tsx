'use client'

// Contenuto reale della mappa con react-leaflet: solo visualizzazione, marker
// singolo, nessuna interazione di scrittura. Importato solo lato client da
// MappaPosizione (dynamic, ssr: false), perciò qui possiamo usare leaflet senza
// preoccuparci del rendering server.
//
// Nota sull'icona: i path delle icone di default di Leaflet si rompono con i
// bundler moderni (Webpack/Turbopack). Per evitare l'icona invisibile usiamo
// un'icona servita da CDN unpkg, senza dover importare gli asset PNG dal pacchetto.

import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MappaInnerProps {
  lat: number
  lng: number
  title: string
}

export default function MappaInner({ lat, lng, title }: MappaInnerProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: '16rem', width: '100%', borderRadius: '1rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={markerIcon} title={title} />
    </MapContainer>
  )
}