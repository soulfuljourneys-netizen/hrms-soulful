
export enum UserRole {
  ADMIN = 'Admin',
  HR = 'HR',
  EMPLOYEE = 'Employee'
}

export enum EmployeeStatus {
  ACTIVE = 'Active',
  ONBOARDING = 'Onboarding',
  ON_LEAVE = 'On Leave',
  TERMINATED = 'Terminated'
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  data?: string; // Base64 data
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  managerId?: string;
  status: EmployeeStatus;
  userRole: UserRole;
  password?: string;
  joinDate: string;
  address: string;
  phone: string;
  salary: number;
  documents: Document[];
  taxId?: string;
  emergencyContact?: string;
  bankAccount?: string;
  dob?: string;
  profilePicture?: string; // Base64 or URL
  // Leave tracking
  vacationUsed: number;
  sickUsed: number;
  personalUsed: number;
  vacationAllowed: number;
  sickAllowed: number;
  personalAllowed: number;
}

export interface LeavePolicy {
  id: string;
  name: string;
  leaveType: 'Vacation' | 'Sick' | 'Personal';
  annualQuota: number;
  maxCarryForward: number;
  probationPeriodDays: number;
  maxDaysPerRequest: number;
  applicableRoles: UserRole[];
  applicableDepartments: string[];
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  type: 'Full Day' | 'Half Day' | 'Leave' | 'Off';
  startTime: string;
  endTime: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'Sick' | 'Vacation' | 'Personal';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  daysCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breaks: Break[];
  totalHours: number;
}

export interface Break {
  start: string;
  end?: string;
}

export type ViewType = 'dashboard' | 'employees' | 'tracker' | 'attendance' | 'mindmap' | 'onboarding' | 'payroll' | 'leaves' | 'announcements' | 'my-team' | 'roster';
