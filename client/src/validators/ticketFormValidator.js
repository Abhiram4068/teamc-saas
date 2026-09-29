export const validateTicketForm = (data) => {
  const errors = {};

  if (!data.subject || data.subject.trim() === '') {
    errors.subject = 'Subject is required.';
  } else if (data.subject.length < 5) {
    errors.subject = 'Subject must be at least 5 characters long.';
  } else if (data.subject.length > 200) {
    errors.subject = 'Subject cannot exceed 200 characters.';
  }

  if (!data.category || data.category.trim() === '') {
    errors.category = 'Category is required.';
  }

  if (!data.priority || data.priority === '') {
    errors.priority = 'Priority is required.';
  }

  if (!data.description || data.description.trim() === '') {
    errors.description = 'Description is required.';
  } else if (data.description.length < 5) {
    errors.description = 'Description must be at least 5 characters long.';
  } else if (data.description.length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
