export const validateAdminNotificationForm = (values) => {
  const errors = {};
  const isSelectAllRiders =
    values.recipientType === "rider" && values.userId === "__ALL_RIDERS__";

  if (!values.recipientType || values.recipientType.trim() === "") {
    errors.recipientType = "Recipient type is required";
  }

  if (!isSelectAllRiders && (!values.userId || values.userId.trim() === "")) {
    errors.userId = "Please select a recipient";
  }

  if (!values.title || values.title.trim() === "") {
    errors.title = "Title is required";
  } else if (values.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (values.title.trim().length > 60) {
    errors.title = "Title cannot exceed 60 characters";
  }

  if (!values.message || values.message.trim() === "") {
    errors.message = "Message is required";
  } else if (values.message.trim().length < 5) {
    errors.message = "Message must be at least 5 characters";
  } else if (values.message.trim().length > 240) {
    errors.message = "Message cannot exceed 240 characters";
  }

  if (!values.type || values.type.trim() === "") {
    errors.type = "Notification type is required";
  }

  return errors;
};
