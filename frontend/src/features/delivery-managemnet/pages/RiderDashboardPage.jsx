import { useCallback, useEffect, useMemo, useState } from "react";
import { getUser } from "../../../lib/auth";
import {
  getDeliveriesByRider,
  getRiderStats,
  updateDeliveryLocation,
  updateDeliveryStatus,
} from "../api/deliveryApi";
import DeliveryStatusBadge from "../components/DeliveryStatusBadge";
import { generateRiderStatsReport } from "../reports/generateRiderStatsReport";

function RiderDashboardPage() {
  const riderId = useMemo(() => {
    const id = String(getUser()?.riderId || "").trim();
    return id || "RIDER001";
  }, []);

  const [stats, setStats] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const deliveriesPerPage = 5;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [statsRes, deliveriesRes] = await Promise.all([
        getRiderStats(riderId),
        getDeliveriesByRider(riderId),
      ]);

      const riderDeliveries = Array.isArray(deliveriesRes.data)
        ? [...deliveriesRes.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        : [];

      setStats(statsRes.data);
      setDeliveries(riderDeliveries);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch rider dashboard data:", error);
      alert("Failed to load rider dashboard");
    } finally {
      setLoading(false);
    }
  }, [riderId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getNextStatus = (status) => {
    if (status === "Assigned") return "Picked Up";
    if (status === "Picked Up") return "On the Way";
    if (status === "On the Way") return "Delivered";
    return null;
  };

  const getNextButtonLabel = (status) => {
    const next = getNextStatus(status);
    return next ? `Mark as ${next}` : null;
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  };

  const handleNextStep = async (delivery) => {
    const nextStatus = getNextStatus(delivery.status);

    if (!nextStatus) return;

    try {
      if (nextStatus === "Picked Up") {
        const position = await getCurrentPosition();
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const currentLocation = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;

        await updateDeliveryLocation(delivery._id, {
          currentLocation,
          latitude,
          longitude,
        });
      }

      await updateDeliveryStatus(delivery._id, {
        status: nextStatus,
        userId: delivery.studentId || "USER001",
      });

      fetchDashboardData();
    } catch (error) {
      console.error("Failed to update next delivery step:", error);
      alert(
        nextStatus === "Picked Up"
          ? "Failed to get current location or update delivery status"
          : "Failed to update delivery status"
      );
    }
  };

  const handleCancel = async (delivery) => {
    try {
      await updateDeliveryStatus(delivery._id, {
        status: "Cancelled",
        userId: delivery.studentId || "USER001",
      });

      fetchDashboardData();
    } catch (error) {
      console.error("Failed to cancel delivery:", error);
      alert("Failed to cancel delivery");
    }
  };

  const getDirectionsUrl = (delivery) => {
    const destinationLat = Number(delivery?.deliveryLocation?.lat);
    const destinationLng = Number(delivery?.deliveryLocation?.lng);

    if (!Number.isFinite(destinationLat) || !Number.isFinite(destinationLng)) {
      return "";
    }

    const originLat = Number(
      delivery?.riderLocation?.lat ?? delivery?.latitude
    );
    const originLng = Number(
      delivery?.riderLocation?.lng ?? delivery?.longitude
    );

    const params = new URLSearchParams({
      api: "1",
      destination: `${destinationLat},${destinationLng}`,
      travelmode: "driving",
    });

    if (Number.isFinite(originLat) && Number.isFinite(originLng)) {
      params.set("origin", `${originLat},${originLng}`);
    }

    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  const totalPages = Math.ceil(deliveries.length / deliveriesPerPage);

  const paginatedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * deliveriesPerPage;
    const endIndex = startIndex + deliveriesPerPage;
    return deliveries.slice(startIndex, endIndex);
  }, [deliveries, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow">
          Loading rider dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Rider Dashboard</h1>
          <p className="mt-2 text-sm text-emerald-50">
            View assigned deliveries, move through delivery steps, and monitor performance.
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Rider Summary</h2>
              <p className="mt-1 text-sm text-gray-500">
                Overview of current workload and performance for {stats?.riderId}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => generateRiderStatsReport(stats, deliveries)}
              disabled={!stats}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Download Rider Stats PDF
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Assigned</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats?.totalAssigned || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-yellow-50 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active</p>
            <p className="mt-2 text-3xl font-bold text-yellow-700">
              {stats?.active || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {stats?.delivered || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {stats?.cancelled || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Avg. Delivery Time</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {stats?.averageDeliveryTime || 0} min
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Avg. Rating</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {stats?.averageRating ? `${stats.averageRating} / 5` : "No ratings"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {stats?.totalRatings || 0} rating{(stats?.totalRatings || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Assigned Deliveries
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Each delivery can only move forward one step at a time.
              </p>
            </div>

            {deliveries.length > 0 && (
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages || 1}
              </div>
            )}
          </div>

          {deliveries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              No deliveries assigned to this rider.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5">
                {paginatedDeliveries.map((delivery) => {
                  const nextLabel = getNextButtonLabel(delivery.status);
                  const canMoveNext = !!nextLabel;
                  const canCancel =
                    delivery.status !== "Delivered" &&
                    delivery.status !== "Cancelled";
                  const canOpenDirections =
                    delivery.status !== "Delivered" &&
                    delivery.status !== "Cancelled";
                  const directionsUrl = getDirectionsUrl(delivery);

                  return (
                    <div
                      key={delivery._id}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            Order ID: {delivery.orderId}
                          </h2>
                          <p className="mt-1 text-sm text-gray-500">
                            Student ID: {delivery.studentId || "Not available"}
                          </p>
                        </div>
                        <DeliveryStatusBadge status={delivery.status} />
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2">
                        <p>
                          <span className="font-semibold text-gray-900">Rider:</span>{" "}
                          {delivery.deliveryPersonName}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-900">Phone:</span>{" "}
                          {delivery.deliveryPersonPhone}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-900">Current Location:</span>{" "}
                          {delivery.currentLocation}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-900">ETA:</span>{" "}
                          {delivery.estimatedDeliveryTime
                            ? new Date(delivery.estimatedDeliveryTime).toLocaleString()
                            : "Not available"}
                        </p>
                        <p className="md:col-span-2">
                          <span className="font-semibold text-gray-900">Notes:</span>{" "}
                          {delivery.notes || "No notes"}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-900">Customer Rating:</span>{" "}
                          {Number.isInteger(delivery.customerRating) ? (
                            <>
                              <span className="text-amber-500">{"★".repeat(delivery.customerRating)}</span>
                              <span className="text-gray-300">{"★".repeat(5 - delivery.customerRating)}</span>
                            </>
                          ) : (
                            "Not rated yet"
                          )}
                        </p>
                        <p className="md:col-span-2">
                          <span className="font-semibold text-gray-900">Customer Feedback:</span>{" "}
                          {delivery.customerFeedback || "No feedback"}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        {canOpenDirections && directionsUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(directionsUrl, "_blank", "noopener,noreferrer")}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Open Directions
                          </button>
                        )}

                        {canMoveNext && (
                          <button
                            onClick={() => handleNextStep(delivery)}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            {nextLabel}
                          </button>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => handleCancel(delivery)}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Cancel Delivery
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="rounded-xl bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RiderDashboardPage;