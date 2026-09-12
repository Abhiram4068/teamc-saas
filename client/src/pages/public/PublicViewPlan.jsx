import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { planApi } from '../../api/planApi';

function getCurrencySymbol(currency) {
  switch (currency) {
    case 1:
      return '₹';
    case 2:
      return '$';
    case 3:
      return '€';
    case 4:
      return '£';
    default:
      return '₹';
  }
}

export default function PublicViewPlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnnual, setIsAnnual] = useState(true);

  useEffect(() => {
    fetchPublicPlans();
  }, []);

  async function fetchPublicPlans() {
    try {
      setLoading(true);
      setError(null);
      const res = await planApi.getPublicPlans();

      if (res?.success && Array.isArray(res?.data)) {
        setPlans(res.data);
      } else if (Array.isArray(res)) {
        setPlans(res);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error('Error loading public plans:', err);
      setError('Unable to load subscription plans right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Unique features extracted across all active plans for the comparison table
  const dynamicFeatures = useMemo(() => {
    if (!plans || plans.length === 0) return [];
    const featureMap = new Map();

    plans.forEach((plan) => {
      (plan.features || []).forEach((feat) => {
        const id = feat.featureId || feat.id;
        if (!featureMap.has(id)) {
          featureMap.set(id, {
            id,
            name: feat.name,
            description: feat.description,
          });
        }
      });
    });

    return Array.from(featureMap.values());
  }, [plans]);

  return (
    <div className="bg-white">
      
      {/* PRICING HERO & TOGGLE */}
      <section className="bg-gradient-to-b from-blue-200 via-blue-100 to-white pt-16 pb-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-800 tracking-tight mb-4">
           Choose a plan that works for your workforce
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-normal">
            Scale your workforce management without hidden seat fees or unexpected setup costs.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <span
              onClick={() => setIsAnnual(false)}
              className={`text-sm cursor-pointer select-none transition ${
                !isAnnual ? 'font-bold text-brand-800' : 'font-medium text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAnnual ? 'bg-brand-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isAnnual}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            <div
              onClick={() => setIsAnnual(true)}
              className="flex items-center space-x-2 cursor-pointer select-none"
            >
              <span
                className={`text-sm transition ${
                  isAnnual ? 'font-bold text-brand-800' : 'font-medium text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual Billing
              </span>
              <span className=" text-green-600 text-xs font-bold px-2.5 py-0.5 ">
                Save up to 20%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING CARDS SECTION */}
      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Loading Skeleton State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-6 bg-white animate-pulse space-y-5">
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-4/5" />
                  <div className="h-10 bg-slate-200 rounded w-1/2 my-4" />
                  <div className="h-10 bg-slate-200 rounded w-full" />
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="h-3.5 bg-slate-100 rounded w-full" />
                    <div className="h-3.5 bg-slate-100 rounded w-5/6" />
                    <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="max-w-md mx-auto text-center py-12 px-6 bg-rose-50 border border-rose-200 rounded-xl">
              <svg className="w-10 h-10 text-rose-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-semibold text-rose-800 mb-4">{error}</p>
              <button
                onClick={fetchPublicPlans}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded transition shadow-xs cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty Plans State */}
          {!loading && !error && plans.length === 0 && (
            <div className="max-w-md mx-auto text-center py-16 px-6 bg-slate-50 border border-slate-200 rounded-xl">
              <svg className="w-10 h-10 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-base font-bold text-slate-800">No Plans Currently Available</h3>
              <p className="text-xs text-slate-500 mt-1">Please check back shortly or reach out to our team.</p>
              <Link
                to="/login"
                className="inline-block mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Active Plans Grid */}
          {!loading && !error && plans.length > 0 && (
            <div
              className={`grid gap-6 items-stretch justify-center ${
                plans.length === 1
                  ? 'max-w-md mx-auto grid-cols-1'
                  : plans.length === 2
                  ? 'max-w-3xl mx-auto grid-cols-1 md:grid-cols-2'
                  : plans.length === 3
                  ? 'max-w-5xl mx-auto grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {plans.map((plan, index) => {
                const isPopular =
                  plan.code?.toUpperCase().includes('PREMIUM') ||
                  plan.code?.toUpperCase().includes('POPULAR') ||
                  (plans.length >= 3 && index === 1);

                const isEnterprise =
                  plan.code?.toUpperCase().includes('ENTERPRISE') ||
                  plan.name?.toLowerCase().includes('enterprise');

                const currencySymbol = getCurrencySymbol(plan.currency);
                const priceValue = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
                const isFree = priceValue === 0;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl p-6 flex flex-col justify-between transition duration-200 relative ${
                      isEnterprise
                        ? 'border border-slate-700 bg-brand-800 text-white shadow-md hover:shadow-xl'
                        : 'border border-gray-200 bg-white hover:shadow-lg'
                    }`}
                  >
                    {/* Highlight Badge
                    {isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-xs">
                        Most Popular
                      </span>
                    )} */}

                    <div>
                      {/* Plan Header */}
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          title={plan.name}
                          className={`text-xl font-bold tracking-tight truncate ${isEnterprise ? 'text-white' : 'text-brand-800'}`}
                        >
                          {plan.name}
                        </h3>
                      </div>

                      {/* Description with fixed height for perfect vertical alignment */}
                      <p
                        title={plan.description || 'Essential tools and capabilities designed for modern workforce operations.'}
                        className={`text-xs mt-1.5 h-9 line-clamp-2 leading-relaxed ${
                          isEnterprise ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {plan.description || 'Essential tools and capabilities designed for modern workforce operations.'}
                      </p>

                      {/* Pricing Block */}
                      <div className="my-5">
                        <div className="flex items-baseline gap-1.5">
                          <span
                            title={isFree ? 'Free' : `${currencySymbol} ${Number(priceValue).toLocaleString()} ${isAnnual ? '/ year' : '/ month'}`}
                            className={`text-3xl font-extrabold tracking-tight truncate ${
                              isEnterprise ? 'text-white' : 'text-brand-800'
                            }`}
                          >
                            {isFree ? 'Free' : `${currencySymbol} ${Number(priceValue).toLocaleString()}`}
                          </span>
                          {!isFree && (
                            <span className={`text-xs font-medium ${isEnterprise ? 'text-gray-300' : 'text-gray-500'}`}>
                              {isAnnual ? '/ year' : '/ month'}
                            </span>
                          )}
                        </div>

                        <span className={`text-xs block mt-1 ${isEnterprise ? 'text-gray-300' : 'text-gray-500'}`}>
                          {isFree
                            ? 'Free forever for basic workforce setup'
                            : isAnnual
                            ? 'Billed annually'
                            : 'Billed monthly'}
                        </span>

                        {/* Always allocate h-7 (28px) so cards without trial maintain identical vertical button alignment */}
                        <div className="h-7 mt-2.5 flex items-center">
                          {plan.trialPeriodDays > 0 ? (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5  ${
                              isEnterprise
                                ? 'text-emerald-300'
                                : 'text-emerald-700 '
                            }`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              {plan.trialPeriodDays}-day free trial included
                            </span>
                          ) : (
                            <div className="h-full w-full" aria-hidden="true" />
                          )}
                        </div>
                      </div>

                      {/* CTA Button (Now perfectly aligned across all cards) */}
                      <Link
                        to={`/checkout/${plan.id}`}
                        className={`block text-center w-full text-sm font-semibold py-2.5 rounded-md transition mb-6 shadow-xs cursor-pointer ${
                          isEnterprise
                            ? 'bg-white hover:bg-gray-100 text-brand-800'
                            : isPopular
                            ? 'bg-brand-600 hover:bg-blue-700 text-white'
                            : 'bg-brand-50 hover:bg-brand-100 text-brand-600'
                        }`}
                      >
                        {plan.trialPeriodDays > 0
                          ? `Start ${plan.trialPeriodDays}-Day Free Trial`
                          : isFree
                          ? 'Get Started'
                          : `Get Started with ${plan.name}`}
                      </Link>

                      {/* Included Features List */}
                      <div className={`border-t pt-4 ${isEnterprise ? 'border-gray-700' : 'border-gray-100'}`}>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                          isEnterprise ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Features Included:
                        </p>

                        <ul className="space-y-3 text-xs">
                          {plan.features && plan.features.length > 0 ? (
                            plan.features.map((feat) => {
                              const desc =
                                feat.description &&
                                feat.description !== feat.name &&
                                feat.description !== feat.code
                                  ? feat.description
                                  : `${feat.name} capability included in this plan.`;

                              return (
                                <li
                                  key={feat.id || feat.featureId}
                                  className="flex items-start gap-2 text-xs"
                                >
                                  {/* Checkmark icon */}
                                  <svg
                                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                                      isEnterprise ? 'text-blue-400' : 'text-emerald-500'
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>

                                  {/* Feature Name — up to 3 lines, then truncates; title shows full text on hover */}
                                  <span
                                    title={feat.name}
                                    className={`font-semibold min-w-0 line-clamp-3 ${isEnterprise ? 'text-white' : 'text-gray-900'}`}
                                  >
                                    {feat.name}
                                  </span>

                                  {/* Info icon button fixed to the right-most of the feature name */}
                                  <div className="relative inline-flex items-center group/tooltip shrink-0 ml-auto">
                                    <button
                                      type="button"
                                      className={`inline-flex items-center justify-center w-4 h-4 rounded-full transition-colors cursor-pointer ${
                                        isEnterprise
                                          ? 'text-slate-400 hover:text-white hover:bg-white/10'
                                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                      }`}
                                      aria-label={`Description for ${feat.name}`}
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </button>

                                    {/* Tooltip bubble on hover */}
                                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:flex flex-col items-end z-50 pointer-events-none w-56 max-w-xs animate-in fade-in zoom-in-95 duration-150">
                                      <div className="bg-slate-900 text-white text-[11px] font-normal leading-relaxed rounded-md py-1.5 px-2.5 shadow-xl border border-slate-700/80 text-center font-jakarta">
                                        {desc}
                                      </div>
                                      <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700/80 mr-1.5" />
                                    </div>
                                  </div>
                                </li>
                              );
                            })
                          ) : (
                            <li className={`italic text-xs ${isEnterprise ? 'text-gray-400' : 'text-gray-400'}`}>
                              Features coming soon
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* DYNAMIC OR FALLBACK COMPARISON TABLE */}
      <section id="comparison" className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-800">Compare Full Plan Features</h2>
            <p className="text-gray-600 mt-2 text-sm">Detailed technical capabilities across all subscription tiers.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-x-auto">
            {dynamicFeatures.length > 0 ? (
              <table className="w-full text-left border-collapse text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 font-bold text-brand-800">
                    <th className="p-4 w-2/5">Capabilities</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="p-4 text-center">
                        <div
                          title={plan.name}
                          className="text-sm font-bold text-slate-900 truncate max-w-[120px] mx-auto"
                        >
                          {plan.name}
                        </div>
                        <div
                          title={isAnnual
                            ? `${getCurrencySymbol(plan.currency)}${plan.yearlyPrice}/yr`
                            : `${getCurrencySymbol(plan.currency)}${plan.monthlyPrice}/mo`}
                          className="text-xs font-normal text-gray-500 mt-0.5 truncate max-w-[120px] mx-auto"
                        >
                          {isAnnual
                            ? `${getCurrencySymbol(plan.currency)}${plan.yearlyPrice}/yr`
                            : `${getCurrencySymbol(plan.currency)}${plan.monthlyPrice}/mo`}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-gray-50/70">
                    <td colSpan={plans.length + 1} className="p-3 font-bold text-xs uppercase tracking-wider text-gray-500">
                      Entitlements & Features
                    </td>
                  </tr>
                  {dynamicFeatures.map((feat) => (
                    <tr key={feat.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 text-gray-800 font-medium max-w-[200px]">
                        <div
                          title={feat.name}
                          className="line-clamp-2 leading-snug"
                        >
                          {feat.name}
                        </div>
                        {feat.description && feat.description !== feat.name && (
                          <div
                            title={feat.description}
                            className="text-xs text-gray-400 font-normal mt-0.5 line-clamp-2 leading-snug"
                          >
                            {feat.description}
                          </div>
                        )}
                      </td>
                      {plans.map((plan) => {
                        const hasFeature = (plan.features || []).some(
                          (f) => (f.featureId || f.id) === feat.id && f.isEnabled !== false
                        );
                        return (
                          <td key={plan.id} className="p-4 text-center">
                            {hasFeature ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-200">
                                ✓
                              </span>
                            ) : (
                              <span className="text-gray-300 font-bold text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 font-bold text-brand-800">
                    <th className="p-4 w-2/5">Capabilities</th>
                    <th className="p-4 text-center w-1/5">Starter</th>
                    <th className="p-4 text-center w-1/5">Standard</th>
                    <th className="p-4 text-center w-1/5 bg-blue-50/50">Premium</th>
                    <th className="p-4 text-center w-1/5">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-gray-50/70">
                    <td colSpan={5} className="p-3 font-bold text-xs uppercase tracking-wider text-gray-500">
                      Core HR & Administration
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-800 font-medium">Employee Profiles & Directory</td>
                    <td className="p-4 text-center font-semibold text-gray-700">Basic</td>
                    <td className="p-4 text-center font-semibold text-gray-700">Full</td>
                    <td className="p-4 text-center font-semibold text-brand-600 bg-blue-50/30">Full</td>
                    <td className="p-4 text-center font-semibold text-gray-700">Custom Fields</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-800 font-medium">Time-off & Leave Management</td>
                    <td className="p-4 text-center"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="p-4 text-center"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="p-4 text-center bg-blue-50/30"><span className="text-green-600 font-bold">✓</span></td>
                    <td className="p-4 text-center"><span className="text-green-600 font-bold">✓</span></td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-brand-800 text-center mb-10">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-base font-bold text-brand-800">
                Can we switch plans or change user seats anytime?
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Yes. You can add or remove employee seats at any time from your tenant admin panel. Billing will automatically prorate for mid-cycle additions.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-base font-bold text-brand-800">
                How does the 14-day free trial work?
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                All plans configured with a trial include complete access to their assigned features for the full trial duration without requiring upfront credit card details.
              </p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-base font-bold text-brand-800">
                Do you support custom enterprise procurement processes?
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Yes, our Enterprise tier supports custom security questionnaires, PO billing, and custom Master Services Agreements (MSA).
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}