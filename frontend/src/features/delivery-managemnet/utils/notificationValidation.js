export const validateNotificationForm = (values) => {
  const errors = {};

  if (!values.recipientType || values.recipientType.trim() === "") {
    errors.recipientType = "Recipient type is required";
  }

  if (!values.userId || values.userId.trim() === "") {
    errors.userId = "Recipient is required";
  }

  if (!values.title || values.title.trim() === "") {
    errors.title = "Title is required";
  } else if (values.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (values.title.trim().length > 50) {
    errors.title = "Title cannot exceed 50 characters";
  }

  if (!values.message || values.message.trim() === "") {
    errors.message = "Message is required";
  } else if (values.message.trim().length < 5) {
    errors.message = "Message must be at least 5 characters";
  } else if (values.message.trim().length > 200) {
    errors.message = "Message cannot exceed 200 characters";
  }

  if (!values.type || values.type.trim() === "") {
    errors.type = "Notification type is required";
  }

  return errors;
};