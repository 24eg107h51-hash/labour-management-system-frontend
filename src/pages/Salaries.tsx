import React, { useState, useEffect } from 'react';
import {
  Banknote,
  Calculator,
  Printer,
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import api from '../services/api';
import { SalaryRecord, Labourer } from '../types';
import { SalarySlipModal } from '../components/SalarySlipModal';
import { PaymentModal } from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';

export const Salaries: React.FC = () => {
  const { hasRole } = useAuth();
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [labourers, setLabourers] = useState<Labourer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals
  const [selectedSalaryForSlip, setSelectedSalaryForSlip] = useState<SalaryRecord | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  const [selectedSalaryForPayment, setSelectedSalaryForPayment] = useState<SalaryRecord | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcData, setCalcData] = useState({
    labourerId: '',
    periodMonth: '2026-10',
    bonusAmount: '0',
    customDeductions: '0',
    notes: '',
  });
  const [calcSubmitting, setCalcSubmitting] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salRes, labRes] = await Promise.all([
        api.get('/salaries', {
          params: { periodMonth: selectedPeriod || undefined, status: statusFilter || undefined },
        }),
        api.get('/labourers', { params: { status: 'ACTIVE', limit: 100 } }),
      ]);

      if (salRes.data?.data) {
        setSalaries(salRes.data.data);
      }
      if (labRes.data?.data) {
        setLabourers(labRes.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod, statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/salaries/${id}/approve`, {
        notes: 'Approved for disbursement by Administrator',
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCalculateWages = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcError(null);
    setCalcSubmitting(true);

    try {
      await api.post('/salaries/calculate', {
        labourerId: calcData.labourerId,
        periodMonth: calcData.periodMonth,
        bonusAmount: parseFloat(calcData.bonusAmount) || 0,
        customDeductions: parseFloat(calcData.customDeductions) || 0,
        notes: calcData.notes,
      });

      setShowCalcModal(false);
      fetchData();
    } catch (err: any) {
      setCalcError(err.response?.data?.message || 'Failed to calculate wages.');
    } finally {
      setCalcSubmitting(false);
    }
  };

  // Payroll Totals
  const totalPayable = salaries.reduce((sum, s) => sum + s.netPay, 0);
  const totalPaid = salaries.reduce(
    (sum, s) => sum + (s.payments?.filter((p) => p.status === 'COMPLETED').reduce((ps, p) => ps + p.amount, 0) || 0),
    0
  );
  const totalPending = Math.max(0, totalPayable - totalPaid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="w-5 h-5 text-blue-600" />
            Wage, Salary & Payroll Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formula: Net Pay = Base Wages + Overtime + Bonuses − Deductions − Advances Recovered
          </p>
        </div>

        {hasRole(['ADMIN', 'SUPERVISOR']) && (
          <button
            onClick={() => {
              setCalcData({
                labourerId: labourers[0]?.id || '',
                periodMonth: selectedPeriod,
                bonusAmount: '0',
                customDeductions: '0',
                notes: '',
              });
              setCalcError(null);
              setShowCalcModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            <Calculator className="w-4 h-4" /> Calculate Monthly Wages
          </button>
        )}
      </div>

      {/* Financial Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Total Wages Incurred ({selectedPeriod})
            </span>
            <p className="text-xl font-black text-slate-900 font-mono mt-1">₹{totalPayable.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Disbursed</span>
            <p className="text-xl font-black text-emerald-600 font-mono mt-1">₹{totalPaid.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pending Disbursement</span>
            <p className="text-xl font-black text-amber-600 font-mono mt-1">₹{totalPending.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Select Pay Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="2026-10">October 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="">All Periods</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Filter Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Statuses</option>
              <option value="CALCULATED">Calculated (Pending Approval)</option>
              <option value="APPROVED">Approved (Ready for Payment)</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid / Completed</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{salaries.length}</strong> payroll records
        </div>
      </div>

      {/* Salary Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Salary Code</th>
                <th className="py-3 px-4">Labourer Name</th>
                <th className="py-3 px-4">Base Wages</th>
                <th className="py-3 px-4">Overtime Pay</th>
                <th className="py-3 px-4">Bonus</th>
                <th className="py-3 px-4">Deductions & Advances</th>
                <th className="py-3 px-4">Net Pay</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading payroll records...
                  </td>
                </tr>
              ) : salaries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No wage records generated for {selectedPeriod}. Use "Calculate Monthly Wages" above.
                  </td>
                </tr>
              ) : (
                salaries.map((sal) => {
                  const paidSoFar = sal.payments
                    ? sal.payments.filter((p) => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0)
                    : 0;

                  return (
                    <tr key={sal.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{sal.salaryCode}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {sal.labourer?.firstName} {sal.labourer?.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {sal.labourer?.labourId} • ₹{sal.labourer?.dailyWageRate}/day
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">₹{sal.baseWages.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-purple-700 font-semibold">
                        ₹{sal.overtimeAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-600">₹{sal.bonusAmount.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-rose-600">
                        ₹{(sal.deductionsAmount + sal.advancesRecovered).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-900 text-sm">
                        ₹{sal.netPay.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sal.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sal.status === 'APPROVED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : sal.status === 'PARTIALLY_PAID'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {sal.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve Button */}
                          {hasRole(['ADMIN', 'SUPERVISOR']) && sal.status === 'CALCULATED' && (
                            <button
                              onClick={() => handleApprove(sal.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition"
                              title="Approve for Payment"
                            >
                              Approve
                            </button>
                          )}

                          {/* Pay Button */}
                          {hasRole('ADMIN') && (sal.status === 'APPROVED' || sal.status === 'PARTIALLY_PAID') && (
                            <button
                              onClick={() => {
                                setSelectedSalaryForPayment(sal);
                                setShowPaymentModal(true);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition"
                              title="Disburse Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay
                            </button>
                          )}

                          {/* Payslip View */}
                          <button
                            onClick={() => {
                              setSelectedSalaryForSlip(sal);
                              setShowSlipModal(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            title="Print / View Payslip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculate Wages Modal */}
      {showCalcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-400" /> Calculate Monthly Wages Engine
              </h3>
              <button onClick={() => setShowCalcModal(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCalculateWages} className="p-6 space-y-4 text-xs">
              {calcError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{calcError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Labourer *</label>
                <select
                  required
                  value={calcData.labourerId}
                  onChange={(e) => setCalcData({ ...calcData, labourerId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs font-semibold"
                >
                  <option value="">-- Choose Labourer --</option>
                  {labourers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.firstName} {l.lastName} ({l.labourId}) - ₹{l.dailyWageRate}/day
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pay Period (YYYY-MM)</label>
                  <input
                    type="text"
                    required
                    value={calcData.periodMonth}
                    onChange={(e) => setCalcData({ ...calcData, periodMonth: e.target.value })}
                    placeholder="2026-10"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Performance Bonus (₹)</label>
                  <input
                    type="number"
                    step="50"
                    value={calcData.bonusAmount}
                    onChange={(e) => setCalcData({ ...calcData, bonusAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Custom Deductions / Penalties (₹)</label>
                <input
                  type="number"
                  step="50"
                  value={calcData.customDeductions}
                  onChange={(e) => setCalcData({ ...calcData, customDeductions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Calculation Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional calculation remarks or milestone justification"
                  value={calcData.notes}
                  onChange={(e) => setCalcData({ ...calcData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Formula Explainer */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] space-y-1">
                <p className="font-bold">Automated Computation Flow:</p>
                <p>1. Aggregates all approved attendance shifts (Full days, Half days, Overtime).</p>
                <p>2. Automatically pulls active advances and recovers pending balance.</p>
                <p>3. Formula: <code>Net Pay = Base + OT + Bonus - Deductions - Advance Recovery</code></p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCalcModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={calcSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition disabled:opacity-50"
                >
                  {calcSubmitting ? 'Calculating...' : 'Run Payroll Calculation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Slip Modal */}
      <SalarySlipModal
        isOpen={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        record={selectedSalaryForSlip}
      />

      {/* Payment Disburse Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        record={selectedSalaryForPayment}
        onSuccess={fetchData}
      />
    </div>
  );
};
