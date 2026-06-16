import { useEffect, useState } from "react";
import { getAllDeliveries } from "../api/deliveryApi";
import DeliveryList from "../components/DeliveryList";

function CustomerDeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      const res = await getAllDeliveries();
      setDeliveries(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">
            🍔 Delivery Tracking
          </h1>
          <p className="mt-2 text-sm text-orange-100">
            Track your food delivery in real-time, including rider details and status updates.
          </p>
        </div>

        {/* Info Card */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow">
          <h2 className="text-lg font-semibold text-gray-800">
            Your Orders
          </h2>
          <p className="text-sm text-gray-500">
            View delivery status, location updates, and estimated arrival time.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl bg-white p-6 text-center shadow">
            <p className="text-gray-500">Loading deliveries...</p>
          </div>
        ) : (
          <DeliveryList deliveries={deliveries} isAdmin={false} />
        )}
      </div>
    </div>
  );
}

export default CustomerDeliveryPage;