import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";

function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function LocationPicker({
  value,
  onChange,
}: {
  value: { latitude: number; longitude: number } | null;
  onChange: (value: { latitude: number; longitude: number }) => void;
}) {
  const [position, setPosition] = useState(
    value ? [value.latitude, value.longitude] : null
  );

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
      <MapContainer
        center={position || [31.7917, -7.0926]} // Default Morocco center
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <LocationMarker
          position={position}
          setPosition={(pos) => {
            setPosition(pos);
            onChange({ latitude: pos[0], longitude: pos[1] });
          }}
        />
      </MapContainer>
    </div>
  );
}
