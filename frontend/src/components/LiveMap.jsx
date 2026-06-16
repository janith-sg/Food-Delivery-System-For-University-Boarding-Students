import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

// Fix icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const isValidCoords = (coords) => {
  if (!Array.isArray(coords) || coords.length !== 2) return false;

  const [lat, lng] = coords;
  return Number.isFinite(lat) && Number.isFinite(lng);
};

const LiveMap = ({ pickup, destination, rider }) => {
  const defaultLocation = [6.9271, 79.8612];

  const [routeCoords, setRouteCoords] = useState([]);
  const [riderPosition, setRiderPosition] = useState(
    isValidCoords(rider) ? rider : pickup
  );

  const routeStart = isValidCoords(rider)
    ? rider
    : isValidCoords(pickup)
      ? pickup
      : null;

  const mapCenter = isValidCoords(rider)
    ? rider
    : isValidCoords(pickup)
      ? pickup
      : isValidCoords(destination)
        ? destination
        : defaultLocation;

  useEffect(() => {
    setRiderPosition(isValidCoords(rider) ? rider : pickup);
  }, [pickup, rider]);

  useEffect(() => {
    if (!isValidCoords(routeStart) || !isValidCoords(destination)) {
      setRouteCoords([]);
      return;
    }

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/` +
            `${routeStart[1]},${routeStart[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
        );

        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            (c) => [c[1], c[0]] // convert [lng, lat] → [lat, lng]
          );

          setRouteCoords(coords);
        } else {
          setRouteCoords([]);
        }
      } catch (err) {
        console.error("Route fetch failed:", err);
        setRouteCoords([]);
      }
    };

    fetchRoute();
  }, [routeStart, destination]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {routeCoords.length > 0 && (
        <Polyline positions={routeCoords} color="blue" />
      )}

      {isValidCoords(pickup) && (
        <Marker position={pickup}>
          <Popup>Pickup</Popup>
        </Marker>
      )}

      {isValidCoords(destination) && (
        <Marker position={destination}>
          <Popup>Destination</Popup>
        </Marker>
      )}

      {isValidCoords(riderPosition) && (
        <Marker position={riderPosition}>
          <Popup>Rider Current Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default LiveMap;