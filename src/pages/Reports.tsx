import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Briefcase,
  Building2,
  Users,
  Banknote,
  Clock,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../services/api';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<string>('wages');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [periodMonth, setPeriodMonth] = useState('2026-10');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-14');

  const reportOptions = [
    { id: 'wages', name: 'Wage & Salary Report', icon: Banknote, description: 'Payroll breakdown, overtime, deductions & net pay' },
    { id: 'attendance', name: 'Daily & Monthly Attendance', icon: Calendar, description: 'Turnout logs, working hours, and supervisor sign-offs' },
    { id: 'projects', name: 'Project-wise Labour Costs', icon: Briefcase, description: 'Site allocation costs and budget utilization rates' },
    { id: 'productivity', name: 'Labour Productivity Report', icon: TrendingUp, description: 'Task performance scores and completed quantities' },
    { id: 'labourers', name: 'Labour Registration Directory', icon: Users, description: 'Worker profiles, trades, rates, and contact details' },
    { id: 'overtime', name: 'Approved Overtime Log', icon: Clock, description: 'Hourly rates and overtime compensation aggregates' },
  ];

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint = '/reports/wages';
      let params: any = {};

      if (reportType === 'wages') {
        endpoint = '/reports/wages';
        params = { periodMonth };
      } else if (reportType === 'attendance') {
        endpoint = '/reports/attendance';
        params = { startDate, endDate };
      } else if (reportType === 'projects') {
        endpoint = '/reports/projects';
      } else if (reportType === 'productivity') {
        endpoint = '/reports/productivity';
      } else if (reportType === 'labourers') {
        endpoint = '/labourers';
        params = { limit: 100 };
      } else if (reportType === 'overtime') {
        endpoint = '/attendance';
        params = { status: 'OVERTIME' };
      }

      const res = await api.get(endpoint, { params });
      setData(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, periodMonth, startDate, endDate]);

  const handleExportCSV = () => {
    const csvExportType = reportType === 'labourers' ? 'labourers' : reportType === 'wages' ? 'wages' : 'attendance';
    window.open(`/api/reports/export/${csvExportType}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Executive Reports & Export Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational intelligence, site audit logs, and compliance export reports (CSV & PDF)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition"
          >
            <Download className="w-4 h-4" /> Export CSV File
          </button>
        </div>
      </div>

      {/* Report Type Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
        {reportOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = reportType === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setReportType(opt.id)}
              className={`p-3 rounded-xl border text-left transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
              <p className="font-bold text-xs mt-2 truncate">{opt.name}</p>
            </button>
          );
        })}
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Filter Parameters:</span>

          {reportType === 'wages' ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Period Month:</span>
              <input
                type="text"
                value={periodMonth}
                onChange={(e) => setPeriodMonth(e.target.value)}
                placeholder="2026-10"
                className="px-2.5 py-1 border border-slate-300 rounded-lg font-mono font-bold w-28"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Date Range:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          )}
        </div>

        <span className="text-slate-500 font-medium">
          Showing <strong>{data.length}</strong> records generated
        </span>
      </div>

      {/* Printable Report Output Area */}
      <div id="printable-content" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Printable Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                Official Compliance Statement
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {reportOptions.find((r) => r.id === reportType)?.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generated from LMS Database on {new Date().toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                LMS-REP-2026
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Table based on reportType */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            {reportType === 'wages' && (
              <>
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Labour ID</th>
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Base Wages</th>
                    <th className="py-2.5 px-4">Overtime</th>
                    <th className="py-2.5 px-4">Bonus</th>
                    <th className="py-2.5 px-4">Deductions</th>
                    <th className="py-2.5 px-4">Net Pay</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{r.salaryCode}</td>
                      <td className="py-2.5 px-4 font-mono">{r.labourer?.labourId}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {r.labourer?.firstName} {r.labourer?.lastName}
                      </td>
                      <td className="py-2.5 px-4 font-mono">₹{r.baseWages.toFixed(2)}</td>
                      <td className="py-2.5 px-4 font-mono text-purple-700">₹{r.overtimeAmount.toFixed(2)}</td>
                      <td className="py-2.5 px-4 font-mono text-emerald-600">₹{r.bonusAmount.toFixed(2)}</td>
                      <td className="py-2.5 px-4 font-mono text-rose-600">
                        ₹{(r.deductionsAmount + r.advancesRecovered).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-black text-slate-900">₹{r.netPay.toFixed(2)}</td>
                      <td className="py-2.5 px-4 font-bold text-[10px]">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'attendance' && (
              <>
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Labour ID</th>
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Project</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Shift Hours</th>
                    <th className="py-2.5 px-4">Overtime</th>
                    <th className="py-2.5 px-4">Approved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{a.labourer?.labourId}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {a.labourer?.firstName} {a.labourer?.lastName}
                      </td>
                      <td className="py-2.5 px-4">{a.project?.name || 'General Site'}</td>
                      <td className="py-2.5 px-4 font-bold text-[10px]">{a.status}</td>
                      <td className="py-2.5 px-4 font-mono">{a.workingHours} hrs</td>
                      <td className="py-2.5 px-4 font-mono text-purple-700">
                        {a.overtimeHours > 0 ? `+${a.overtimeHours} hrs` : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-emerald-600 font-semibold">
                        {a.isApproved ? 'YES' : 'NO'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'projects' && (
              <>
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Project Code</th>
                    <th className="py-2.5 px-4">Project Name</th>
                    <th className="py-2.5 px-4">Client</th>
                    <th className="py-2.5 px-4">Budget</th>
                    <th className="py-2.5 px-4">Workers Assigned</th>
                    <th className="py-2.5 px-4">Man-Days</th>
                    <th className="py-2.5 px-4">Incurred Labour Cost</th>
                    <th className="py-2.5 px-4">Budget Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((p) => (
                    <tr key={p.projectId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{p.projectCode}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-4">{p.clientName}</td>
                      <td className="py-2.5 px-4 font-mono">₹{p.budget.toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-mono">{p.workersAssigned}</td>
                      <td className="py-2.5 px-4 font-mono">{p.manDaysLogged}</td>
                      <td className="py-2.5 px-4 font-mono font-black text-blue-700">
                        ₹{p.totalLabourCost.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                        {p.budgetUtilizationRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'productivity' && (
              <>
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Labour ID</th>
                    <th className="py-2.5 px-4">Labourer Name</th>
                    <th className="py-2.5 px-4">Task Allocated</th>
                    <th className="py-2.5 px-4">Project</th>
                    <th className="py-2.5 px-4">Completed Qty</th>
                    <th className="py-2.5 px-4">Productivity Score</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{pr.labourer?.labourId}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {pr.labourer?.firstName} {pr.labourer?.lastName}
                      </td>
                      <td className="py-2.5 px-4 font-medium">{pr.task?.title}</td>
                      <td className="py-2.5 px-4 text-slate-500">{pr.task?.project?.name}</td>
                      <td className="py-2.5 px-4 font-mono font-bold">
                        {pr.completedQuantity} {pr.task?.unit}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-black text-emerald-600">
                        {pr.productivityScore}%
                      </td>
                      <td className="py-2.5 px-4 text-[10px] font-bold">{pr.status}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
