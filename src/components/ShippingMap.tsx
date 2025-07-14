"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Para que el ícono se vea bien:
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  coords: [number, number]; // [lng, lat]
  draggable?: boolean;
  onCoordsChange?: (coords: [number, number]) => void; // Nuevo callback
};

export default function ShippingMap({
  coords,
  draggable = false,
  onCoordsChange,
}: Props) {
  return (
    <div className="h-48 w-full rounded overflow-hidden">
      <MapContainer
        center={[coords[1], coords[0]]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[coords[1], coords[0]]}
          icon={icon}
          draggable={draggable}
          eventHandlers={
            draggable && onCoordsChange
              ? {
                  dragend: (e) => {
                    const marker = e.target;
                    const { lat, lng } = marker.getLatLng();
                    // Avisar el nuevo punto
                    onCoordsChange([lng, lat]);
                  },
                }
              : undefined
          }
        />{" "}
      </MapContainer>
    </div>
  );
}
