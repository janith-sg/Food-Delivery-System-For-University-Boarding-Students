import { useMemo, useState } from "react";
import { createNotification } from "../api/notificationApi";
import { validateAdminNotificationForm } from "../utils/notificationValidation";

const initialState = {
  recipientType: "customer",
  userId: "",
  title: "",
  message: "",
  type: "general",
};

const SELECT_ALL_RIDERS_VALUE = "__ALL_RIDERS__";

function AdminNotificationForm({ customerRecipients = [], riderRecipients = [], onCreated }) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recipientOptions = useMemo(() => {
    return formData.recipientType === "rider" ? riderRecipients : customerRecipients;
  }, [formData.recipientType, customerRecipients, riderRecipients]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => {
      const nextData = {
        ...prev,
        [name]: value,
      };

      if (name === "recipientType") {
        nextData.userId = "";
      }

      return nextData;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateAdminNotificationForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const notificationPayload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
      };

      if (
        formData.recipientType === "rider" &&
        formData.userId === SELECT_ALL_RIDERS_VALUE
      ) {
        await Promise.all(
          riderRecipients.map((recipient) =>
            createNotification({
              ...notificationPayload,
              userId: recipient.id,
            })
          )
        );
      } else {
        await createNotification({
          ...notificationPayload,
          userId: formData.userId.trim(),
        });
      }

      setFormData((prev) => ({
        ...initialState,
        recipientType: prev.recipientType,
      }));

      if (onCreated) {
        onCreated();
      }
    } catch (error) {
      console.error("Failed to create notification:", error);
      alert(error?.response?.data?.message || "Failed to create notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Custom Notification</h2>
        <p className="mt-1 text-sm text-gray-500">
          Send targeted notifications to a selected customer or rider.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Recipient Type</label>
          <select
            name="recipientType"
            value={formData.recipientType}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
          >
            <option value="customer">Customer</option>
            <option value="rider">Rider</option>
          </select>
          {errors.recipientType && <p className="mt-2 text-sm text-red-500">{errors.recipientType}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Specific Recipient</label>
          <select
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
          >
            <option value="" disabled>
              Select recipient
            </option>
            {formData.recipientType === "rider" && riderRecipients.length > 0 && (
              <option value={SELECT_ALL_RIDERS_VALUE}>Select all riders</option>
            )}
            {recipientOptions.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.label}
              </option>
            ))}
          </select>
          {errors.userId && <p className="mt-2 text-sm text-red-500">{errors.userId}</p>}
          {recipientOptions.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">
              No {formData.recipientType} recipients found in current delivery records.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter notification title"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
          />
          {errors.title && <p className="mt-2 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Notification Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
          >
            <option value="general">General</option>
            <option value="delivery">Delivery</option>
            <option value="order">Order</option>
            <option value="payment">Payment</option>
          </select>
          {errors.type && <p className="mt-2 text-sm text-red-500">{errors.type}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            placeholder="Enter notification message"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
          />
          {errors.message && <p className="mt-2 text-sm text-red-500">{errors.message}</p>}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting || recipientOptions.length === 0}
            className="inline-flex items-center rounded-xl bg-slate-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Create Notification"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminNotificationForm;
