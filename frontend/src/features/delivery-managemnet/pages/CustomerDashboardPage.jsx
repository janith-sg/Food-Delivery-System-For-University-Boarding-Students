import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllDeliveries, updateDeliveryRating } from "../api/deliveryApi";
import { getUserNotifications } from "../../notification-management/api/notificationApi";
import DeliveryStatusBadge from "../components/DeliveryStatusBadge";
import LiveMap from "../../../components/LiveMap";
import CustomerMenuBar from "../../user-management/components/CustomerMenuBar";
import { clearAuthWithAudit, getUser } from "../../../lib/auth";
import { getProfilePath } from "../../../lib/postLoginRedirect";

function CustomerDashboardPage() {
  const navigate = useNavigate();
  const userId = "USER001";
  const [searchParams, setSearchParams] = useSearchParams();

  const formatEta = (eta) => {
    if (!eta) {
      return "Not available";
    }

    const etaDate = new Date(eta);
    if (Number.isNaN(etaDate.getTime())) {
      return "Not available";
    }

    return etaDate.toLocaleString();
  };

  const parseCoords = (location) => {
    if (!location) return null;

    const lat = Number(location.lat);
    const lng = Number(location.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return [lat, lng];
  };

  const [deliveries, setDeliveries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [ratingSubmittingId, setRatingSubmittingId] = useState("");
  const [highlightDeliveryId, setHighlightDeliveryId] = useState("");
  const ratingSectionRefs = useRef({});

  const deliveriesPerPage = 5;

  const fetchDeliveries = async () => {
    try {
      const deliveryRes = await getAllDeliveries();
      const allDeliveries = Array.isArray(deliveryRes.data) ? deliveryRes.data : [];

      const userDeliveries = allDeliveries
        .filter((delivery) => delivery.studentId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setDeliveries(userDeliveries);
    } catch (error) {
      console.error("Failed to load deliveries:", error);
      setDeliveries([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const notificationRes = await getUserNotifications(userId);
      const userNotifications = Array.isArray(notificationRes.data)
        ? notificationRes.data
        : [];

      const sortedNotifications = [...userNotifications].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await Promise.all([fetchDeliveries(), fetchNotifications()]);
      setLoading(false);
    };

    initialLoad();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchDeliveries();
    }, 5000);

    const onNotificationsUpdated = () => fetchNotifications();
    window.addEventListener("notificationsUpdated", onNotificationsUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notificationsUpdated", onNotificationsUpdated);
    };
  }, []);

  const totalPages = Math.ceil(deliveries.length / deliveriesPerPage) || 1;
  const rateDeliveryId = searchParams.get("rateDelivery") || "";

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!rateDeliveryId || deliveries.length === 0) {
      return;
    }

    const deliveryIndex = deliveries.findIndex(
      (delivery) => delivery._id === rateDeliveryId && delivery.status === "Delivered"
    );

    if (deliveryIndex < 0) {
      return;
    }

    const targetPage = Math.floor(deliveryIndex / deliveriesPerPage) + 1;

    if (currentPage !== targetPage) {
      setCurrentPage(targetPage);
      return;
    }

    const targetSection = ratingSectionRefs.current[rateDeliveryId];
    if (!targetSection) {
      return;
    }

    targetSection.scrollIntoView({ behavior: "smooth", block: "center" });

    const firstControl = targetSection.querySelector("button, textarea");
    if (firstControl && typeof firstControl.focus === "function") {
      firstControl.focus();
    }

    setHighlightDeliveryId(rateDeliveryId);
    setTimeout(() => {
      setHighlightDeliveryId("");
    }, 2200);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("rateDelivery");
    setSearchParams(nextParams, { replace: true });
  }, [
    currentPage,
    deliveries,
    deliveriesPerPage,
    rateDeliveryId,
    searchParams,
    setSearchParams,
  ]);

  const paginatedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * deliveriesPerPage;
    return deliveries.slice(startIndex, startIndex + deliveriesPerPage);
  }, [deliveries, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getDeliveryDraft = (deliveryId) => {
    return ratingDrafts[deliveryId] || { rating: "", feedback: "" };
  };

  const handleRatingDraftChange = (deliveryId, field, value) => {
    setRatingDrafts((prev) => ({
      ...prev,
      [deliveryId]: {
        ...getDeliveryDraft(deliveryId),
        [field]: value,
      },
    }));
  };

  const handleSubmitRating = async (deliveryId) => {
    const draft = getDeliveryDraft(deliveryId);
    const rating = Number(draft.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5 stars");
      return;
    }

    try {
      setRatingSubmittingId(deliveryId);

      const response = await updateDeliveryRating(deliveryId, {
        rating,
        feedback: (draft.feedback || "").trim(),
      });

      const updatedDelivery = response.data;
      setDeliveries((prev) =>
        prev.map((item) => (item._id === deliveryId ? updatedDelivery : item))
      );

      setRatingDrafts((prev) => {
        const next = { ...prev };
        delete next[deliveryId];
        return next;
      });
    } catch (error) {
      console.error("Failed to submit delivery rating:", error);
      alert(error?.response?.data?.message || "Failed to submit rating");
    } finally {
      setRatingSubmittingId("");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <CustomerMenuBar
          onLogout={async () => {
            await clearAuthWithAudit();
            navigate("/login");
          }}
          onProfileClick={() => navigate(getProfilePath(getUser()))}
          cartItemsCount={0}
          onCartClick={() => navigate("/order-management")}
        />
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl bg-white p-8 text-black shadow-sm">
            Loading customer dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-black">
      <CustomerMenuBar
        onLogout={async () => {
          await clearAuthWithAudit();
          navigate("/login");
        }}
        onProfileClick={() => navigate(getProfilePath(getUser()))}
        cartItemsCount={0}
        onCartClick={() => navigate("/order-management")}
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* HEADER */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Customer Dashboard</h1>
          <p className="mt-2 text-sm text-orange-100">
            Track your deliveries and recent updates in one place.
          </p>
        </div>

        {/* STATS */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">My Deliveries</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{deliveries.length}</p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active Deliveries</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {deliveries.filter((d) =>
                ["Assigned", "Picked Up", "On the Way"].includes(d.status)
              ).length}
            </p>
          </div>

          <div className="rounded-2xl bg-orange-50 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Unread Notifications</p>
            <p className="mt-2 text-3xl font-bold text-orange-700">{unreadCount}</p>
          </div>
        </div>

        {/* DELIVERY LIST */}
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex justify-between">
            <h2 className="text-2xl font-bold text-gray-900">My Deliveries</h2>
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {paginatedDeliveries.map((delivery) => {
              const isActive = ["Assigned", "Picked Up", "On the Way"].includes(delivery.status);

              // 🔥 Extract coordinates safely
              const pickupCoords = parseCoords(delivery.pickupLocation);
              const destinationCoords = parseCoords(delivery.deliveryLocation);
              const riderCoords = parseCoords(delivery.riderLocation)
                || (Number.isFinite(Number(delivery.latitude))
                  && Number.isFinite(Number(delivery.longitude))
                  ? [Number(delivery.latitude), Number(delivery.longitude)]
                  : pickupCoords);

              return (
                <div key={delivery._id} className="rounded-2xl border p-6 shadow-sm">
                  <h2 className="text-xl font-bold">
                    Order ID: {delivery.orderId}
                  </h2>

                  <DeliveryStatusBadge status={delivery.status} />

                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
                    <p>
                      <span className="font-semibold text-gray-900">Order ID:</span>{" "}
                      {delivery.orderId || "-"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Order Status:</span>{" "}
                      {delivery.status || "-"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Rider Name:</span>{" "}
                      {delivery.deliveryPersonName || "Not assigned"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Phone Num:</span>{" "}
                      {delivery.deliveryPersonPhone || "Not available"}
                    </p>
                    <p className="md:col-span-2">
                      <span className="font-semibold text-gray-900">ETA:</span>{" "}
                      {formatEta(delivery.estimatedDeliveryTime)}
                    </p>
                  </div>

                  {delivery.status === "Delivered" && (
                    <div
                      ref={(element) => {
                        if (element) {
                          ratingSectionRefs.current[delivery._id] = element;
                        }
                      }}
                      className={`mt-4 rounded-xl border border-orange-100 bg-orange-50 p-4 transition ${
                        highlightDeliveryId === delivery._id
                          ? "ring-2 ring-orange-400 ring-offset-1"
                          : ""
                      }`}
                    >
                      {delivery.customerRating ? (
                        <>
                          <p className="text-sm font-semibold text-orange-900">
                            Your Rating: {"★".repeat(delivery.customerRating)}
                            <span className="text-orange-700">{"☆".repeat(5 - delivery.customerRating)}</span>
                          </p>
                          <p className="mt-1 text-sm text-orange-900/90">
                            Feedback: {delivery.customerFeedback || "No written feedback"}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-orange-900">
                            Rate this delivery
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const selected = Number(getDeliveryDraft(delivery._id).rating) === star;

                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleRatingDraftChange(delivery._id, "rating", String(star))}
                                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                                    selected
                                      ? "border-orange-500 bg-orange-500 text-white"
                                      : "border-orange-200 bg-white text-orange-800 hover:border-orange-300"
                                  }`}
                                >
                                  {star} ★
                                </button>
                              );
                            })}
                          </div>

                          <textarea
                            value={getDeliveryDraft(delivery._id).feedback}
                            onChange={(event) =>
                              handleRatingDraftChange(delivery._id, "feedback", event.target.value)
                            }
                            rows={2}
                            placeholder="Optional feedback"
                            className="mt-3 w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                          />

                          <button
                            type="button"
                            onClick={() => handleSubmitRating(delivery._id)}
                            disabled={ratingSubmittingId === delivery._id}
                            className="mt-3 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {ratingSubmittingId === delivery._id ? "Submitting..." : "Submit Rating"}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* 🔥 MAP */}
                  {isActive && (
                    <div className="mt-4">
                      <LiveMap
                        pickup={pickupCoords}
                        destination={destinationCoords}
                        rider={riderCoords}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboardPage;