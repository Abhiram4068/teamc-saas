export const validatePlanForm = (formData) => {
    const errors = {};

    // Name Validation
    if (!formData.Name) {
        errors.Name = "Plan Name is required.";
    } else if (formData.Name.length < 3) {
        errors.Name = "Plan Name must be at least 3 characters.";
    } else if (formData.Name.length > 100) {
        errors.Name = "Plan Name must not exceed 100 characters.";
    }

    // Code Validation
    if (!formData.Code) {
        errors.Code = "Plan Code is required.";
    } else if (formData.Code.length > 50) {
        errors.Code = "Plan Code must not exceed 50 characters.";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.Code)) {
        errors.Code = "Plan Code must contain only letters, numbers, underscores, or hyphens.";
    }

    // Description Validation
    if (formData.Description && formData.Description.length > 500) {
        errors.Description = "Description must not exceed 500 characters.";
    }

    // Monthly Price Validation
    if (formData.MonthlyPrice === undefined || formData.MonthlyPrice === null || formData.MonthlyPrice === "") {
        errors.MonthlyPrice = "Monthly Price is required.";
    } else if (parseFloat(formData.MonthlyPrice) < 0) {
        errors.MonthlyPrice = "Monthly Price must be 0 or greater.";
    }

    // Yearly Price Validation
    if (formData.YearlyPrice === undefined || formData.YearlyPrice === null || formData.YearlyPrice === "") {
        errors.YearlyPrice = "Yearly Price is required.";
    } else if (parseFloat(formData.YearlyPrice) < 0) {
        errors.YearlyPrice = "Yearly Price must be 0 or greater.";
    }

    // Trial Period Validation
    if (formData.TrialPeriodDays !== undefined && formData.TrialPeriodDays !== null && formData.TrialPeriodDays !== "") {
        if (parseInt(formData.TrialPeriodDays) < 0) {
            errors.TrialPeriodDays = "Trial Period Days must be 0 or greater.";
        }
    }

    // EffectiveFrom Validation
    if (!formData.EffectiveFrom) {
        errors.EffectiveFrom = "Effective From date is required.";
    }

    return errors;
};
