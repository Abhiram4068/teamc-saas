export const validateDocumentUpload = (files) => {
  if (!files) {
    return { isValid: false, error: "Files are required." };
  }
  
  if (files.length === 0) {
    return { isValid: false, error: "At least one file must be uploaded." };
  }

  const maxSizeInBytes = 100 * 1024 * 1024; // 100 MB
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.xls'];

  for (const file of files) {
    // Validate Size
    if (file.size > maxSizeInBytes) {
      return { isValid: false, error: `File ${file.name} exceeds the maximum limit of 100MB.` };
    }

    // Validate Extension (Frontend approximation of backend Magic Number check)
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return { isValid: false, error: `Invalid file type for ${file.name}. Only PDF, Excel, and Images are allowed based on secure content validation.` };
    }
  }

  return { isValid: true, error: null };
};

export const validateDocumentUpdate = (displayName) => {
  if (!displayName || displayName.trim() === '') {
    return { isValid: false, error: "Display Name is required." };
  }
  
  if (displayName.length > 255) {
    return { isValid: false, error: "Display Name cannot exceed 255 characters." };
  }
  
  return { isValid: true, error: null };
};
