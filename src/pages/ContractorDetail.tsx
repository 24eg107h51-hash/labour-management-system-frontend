import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  FileSpreadsheet,
  Printer,
  CheckCircle,
  Clock,
  Banknote,
} from 'lucide-react';
import api from '../services/api';

export const ContractorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [statement, setStatement] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('2026-10');

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/contractors/${id}/statement`, {
        params: { periodMonth: period || undefined },
      });
      if (res.data?.data) {
        setStatement(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement();
  }, [id, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Contractor statement not found.</p>
        <Link to="/contractors" className="mt-2 text-blue-600 font-bold inline-block">
          Back to Contractors
        </Link>
      </div>
    );
  }

  const { contractor, summary, breakdown } = statement;

  return (
    <div className="space-y-6">
      {/* Back button & Print */}
      <div className="flex justify-between items-center no-print">
        <Link
          to="/contractors"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Contractors
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
        >
          <Printer className="w-3.5 h-3.5" /> Print Statement
        </button>
      </div>

      {/* Header Profile */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{contractor.companyName}</h1>
            <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              {contractor.taxId || 'GST REG'}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-semibold mt-1">Authorized Contact: {contractor.contactPerson}</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2 font-mono">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {contractor.phone}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {contractor.email}
            </span>
          </div>
        </div>

        {/* Financial Statement Summary Cards */}
        <div className="grid grid-cols-3 gap-3 text-xs w-full md:w-auto">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center min-w-[110px]">
            <span className="text-[10px] text-blue-700 uppercase font-semibold block">Total Incurred</span>
            <span className="text-base font-black text-blue-900 font-mono">
              ₹{(summary?.totalWagesCalculated || 0).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center min-w-[110px]">
            <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Total Disbursed</span>
            <span className="text-base font-black text-emerald-900 font-mono">
              ₹{(summary?.totalWagesPaid || 0).toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center min-w-[110px]">
            <span className="text-[10px] text-amber-700 uppercase font-semibold block">Pending Balance</span>
            <span className="text-base font-black text-amber-900 font-mono">
              ₹{(summary?.totalPending || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-2xl border border-slate-200 text-xs">
        <span className="font-bold text-slate-800">Contractor Manpower Statement & Wage Distribution</span>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold"
          >
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="">All Periods Combined</option>
          </select>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Labour ID</th>
                <th className="py-3 px-4">Labourer Name</th>
                <th className="py-3 px-4">Trade / Skills</th>
                <th className="py-3 px-4">Daily Rate</th>
                <th className="py-3 px-4">Net Wage</th>
                <th className="py-3 px-4">Paid to Date</th>
                <th className="py-3 px-4">Pending Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdown?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No wage records found for this period.
                  </td>
                </tr>
              ) : (
                breakdown?.map((b: any) => (
                  <tr key={b.labourerId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{b.labourCode}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{b.name}</td>
                    <td className="py-2.5 px-4 text-slate-500">{b.skills}</td>
                    <td className="py-2.5 px-4 font-mono">₹{b.dailyRate?.toFixed(2)}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">₹{b.totalNetPay?.toFixed(2)}</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-600 font-bold">₹{b.totalPaid?.toFixed(2)}</td>
                    <td className="py-2.5 px-4 font-mono text-amber-600 font-bold">₹{b.pendingAmount?.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
