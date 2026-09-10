import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { planApi } from '../../api/planApi';
import { validatePlanForm } from '../../validators/planFormValidator';
import { useToast } from '../../utils/Toast';
import Breadcrumb from '../../components/common/Breadcrumb';

const CURRENCY_OPTIONS = [
  { value: 1, symbol: '₹', code: 'INR', label: 'INR (₹)' },
  { value: 2, symbol: '$', code: 'USD', label: 'USD ($)' },
  { value: 3, symbol: '€', code: 'EUR', label: 'EUR (€)' },
  { value: 4, symbol: '£', code: 'GBP', label: 'GBP (£)' },
];

const STATUS_OPTIONS = [
  { value: 3, label: 'Draft', desc: 'Visible only to system administrators' },
  { value: 2, label: 'Inactive', desc: 'Disabled for new signups' },
];

const INITIAL_FORM_DATA = {
  name: '',
  code: '',
  description: '',
  currency: 1,
  monthlyPrice: '',
  yearlyPrice: '',
  trialPeriodDays: 0,
  status: 3, // Default to Draft
  version: '1.0',
  effectiveFrom: new Date().toISOString().split('T')[0],
  effectiveTo: '',
  codeModified: false,
};

export default function SuperAdminCreatePlan() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTrial, setHasTrial] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? '' : Number(value)) : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    // Auto-generate system code from plan name if code hasn't been manually tweaked
    if (name === 'name' && !formData.codeModified) {
      const generatedCode = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 50);
      setFormData((prev) => ({ ...prev, name: value, code: generatedCode }));
    }

    if (name === 'code') {
      setFormData((prev) => ({ ...prev, codeModified: true }));
    }

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleToggleTrial = () => {
    setHasTrial((prev) => {
      const nextState = !prev;
      if (!nextState) {
        setFormData((f) => ({ ...f, trialPeriodDays: 0 }));
        setErrors((errs) => ({ ...errs, trialPeriodDays: null }));
      }
      return nextState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationPayload = {
      ...formData,
      hasTrial,
      trialPeriodDays: hasTrial ? formData.trialPeriodDays : null,
    };

    const { isValid, errors: validationErrors } = validatePlanForm(validationPayload);

    if (!isValid) {
      setErrors(validationErrors);
      const firstErrorMessage = Object.values(validationErrors)[0] || 'Please fix the errors in the form.';
      showToast(firstErrorMessage, 'error');
      return;
    }

    setErrors({});

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description ? formData.description.trim() : null,
        status: Number(formData.status),
        currency: Number(formData.currency),
        monthlyPrice: Number(formData.monthlyPrice),
        yearlyPrice: Number(formData.yearlyPrice),
        trialPeriodDays: hasTrial ? Number(formData.trialPeriodDays) : null,
        effectiveFrom: formData.effectiveFrom ? new Date(formData.effectiveFrom).toISOString() : new Date().toISOString(),
        effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null,
      };

      const response = await planApi.createPlan(payload);

      if (response?.success !== false) {
        showToast(response?.message || 'Plan created successfully!', 'success');
        // Clear the form once the plan is created
        setFormData(INITIAL_FORM_DATA);
        setHasTrial(false);
        setErrors({});
      } else {
        showToast(response?.message || 'Failed to create plan.', 'error');
      }
    } catch (err) {
      console.error('Error creating plan:', err);
      const backendError =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat()[0] : null) ||
        err.message ||
        'Failed to create plan.';
      showToast(backendError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCurrencySymbol = CURRENCY_OPTIONS.find((c) => c.value === Number(formData.currency))?.symbol || '₹';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f1f5f9] min-h-screen text-slate-900">

      {/* Header & Breadcrumb Shell */}
      <div className="bg-white rounded border border-gray-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Home', to: '/superadmin/dashboard' },
              { label: 'Plans', to: '/superadmin/plans' },
              { label: 'Create Plan' },
            ]}
          />
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold text-gray-800">Create New Subscription Plan</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
              Draft Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Configure pricing tiers, billing cycles, and feature lifecycles.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/superadmin/plans')}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-slate-900 border border-slate-900 px-5 py-2 rounded hover:bg-slate-800 transition disabled:opacity-50 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Core Fields */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Details Card */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">General Information</h2>
            </div>

            <div className="p-5 space-y-4 text-xs">
              
              {/* Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Plan Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Enterprise Pro"
                    className={`w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                      errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-gray-200'
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    System Identifier (Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="ENTERPRISE_PRO"
                    className={`w-full px-3 py-2 border rounded text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                      errors.code ? 'border-rose-400 bg-rose-50/30' : 'border-gray-200'
                    }`}
                  />
                  {errors.code ? (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.code}</p>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-1">Unique key used by billing and backend APIs.</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Outline feature limits, targeted business size, or included perks..."
                  className={`w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed ${
                    errors.description ? 'border-rose-400 bg-rose-50/30' : 'border-gray-200'
                  }`}
                />
                {errors.description && <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>}
              </div>

            </div>
          </div>

          {/* Pricing Structure Card */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Pricing Strategy</h2>
              
              {/* Currency Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 font-medium">Currency:</span>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="px-2 py-1 text-xs border border-gray-200 rounded bg-white font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 space-y-6 text-xs">
              
              {/* Rates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Monthly */}
                <div className="p-4 rounded border border-slate-200/80 bg-slate-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gray-700">Monthly Price</label>
                    <span className="text-[10px] font-mono text-slate-400">/ month</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-semibold">{selectedCurrencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="monthlyPrice"
                      value={formData.monthlyPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`w-full pl-7 pr-3 py-2 border rounded text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                        errors.monthlyPrice ? 'border-rose-400' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.monthlyPrice && <p className="text-[11px] text-rose-500">{errors.monthlyPrice}</p>}
                </div>

                {/* Annual */}
                <div className="p-4 rounded border border-slate-200/80 bg-slate-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-gray-700">Annual Price</label>
                    <span className="text-[10px] font-mono text-slate-400">/ year</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-semibold">{selectedCurrencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="yearlyPrice"
                      value={formData.yearlyPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`w-full pl-7 pr-3 py-2 border rounded text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                        errors.yearlyPrice ? 'border-rose-400' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.yearlyPrice && <p className="text-[11px] text-rose-500">{errors.yearlyPrice}</p>}
                </div>

              </div>

              {/* Free Trial Option */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-800 block">Offer Free Evaluation Trial</span>
                    <span className="text-[11px] text-gray-400">Allow users to try this plan before payment is required.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleTrial}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      hasTrial ? 'bg-slate-900' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        hasTrial ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {hasTrial && (
                  <div className="pt-2 max-w-xs">
                    <label className="block font-medium text-gray-700 mb-1">
                      Trial Duration (Days) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        name="trialPeriodDays"
                        value={formData.trialPeriodDays}
                        onChange={handleChange}
                        placeholder="14"
                        className={`w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                          errors.trialPeriodDays ? 'border-rose-400' : 'border-gray-200'
                        }`}
                      />
                      <span className="text-gray-500 font-medium text-xs shrink-0">days</span>
                    </div>
                    {errors.trialPeriodDays && <p className="text-[11px] text-rose-500 mt-1">{errors.trialPeriodDays}</p>}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Settings & Lifecycle */}
        <div className="space-y-6">

          {/* Initial Status Selection */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Initial Publishing State</h2>
            </div>
            <div className="p-5 space-y-2 text-xs">
              {STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition ${
                    formData.status === opt.value
                      ? 'border-slate-900 bg-slate-50/80 ring-1 ring-slate-900/10'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={formData.status === opt.value}
                    onChange={() => setFormData((prev) => ({ ...prev, status: opt.value }))}
                    className="mt-0.5 accent-slate-900"
                  />
                  <div>
                    <span className="font-semibold text-gray-800 block">{opt.label}</span>
                    <span className="text-[11px] text-gray-400 leading-tight block mt-0.5">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Lifecycle & Versioning */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Lifecycle & Validity</h2>
            </div>
            
            <div className="p-5 space-y-4 text-xs">
              
              {/* Version */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Initial Version Tag</label>
                <input
                  type="text"
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  placeholder="1.0"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Effective From */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Effective From <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="effectiveFrom"
                  value={formData.effectiveFrom}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                    errors.effectiveFrom ? 'border-rose-400' : 'border-gray-200'
                  }`}
                />
                {errors.effectiveFrom && <p className="text-[11px] text-rose-500 mt-1">{errors.effectiveFrom}</p>}
              </div>

              {/* Effective To */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Effective Until (Optional)</label>
                <input
                  type="date"
                  name="effectiveTo"
                  value={formData.effectiveTo}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                    errors.effectiveTo ? 'border-rose-400' : 'border-gray-200'
                  }`}
                />
                {errors.effectiveTo ? (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.effectiveTo}</p>
                ) : (
                  <p className="text-[10px] text-gray-400 mt-1">Leave blank for indefinite validity.</p>
                )}
              </div>

            </div>
          </div>

        </div>

      </form>

    </div>
  );
}