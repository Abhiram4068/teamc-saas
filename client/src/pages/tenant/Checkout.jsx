import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { planApi } from '../../api/planApi';

export default function Checkout() {
  const { planId } = useParams();
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [plan, setPlan] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);
        const [planRes, featuresRes] = await Promise.all([
          planApi.getPlanById(planId),
          planApi.getPlanFeatures(planId)
        ]);
        setPlan(planRes.data || planRes);
        setFeatures(featuresRes.data || featuresRes);
      } catch (error) {
        console.error("Failed to fetch plan data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (planId) fetchPlanData();
  }, [planId]);

  if (loading) {
    return <div className="min-h-[60vh] flex justify-center items-center text-slate-500 font-medium text-sm">Loading checkout details...</div>;
  }

  if (!plan) {
    return <div className="min-h-[60vh] flex justify-center items-center text-red-500 font-medium text-sm">Plan not found or failed to load.</div>;
  }

  const price = billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice;

  return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
          <div className="mb-8 border-b border-slate-200 pb-4">
              <h1 className="text-xl font-bold text-[#091E42] tracking-tight">Complete Checkout for Subscription</h1>
              <p className="text-xs text-slate-500 mt-1">Review your organization details and select a payment method to proceed.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Organization Info & Payment Options */}
              <div className="lg:col-span-7 space-y-6">
                  
                  {/* Step 1: Organization Details Form */}
                  <div className="p-6 sm:p-7">
                      <h2 className="text-base font-bold text-slate-900 mb-0.5">
                          1. Organization info
                      </h2>
                      <p className="text-xs text-slate-500 mb-6">This information will be included on all billing invoices on your account.</p>

                      <form className="space-y-4">
                          <div>
                              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Organization name</label>
                              <input type="text" defaultValue="Workspace Name" className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm font-medium outline-none transition" placeholder="Enter organization name" />
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Country or region</label>
                              <select className="w-full px-3 py-2 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm font-medium outline-none transition" defaultValue="IN">
                                  <option value="IN">India</option>
                                  <option value="US">United States</option>
                                  <option value="GB">United Kingdom</option>
                                  <option value="AE">United Arab Emirates</option>
                              </select>
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Address line 1</label>
                              <input type="text" className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition" placeholder="Street address or P.O. Box" />
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Address line 2 <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                              <input type="text" className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition" placeholder="Apartment, suite, unit, or floor" />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">City</label>
                                  <input type="text" className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition" />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">PIN Code</label>
                                  <input type="text" className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm outline-none transition" />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">State</label>
                                  <select className="w-full px-3 py-2 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm font-medium outline-none transition" defaultValue="">
                                      <option value="" disabled>Select</option>
                                      <option value="KL">Kerala</option>
                                      <option value="KA">Karnataka</option>
                                      <option value="MH">Maharashtra</option>
                                      <option value="DL">Delhi</option>
                                  </select>
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">GSTIN ID <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
                              <input type="text" placeholder="12ABCDE3456F7Z8" className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm font-mono uppercase outline-none transition" />
                          </div>
                      </form>
                  </div>

                  {/* Step 2: Payment Methods (UPI, QR Code, Card) */}
                  <div className="p-6 sm:p-7 ">
                      <h2 className="text-base font-bold text-slate-900 mb-0.5">2. Payment method</h2>
                      <p className="text-xs text-slate-500 mb-6">Select your payment preferences.</p>

                      <div className="space-y-3">
                          {/* UPI / QR Option (Active) */}
                          <div className="border border-brand-600 rounded p-4 bg-slate-50/50">
                              <label className="flex items-center justify-between cursor-pointer mb-3">
                                  <div className="flex items-center gap-2.5">
                                      <input type="radio" name="payment-method" defaultChecked className="w-4 h-4 text-brand-600 focus:ring-brand-500" />
                                      <span className="font-bold text-slate-900 text-sm">UPI / Dynamic QR Code</span>
                                  </div>
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-sm uppercase tracking-wider">Instant</span>
                              </label>

                              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                                  {/* QR Display */}
                                  <div className="flex flex-col items-center bg-white p-3.5 rounded border border-slate-200 shadow-xs text-center">
                                      <div className="w-32 h-32 bg-slate-50 rounded p-1.5 border border-slate-200 flex items-center justify-center mb-2 relative">
                                          {/* Clean SVG QR Code */}
                                          <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                                              <path d="M0 0h30v30H0zm10 10v10h10V10zM70 0h30v30H70zm10 10v10h10V10zM0 70h30v30H0zm10 10v10h10V10zM40 10h10v10H40zm10 20h10v10H50zm-10 10h10v10H40zm20-20h10v10H60zm10 30h10v10H70zm-20 0h10v10H50zm30 10h10v20H80zm10 20h10v10H90zm-40 0h20v10H50zm-10-10h10v20H40zm30 0h10v10H70z"/>
                                          </svg>
                                      </div>
                                      <span className="text-xs font-semibold text-slate-800">Scan to pay ₹294.75</span>
                                      <span className="text-[10px] text-slate-400 mt-0.5">GPay, PhonePe, Paytm, BHIM</span>
                                  </div>

                                  {/* UPI ID Input */}
                                  <div className="space-y-3">
                                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Enter VPA / UPI ID</label>
                                      <div className="flex gap-2">
                                          <input type="text" placeholder="username@upi" className="flex-grow px-3 py-2 rounded border border-slate-300 text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none" />
                                          <button type="button" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded transition">Verify</button>
                                      </div>
                                      <p className="text-[11px] text-slate-500 leading-normal">Payment request will be pushed directly to your UPI handle.</p>
                                  </div>
                              </div>
                          </div>

                          {/* Card Option */}
                          <div className="border border-slate-200 rounded p-3.5 hover:border-slate-300 transition">
                              <label className="flex items-center justify-between cursor-pointer">
                                  <div className="flex items-center gap-2.5">
                                      <input type="radio" name="payment-method" className="w-4 h-4 text-brand-600 focus:ring-brand-500" />
                                      <span className="font-semibold text-slate-800 text-sm">Credit or Debit Card</span>
                                  </div>
                                  <div className="flex gap-1.5 text-[10px] text-slate-400 font-mono font-bold tracking-widest">
                                      <span>VISA</span>
                                      <span>MC</span>
                                      <span>AMEX</span>
                                  </div>
                              </label>
                          </div>
                      </div>

                      <button type="button" className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-3.5 rounded shadow-sm transition">
                          Complete Upgrade — ₹ {price}
                      </button>
                  </div>
              </div>

              {/* RIGHT COLUMN: Plan Summary, Features & Currency Selection */}
              <div className="lg:col-span-5 sticky top-20">
                  <div className="bg-white border-slate-200 border p-6 space-y-5">
                      
                      {/* Plan Name */}
                      <div>
                          <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Summary</span>
                          </div>

                          <div className="mb-4">
                              <h3 className="text-xl font-extrabold text-slate-900 mb-4">Teamo {plan.name}</h3>
                              
                              <div className="grid grid-cols-2 gap-3">
                                  {/* Monthly Option */}
                                  <label className={`border rounded p-3 cursor-pointer flex flex-col transition-all ${billingCycle === 'MONTHLY' ? 'border-[#091E42] bg-blue-50/30 ring-1 ring-[#091E42]' : 'border-slate-200 hover:border-slate-300'}`}>
                                      <div className="flex items-center gap-2 mb-1.5">
                                          <input 
                                              type="radio" 
                                              name="billingCycle" 
                                              value="MONTHLY" 
                                              checked={billingCycle === 'MONTHLY'} 
                                              onChange={(e) => setBillingCycle(e.target.value)} 
                                              className="w-4 h-4 text-[#091E42] focus:ring-[#091E42]" 
                                          />
                                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Monthly</span>
                                      </div>
                                      <div className="text-lg font-extrabold text-slate-900">₹{plan.monthlyPrice}</div>
                                      <div className="text-[10px] text-slate-500 mt-1">Billed every month</div>
                                  </label>

                                  {/* Yearly Option */}
                                  <label className={`border rounded p-3 cursor-pointer flex flex-col transition-all ${billingCycle === 'YEARLY' ? 'border-[#091E42] bg-blue-50/30 ring-1 ring-[#091E42]' : 'border-slate-200 hover:border-slate-300'}`}>
                                      <div className="flex items-center justify-between mb-1.5">
                                          <div className="flex items-center gap-2">
                                              <input 
                                                  type="radio" 
                                                  name="billingCycle" 
                                                  value="YEARLY" 
                                                  checked={billingCycle === 'YEARLY'} 
                                                  onChange={(e) => setBillingCycle(e.target.value)} 
                                                  className="w-4 h-4 text-[#091E42] focus:ring-[#091E42]" 
                                              />
                                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Yearly</span>
                                          </div>
                                          {plan.monthlyPrice * 12 > plan.yearlyPrice && (
                                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Save</span>
                                          )}
                                      </div>
                                      <div className="text-lg font-extrabold text-slate-900">₹{plan.yearlyPrice}</div>
                                      <div className="text-[10px] text-slate-500 mt-1">Billed once a year</div>
                                  </label>
                              </div>
                          </div>
                      </div>

                      <hr className="border-slate-100" />

                      {/* Included Plan Features with Descriptions */}
                      <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Top Features Included</h4>
                          <ul className="space-y-3">
                              {features.length > 0 ? features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2.5">
                                      <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                      </svg>
                                      <div>
                                          <div className="text-xs font-bold text-slate-800">{feature.featureName}</div>
                                          {feature.featureDescription && (
                                            <p className="text-[11px] text-slate-500 leading-normal mt-0.5">{feature.featureDescription}</p>
                                          )}
                                      </div>
                                  </li>
                              )) : (
                                  <li className="text-xs text-slate-500">No specific features listed for this plan.</li>
                              )}
                          </ul>
                      </div>

                      <hr className="border-slate-100" />

                      {/* Price Breakdown */}
                      <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-slate-600">
                              <span>{billingCycle === "MONTHLY" ? "Monthly" : "Yearly"} Amount</span>
                              <span className="font-medium">₹{price}</span>
                          </div>

                          <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                              <div>
                                  <span className="text-sm font-bold text-slate-900">Due Today</span>
                              </div>
                              <span className="text-xl font-extrabold text-slate-900">₹ {price}</span>
                          </div>
                      </div>

                      {/* Disclaimer Box
                      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-500 flex gap-2 items-start">
                          <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="leading-relaxed">This is an estimate. Charges adjust automatically based on active members at billing date.</span>
                      </div> */}

                  </div>
              </div>

          </div>
      </main>

  );
}
