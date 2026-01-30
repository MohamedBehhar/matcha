import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

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

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({
  value,
  onChange,
}: {
  value: { latitude: number; longitude: number } | null;
  onChange: (value: { latitude: number; longitude: number }) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    value ? [value.latitude, value.longitude] : null
  );

  useEffect(() => {
    if (value) {
      setPosition([value.latitude, value.longitude]);
    }
  }, [value]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Unable to retrieve your location, make sure to give location permissions')
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude] as [number, number];
  
        setPosition(coords);
  
        onChange({ latitude: coords[0], longitude: coords[1] });
      },
      (err) => {
        console.warn("Geolocation error:", err);
        toast.error('Unable to retrieve your location, make sure to give location permissions')      }
    );
  };
  

  return (
    <div className="space-y-2">
      <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
        <MapContainer
          center={position || [31.7917, -7.0926]} // Default Morocco
          zoom={position ? 13 : 6}
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
      <Button variant="outline" onClick={handleUseMyLocation}
        type='button'
      >
        📍 Use My Location
      </Button>
    </div>
  );
}
