import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Briefcase,
  Building2,
  CalendarCheck,
  Banknote,
  FileText,
  Upload,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';
import api from '../services/api';
import { Labourer, SalaryRecord } from '../types';
import { SalarySlipModal } from '../components/SalarySlipModal';

export const LabourerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [labourer, setLabourer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'SALARIES' | 'LEAVES' | 'DOCUMENTS'>('ATTENDANCE');

  // Salary Slip Modal
  const [selectedSalary, setSelectedSalary] = useState<SalaryRecord | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Document Upload
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('ID_PROOF');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchLabourer = async () => {
    try {
      const res = await api.get(`/labourers/${id}`);
      if (res.data?.data) {
        setLabourer(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabourer();
  }, [id]);

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', docTitle || selectedFile.name);
      formData.append('documentType', docType);

      await api.post(`/labourers/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDocTitle('');
      setSelectedFile(null);
      fetchLabourer();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!labourer) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Labourer not found.</p>
        <Link to="/labourers" className="mt-2 text-blue-600 font-bold inline-block">
          Back to Directory
        </Link>
      </div>
    );
  }

  const activeProject = labourer.projectAssignments?.[0]?.project;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/labourers"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Labourers
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {labourer.firstName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">
                {labourer.firstName} {labourer.lastName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                {labourer.labourId}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  labourer.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {labourer.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {labourer.phone}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {labourer.skills || 'General Labour'}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />{' '}
                {labourer.contractor?.companyName || 'Direct Employment'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-semibold block">Daily Wage</span>
            <span className="text-lg font-black text-slate-900 font-mono">
              ₹{labourer.dailyWageRate?.toFixed(2)}
            </span>
          </div>
          <div className="h-8 border-r border-slate-200" />
          <div>
            <span className="text-slate-400 uppercase text-[10px] font-semibold block">Active Project</span>
            <span className="font-bold text-slate-800">{activeProject?.name || 'Unassigned'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {[
          { id: 'ATTENDANCE', label: 'Attendance Records', icon: CalendarCheck },
          { id: 'SALARIES', label: 'Wages & Salary Slips', icon: Banknote },
          { id: 'LEAVES', label: 'Leave History & Balances', icon: Calendar },
          { id: 'DOCUMENTS', label: 'Documents & IDs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Attendance */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">Recent Attendance Logs (Last 30 Days)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Project</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Working Hours</th>
                  <th className="py-2.5 px-4">Overtime</th>
                  <th className="py-2.5 px-4">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labourer.attendances?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  labourer.attendances.map((att: any) => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-semibold">
                        {new Date(att.date).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-4">{att.project?.name || 'General Site'}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            att.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.status === 'OVERTIME'
                              ? 'bg-purple-100 text-purple-800'
                              : att.status === 'HALF_DAY'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono">{att.workingHours} hrs</td>
                      <td className="py-2.5 px-4 font-mono text-purple-700 font-semibold">
                        {att.overtimeHours > 0 ? `+${att.overtimeHours} hrs` : '-'}
                      </td>
                      <td className="py-2.5 px-4">
                        {att.isApproved ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Salaries */}
      {activeTab === 'SALARIES' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">Monthly Payroll & Generated Salary Slips</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Period</th>
                  <th className="py-2.5 px-4">Salary Code</th>
                  <th className="py-2.5 px-4">Base Wages</th>
                  <th className="py-2.5 px-4">Overtime</th>
                  <th className="py-2.5 px-4">Deductions</th>
                  <th className="py-2.5 px-4">Net Payable</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labourer.salaryRecords?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400">
                      No salary records generated yet.
                    </td>
                  </tr>
                ) : (
                  labourer.salaryRecords.map((sal: any) => (
                    <tr key={sal.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-800">{sal.periodMonth}</td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-blue-600">{sal.salaryCode}</td>
                      <td className="py-2.5 px-4 font-mono">₹{sal.baseWages.toFixed(2)}</td>
                      <td className="py-2.5 px-4 font-mono text-purple-700">₹{sal.overtimeAmount.toFixed(2)}</td>
                      <td className="py-2.5 px-4 font-mono text-rose-600">
                        ₹{(sal.deductionsAmount + sal.advancesRecovered).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-black text-slate-900">₹{sal.netPay.toFixed(2)}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sal.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sal.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sal.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSalary({ ...sal, labourer });
                            setShowSlipModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold"
                        >
                          <Printer className="w-3 h-3" /> View Payslip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Leaves */}
      {activeTab === 'LEAVES' && (
        <div className="space-y-4">
          {/* Balances Card */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Casual Leave Remaining</span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {(labourer.leaveBalances?.[0]?.casualLeave || 12) - (labourer.leaveBalances?.[0]?.usedCasual || 0)} Days
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Sick Leave Remaining</span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {(labourer.leaveBalances?.[0]?.sickLeave || 10) - (labourer.leaveBalances?.[0]?.usedSick || 0)} Days
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Annual Leave Remaining</span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {(labourer.leaveBalances?.[0]?.annualLeave || 15) - (labourer.leaveBalances?.[0]?.usedAnnual || 0)} Days
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-800">
              Leave Request History
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {labourer.leaveRequests?.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No leave requests found.</div>
              ) : (
                labourer.leaveRequests.map((l: any) => (
                  <div key={l.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{l.leaveType} Leave</span>
                        <span className="text-slate-400">• {l.totalDays} day(s)</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">{l.reason}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Dates: {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        l.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : l.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-6">
          {/* Upload Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Upload Verification Document
            </h3>
            <form onSubmit={handleUploadDoc} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Aadhaar Card, Skill Cert"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ID_PROOF">ID Proof / Govt Card</option>
                  <option value="CONTRACT">Employment Contract</option>
                  <option value="CERTIFICATE">Skill / Trade Certificate</option>
                  <option value="MEDICAL">Medical Fitness Clearance</option>
                  <option value="PROFILE_PHOTO">Profile Photo</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Doc'}
              </button>
            </form>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {labourer.documents?.length === 0 ? (
              <div className="col-span-3 py-8 text-center text-slate-400 text-xs">
                No documents uploaded yet.
              </div>
            ) : (
              labourer.documents?.map((doc: any) => (
                <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{doc.title}</h4>
                    <p className="text-[10px] text-slate-400">{doc.documentType} • {(doc.fileSize / 1024).toFixed(1)} KB</p>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 font-semibold hover:underline mt-1 inline-block"
                    >
                      View / Download
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Salary Slip Modal */}
      <SalarySlipModal
        isOpen={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        record={selectedSalary}
      />
    </div>
  );
};
