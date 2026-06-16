import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { createDelivery } from "../api/deliveryApi";
import { validateDeliveryForm } from "../utils/deliveryValidation";

const SHOP_PICKUP = {
  lat: 6.8456,
  lng: 80.0036,
};

const riderOptions = [
  { id: "", label: "Auto-assign after 5 seconds" },
  { id: "RIDER001", label: "Kamal Perera (RIDER001)" },
  { id: "RIDER002", label: "Nimal Silva (RIDER002)" },
  { id: "RIDER003", label: "Saman Kumara (RIDER003)" },
  { id: "RIDER004", label: "Dasun Fernando (RIDER004)" },
  { id: "RIDER005", label: "Ravindu Jayasekara (RIDER005)" },
];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${randomPart}`;
};

const initialFormState = {
  orderId: generateOrderId(),
  studentId: "USER001",
  deliveryPersonId: "",
  status: "Assigned",
  currentLocation: "Shop",
  destinationLat: "",
  destinationLng: "",
  destinationSearch: "",
  notes: "",
};

function DestinationMapPicker({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function MapCenterUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

function DeliveryForm({ onDeliveryCreated }) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [mapCenter, setMapCenter] = useState([SHOP_PICKUP.lat, SHOP_PICKUP.lng]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const setDestinationCoords = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      destinationLat: lat.toFixed(6),
      destinationLng: lng.toFixed(6),
    }));

    setErrors((prev) => ({
      ...prev,
      destinationLat: "",
      destinationLng: "",
    }));

    setMapCenter([lat, lng]);
  };

  const handleSearchDestination = async () => {
    const query = formData.destinationSearch.trim();

    if (!query) {
      setSearchError("Please enter a location to search.");
      setSearchResults([]);
      return;
    }

    try {
      setIsSearchingDestination(true);
      setSearchError("");

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const results = await response.json();

      if (!Array.isArray(results) || results.length === 0) {
        setSearchError("No matching location found.");
        setSearchResults([]);
        return;
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Destination search failed:", error);
      setSearchError("Unable to search location right now. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearchingDestination(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setSearchError("Selected location does not have valid coordinates.");
      return;
    }

    setDestinationCoords(lat, lng);
    setSearchResults([]);
    setSearchError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateDeliveryForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsSubmitting(true);

      await createDelivery({
        ...formData,
        orderId: formData.orderId.trim(),
        studentId: formData.studentId.trim(),
        deliveryPersonId: formData.deliveryPersonId,
        currentLocation: formData.currentLocation.trim(),
        notes: formData.notes.trim(),
        pickupLocation: {
          lat: SHOP_PICKUP.lat,
          lng: SHOP_PICKUP.lng,
        },
        deliveryLocation: {
          lat: Number(formData.destinationLat),
          lng: Number(formData.destinationLng),
        },
      });

      alert("Delivery created successfully");
      setFormData({
        ...initialFormState,
        orderId: generateOrderId(),
      });
      setSearchResults([]);
      setSearchError("");
      setMapCenter([SHOP_PICKUP.lat, SHOP_PICKUP.lng]);

      if (onDeliveryCreated) {
        onDeliveryCreated();
      }
    } catch (error) {
      console.error("Failed to create delivery:", error);
      alert(error?.response?.data?.message || "Failed to create delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Create Delivery</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add a new delivery assignment and track its progress.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Order ID
          </label>
          <input
            type="text"
            name="orderId"
            value={formData.orderId}
            readOnly
            placeholder="Auto generated order ID"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          {errors.orderId && (
            <p className="mt-2 text-sm text-red-500">{errors.orderId}</p>
          )}
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                orderId: generateOrderId(),
              }))
            }
            className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
          >
            Regenerate Order ID
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Student ID
          </label>
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="Enter customer student ID (e.g., USER001)"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          {errors.studentId && (
            <p className="mt-2 text-sm text-red-500">{errors.studentId}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Assign Rider (Optional)
          </label>
          <select
            name="deliveryPersonId"
            value={formData.deliveryPersonId}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            {riderOptions.map((rider) => (
              <option key={rider.id || "auto"} value={rider.id}>
                {rider.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            <option value="Assigned">Assigned</option>
            <option value="Picked Up">Picked Up</option>
            <option value="On the Way">On the Way</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {errors.status && (
            <p className="mt-2 text-sm text-red-500">{errors.status}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Current Location
          </label>
          <input
            type="text"
            name="currentLocation"
            value={formData.currentLocation}
            onChange={handleChange}
            placeholder="Enter current location"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          {errors.currentLocation && (
            <p className="mt-2 text-sm text-red-500">{errors.currentLocation}</p>
          )}
        </div>

        <div className="md:col-span-2 rounded-xl border border-gray-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-gray-800">Fixed Pickup Location (Shop)</p>
          <p className="mt-1 text-sm text-gray-600">
            Latitude: {SHOP_PICKUP.lat}, Longitude: {SHOP_PICKUP.lng}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Search Destination
          </label>
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              type="text"
              name="destinationSearch"
              value={formData.destinationSearch}
              onChange={handleChange}
              placeholder="Search boarding house, street, or landmark"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            <button
              type="button"
              onClick={handleSearchDestination}
              disabled={isSearchingDestination}
              className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSearchingDestination ? "Searching..." : "Search"}
            </button>
          </div>
          {searchError && <p className="mt-2 text-sm text-red-500">{searchError}</p>}
          {searchResults.length > 0 && (
            <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  type="button"
                  onClick={() => handleSelectSearchResult(result)}
                  className="block w-full border-b border-gray-100 px-4 py-3 text-left text-sm text-gray-700 last:border-b-0 hover:bg-orange-50"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Destination Latitude
          </label>
          <input
            type="number"
            name="destinationLat"
            value={formData.destinationLat}
            readOnly
            placeholder="e.g., 6.9100"
            step="any"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          {errors.destinationLat && (
            <p className="mt-2 text-sm text-red-500">{errors.destinationLat}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Destination Longitude
          </label>
          <input
            type="number"
            name="destinationLng"
            value={formData.destinationLng}
            readOnly
            placeholder="e.g., 79.9000"
            step="any"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          {errors.destinationLng && (
            <p className="mt-2 text-sm text-red-500">{errors.destinationLng}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Select Destination on Map
          </p>
          <div className="overflow-hidden rounded-2xl border border-gray-300">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "320px", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenterUpdater center={mapCenter} />
              <DestinationMapPicker onPick={setDestinationCoords} />
              <Marker position={[SHOP_PICKUP.lat, SHOP_PICKUP.lng]} />
              {formData.destinationLat && formData.destinationLng && (
                <Marker
                  position={[
                    Number(formData.destinationLat),
                    Number(formData.destinationLng),
                  ]}
                />
              )}
            </MapContainer>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Click on the map to set destination, or search and select from results.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional notes"
            rows="4"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          {errors.notes && (
            <p className="mt-2 text-sm text-red-500">{errors.notes}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating..." : "Create Delivery"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeliveryForm;