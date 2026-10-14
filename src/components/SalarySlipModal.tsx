import React from 'react';
import { X, Printer, HardHat, CheckCircle2 } from 'lucide-react';
import { SalarySlip, SalaryRecord } from '../types';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SalaryRecord | null;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const earnings = record.components?.filter((c) => c.type === 'EARNING') || [
    { id: '1', name: 'Base Wages', amount: record.baseWages },
    ...(record.overtimeAmount > 0 ? [{ id: '2', name: 'Overtime Pay', amount: record.overtimeAmount }] : []),
    ...(record.bonusAmount > 0 ? [{ id: '3', name: 'Special Bonus', amount: record.bonusAmount }] : []),
  ];

  const deductions = record.components?.filter((c) => c.type === 'DEDUCTION') || [
    ...(record.deductionsAmount > 0 ? [{ id: '4', name: 'Statutory Deductions', amount: record.deductionsAmount }] : []),
    ...(record.advancesRecovered > 0 ? [{ id: '5', name: 'Advance Loan Recovery', amount: record.advancesRecovered }] : []),
  ];

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header with actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white no-print">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm tracking-wide">Official Salary Pay Slip</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div id="printable-content" className="p-8 font-sans text-slate-800">
          {/* Company Branding */}
          <div className="flex justify-between items-start border-b-2 border-blue-600 pb-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                APEX INFRASTRUCTURE & LABOUR SOLUTIONS
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Apex Corporate Park, Outer Ring Road, Bengaluru, KA - 560103
              </p>
              <p className="text-xs text-slate-500">
                GSTIN: 29AABCU9603R1ZM | Phone: +91 (80) 4567-8900
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                PAYSLIP FOR {record.periodMonth}
              </span>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                Slip No: {record.salarySlip?.slipNumber || `SLIP-${record.salaryCode}`}
              </p>
            </div>
          </div>

          {/* Labourer Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-200 text-xs">
            <div>
              <p className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Labour Name</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {record.labourer?.firstName} {record.labourer?.lastName}
              </p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Labour ID</p>
              <p className="font-bold text-blue-600 font-mono mt-0.5">{record.labourer?.labourId}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Daily Wage Rate</p>
              <p className="font-bold text-slate-900 mt-0.5">₹{record.labourer?.dailyWageRate?.toFixed(2)} / day</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Contractor</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {record.labourer?.contractor?.companyName || 'Direct Employee'}
              </p>
            </div>
          </div>

          {/* Period & Payment Status */}
          <div className="grid grid-cols-3 gap-4 py-4 border-b border-slate-200 text-xs bg-slate-50/50 px-3 rounded-lg my-4">
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase">Pay Period</p>
              <p className="font-bold text-slate-800">
                {new Date(record.startDate).toLocaleDateString()} to {new Date(record.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase">Approval Status</p>
              <p className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {record.status}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-semibold uppercase">Approved By</p>
              <p className="font-bold text-slate-800">
                {record.approvedBy ? `${record.approvedBy.firstName} ${record.approvedBy.lastName}` : 'System Administrator'}
              </p>
            </div>
          </div>

          {/* Earnings & Deductions Breakdown Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 uppercase text-[11px] tracking-wider border-b border-slate-200">
                Earnings
              </div>
              <div className="divide-y divide-slate-100">
                {earnings.map((e, idx) => (
                  <div key={idx} className="flex justify-between px-4 py-2">
                    <span className="text-slate-600">{e.name}</span>
                    <span className="font-semibold text-slate-900 font-mono">₹{e.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <span>Gross Earnings</span>
                <span className="font-mono text-blue-700">₹{totalEarnings.toFixed(2)}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 uppercase text-[11px] tracking-wider border-b border-slate-200">
                Deductions & Recoveries
              </div>
              <div className="divide-y divide-slate-100">
                {deductions.length === 0 ? (
                  <div className="px-4 py-2 text-slate-400 italic">No deductions applied</div>
                ) : (
                  deductions.map((d, idx) => (
                    <div key={idx} className="flex justify-between px-4 py-2">
                      <span className="text-slate-600">{d.name}</span>
                      <span className="font-semibold text-rose-600 font-mono">₹{d.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <span>Total Deductions</span>
                <span className="font-mono text-rose-600">₹{totalDeductions.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Formula Summary Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <p className="text-[11px] text-blue-700 font-semibold uppercase tracking-wider">Payroll Formula Applied</p>
              <p className="text-xs text-blue-900 mt-0.5">
                Net Pay = Base Wages + Overtime + Bonuses − Deductions − Advances Recovered
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">NET PAYABLE AMOUNT</span>
              <p className="text-2xl font-black text-blue-700 font-mono">₹{record.netPay.toFixed(2)}</p>
            </div>
          </div>

          {/* Payment Transactions Log if paid */}
          {record.payments && record.payments.length > 0 && (
            <div className="mt-6 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Disbursement Record</h4>
              <div className="space-y-1.5">
                {record.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-600">
                    <span>
                      {p.paymentMethod} • Ref: <span className="font-mono font-semibold">{p.transactionRef}</span>
                    </span>
                    <span className="font-bold text-emerald-700 font-mono">
                      ₹{p.amount.toFixed(2)} (Paid on {new Date(p.paymentDate).toLocaleDateString()})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-slate-300 text-center text-xs text-slate-600">
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">Site Supervisor / Accounts Manager</p>
              <p className="text-[10px] text-slate-400">Authorized Signature & Seal</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">Labourer / Beneficiary</p>
              <p className="text-[10px] text-slate-400">Signature / Thumb Impression</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
