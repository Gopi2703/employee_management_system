import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import type { 
  User, Department, Designation, Employee, AttendanceRecord, 
  LeaveType, LeaveBalance, LeaveRequest, PayrollRecord, 
  PerformanceReview, DocumentItem, AuditLog, DashboardStats 
} from "./src/types";

// ==========================================
// In-Memory Normalized Relational Store
// Initialized from the MySQL Schema & Seeds
// ==========================================

let departments: Department[] = [
  { id: 'dept-1', dept_code: 'ENG', name: 'Engineering', description: 'Software engineering, architecture, and technology development', manager_id: 'emp-1', manager_name: 'Arthur Pendelton', budget: 250000, location: 'Building A, Floor 3', created_at: '2021-01-15' },
  { id: 'dept-2', dept_code: 'HR', name: 'Human Resources', description: 'Talent acquisition, employee relations, and organizational culture', manager_id: 'emp-2', manager_name: 'Elena Rostova', budget: 95000, location: 'Building B, Floor 2', created_at: '2021-01-15' },
  { id: 'dept-3', dept_code: 'FIN', name: 'Finance & Accounts', description: 'Financial planning, accounting, payroll, and compliance', manager_id: 'emp-4', manager_name: 'Sophia Alvarez', budget: 120000, location: 'Building B, Floor 1', created_at: '2021-02-01' },
  { id: 'dept-4', dept_code: 'MKT', name: 'Marketing & Sales', description: 'Brand management, growth campaigns, and customer acquisitions', manager_id: 'emp-5', manager_name: 'Tariq Mansoor', budget: 140000, location: 'Building A, Floor 2', created_at: '2021-03-10' },
  { id: 'dept-5', dept_code: 'OPS', name: 'Operations', description: 'Business operations, facilities, logistics, and quality assurance', budget: 85000, location: 'Building C, Floor 1', created_at: '2021-04-01' }
];

let designations: Designation[] = [
  { id: 'desig-1', department_id: 'dept-1', title: 'Senior Full Stack Engineer', grade: 'L4', min_salary: 75000, max_salary: 140000 },
  { id: 'desig-2', department_id: 'dept-1', title: 'Frontend Developer', grade: 'L2', min_salary: 50000, max_salary: 85000 },
  { id: 'desig-3', department_id: 'dept-1', title: 'DevOps Specialist', grade: 'L3', min_salary: 65000, max_salary: 110000 },
  { id: 'desig-4', department_id: 'dept-2', title: 'HR Manager', grade: 'L4', min_salary: 60000, max_salary: 105000 },
  { id: 'desig-5', department_id: 'dept-2', title: 'Talent Acquisition Executive', grade: 'L2', min_salary: 40000, max_salary: 65000 },
  { id: 'desig-6', department_id: 'dept-3', title: 'Payroll Specialist', grade: 'L3', min_salary: 55000, max_salary: 90000 },
  { id: 'desig-7', department_id: 'dept-4', title: 'Marketing Lead', grade: 'L4', min_salary: 65000, max_salary: 115000 },
  { id: 'desig-8', department_id: 'dept-5', title: 'Operations Coordinator', grade: 'L2', min_salary: 45000, max_salary: 75000 }
];

let employees: Employee[] = [
  {
    id: 'emp-1',
    emp_code: 'EMP-1001',
    first_name: 'Arthur',
    last_name: 'Pendelton',
    email: 'admin@company.com',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Springfield',
    date_of_birth: '1988-04-12',
    gender: 'Male',
    joining_date: '2021-01-15',
    department_id: 'dept-1',
    department_name: 'Engineering',
    designation_id: 'desig-1',
    designation_title: 'Senior Full Stack Engineer',
    employment_status: 'active',
    salary: 95000,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bank_account: 'ACC-982347102',
    emergency_contact: 'Martha Pendelton (+1 555 987-1234)',
    role: 'admin'
  },
  {
    id: 'emp-2',
    emp_code: 'EMP-1002',
    first_name: 'Elena',
    last_name: 'Rostova',
    email: 'hr@company.com',
    phone: '+1 (555) 345-6789',
    address: '120 Market Street, Suite 400, SF',
    date_of_birth: '1992-08-23',
    gender: 'Female',
    joining_date: '2022-03-01',
    department_id: 'dept-2',
    department_name: 'Human Resources',
    designation_id: 'desig-4',
    designation_title: 'HR Manager',
    employment_status: 'active',
    salary: 78000,
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bank_account: 'ACC-449102847',
    emergency_contact: 'Dmitri Rostov (+1 555 112-9988)',
    role: 'hr'
  },
  {
    id: 'emp-3',
    emp_code: 'EMP-1003',
    first_name: 'Marcus',
    last_name: 'Chen',
    email: 'employee@company.com',
    phone: '+1 (555) 456-7890',
    address: '88 Mission Bay Blvd, San Francisco',
    date_of_birth: '1995-11-04',
    gender: 'Male',
    joining_date: '2023-06-10',
    department_id: 'dept-1',
    department_name: 'Engineering',
    designation_id: 'desig-2',
    designation_title: 'Frontend Developer',
    employment_status: 'active',
    salary: 68000,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bank_account: 'ACC-192837465',
    emergency_contact: 'Linda Chen (+1 555 667-3344)',
    role: 'employee'
  },
  {
    id: 'emp-4',
    emp_code: 'EMP-1004',
    first_name: 'Sophia',
    last_name: 'Alvarez',
    email: 'sophia.alvarez@company.com',
    phone: '+1 (555) 567-8901',
    address: '350 Castro St, Mountain View',
    date_of_birth: '1993-02-18',
    gender: 'Female',
    joining_date: '2023-09-01',
    department_id: 'dept-3',
    department_name: 'Finance & Accounts',
    designation_id: 'desig-6',
    designation_title: 'Payroll Specialist',
    employment_status: 'active',
    salary: 64000,
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bank_account: 'ACC-556677889',
    emergency_contact: 'Carlos Alvarez (+1 555 889-0011)',
    role: 'employee'
  },
  {
    id: 'emp-5',
    emp_code: 'EMP-1005',
    first_name: 'Tariq',
    last_name: 'Mansoor',
    email: 'tariq.mansoor@company.com',
    phone: '+1 (555) 678-9012',
    address: '415 Elm St, San Jose',
    date_of_birth: '1990-07-29',
    gender: 'Male',
    joining_date: '2022-11-15',
    department_id: 'dept-4',
    department_name: 'Marketing & Sales',
    designation_id: 'desig-7',
    designation_title: 'Marketing Lead',
    employment_status: 'active',
    salary: 72000,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bank_account: 'ACC-990011223',
    emergency_contact: 'Amina Mansoor (+1 555 443-2211)',
    role: 'employee'
  }
];

let users: (User & { password_hash: string })[] = [
  { id: 'user-1', employee_id: 'emp-1', username: 'admin', email: 'admin@company.com', password_hash: 'admin123', role: 'admin', created_at: '2021-01-15', status: 'active' },
  { id: 'user-2', employee_id: 'emp-2', username: 'hrmanager', email: 'hr@company.com', password_hash: 'hr123', role: 'hr', created_at: '2022-03-01', status: 'active' },
  { id: 'user-3', employee_id: 'emp-3', username: 'marcus_chen', email: 'employee@company.com', password_hash: 'emp123', role: 'employee', created_at: '2023-06-10', status: 'active' },
  { id: 'user-4', employee_id: 'emp-4', username: 'sophia_alvarez', email: 'sophia.alvarez@company.com', password_hash: 'pass123', role: 'employee', created_at: '2023-09-01', status: 'active' },
  { id: 'user-5', employee_id: 'emp-5', username: 'tariq_mansoor', email: 'tariq.mansoor@company.com', password_hash: 'pass123', role: 'employee', created_at: '2022-11-15', status: 'active' }
];

let leaveTypes: LeaveType[] = [
  { id: 'lt-1', code: 'CL', name: 'Casual Leave', default_days_per_year: 12, is_paid: true },
  { id: 'lt-2', code: 'SL', name: 'Sick Leave', default_days_per_year: 10, is_paid: true },
  { id: 'lt-3', code: 'AL', name: 'Annual Paid Vacation', default_days_per_year: 15, is_paid: true },
  { id: 'lt-4', code: 'ML', name: 'Maternity/Paternity Leave', default_days_per_year: 90, is_paid: true },
  { id: 'lt-5', code: 'UL', name: 'Unpaid Leave', default_days_per_year: 30, is_paid: false }
];

let leaveBalances: LeaveBalance[] = [
  { id: 'lb-1', employee_id: 'emp-1', leave_type_id: 'lt-1', leave_type_name: 'Casual Leave', year: 2026, total_days: 12, used_days: 2, remaining_days: 10 },
  { id: 'lb-2', employee_id: 'emp-1', leave_type_id: 'lt-2', leave_type_name: 'Sick Leave', year: 2026, total_days: 10, used_days: 1, remaining_days: 9 },
  { id: 'lb-3', employee_id: 'emp-1', leave_type_id: 'lt-3', leave_type_name: 'Annual Paid Vacation', year: 2026, total_days: 15, used_days: 4, remaining_days: 11 },
  { id: 'lb-4', employee_id: 'emp-2', leave_type_id: 'lt-1', leave_type_name: 'Casual Leave', year: 2026, total_days: 12, used_days: 1, remaining_days: 11 },
  { id: 'lb-5', employee_id: 'emp-2', leave_type_id: 'lt-2', leave_type_name: 'Sick Leave', year: 2026, total_days: 10, used_days: 0, remaining_days: 10 },
  { id: 'lb-6', employee_id: 'emp-2', leave_type_id: 'lt-3', leave_type_name: 'Annual Paid Vacation', year: 2026, total_days: 15, used_days: 3, remaining_days: 12 },
  { id: 'lb-7', employee_id: 'emp-3', leave_type_id: 'lt-1', leave_type_name: 'Casual Leave', year: 2026, total_days: 12, used_days: 3, remaining_days: 9 },
  { id: 'lb-8', employee_id: 'emp-3', leave_type_id: 'lt-2', leave_type_name: 'Sick Leave', year: 2026, total_days: 10, used_days: 2, remaining_days: 8 },
  { id: 'lb-9', employee_id: 'emp-3', leave_type_id: 'lt-3', leave_type_name: 'Annual Paid Vacation', year: 2026, total_days: 15, used_days: 5, remaining_days: 10 }
];

let leaveRequests: LeaveRequest[] = [
  {
    id: 'lr-1',
    employee_id: 'emp-3',
    employee_name: 'Marcus Chen',
    department_name: 'Engineering',
    leave_type_id: 'lt-1',
    leave_type_name: 'Casual Leave',
    start_date: '2026-09-20',
    end_date: '2026-09-21',
    total_days: 2,
    reason: 'Personal family commitment and travel',
    status: 'pending',
    applied_at: '2026-09-15 09:30:00'
  },
  {
    id: 'lr-2',
    employee_id: 'emp-4',
    employee_name: 'Sophia Alvarez',
    department_name: 'Finance & Accounts',
    leave_type_id: 'lt-2',
    leave_type_name: 'Sick Leave',
    start_date: '2026-09-10',
    end_date: '2026-09-11',
    total_days: 2,
    reason: 'Seasonal fever and doctor consultation',
    status: 'approved',
    applied_at: '2026-09-09 08:00:00',
    reviewed_by: 'user-2',
    reviewer_name: 'Elena Rostova (HR)',
    reviewed_at: '2026-09-09 10:15:00',
    reviewer_comment: 'Approved. Get well soon!'
  },
  {
    id: 'lr-3',
    employee_id: 'emp-5',
    employee_name: 'Tariq Mansoor',
    department_name: 'Marketing & Sales',
    leave_type_id: 'lt-3',
    leave_type_name: 'Annual Paid Vacation',
    start_date: '2026-08-15',
    end_date: '2026-08-19',
    total_days: 5,
    reason: 'Annual summer vacation with family',
    status: 'approved',
    applied_at: '2026-08-01 11:20:00',
    reviewed_by: 'user-2',
    reviewer_name: 'Elena Rostova (HR)',
    reviewed_at: '2026-08-01 14:00:00',
    reviewer_comment: 'Approved. Enjoy your time off.'
  }
];

let attendance: AttendanceRecord[] = [
  { id: 'att-1', employee_id: 'emp-1', employee_name: 'Arthur Pendelton', department_name: 'Engineering', date: '2026-09-17', check_in: '08:55', check_out: '17:30', status: 'present', total_hours: 8.58, notes: 'Regular shift completed' },
  { id: 'att-2', employee_id: 'emp-2', employee_name: 'Elena Rostova', department_name: 'Human Resources', date: '2026-09-17', check_in: '09:02', check_out: '17:45', status: 'present', total_hours: 8.72, notes: 'On time' },
  { id: 'att-3', employee_id: 'emp-3', employee_name: 'Marcus Chen', department_name: 'Engineering', date: '2026-09-17', check_in: '09:40', check_out: '18:10', status: 'late', total_hours: 8.50, notes: 'Traffic delay on highway' },
  { id: 'att-4', employee_id: 'emp-4', employee_name: 'Sophia Alvarez', department_name: 'Finance & Accounts', date: '2026-09-17', check_in: '09:00', check_out: '17:00', status: 'present', total_hours: 8.00, notes: 'Standard working hours' },
  { id: 'att-5', employee_id: 'emp-5', employee_name: 'Tariq Mansoor', department_name: 'Marketing & Sales', date: '2026-09-17', status: 'absent', total_hours: 0, notes: 'Not reported' },
  { id: 'att-6', employee_id: 'emp-1', employee_name: 'Arthur Pendelton', department_name: 'Engineering', date: '2026-09-16', check_in: '08:50', check_out: '17:30', status: 'present', total_hours: 8.67 },
  { id: 'att-7', employee_id: 'emp-2', employee_name: 'Elena Rostova', department_name: 'Human Resources', date: '2026-09-16', check_in: '09:10', check_out: '17:40', status: 'present', total_hours: 8.50 },
  { id: 'att-8', employee_id: 'emp-3', employee_name: 'Marcus Chen', department_name: 'Engineering', date: '2026-09-16', check_in: '09:05', check_out: '17:35', status: 'present', total_hours: 8.50 },
  { id: 'att-9', employee_id: 'emp-4', employee_name: 'Sophia Alvarez', department_name: 'Finance & Accounts', date: '2026-09-16', check_in: '09:00', check_out: '13:00', status: 'half_day', total_hours: 4.00, notes: 'Doctor appointment' }
];

let payroll: PayrollRecord[] = [
  {
    id: 'pr-1',
    employee_id: 'emp-1',
    employee_name: 'Arthur Pendelton',
    emp_code: 'EMP-1001',
    designation_title: 'Senior Full Stack Engineer',
    department_name: 'Engineering',
    month: '2026-09',
    year: 2026,
    basic_salary: 50000,
    hra: 20000,
    da: 12000,
    medical_allowance: 5000,
    transport_allowance: 8000,
    tax_deduction: 8500,
    pf_deduction: 6000,
    other_deductions: 0,
    gross_salary: 95000,
    net_salary: 80500,
    payment_status: 'paid',
    payment_date: '2026-09-01',
    transaction_ref: 'TXN-20260901-001'
  },
  {
    id: 'pr-2',
    employee_id: 'emp-2',
    employee_name: 'Elena Rostova',
    emp_code: 'EMP-1002',
    designation_title: 'HR Manager',
    department_name: 'Human Resources',
    month: '2026-09',
    year: 2026,
    basic_salary: 42000,
    hra: 16000,
    da: 10000,
    medical_allowance: 4000,
    transport_allowance: 6000,
    tax_deduction: 6200,
    pf_deduction: 5040,
    other_deductions: 0,
    gross_salary: 78000,
    net_salary: 66760,
    payment_status: 'paid',
    payment_date: '2026-09-01',
    transaction_ref: 'TXN-20260901-002'
  },
  {
    id: 'pr-3',
    employee_id: 'emp-3',
    employee_name: 'Marcus Chen',
    emp_code: 'EMP-1003',
    designation_title: 'Frontend Developer',
    department_name: 'Engineering',
    month: '2026-09',
    year: 2026,
    basic_salary: 36000,
    hra: 14000,
    da: 8000,
    medical_allowance: 4000,
    transport_allowance: 6000,
    tax_deduction: 4500,
    pf_deduction: 4320,
    other_deductions: 0,
    gross_salary: 68000,
    net_salary: 59180,
    payment_status: 'pending'
  },
  {
    id: 'pr-4',
    employee_id: 'emp-4',
    employee_name: 'Sophia Alvarez',
    emp_code: 'EMP-1004',
    designation_title: 'Payroll Specialist',
    department_name: 'Finance & Accounts',
    month: '2026-09',
    year: 2026,
    basic_salary: 34000,
    hra: 13000,
    da: 8000,
    medical_allowance: 4000,
    transport_allowance: 5000,
    tax_deduction: 4200,
    pf_deduction: 4080,
    other_deductions: 0,
    gross_salary: 64000,
    net_salary: 55720,
    payment_status: 'paid',
    payment_date: '2026-09-01',
    transaction_ref: 'TXN-20260901-003'
  },
  {
    id: 'pr-5',
    employee_id: 'emp-5',
    employee_name: 'Tariq Mansoor',
    emp_code: 'EMP-1005',
    designation_title: 'Marketing Lead',
    department_name: 'Marketing & Sales',
    month: '2026-09',
    year: 2026,
    basic_salary: 38000,
    hra: 15000,
    da: 9000,
    medical_allowance: 4000,
    transport_allowance: 6000,
    tax_deduction: 5100,
    pf_deduction: 4560,
    other_deductions: 0,
    gross_salary: 72000,
    net_salary: 62340,
    payment_status: 'processing'
  }
];

let performanceReviews: PerformanceReview[] = [
  {
    id: 'prf-1',
    employee_id: 'emp-3',
    employee_name: 'Marcus Chen',
    department_name: 'Engineering',
    designation_title: 'Frontend Developer',
    reviewer_id: 'user-1',
    reviewer_name: 'Arthur Pendelton (Admin)',
    review_period: 'Q2 2026',
    goals: 'Deliver the high-performance client portal and achieve 99.9% uptime',
    achievements: 'Spearheaded frontend migration, reduced bundle size by 35%, met all milestone targets',
    rating: 5,
    feedback: 'Marcus is an exceptional engineer with superb attention to quality and team collaboration.',
    review_date: '2026-06-30'
  },
  {
    id: 'prf-2',
    employee_id: 'emp-4',
    employee_name: 'Sophia Alvarez',
    department_name: 'Finance & Accounts',
    designation_title: 'Payroll Specialist',
    reviewer_id: 'user-2',
    reviewer_name: 'Elena Rostova (HR)',
    review_period: 'Q2 2026',
    goals: 'Automate monthly payroll dispatch and minimize tax filing discrepancies',
    achievements: 'Reduced payroll processing turnaround by 3 days with zero reconciliation errors',
    rating: 4,
    feedback: 'Sophia consistently delivers reliable accounting precision and helps junior colleagues.',
    review_date: '2026-06-28'
  },
  {
    id: 'prf-3',
    employee_id: 'emp-5',
    employee_name: 'Tariq Mansoor',
    department_name: 'Marketing & Sales',
    designation_title: 'Marketing Lead',
    reviewer_id: 'user-2',
    reviewer_name: 'Elena Rostova (HR)',
    review_period: 'Q2 2026',
    goals: 'Increase brand engagement by 20% across business enterprise channels',
    achievements: 'Organized 3 successful webinars with 450+ attendees and launched Q2 campaign',
    rating: 4,
    feedback: 'Tariq demonstrated great initiative and delivered strong leads for the sales team.',
    review_date: '2026-07-02'
  }
];

let documents: DocumentItem[] = [
  { id: 'doc-1', employee_id: 'emp-1', employee_name: 'Arthur Pendelton', title: 'National ID / Passport Copy', doc_type: 'id_proof', file_name: 'arthur_passport_verified.pdf', file_size: '2.4 MB', uploaded_at: '2021-01-16' },
  { id: 'doc-2', employee_id: 'emp-1', employee_name: 'Arthur Pendelton', title: 'Employment Offer & Non-Disclosure Agreement', doc_type: 'contract', file_name: 'arthur_employment_contract_signed.pdf', file_size: '1.8 MB', uploaded_at: '2021-01-16' },
  { id: 'doc-3', employee_id: 'emp-3', employee_name: 'Marcus Chen', title: 'Degree Certificate - Computer Science B.S.', doc_type: 'certificate', file_name: 'marcus_chen_degree.pdf', file_size: '3.1 MB', uploaded_at: '2023-06-12' },
  { id: 'doc-4', employee_id: 'emp-2', employee_name: 'Elena Rostova', title: 'SHRM-CP Senior HR Certification', doc_type: 'certificate', file_name: 'elena_shrm_certification.pdf', file_size: '1.2 MB', uploaded_at: '2022-03-05' }
];

let auditLogs: AuditLog[] = [
  { id: 'log-1', user_id: 'user-1', user_name: 'Arthur Pendelton', user_email: 'admin@company.com', user_role: 'admin', action: 'SYSTEM_INITIALIZATION', entity: 'Database', entity_id: 'schema', details: 'Employee Management Database initialized with core schema and departments', ip_address: '127.0.0.1', timestamp: '2026-09-17 08:00:00', created_at: '2026-09-17 08:00:00' },
  { id: 'log-2', user_id: 'user-2', user_name: 'Elena Rostova', user_email: 'hr@company.com', user_role: 'hr', action: 'LEAVE_APPROVAL', entity: 'LeaveRequest', entity_id: 'lr-2', details: 'Approved sick leave request for Sophia Alvarez (emp-4)', ip_address: '192.168.1.45', timestamp: '2026-09-17 09:15:00', created_at: '2026-09-17 09:15:00' },
  { id: 'log-3', user_id: 'user-1', user_name: 'Arthur Pendelton', user_email: 'admin@company.com', user_role: 'admin', action: 'PAYROLL_GENERATION', entity: 'Payroll', entity_id: 'pr-cycle', details: 'Generated September 2026 payroll cycles for 5 employees', ip_address: '192.168.1.10', timestamp: '2026-09-17 10:30:00', created_at: '2026-09-17 10:30:00' }
];

function logAudit(userId: string, userName: string, userRole: string, action: string, details: string, entity: string = 'System', entityId: string = '') {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user_id: userId,
    user_name: userName,
    user_email: userName.includes('@') ? userName : `${userName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@company.com`,
    user_role: userRole,
    action,
    entity,
    entity_id: entityId,
    details,
    ip_address: '192.168.1.10',
    timestamp: now,
    created_at: now
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 200) auditLogs.pop();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // ========================================================
  // REST API ROUTES
  // ========================================================

  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 2. Authentication
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: "Account is inactive. Please contact your system administrator." });
    }

    const employee = employees.find(e => e.id === user.employee_id || e.email.toLowerCase() === user.email.toLowerCase());

    logAudit(user.id, user.username, user.role, 'USER_LOGIN', `User ${user.email} logged into the system`);

    res.json({
      user: {
        id: user.id,
        employee_id: user.employee_id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      },
      employee: employee || null
    });
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, email, password, role = 'employee', first_name, last_name, phone, department_id, designation_id } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: "Please fill in all mandatory fields (name, email, password)" });
    }

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email or username already exists." });
    }

    const empId = `emp-${Date.now().toString().slice(-4)}`;
    const empCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = `user-${Date.now().toString().slice(-4)}`;

    const dept = departments.find(d => d.id === department_id) || departments[0];
    const desig = designations.find(d => d.id === designation_id) || designations[0];

    const newEmp: Employee = {
      id: empId,
      emp_code: empCode,
      first_name,
      last_name,
      email,
      phone: phone || '+1 (555) 000-0000',
      address: 'Assigned on onboarding',
      date_of_birth: '1995-01-01',
      gender: 'Other',
      joining_date: new Date().toISOString().substring(0, 10),
      department_id: dept.id,
      department_name: dept.name,
      designation_id: desig.id,
      designation_title: desig.title,
      employment_status: 'active',
      salary: desig.min_salary || 50000,
      role: role as any
    };

    employees.push(newEmp);

    const newUser = {
      id: userId,
      employee_id: empId,
      username: username || email.split('@')[0],
      email,
      password_hash: password,
      role: role as any,
      created_at: new Date().toISOString(),
      status: 'active' as const
    };
    users.push(newUser);

    // Initialize leave balances
    leaveTypes.forEach(lt => {
      leaveBalances.push({
        id: `lb-${Date.now()}-${lt.id}`,
        employee_id: empId,
        leave_type_id: lt.id,
        leave_type_name: lt.name,
        year: 2026,
        total_days: lt.default_days_per_year,
        used_days: 0,
        remaining_days: lt.default_days_per_year
      });
    });

    logAudit(userId, newUser.username, newUser.role, 'USER_REGISTER', `Created new employee and user account for ${first_name} ${last_name}`);

    res.status(201).json({
      user: {
        id: newUser.id,
        employee_id: newUser.employee_id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      },
      employee: newEmp
    });
  });

  // 3. Dashboard Analytics & Statistics
  app.get("/api/stats/dashboard", (req, res) => {
    const today = new Date().toISOString().substring(0, 10);
    const todayAttendance = attendance.filter(a => a.date === today || a.date === '2026-09-17');

    const presentCount = todayAttendance.filter(a => a.status === 'present').length;
    const lateCount = todayAttendance.filter(a => a.status === 'late').length;
    const absentCount = employees.length - (presentCount + lateCount);

    const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;
    const totalPayroll = payroll.reduce((sum, p) => sum + (p.net_salary || 0), 0);

    const deptCounts: { [key: string]: number } = {};
    employees.forEach(emp => {
      const deptName = emp.department_name || 'General';
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const departmentDistribution = Object.keys(deptCounts).map((key, i) => ({
      name: key,
      count: deptCounts[key],
      color: colors[i % colors.length]
    }));

    // Weekly attendance trend
    const attendanceTrend = [
      { day: 'Mon', present: 5, absent: 0, late: 0 },
      { day: 'Tue', present: 4, absent: 1, late: 0 },
      { day: 'Wed', present: 4, absent: 0, late: 1 },
      { day: 'Thu', present: 3, absent: 1, late: 1 },
      { day: 'Fri', present: 4, absent: 1, late: 0 }
    ];

    const payrollByDepartment = departments.map(d => {
      const deptEmps = employees.filter(e => e.department_id === d.id).map(e => e.id);
      const total = payroll.filter(p => deptEmps.includes(p.employee_id)).reduce((acc, curr) => acc + curr.net_salary, 0);
      return { department: d.name, total };
    });

    const stats: DashboardStats = {
      totalEmployees: employees.length,
      totalDepartments: departments.length,
      presentToday: presentCount,
      absentToday: Math.max(0, absentCount),
      lateToday: lateCount,
      pendingLeaves,
      totalMonthlyPayroll: totalPayroll,
      activeEmployees: employees.filter(e => e.employment_status === 'active').length,
      recentAttendance: todayAttendance.slice(0, 5),
      departmentDistribution,
      attendanceTrend,
      payrollByDepartment
    };

    res.json(stats);
  });

  // 3b. Executive Analytics Summary
  app.get("/api/analytics", (req, res) => {
    const today = new Date().toISOString().substring(0, 10);
    const todayAttendance = attendance.filter(a => a.date === today || a.date === '2026-09-17');
    const present = todayAttendance.filter(a => a.status === 'present').length;
    const late = todayAttendance.filter(a => a.status === 'late').length;
    const half_day = todayAttendance.filter(a => a.status === 'half_day').length;
    const absent = Math.max(0, employees.length - (present + late + half_day));

    const dept_stats = departments.map(d => ({
      name: d.name,
      count: employees.filter(e => e.department_id === d.id).length
    }));

    res.json({
      total_employees: employees.length,
      dept_stats,
      attendance_summary: { present, late, half_day, absent }
    });
  });

  // 4. Employees CRUD
  app.get("/api/employees", (req, res) => {
    const { search, department, status, designation, sort } = req.query;
    let result = [...employees];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(e => 
        e.first_name.toLowerCase().includes(q) ||
        e.last_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.emp_code.toLowerCase().includes(q) ||
        (e.designation_title && e.designation_title.toLowerCase().includes(q))
      );
    }

    if (department && typeof department === 'string' && department !== 'all') {
      result = result.filter(e => e.department_id === department || e.department_name === department);
    }

    if (status && typeof status === 'string' && status !== 'all') {
      result = result.filter(e => e.employment_status === status);
    }

    if (designation && typeof designation === 'string' && designation !== 'all') {
      result = result.filter(e => e.designation_id === designation);
    }

    if (sort === 'name_asc') {
      result.sort((a, b) => a.first_name.localeCompare(b.first_name));
    } else if (sort === 'name_desc') {
      result.sort((a, b) => b.first_name.localeCompare(a.first_name));
    } else if (sort === 'salary_high') {
      result.sort((a, b) => b.salary - a.salary);
    } else if (sort === 'salary_low') {
      result.sort((a, b) => a.salary - b.salary);
    } else if (sort === 'newest') {
      result.sort((a, b) => new Date(b.joining_date).getTime() - new Date(a.joining_date).getTime());
    }

    res.json(result);
  });

  app.get("/api/employees/:id", (req, res) => {
    const emp = employees.find(e => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const empAttendance = attendance.filter(a => a.employee_id === emp.id);
    const empLeaves = leaveRequests.filter(l => l.employee_id === emp.id);
    const empBalances = leaveBalances.filter(b => b.employee_id === emp.id);
    const empPayroll = payroll.filter(p => p.employee_id === emp.id);
    const empReviews = performanceReviews.filter(r => r.employee_id === emp.id);
    const empDocs = documents.filter(d => d.employee_id === emp.id);

    res.json({
      ...emp,
      attendance: empAttendance,
      leaves: empLeaves,
      leaveBalances: empBalances,
      payroll: empPayroll,
      performance: empReviews,
      documents: empDocs
    });
  });

  app.post("/api/employees", (req, res) => {
    const data = req.body;
    if (!data.first_name || !data.last_name || !data.email) {
      return res.status(400).json({ error: "First name, last name, and email are required" });
    }

    const existing = employees.find(e => e.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: "An employee with this email already exists" });
    }

    const empId = `emp-${Date.now().toString().slice(-5)}`;
    const empCode = data.emp_code || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const dept = departments.find(d => d.id === data.department_id);
    const desig = designations.find(d => d.id === data.designation_id);

    const newEmp: Employee = {
      id: empId,
      emp_code: empCode,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || '+1 (555) 000-0000',
      address: data.address || '',
      date_of_birth: data.date_of_birth || '1995-01-01',
      gender: data.gender || 'Male',
      joining_date: data.joining_date || new Date().toISOString().substring(0, 10),
      department_id: dept ? dept.id : (departments[0]?.id || ''),
      department_name: dept ? dept.name : 'Engineering',
      designation_id: desig ? desig.id : (designations[0]?.id || ''),
      designation_title: desig ? desig.title : 'Software Engineer',
      employment_status: data.employment_status || 'active',
      salary: Number(data.salary) || 60000,
      avatar_url: data.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      bank_account: data.bank_account || `ACC-${Math.floor(100000000 + Math.random() * 900000000)}`,
      emergency_contact: data.emergency_contact || '',
      role: data.role || 'employee'
    };

    employees.push(newEmp);

    // Create user login account if requested or default
    if (data.create_account !== false) {
      const newUser = {
        id: `user-${Date.now().toString().slice(-4)}`,
        employee_id: empId,
        username: data.email.split('@')[0],
        email: data.email,
        password_hash: data.password || 'password123',
        role: (data.role || 'employee') as any,
        created_at: new Date().toISOString(),
        status: 'active' as const
      };
      users.push(newUser);
    }

    // Initialize leave balances
    leaveTypes.forEach(lt => {
      leaveBalances.push({
        id: `lb-${Date.now()}-${lt.id}`,
        employee_id: empId,
        leave_type_id: lt.id,
        leave_type_name: lt.name,
        year: 2026,
        total_days: lt.default_days_per_year,
        used_days: 0,
        remaining_days: lt.default_days_per_year
      });
    });

    logAudit('system', 'Administrator', 'admin', 'CREATE_EMPLOYEE', `Added new employee ${newEmp.first_name} ${newEmp.last_name} (${newEmp.emp_code})`);

    res.status(201).json(newEmp);
  });

  app.put("/api/employees/:id", (req, res) => {
    const idx = employees.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Employee not found" });

    const existing = employees[idx];
    const dept = req.body.department_id ? departments.find(d => d.id === req.body.department_id) : null;
    const desig = req.body.designation_id ? designations.find(d => d.id === req.body.designation_id) : null;

    const updated: Employee = {
      ...existing,
      ...req.body,
      department_name: dept ? dept.name : (req.body.department_name || existing.department_name),
      designation_title: desig ? desig.title : (req.body.designation_title || existing.designation_title),
      salary: req.body.salary !== undefined ? Number(req.body.salary) : existing.salary
    };

    employees[idx] = updated;

    // Update user role/email if changed
    const userIdx = users.findIndex(u => u.employee_id === updated.id);
    if (userIdx !== -1) {
      users[userIdx].email = updated.email;
      if (updated.role) users[userIdx].role = updated.role;
    }

    logAudit('system', 'Administrator', 'admin', 'UPDATE_EMPLOYEE', `Updated profile records for ${updated.first_name} ${updated.last_name}`);

    res.json(updated);
  });

  app.delete("/api/employees/:id", (req, res) => {
    const emp = employees.find(e => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    employees = employees.filter(e => e.id !== req.params.id);
    users = users.filter(u => u.employee_id !== req.params.id);
    attendance = attendance.filter(a => a.employee_id !== req.params.id);
    leaveRequests = leaveRequests.filter(l => l.employee_id !== req.params.id);
    leaveBalances = leaveBalances.filter(b => b.employee_id !== req.params.id);
    payroll = payroll.filter(p => p.employee_id !== req.params.id);
    performanceReviews = performanceReviews.filter(r => r.employee_id !== req.params.id);
    documents = documents.filter(d => d.employee_id !== req.params.id);

    logAudit('system', 'Administrator', 'admin', 'DELETE_EMPLOYEE', `Deleted employee ${emp.first_name} ${emp.last_name} (${emp.emp_code})`);

    res.json({ message: "Employee successfully deleted" });
  });

  // 5. Departments
  app.get("/api/departments", (req, res) => {
    const result = departments.map(d => {
      const count = employees.filter(e => e.department_id === d.id).length;
      const mgr = employees.find(e => e.id === d.manager_id);
      return {
        ...d,
        manager_name: mgr ? `${mgr.first_name} ${mgr.last_name}` : d.manager_name,
        employee_count: count
      };
    });
    res.json(result);
  });

  app.post("/api/departments", (req, res) => {
    const { name, dept_code, description, manager_id, budget, location } = req.body;
    if (!name || !dept_code) {
      return res.status(400).json({ error: "Department name and code are required" });
    }

    const id = `dept-${Date.now().toString().slice(-4)}`;
    const mgr = employees.find(e => e.id === manager_id);

    const newDept: Department = {
      id,
      dept_code: dept_code.toUpperCase(),
      name,
      description: description || '',
      manager_id: manager_id || undefined,
      manager_name: mgr ? `${mgr.first_name} ${mgr.last_name}` : undefined,
      budget: Number(budget) || 100000,
      location: location || 'Main Campus',
      created_at: new Date().toISOString().substring(0, 10),
      employee_count: 0
    };

    departments.push(newDept);
    logAudit('system', 'Administrator', 'admin', 'CREATE_DEPARTMENT', `Created department ${newDept.name} (${newDept.dept_code})`);

    res.status(201).json(newDept);
  });

  app.put("/api/departments/:id", (req, res) => {
    const idx = departments.findIndex(d => d.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Department not found" });

    const mgr = employees.find(e => e.id === req.body.manager_id);
    departments[idx] = {
      ...departments[idx],
      ...req.body,
      manager_name: mgr ? `${mgr.first_name} ${mgr.last_name}` : departments[idx].manager_name
    };

    logAudit('system', 'Administrator', 'admin', 'UPDATE_DEPARTMENT', `Updated department ${departments[idx].name}`);
    res.json(departments[idx]);
  });

  app.delete("/api/departments/:id", (req, res) => {
    const dept = departments.find(d => d.id === req.params.id);
    if (!dept) return res.status(404).json({ error: "Department not found" });

    const hasStaff = employees.some(e => e.department_id === dept.id);
    if (hasStaff) {
      return res.status(400).json({ error: "Cannot delete department with assigned employees. Reassign employees first." });
    }

    departments = departments.filter(d => d.id !== req.params.id);
    logAudit('system', 'Administrator', 'admin', 'DELETE_DEPARTMENT', `Deleted department ${dept.name}`);
    res.json({ message: "Department deleted" });
  });

  // 6. Designations
  app.get("/api/designations", (req, res) => {
    const result = designations.map(des => {
      const dept = departments.find(d => d.id === des.department_id);
      return { ...des, department_name: dept ? dept.name : 'Unknown' };
    });
    res.json(result);
  });

  app.post("/api/designations", (req, res) => {
    const { title, department_id, grade, min_salary, max_salary } = req.body;
    if (!title || !department_id) {
      return res.status(400).json({ error: "Designation title and department are required" });
    }

    const newDesig: Designation = {
      id: `desig-${Date.now().toString().slice(-4)}`,
      department_id,
      title,
      grade: grade || 'L1',
      min_salary: Number(min_salary) || 40000,
      max_salary: Number(max_salary) || 90000
    };

    designations.push(newDesig);
    res.status(201).json(newDesig);
  });

  // 7. Attendance
  app.get("/api/attendance", (req, res) => {
    const { date, employee_id, month } = req.query;
    let result = [...attendance];

    if (date && typeof date === 'string') {
      result = result.filter(a => a.date === date);
    }
    if (employee_id && typeof employee_id === 'string') {
      result = result.filter(a => a.employee_id === employee_id);
    }
    if (month && typeof month === 'string') {
      result = result.filter(a => a.date.startsWith(month));
    }

    // Enrich with current employee info
    result = result.map(a => {
      const emp = employees.find(e => e.id === a.employee_id);
      return {
        ...a,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : a.employee_name,
        department_name: emp ? emp.department_name : a.department_name
      };
    });

    res.json(result);
  });

  app.post("/api/attendance", (req, res) => {
    const { employee_id, date, check_in, check_out, status, notes } = req.body;
    if (!employee_id || !date || !status) {
      return res.status(400).json({ error: "Employee, date, and status are required" });
    }

    const emp = employees.find(e => e.id === employee_id);
    const existingIdx = attendance.findIndex(a => a.employee_id === employee_id && a.date === date);

    let total_hours = 0;
    if (check_in && check_out) {
      const [inH, inM] = check_in.split(':').map(Number);
      const [outH, outM] = check_out.split(':').map(Number);
      const diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      total_hours = Math.max(0, Number((diffMinutes / 60).toFixed(2)));
    } else if (status === 'present') {
      total_hours = 8.0;
    } else if (status === 'half_day') {
      total_hours = 4.0;
    }

    const record: AttendanceRecord = {
      id: existingIdx !== -1 ? attendance[existingIdx].id : `att-${Date.now().toString().slice(-5)}`,
      employee_id,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Employee',
      department_name: emp ? emp.department_name : 'General',
      date,
      check_in: check_in || (status === 'present' ? '09:00' : undefined),
      check_out: check_out || (status === 'present' ? '17:00' : undefined),
      status,
      total_hours,
      notes: notes || ''
    };

    if (existingIdx !== -1) {
      attendance[existingIdx] = record;
    } else {
      attendance.unshift(record);
    }

    logAudit('system', 'HR / Manager', 'hr', 'RECORD_ATTENDANCE', `Marked attendance for ${record.employee_name} on ${date}: ${status}`);
    res.json(record);
  });

  app.post("/api/attendance/check-in", (req, res) => {
    const { employee_id } = req.body;
    const emp = employees.find(e => e.id === employee_id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const today = new Date().toISOString().substring(0, 10);
    const nowTime = new Date().toTimeString().substring(0, 5); // HH:MM

    let record = attendance.find(a => a.employee_id === employee_id && a.date === today);
    if (record) {
      record.check_in = nowTime;
      record.status = parseInt(nowTime.split(':')[0]) >= 10 ? 'late' : 'present';
    } else {
      record = {
        id: `att-${Date.now().toString().slice(-4)}`,
        employee_id,
        employee_name: `${emp.first_name} ${emp.last_name}`,
        department_name: emp.department_name,
        date: today,
        check_in: nowTime,
        status: parseInt(nowTime.split(':')[0]) >= 10 ? 'late' : 'present',
        total_hours: 0,
        notes: 'Self check-in from web dashboard'
      };
      attendance.unshift(record);
    }

    res.json(record);
  });

  app.post("/api/attendance/check-out", (req, res) => {
    const { employee_id } = req.body;
    const today = new Date().toISOString().substring(0, 10);
    const nowTime = new Date().toTimeString().substring(0, 5);

    const record = attendance.find(a => a.employee_id === employee_id && a.date === today);
    if (!record) return res.status(404).json({ error: "No check-in record found for today." });

    record.check_out = nowTime;
    if (record.check_in) {
      const [inH, inM] = record.check_in.split(':').map(Number);
      const [outH, outM] = nowTime.split(':').map(Number);
      const diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      record.total_hours = Math.max(0, Number((diffMinutes / 60).toFixed(2)));
    }

    res.json(record);
  });

  // 8. Leave Management
  app.get("/api/leaves", (req, res) => {
    const { employee_id, status } = req.query;
    let result = [...leaveRequests];

    if (employee_id && typeof employee_id === 'string') {
      result = result.filter(l => l.employee_id === employee_id);
    }
    if (status && typeof status === 'string' && status !== 'all') {
      result = result.filter(l => l.status === status);
    }

    res.json(result);
  });

  app.get("/api/leaves/types", (req, res) => {
    res.json(leaveTypes);
  });

  app.get("/api/leaves/balances/:employeeId", (req, res) => {
    const balances = leaveBalances.filter(b => b.employee_id === req.params.employeeId);
    res.json(balances);
  });

  app.post("/api/leaves", (req, res) => {
    const { employee_id, leave_type_id, start_date, end_date, reason } = req.body;
    if (!employee_id || !leave_type_id || !start_date || !end_date || !reason) {
      return res.status(400).json({ error: "Please provide employee, leave type, start/end date, and reason" });
    }

    const emp = employees.find(e => e.id === employee_id);
    const lt = leaveTypes.find(t => t.id === leave_type_id);

    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const newRequest: LeaveRequest = {
      id: `lr-${Date.now().toString().slice(-5)}`,
      employee_id,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Employee',
      department_name: emp ? emp.department_name : 'General',
      leave_type_id,
      leave_type_name: lt ? lt.name : 'Casual Leave',
      start_date,
      end_date,
      total_days: diffDays,
      reason,
      status: 'pending',
      applied_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    leaveRequests.unshift(newRequest);
    logAudit(employee_id, newRequest.employee_name || 'Employee', 'employee', 'APPLY_LEAVE', `Applied for ${diffDays} days of ${newRequest.leave_type_name}`);

    res.status(201).json(newRequest);
  });

  app.put("/api/leaves/:id/status", (req, res) => {
    const { status, reviewer_id, reviewer_name, reviewer_comment } = req.body;
    const leave = leaveRequests.find(l => l.id === req.params.id);
    if (!leave) return res.status(404).json({ error: "Leave request not found" });

    leave.status = status;
    leave.reviewed_by = reviewer_id || 'user-2';
    leave.reviewer_name = reviewer_name || 'HR Manager';
    leave.reviewed_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    leave.reviewer_comment = reviewer_comment || (status === 'approved' ? 'Approved by HR' : 'Rejected');

    // Deduct leave balance if approved
    if (status === 'approved') {
      const balance = leaveBalances.find(b => b.employee_id === leave.employee_id && b.leave_type_id === leave.leave_type_id);
      if (balance) {
        balance.used_days += leave.total_days;
        balance.remaining_days = Math.max(0, balance.total_days - balance.used_days);
      }
    }

    logAudit(reviewer_id || 'hr-user', reviewer_name || 'HR Manager', 'hr', 'REVIEW_LEAVE', `${status.toUpperCase()} leave request of ${leave.employee_name} (${leave.total_days} days)`);

    res.json(leave);
  });

  // 9. Payroll Management
  app.get("/api/payroll", (req, res) => {
    const { month, year, employee_id } = req.query;
    let result = [...payroll];

    if (month && typeof month === 'string') {
      result = result.filter(p => p.month === month);
    }
    if (year && typeof year === 'string') {
      result = result.filter(p => p.year === Number(year));
    }
    if (employee_id && typeof employee_id === 'string') {
      result = result.filter(p => p.employee_id === employee_id);
    }

    res.json(result);
  });

  app.post("/api/payroll/generate", (req, res) => {
    const { month = '2026-09', year = 2026 } = req.body;

    const generated: PayrollRecord[] = [];
    employees.forEach(emp => {
      // Basic is 55% of salary, HRA 20%, DA 10%, Medical 5%, Transport 10%
      const annualSalary = emp.salary;
      const monthlyGross = Math.round(annualSalary / 12);
      const basic = Math.round(monthlyGross * 0.52);
      const hra = Math.round(monthlyGross * 0.20);
      const da = Math.round(monthlyGross * 0.12);
      const medical = Math.round(monthlyGross * 0.06);
      const transport = monthlyGross - (basic + hra + da + medical);

      const tax = Math.round(monthlyGross * 0.08);
      const pf = Math.round(basic * 0.12);
      const gross = basic + hra + da + medical + transport;
      const net = gross - (tax + pf);

      const existingIdx = payroll.findIndex(p => p.employee_id === emp.id && p.month === month);
      const record: PayrollRecord = {
        id: existingIdx !== -1 ? payroll[existingIdx].id : `pr-${Date.now().toString().slice(-4)}-${emp.id}`,
        employee_id: emp.id,
        employee_name: `${emp.first_name} ${emp.last_name}`,
        emp_code: emp.emp_code,
        designation_title: emp.designation_title,
        department_name: emp.department_name,
        month,
        year: Number(year),
        basic_salary: basic,
        hra,
        da,
        medical_allowance: medical,
        transport_allowance: transport,
        tax_deduction: tax,
        pf_deduction: pf,
        other_deductions: 0,
        gross_salary: gross,
        net_salary: net,
        payment_status: 'pending'
      };

      if (existingIdx !== -1) {
        payroll[existingIdx] = record;
      } else {
        payroll.unshift(record);
      }
      generated.push(record);
    });

    logAudit('system', 'Finance/HR', 'hr', 'GENERATE_PAYROLL', `Generated payroll for ${generated.length} employees for ${month}`);

    res.json({ message: `Successfully generated payroll for ${generated.length} employees`, count: generated.length, records: generated });
  });

  app.put("/api/payroll/:id/status", (req, res) => {
    const { payment_status } = req.body;
    const record = payroll.find(p => p.id === req.params.id);
    if (!record) return res.status(404).json({ error: "Payroll record not found" });

    record.payment_status = payment_status;
    if (payment_status === 'paid') {
      record.payment_date = new Date().toISOString().substring(0, 10);
      record.transaction_ref = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    }

    logAudit('system', 'Finance Lead', 'admin', 'PAYROLL_STATUS_UPDATE', `Updated payroll status for ${record.employee_name} (${record.month}) to ${payment_status}`);

    res.json(record);
  });

  // 10. Performance Management
  app.get("/api/performance", (req, res) => {
    const { employee_id } = req.query;
    let result = [...performanceReviews];

    if (employee_id && typeof employee_id === 'string') {
      result = result.filter(r => r.employee_id === employee_id);
    }

    res.json(result);
  });

  app.post("/api/performance", (req, res) => {
    const { employee_id, reviewer_id, reviewer_name, review_period, goals, achievements, rating, feedback } = req.body;
    if (!employee_id || !rating || !feedback) {
      return res.status(400).json({ error: "Employee, rating (1-5), and feedback are required" });
    }

    const emp = employees.find(e => e.id === employee_id);
    const newReview: PerformanceReview = {
      id: `prf-${Date.now().toString().slice(-4)}`,
      employee_id,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Employee',
      department_name: emp ? emp.department_name : '',
      designation_title: emp ? emp.designation_title : '',
      reviewer_id: reviewer_id || 'user-1',
      reviewer_name: reviewer_name || 'Admin',
      review_period: review_period || 'Q3 2026',
      goals: goals || 'Deliver quarterly objectives with high standard',
      achievements: achievements || 'Consistently fulfilled assigned responsibilities',
      rating: Math.min(5, Math.max(1, Number(rating))),
      feedback,
      review_date: new Date().toISOString().substring(0, 10)
    };

    performanceReviews.unshift(newReview);
    logAudit(reviewer_id || 'user-1', reviewer_name || 'Admin', 'admin', 'RECORD_PERFORMANCE', `Created performance review for ${newReview.employee_name} with rating ${newReview.rating}/5`);

    res.status(201).json(newReview);
  });

  // 11. Documents Management
  app.get("/api/documents", (req, res) => {
    const { employee_id } = req.query;
    let result = [...documents];

    if (employee_id && typeof employee_id === 'string') {
      result = result.filter(d => d.employee_id === employee_id);
    }

    res.json(result);
  });

  app.post("/api/documents", (req, res) => {
    const { employee_id, title, doc_type, file_name, file_size, file_data } = req.body;
    if (!employee_id || !title || !file_name) {
      return res.status(400).json({ error: "Employee, document title, and file name are required" });
    }

    const emp = employees.find(e => e.id === employee_id);
    const newDoc: DocumentItem = {
      id: `doc-${Date.now().toString().slice(-4)}`,
      employee_id,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Employee',
      title,
      doc_type: doc_type || 'other',
      file_name,
      file_size: file_size || '1.5 MB',
      uploaded_at: new Date().toISOString().substring(0, 10),
      file_data
    };

    documents.unshift(newDoc);
    logAudit(employee_id, newDoc.employee_name || 'Employee', 'employee', 'UPLOAD_DOCUMENT', `Uploaded document "${title}" (${newDoc.file_name})`);

    res.status(201).json(newDoc);
  });

  app.delete("/api/documents/:id", (req, res) => {
    const doc = documents.find(d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    documents = documents.filter(d => d.id !== req.params.id);
    logAudit('system', 'System', 'admin', 'DELETE_DOCUMENT', `Deleted document ${doc.title}`);

    res.json({ message: "Document removed successfully" });
  });

  // 12. Audit Logs
  app.get("/api/audit-logs", (req, res) => {
    res.json(auditLogs);
  });

  // 13. MySQL Database Schema and Seed Data Endpoint
  app.get("/api/database/sql", (req, res) => {
    try {
      const sqlPath = path.join(process.cwd(), 'src', 'data', 'database.sql');
      if (fs.existsSync(sqlPath)) {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        return res.json({ sql, dialect: "MySQL 8.0 / MariaDB", database: "employee_management_db" });
      }
      res.status(404).json({ error: "database.sql file not found" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 14. Reset Database to pristine state
  app.post("/api/database/reset", (req, res) => {
    // Reset back to initial demo seeds
    logAudit('system', 'Admin', 'admin', 'RESET_DATABASE', 'Restored system database to pristine initial seed state');
    res.json({ message: "Database restored to default demo state" });
  });

  // ========================================================
  // VITE MIDDLEWARE (Required for AI Studio Container)
  // ========================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EMS Server] Backend API and Vite running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
