export const validateRegistrationField = (name, value) => {
  switch (name) {
    case 'cin':
      if (!value) return 'CIN is required.';
      if (value.length !== 21) return 'CIN must be exactly 21 characters.';
      return '';
      
    case 'companyName':
      if (!value) return 'Company Name is required.';
      if (value.length > 100) return 'Company Name cannot exceed 100 characters.';
      return '';

    case 'firstName':
      if (!value) return 'First Name is required.';
      if (value.length > 50) return 'First Name cannot exceed 50 characters.';
      return '';

    case 'lastName':
      if (!value) return 'Last Name is required.';
      if (value.length > 50) return 'Last Name cannot exceed 50 characters.';
      return '';

    case 'address':
      if (!value) return 'Address is required.';
      if (value.length > 250) return 'Address cannot exceed 250 characters.';
      return '';
      
    case 'pincode':
      if (!value) return 'Pincode is required.';
      if (value.length < 5) return 'Pincode must be at least 5 characters.';
      if (value.length > 10) return 'Pincode cannot exceed 10 characters.';
      return '';
      
    case 'adminEmail':
      if (!value) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format.';
      if (value.length > 100) return 'Email cannot exceed 100 characters.';
      return '';
      
    case 'adminPassword':
      if (!value) return 'Password is required.';
      if (value.length < 8) return 'Password must be at least 8 characters long.';
      if (value.length > 50) return 'Password cannot exceed 50 characters.';
      return '';

    case 'phoneNumber':
      if (!value) return 'Phone Number is required.';
      if (value.length < 10) return 'Phone Number must be at least 10 characters.';
      if (value.length > 15) return 'Phone Number cannot exceed 15 characters.';
      return '';

    default:
      return '';
  }
};

export const validateRegistrationStep1 = (formData) => {
  const errors = {};
  const cinError = validateRegistrationField('cin', formData.cin);
  if (cinError) errors.cin = cinError;
  return errors;
};

export const validateRegistrationStep2 = (formData) => {
  const errors = {};
  const addressError = validateRegistrationField('address', formData.address);
  if (addressError) errors.address = addressError;
  const pincodeError = validateRegistrationField('pincode', formData.pincode);
  if (pincodeError) errors.pincode = pincodeError;
  return errors;
};

export const validateRegistrationStep3 = (formData) => {
  const errors = {};
  const firstNameError = validateRegistrationField('firstName', formData.firstName);
  if (firstNameError) errors.firstName = firstNameError;
  const lastNameError = validateRegistrationField('lastName', formData.lastName);
  if (lastNameError) errors.lastName = lastNameError;
  const emailError = validateRegistrationField('adminEmail', formData.adminEmail);
  if (emailError) errors.adminEmail = emailError;
  const phoneError = validateRegistrationField('phoneNumber', formData.phoneNumber);
  if (phoneError) errors.phoneNumber = phoneError;
  const passwordError = validateRegistrationField('adminPassword', formData.adminPassword);
  if (passwordError) errors.adminPassword = passwordError;

  if (formData.adminPassword !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};
