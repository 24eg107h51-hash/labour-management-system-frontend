export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  roles: ('ADMIN' | 'SUPERVISOR' | 'CONTRACTOR' | 'LABOURER')[];
  contractorId?: string | null;
  labourerId?: string | null;
}

export interface Labourer {
  id: string;
  labourId: string;
  userId?: string | null;
  contractorId?: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  emergencyContact?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  dateOfBirth?: string;
  gender?: string;
  joiningDate: string;
  skills?: string;
  dailyWageRate: number;
  employmentType: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE';
  photoUrl?: string;
  contractor?: {
    id: string;
    companyName: string;
    contactPerson: string;
  };
  projectAssignments?: any[];
  leaveBalances?: any[];
}

export interface Contractor {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
  licenseNumber?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  status: string;
  notes?: string;
  _count?: {
    labourers: number;
    projectAssignments: number;
  };
  labourers?: Labourer[];
}

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  clientName?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  estimatedBudget: number;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  _count?: {
    projectAssignments: number;
    workTasks: number;
    attendances: number;
  };
  projectAssignments?: any[];
  workTasks?: any[];
  computedLabourCost?: number;
  totalManDays?: number;
}

export interface Attendance {
  id: string;
  labourerId: string;
  projectId?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'PAID_LEAVE' | 'OVERTIME';
  workingHours: number;
  overtimeHours: number;
  isApproved: boolean;
  approvedById?: string;
  approvalNotes?: string;
  remarks?: string;
  labourer?: {
    id: string;
    labourId: string;
    firstName: string;
    lastName: string;
    dailyWageRate: number;
    skills?: string;
    contractor?: { companyName: string };
  };
  project?: {
    id: string;
    projectCode: string;
    name: string;
  };
}

export interface SalaryRecord {
  id: string;
  salaryCode: string;
  labourerId: string;
  periodMonth: string;
  startDate: string;
  endDate: string;
  baseWages: number;
  overtimeAmount: number;
  bonusAmount: number;
  deductionsAmount: number;
  advancesRecovered: number;
  netPay: number;
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
  calculatedById?: string;
  approvedById?: string;
  approvalDate?: string;
  notes?: string;
  labourer?: Labourer;
  salarySlip?: SalarySlip;
  payments?: PaymentTransaction[];
  components?: SalaryComponent[];
}

export interface SalaryComponent {
  id: string;
  salaryRecordId: string;
  type: 'EARNING' | 'DEDUCTION';
  name: string;
  amount: number;
  description?: string;
}

export interface SalarySlip {
  id: string;
  slipNumber: string;
  salaryRecordId: string;
  labourerId: string;
  generatedDate: string;
  period: string;
  totalDaysWorked: number;
  totalHoursWorked: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
}

export interface PaymentTransaction {
  id: string;
  transactionRef: string;
  salaryRecordId: string;
  labourerId: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'UPI';
  paymentDate: string;
  status: string;
  remarks?: string;
  labourer?: {
    labourId: string;
    firstName: string;
    lastName: string;
  };
  salaryRecord?: {
    salaryCode: string;
    periodMonth: string;
  };
}

export interface LeaveRequest {
  id: string;
  labourerId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  createdAt: string;
  labourer?: {
    id: string;
    labourId: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalLabourers: number;
  activeLabourers: number;
  presentToday: number;
  absentToday: number;
  halfDayToday: number;
  ongoingProjects: number;
  totalContractors: number;
  totalWagesPayable: number;
  totalWagesPaid: number;
  pendingPayments: number;
  monthlyStats: {
    month: string;
    wages: number;
    paid: number;
    attendanceRate: number;
  }[];
  recentActivities: any[];
}
