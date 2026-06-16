export const validateDeliveryForm = (values) => {
  const errors = {};

  const validateLatitude = (value, fieldName) => {
    if (value === "" || value === null || value === undefined) {
      errors[fieldName] = "This field is required";
      return;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < -90 || parsed > 90) {
      errors[fieldName] = "Latitude must be a number between -90 and 90";
    }
  };

  const validateLongitude = (value, fieldName) => {
    if (value === "" || value === null || value === undefined) {
      errors[fieldName] = "This field is required";
      return;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < -180 || parsed > 180) {
      errors[fieldName] = "Longitude must be a number between -180 and 180";
    }
  };

  if (!values.orderId || values.orderId.trim() === "") {
    errors.orderId = "Order ID is required";
  }

  if (!values.studentId || values.studentId.trim() === "") {
    errors.studentId = "Student ID is required";
  }

  if (!values.status || values.status.trim() === "") {
    errors.status = "Status is required";
  }

  if (!values.currentLocation || values.currentLocation.trim() === "") {
    errors.currentLocation = "Current location is required";
  }

  validateLatitude(values.destinationLat, "destinationLat");
  validateLongitude(values.destinationLng, "destinationLng");

  if (
    values.notes &&
    values.notes.trim().length > 200
  ) {
    errors.notes = "Notes cannot exceed 200 characters";
  }

  return errors;
};