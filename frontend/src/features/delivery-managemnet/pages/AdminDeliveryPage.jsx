import { useEffect, useState } from "react";
import {
  assignRiderToDelivery,
  getAllDeliveries,
  updateDeliveryStatus,
} from "../api/deliveryApi";
import { generateDeliveryReport } from "../reports/generateDeliveryReport";
import DeliveryForm from "../components/DeliveryForm";
import DeliveryList from "../components/DeliveryList";


function AdminDeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSection, setActiveSection] = useState("all");
  const ITEMS_PER_PAGE = 6;

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await getAllDeliveries();
      setDeliveries(response.data);
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
      alert("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const sortedDeliveries = [...deliveries].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  const assignedDeliveries = sortedDeliveries.filter(
    (delivery) => String(delivery.deliveryPersonId || "").trim().length > 0
  );

  const unassignedDeliveries = sortedDeliveries.filter(
    (delivery) => String(delivery.deliveryPersonId || "").trim().length === 0
  );

  const sectionMap = {
    all: sortedDeliveries,
    assigned: assignedDeliveries,
    unassigned: unassignedDeliveries,
  };

  const sectionTitleMap = {
    all: "All Deliveries",
    assigned: "Assigned Deliveries",
    unassigned: "Not Assigned Deliveries",
  };

  const sectionDeliveries = sectionMap[activeSection] || sortedDeliveries;

  const totalPages = Math.max(1, Math.ceil(sectionDeliveries.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDeliveries = sectionDeliveries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSection]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDeliveryStatus(id, {
        status: newStatus,
        currentLocation: "Updated by Admin",
        userId: "USER001",
      });

      alert("Delivery status updated successfully");
      fetchDeliveries();
    } catch (error) {
      console.error("Failed to update delivery status:", error);
      alert("Failed to update delivery status");
    }
  };

  const handleAssignRider = async (id, riderId) => {
    try {
      await assignRiderToDelivery(id, { deliveryPersonId: riderId });
      alert("Rider assigned successfully");
      fetchDeliveries();
    } catch (error) {
      console.error("Failed to assign rider:", error);
      alert(error?.response?.data?.message || "Failed to assign rider");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Admin Delivery Management</h1>
          <p className="mt-2 text-sm text-slate-200">
            Create deliveries, monitor status updates, and manage delivery operations.
          </p>
        </div>

        <div className="mb-8">
          <DeliveryForm onDeliveryCreated={fetchDeliveries} />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{sectionTitleMap[activeSection]}</h2>
              <p className="mt-1 text-sm text-gray-500">
                Review delivery records and update statuses by section.
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
              Total: {sectionDeliveries.length}
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <button
              onClick={() => setActiveSection("all")}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                activeSection === "all"
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide">Section</p>
              <p className="text-base font-bold">All Deliveries</p>
              <p className="text-sm">{sortedDeliveries.length} records</p>
            </button>

            <button
              onClick={() => setActiveSection("assigned")}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                activeSection === "assigned"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide">Section</p>
              <p className="text-base font-bold">Assigned Deliveries</p>
              <p className="text-sm">{assignedDeliveries.length} records</p>
            </button>

            <button
              onClick={() => setActiveSection("unassigned")}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                activeSection === "unassigned"
                  ? "border-amber-600 bg-amber-50 text-amber-800"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide">Section</p>
              <p className="text-base font-bold">Not Assigned Deliveries</p>
              <p className="text-sm">{unassignedDeliveries.length} records</p>
            </button>
          </div>

            <button
              onClick={() => generateDeliveryReport(deliveries)}
              className="mb-4 rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Download Delivery Report
            </button>
          {loading ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              Loading deliveries...
            </div>
          ) : (
            <>
              <DeliveryList
                deliveries={paginatedDeliveries}
                onStatusChange={handleStatusChange}
                onAssignRider={handleAssignRider}
                isAdmin={true}
              />

              {sectionDeliveries.length > 0 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700 md:flex-row">
                  <p>
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, sectionDeliveries.length)} of {sectionDeliveries.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Back
                    </button>

                    <span className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
                      Page {currentPage} / {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDeliveryPage;