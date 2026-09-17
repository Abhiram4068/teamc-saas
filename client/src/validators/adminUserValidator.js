export const validateTenantAdminRequest = (data) => {
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

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || data.email.trim() === '') {
    errors.push('Email is required.');
  } else if (!emailRegex.test(data.email)) {
    errors.push('A valid email address is required.');
  } else if (data.email.length > 100) {
    errors.push('Email cannot exceed 100 characters.');
  }

  // Password validation
  if (!data.password || data.password.trim() === '') {
    errors.push('Password is required.');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }

  return {
    isValid: errors.length === 0,
    errorMessage: errors.join(' ')
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
