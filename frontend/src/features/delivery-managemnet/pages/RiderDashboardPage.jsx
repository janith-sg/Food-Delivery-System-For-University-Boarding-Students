import { useCallback, useEffect, useMemo, useState } from "react";
import { getUser } from "../../../lib/auth";
import {
  getDeliveriesByRider,
  getRiderStats,
  updateDeliveryLocation,
  updateDeliveryStatus,
} from "../api/deliveryApi";
import DeliveryStatusBadge from "../components/DeliveryStatusBadge";
import NotificationBell from "../../../components/NotificationBell";
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
  const [activeSection, setActiveSection] = useState("ongoing");

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
    const destinationAddress = String(delivery?.deliveryAddress || "").trim();

    if (
      !Number.isFinite(destinationLat) ||
      !Number.isFinite(destinationLng)
    ) {
      if (!destinationAddress) {
        return "";
      }

      const addressParams = new URLSearchParams({
        api: "1",
        destination: destinationAddress,
        travelmode: "driving",
      });

      return `https://www.google.com/maps/dir/?${addressParams.toString()}`;
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

  const ongoingStatuses = ["Assigned", "Picked Up", "On the Way"];

  const ongoingDeliveries = useMemo(
    () => deliveries.filter((delivery) => ongoingStatuses.includes(delivery.status)),
    [deliveries]
  );

  const cancelledDeliveries = useMemo(
    () => deliveries.filter((delivery) => delivery.status === "Cancelled"),
    [deliveries]
  );

  const sectionMap = {
    ongoing: ongoingDeliveries,
    cancelled: cancelledDeliveries,
    all: deliveries,
  };

  const sectionTitleMap = {
    ongoing: "Ongoing Deliveries",
    cancelled: "Cancelled Deliveries",
    all: "All Deliveries",
  };

  const filteredDeliveries = sectionMap[activeSection] || ongoingDeliveries;

  const totalPages = Math.ceil(filteredDeliveries.length / deliveriesPerPage);

  const paginatedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * deliveriesPerPage;
    const endIndex = startIndex + deliveriesPerPage;
    return filteredDeliveries.slice(startIndex, endIndex);
  }, [filteredDeliveries, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSection]);

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
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow">
          Loading rider dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-5">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Rider Dashboard</h1>
          <p className="mt-1 text-sm text-emerald-50">
            View assigned deliveries, move through delivery steps, and monitor performance.
          </p>
        </div>

        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Assigned</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {stats?.totalAssigned || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-yellow-50 p-4 shadow-sm">
            <p className="text-sm text-gray-500">Active</p>
            <p className="mt-1 text-3xl font-bold text-yellow-700">
              {stats?.active || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 p-4 shadow-sm">
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="mt-1 text-3xl font-bold text-green-700">
              {stats?.delivered || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 p-4 shadow-sm">
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="mt-1 text-3xl font-bold text-red-700">
              {stats?.cancelled || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4 shadow-sm">
            <p className="text-sm text-gray-500">Avg. Delivery Time</p>
            <p className="mt-1 text-3xl font-bold text-blue-700">
              {stats?.averageDeliveryTime || 0} min
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50 p-4 shadow-sm">
            <p className="text-sm text-gray-500">Avg. Rating</p>
            <p className="mt-1 text-3xl font-bold text-amber-700">
              {stats?.averageRating ? `${stats.averageRating} / 5` : "No ratings"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {stats?.totalRatings || 0} rating{(stats?.totalRatings || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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

          {deliveries.length > 0 && (
            <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
              <button
                onClick={() => setActiveSection("ongoing")}
                className={`rounded-2xl border px-3 py-2 text-left transition ${
                  activeSection === "ongoing"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide">Section</p>
                <p className="text-base font-bold">Ongoing Deliveries</p>
                <p className="text-sm">{ongoingDeliveries.length} records</p>
              </button>

              <button
                onClick={() => setActiveSection("cancelled")}
                className={`rounded-2xl border px-3 py-2 text-left transition ${
                  activeSection === "cancelled"
                    ? "border-red-600 bg-red-50 text-red-800"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide">Section</p>
                <p className="text-base font-bold">Cancelled Deliveries</p>
                <p className="text-sm">{cancelledDeliveries.length} records</p>
              </button>

              <button
                onClick={() => setActiveSection("all")}
                className={`rounded-2xl border px-3 py-2 text-left transition ${
                  activeSection === "all"
                    ? "border-blue-600 bg-blue-50 text-blue-800"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide">Section</p>
                <p className="text-base font-bold">All Deliveries</p>
                <p className="text-sm">{deliveries.length} records</p>
              </button>
            </div>
          )}

          {deliveries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
              No deliveries assigned to this rider.
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
              No deliveries found in {sectionTitleMap[activeSection].toLowerCase()}.
            </div>
          ) : (
            <>
              <div className="mb-3 rounded-2xl bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                {sectionTitleMap[activeSection]} ({filteredDeliveries.length})
              </div>

              <div className="grid grid-cols-1 gap-3">
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
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            Order ID: {delivery.orderId}
                          </h2>
                          <p className="mt-0.5 text-sm text-gray-500">
                            Customer: {delivery.customerName || "Not available"}
                          </p>
                        </div>
                        <DeliveryStatusBadge status={delivery.status} />
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 text-sm text-gray-700 md:grid-cols-2">
                        <p className="leading-tight">
                          <span className="font-semibold text-gray-900">Customer Name:</span>{" "}
                          {delivery.customerName || "Not available"}
                        </p>
                        <p className="leading-tight">
                          <span className="font-semibold text-gray-900">Customer Phone:</span>{" "}
                          {delivery.customerPhone || "Not available"}
                        </p>
                        <p className="leading-tight md:col-span-2">
                          <span className="font-semibold text-gray-900">Delivery Address:</span>{" "}
                          {delivery.deliveryAddress || "Not available"}
                        </p>
                        <p className="leading-tight">
                          <span className="font-semibold text-gray-900">Current Location:</span>{" "}
                          {delivery.currentLocation}
                        </p>
                        <p className="leading-tight">
                          <span className="font-semibold text-gray-900">ETA:</span>{" "}
                          {delivery.estimatedDeliveryTime
                            ? new Date(delivery.estimatedDeliveryTime).toLocaleString()
                            : "Not available"}
                        </p>
                        <p className="leading-tight md:col-span-2">
                          <span className="font-semibold text-gray-900">Notes:</span>{" "}
                          {delivery.notes || "No notes"}
                        </p>
                        <p className="leading-tight">
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
                        <p className="leading-tight md:col-span-2">
                          <span className="font-semibold text-gray-900">Customer Feedback:</span>{" "}
                          {delivery.customerFeedback || "No feedback"}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {canOpenDirections && directionsUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(directionsUrl, "_blank", "noopener,noreferrer")}
                            className="rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Open Directions
                          </button>
                        )}

                        {canMoveNext && (
                          <button
                            onClick={() => handleNextStep(delivery)}
                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            {nextLabel}
                          </button>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => handleCancel(delivery)}
                            className="rounded-xl bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Cancel Delivery
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="rounded-xl bg-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <NotificationBell role="rider" userId={riderId} />
    </div>
  );
}

export default RiderDashboardPage;