export const validateCheckoutForm = (formData) => {
  const errors = {};

  if (!formData.organizationName || formData.organizationName.trim() === "") {
    errors.organizationName = "Organization name is required.";
  } else if (formData.organizationName.trim().length < 2) {
    errors.organizationName = "Organization name must be at least 2 characters.";
  }

  if (!formData.address || formData.address.trim() === "") {
    errors.address = "Address is required.";
  } else if (formData.address.trim().length < 2) {
    errors.address = "Address must be at least 2 characters.";
  }

  if (!formData.city || formData.city.trim() === "") {
    errors.city = "City is required.";
  } else if (formData.city.trim().length < 2) {
    errors.city = "City must be at least 2 characters.";
  }

  if (!formData.pincode || formData.pincode.trim() === "") {
    errors.pincode = "Pincode is required.";
  } else if (!/^\d+$/.test(formData.pincode.trim())) {
    errors.pincode = "Pincode must contain only numbers.";
  } else if (formData.pincode.trim().length !== 6) {
    errors.pincode = "Pincode must be exactly 6 digits.";
  } else if (formData.pincode.trim().startsWith('0')) {
    errors.pincode = "Pincode cannot start with 0.";
  }

  if (!formData.state || formData.state.trim() === "") {
    errors.state = "State is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
