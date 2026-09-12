import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Checkout() {
  const { planId } = useParams();
  const [currency, setCurrency] = useState('INR');
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <div className="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-brand-500 selection:text-white min-h-screen flex flex-col justify-between">

      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2.5">
                  {/* <div className="w-7 h-7 rounded bg-brand-600 flex items-center justify-center text-white shadow-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                  </div> */}
                  <span className="text-lg font-bold text-slate-900 tracking-tight">Teamo</span>
              </Link>
              
              <div className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <span>Upgrade <strong className="text-slate-900 font-semibold">Workspace</strong> to Teamo Pro</span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  {/* <span className="hidden sm:inline">Secure 256-bit SSL</span> */}
              </div>
          </div>
      </header>

      {/* MAIN CHECKOUT CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Organization Info & Payment Options */}
              <div className="lg:col-span-7 space-y-6">
                  
                  {/* Step 1: Organization Details Form */}
                  <div className="bg-white p-6 sm:p-7 rounded border border-slate-200 shadow-sm">
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
                  <div className="bg-white p-6 sm:p-7 rounded border border-slate-200 shadow-sm">
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
                          Complete Upgrade — ₹294.75
                      </button>
                  </div>
              </div>

              {/* RIGHT COLUMN: Plan Summary, Features & Currency Selection */}
              <div className="lg:col-span-5 sticky top-20">
                  <div className="bg-white rounded border border-slate-200 shadow-sm p-6 space-y-5">
                      
                      {/* Currency Switcher & Plan Name */}
                      <div>
                          <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Summary</span>
                              
                              {/* Currency Selector */}
                              <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-slate-500 font-medium">Currency:</span>
                                  <select 
                                      value={currency}
                                      onChange={(e) => setCurrency(e.target.value)}
                                      className="bg-slate-50 font-semibold text-slate-700 rounded px-2 py-0.5 text-xs border border-slate-200 outline-none focus:ring-1 focus:ring-brand-500"
                                  >
                                      <option value="INR">INR (₹)</option>
                                      <option value="USD">USD ($)</option>
                                      <option value="EUR">EUR (€)</option>
                                      <option value="GBP">GBP (£)</option>
                                  </select>
                              </div>
                          </div>

                          <div className="flex items-center justify-between">
                              <h3 className="text-xl font-extrabold text-slate-900">Teamo Pro</h3>
                              <select 
                                  value={billingCycle}
                                  onChange={(e) => setBillingCycle(e.target.value)}
                                  className="bg-slate-50 font-medium text-slate-700 rounded px-2.5 py-1 text-xs border border-slate-200 outline-none"
                              >
                                  <option value="monthly">Billed monthly</option>
                                  <option value="annually">Billed annually (-20%)</option>
                              </select>
                          </div>
                      </div>

                      <hr className="border-slate-100" />

                      {/* Included Plan Features with Descriptions */}
                      <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Top Features Included</h4>
                          <ul className="space-y-3">
                              <li className="flex items-start gap-2.5">
                                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  <div>
                                      <div className="text-xs font-bold text-slate-800">Unlimited Employee Records & History</div>
                                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Store complete profiles, documents, and historical logs without limits.</p>
                                  </div>
                              </li>
                              <li className="flex items-start gap-2.5">
                                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  <div>
                                      <div className="text-xs font-bold text-slate-800">Automated Onboarding Workflows</div>
                                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Role-based checklists and digital e-signatures for new team hires.</p>
                                  </div>
                              </li>
                              <li className="flex items-start gap-2.5">
                                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  <div>
                                      <div className="text-xs font-bold text-slate-800">Real-Time Payroll Sync</div>
                                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Automatically stream leave and comp changes straight to payroll.</p>
                                  </div>
                              </li>
                              <li className="flex items-start gap-2.5">
                                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  <div>
                                      <div className="text-xs font-bold text-slate-800">Custom PTO & Attendance Rules</div>
                                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Multi-region holiday calendar setups and 1-click approvals.</p>
                                  </div>
                              </li>
                          </ul>
                      </div>

                      <hr className="border-slate-100" />

                      {/* Price Breakdown */}
                      <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-slate-600">
                              <span>₹655.00 × 1 member</span>
                              <span className="font-medium">₹655.00</span>
                          </div>
                          <div className="flex justify-between text-emerald-700 font-medium">
                              <span>Plan discount (55%)</span>
                              <span>-₹360.25</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                              <span>Sales tax</span>
                              <span className="font-medium">₹0.00</span>
                          </div>

                          <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                              <div>
                                  <span className="text-sm font-bold text-slate-900">Due on October 11th, 2026</span>
                                  <div className="text-[11px] text-slate-400">30 days left in trial</div>
                              </div>
                              <span className="text-xl font-extrabold text-slate-900">₹294.75</span>
                          </div>
                      </div>

                      {/* Disclaimer Box */}
                      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-500 flex gap-2 items-start">
                          <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="leading-relaxed">This is an estimate. Charges adjust automatically based on active members at billing date.</span>
                      </div>

                  </div>
              </div>

          </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
              &copy; 2026 Teamo Software Inc. All rights reserved. &bull; <Link to="#" className="hover:underline text-slate-600">Privacy Policy</Link> &bull; <Link to="#" className="hover:underline text-slate-600">Terms of Service</Link>
          </div>
      </footer>

    </div>
  );
}
