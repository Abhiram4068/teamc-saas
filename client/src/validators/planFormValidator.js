export const validatePlanForm = (data) => {
    const errors = {};

    // Plan Name validation
    if (!data.name || data.name.trim() === '') {
        errors.name = 'Plan Name is required.';
    } else if (data.name.trim().length < 3) {
        errors.name = 'Plan Name must be at least 3 characters.';
    } else if (data.name.trim().length > 100) {
        errors.name = 'Plan Name must not exceed 100 characters.';
    }

    // Plan Code validation
    if (!data.code || data.code.trim() === '') {
        errors.code = 'Plan Code is required.';
    } else if (data.code.trim().length > 50) {
        errors.code = 'Plan Code must not exceed 50 characters.';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.code.trim())) {
        errors.code = 'Plan Code must contain only letters, numbers, underscores, or hyphens.';
    }

    // Description validation
    if (data.description && data.description.length > 500) {
        errors.description = 'Description must not exceed 500 characters.';
    }

    // Status validation (Only Draft = 3 and Inactive = 2 allowed on creation)
    const validStatuses = [2, 3];
    if (data.status === undefined || data.status === null || !validStatuses.includes(Number(data.status))) {
        errors.status = 'Plan Status must be either Draft or Inactive.';
    }

    // Monthly Price validation
    if (data.monthlyPrice === '' || data.monthlyPrice === null || data.monthlyPrice === undefined) {
        errors.monthlyPrice = 'Monthly Price is required.';
    } else if (isNaN(Number(data.monthlyPrice)) || Number(data.monthlyPrice) < 0) {
        errors.monthlyPrice = 'Monthly Price must be 0 (for free plans) or greater (for paid plans).';
    }

    // Yearly Price validation
    if (data.yearlyPrice === '' || data.yearlyPrice === null || data.yearlyPrice === undefined) {
        errors.yearlyPrice = 'Yearly Price is required.';
    } else if (isNaN(Number(data.yearlyPrice)) || Number(data.yearlyPrice) < 0) {
        errors.yearlyPrice = 'Yearly Price must be 0 (for free plans) or greater (for paid plans).';
    }

    // Trial Period Days validation
    if (data.hasTrial) {
        if (data.trialPeriodDays === '' || data.trialPeriodDays === null || data.trialPeriodDays === undefined) {
            errors.trialPeriodDays = 'Trial Period Days is required when trial is enabled.';
        } else if (isNaN(Number(data.trialPeriodDays)) || Number(data.trialPeriodDays) <= 0) {
            errors.trialPeriodDays = 'Trial Period Days must be greater than 0.';
        } else if (!Number.isInteger(Number(data.trialPeriodDays))) {
            errors.trialPeriodDays = 'Trial Period Days must be a whole number.';
        }
    } else if (data.trialPeriodDays !== null && data.trialPeriodDays !== undefined && data.trialPeriodDays !== '') {
        if (isNaN(Number(data.trialPeriodDays)) || Number(data.trialPeriodDays) < 0) {
            errors.trialPeriodDays = 'Trial Period Days must be greater than or equal to 0.';
        }
    }

    // Currency validation (PlanCurrency enum: 1=INR, 2=USD, 3=EUR, 4=GBP)
    const validCurrencies = [1, 2, 3, 4];
    if (data.currency === undefined || data.currency === null || !validCurrencies.includes(Number(data.currency))) {
        errors.currency = 'Invalid Currency.';
    }

    // Effective Date validation
    if (!data.effectiveFrom) {
        errors.effectiveFrom = 'Effective From date is required.';
    }

    if (data.effectiveFrom && data.effectiveTo) {
        if (new Date(data.effectiveTo) < new Date(data.effectiveFrom)) {
            errors.effectiveTo = 'Effective To date cannot be earlier than Effective From date.';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
