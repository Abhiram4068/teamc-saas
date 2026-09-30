export const validateTenantAdminRequest = (data) => {
  const errors = {};

  // First Name validation
  if (!data.firstName || data.firstName.trim() === '') {
    errors.firstName = 'First name is required.';
  } else if (data.firstName.trim().length < 3) {
    errors.firstName = 'First name must be at least 3 characters long.';
  } else if (data.firstName.trim().length > 50) {
    errors.firstName = 'First name cannot exceed 50 characters.';
  } else if (!/^[a-zA-Z]+$/.test(data.firstName.trim())) {
    errors.firstName = 'First name can only contain alphabets.';
  }

  // Last Name validation
  if (!data.lastName || data.lastName.trim() === '') {
    errors.lastName = 'Last name is required.';
  } else if (data.lastName.trim().length < 3) {
    errors.lastName = 'Last name must be at least 3 characters long.';
  } else if (data.lastName.trim().length > 50) {
    errors.lastName = 'Last name cannot exceed 50 characters.';
  } else if (!/^[a-zA-Z]+$/.test(data.lastName.trim())) {
    errors.lastName = 'Last name can only contain alphabets.';
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email is required.';
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'A valid email address is required.';
  } else if (data.email.trim().length > 100) {
    errors.email = 'Email cannot exceed 100 characters.';
  }

  // Phone validation
  if (!data.phoneNumber || data.phoneNumber.trim() === '') {
    errors.phoneNumber = 'Phone number is required.';
  } else if (!/^[0-9]+$/.test(data.phoneNumber.trim())) {
    errors.phoneNumber = 'Phone number can only contain numbers.';
  }

  // Password validation
  if (!data.password || data.password.trim() === '') {
    errors.password = 'Password is required.';
  } else if (data.password.trim().length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  // Confirm Password validation
  if (!data.confirmPassword || data.confirmPassword.trim() === '') {
    errors.confirmPassword = 'Confirm Password is required.';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUpdateTenantAdminRequest = (data) => {
  const errors = [];

  // First Name validation
  if (!data.firstName || data.firstName.trim() === '') {
    errors.push('First name is required.');
  } else if (data.firstName.length > 50) {
    errors.push('First name cannot exceed 50 characters.');
  }

  // Last Name validation
  if (!data.lastName || data.lastName.trim() === '') {
    errors.push('Last name is required.');
  } else if (data.lastName.length > 50) {
    errors.push('Last name cannot exceed 50 characters.');
  }

  // Phone validation
  const phoneRegex = /^[0-9\+\-\s\(\)]+$/;
  if (!data.phone || data.phone.trim() === '') {
    errors.push('Phone number is required.');
  } else if (!phoneRegex.test(data.phone)) {
    errors.push('Invalid phone number format.');
  } else if (data.phone.length > 15) {
    errors.push('Phone number cannot exceed 15 characters.');
  }

  return {
    isValid: errors.length === 0,
    errorMessage: errors.join(' ')
  };
};
