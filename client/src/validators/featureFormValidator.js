export const validateFeatureForm = (data) => {
    const errors = {};

    // Name validation
    if (!data.name || data.name.trim() === '') {
        errors.name = 'Feature Name is required.';
    } else if (data.name.trim().length < 3) {
        errors.name = 'Feature Name must be at least 3 characters.';
    } else if (data.name.length > 100) {
        errors.name = 'Feature Name must not exceed 100 characters.';
    }

    // Code validation
    if (!data.code || data.code.trim() === '') {
        errors.code = 'Feature Code is required.';
    } else if (data.code.length > 50) {
        errors.code = 'Feature Code must not exceed 50 characters.';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.code)) {
        errors.code = 'Feature Code must contain only letters, numbers, underscores, or hyphens.';
    }

    // Description validation
    if (data.description && data.description.length > 500) {
        errors.description = 'Description must not exceed 500 characters.';
    }

    // Status validation
    if (data.status !== 1 && data.status !== 3) {
        errors.status = 'Invalid Feature Status.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
