export type UserRole = 'admin' | 'hr' | 'employee';

export interface User {
  id: string;
  employee_id?: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  status?: 'active' | 'inactive';
  is_active?: boolean;
}

export interface Department {
  id: string;
  dept_code: string;
  name: string;
  description: string;
  manager_id?: string;
  manager_name?: string;
  budget: number;
  location: string;
  created_at: string;
  employee_count?: number;
}

export interface Designation {
  id: string;
  title: string;
  department_id: string;
  department_name?: string;
  grade: string;
  min_salary: number;
  max_salary: number;
}

export interface Employee {
  id: string;
  emp_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  joining_date: string;
  department_id: string;
  department_name?: string;
  designation_id: string;
  designation_title?: string;
  employment_status: 'active' | 'probation' | 'terminated' | 'on_leave';
  salary: number;
  avatar_url?: string;
  bank_account?: string;
  emergency_contact?: string;
  role: UserRole;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  department_name?: string;
  date: string; // YYYY-MM-DD
  check_in?: string; // HH:MM
  check_out?: string; // HH:MM
  status: AttendanceStatus;
  total_hours?: number;
  notes?: string;
}

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  default_days_per_year: number;
  is_paid: boolean;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  leave_type_name: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  department_name?: string;
  leave_type_id: string;
  leave_type_name?: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveStatus;
  applied_at: string;
  reviewed_by?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  reviewer_comment?: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  emp_code?: string;
  designation_title?: string;
  department_name?: string;
  month: string; // e.g. "September 2026"
  year?: number;
  basic_salary: number;
  hra?: number;
  da?: number;
  medical_allowance?: number;
  transport_allowance?: number;
  tax_deduction?: number;
  pf_deduction?: number;
  other_deductions?: number;
  allowances?: number;
  deductions?: number;
  gross_salary?: number;
  net_salary: number;
  status?: 'paid' | 'pending' | 'processing';
  payment_status?: 'paid' | 'pending' | 'processing';
  payment_method?: string;
  payment_date?: string;
  transaction_ref?: string;
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  employee_name?: string;
  department_name?: string;
  designation_title?: string;
  reviewer_id: string;
  reviewer_name: string;
  review_period: string; // e.g. "Q3 2026"
  goals?: string;
  achievements?: string;
  rating: number; // 1 to 5
  kpi_score?: number;
  feedback: string;
  goals_met?: string;
  recommendation?: string;
  review_date?: string;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  employee_name?: string;
  title: string;
  document_type?: string;
  doc_type?: string;
  file_name?: string;
  file_url?: string;
  file_size?: number | string;
  uploaded_at: string;
  file_data?: string;
}

export interface DocumentItem extends EmployeeDocument {}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  user_role?: string;
  action: string;
  entity?: string;
  entity_id?: string;
  details: string;
  ip_address?: string;
  timestamp?: string;
  created_at?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  pendingLeaves: number;
  totalMonthlyPayroll: number;
  activeEmployees: number;
  recentAttendance: AttendanceRecord[];
  departmentDistribution: { name: string; count: number; color: string }[];
  attendanceTrend: { day: string; present: number; absent: number; late: number }[];
  payrollByDepartment: { department: string; total: number }[];
}
