-- ==========================================================
-- Employee Management System (EMS) - Normalized MySQL Schema
-- Compatible with MySQL 5.7+ / 8.0+ / MariaDB
-- ==========================================================

DROP DATABASE IF EXISTS employee_management_db;
CREATE DATABASE employee_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE employee_management_db;

-- 1. DEPARTMENTS TABLE
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY,
    dept_code VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id VARCHAR(36) NULL,
    budget DECIMAL(12, 2) DEFAULT 0.00,
    location VARCHAR(100) DEFAULT 'Main Campus',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dept_code (dept_code)
) ENGINE=InnoDB;

-- 2. DESIGNATIONS TABLE
CREATE TABLE designations (
    id VARCHAR(36) PRIMARY KEY,
    department_id VARCHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    grade VARCHAR(20) DEFAULT 'L1',
    min_salary DECIMAL(10, 2) NOT NULL DEFAULT 30000.00,
    max_salary DECIMAL(10, 2) NOT NULL DEFAULT 150000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_designation_dept (department_id)
) ENGINE=InnoDB;

-- 3. EMPLOYEES TABLE
CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    emp_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    address TEXT,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') NOT NULL,
    joining_date DATE NOT NULL,
    department_id VARCHAR(36) NOT NULL,
    designation_id VARCHAR(36) NOT NULL,
    employment_status ENUM('active', 'probation', 'terminated', 'on_leave') DEFAULT 'active',
    salary DECIMAL(10, 2) NOT NULL DEFAULT 50000.00,
    avatar_url VARCHAR(500) NULL,
    bank_account VARCHAR(50) NULL,
    emergency_contact VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE RESTRICT,
    INDEX idx_emp_email (email),
    INDEX idx_emp_code (emp_code),
    INDEX idx_emp_dept (department_id),
    INDEX idx_emp_status (employment_status)
) ENGINE=InnoDB;

-- Add foreign key constraint for departments manager
ALTER TABLE departments
ADD CONSTRAINT fk_dept_manager
FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- 4. USERS TABLE (Authentication & Role-Based Access Control)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NULL UNIQUE,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hr', 'employee') NOT NULL DEFAULT 'employee',
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 5. ATTENDANCE TABLE
CREATE TABLE attendance (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    check_in TIME NULL,
    check_out TIME NULL,
    status ENUM('present', 'absent', 'late', 'half_day') NOT NULL DEFAULT 'present',
    total_hours DECIMAL(4, 2) DEFAULT 0.00,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_emp_date (employee_id, date),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_attendance_date (date),
    INDEX idx_attendance_status (status)
) ENGINE=InnoDB;

-- 6. LEAVE TYPES TABLE
CREATE TABLE leave_types (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    default_days_per_year INT NOT NULL DEFAULT 12,
    is_paid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. LEAVE BALANCES TABLE
CREATE TABLE leave_balances (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    leave_type_id VARCHAR(36) NOT NULL,
    year INT NOT NULL,
    total_days INT NOT NULL DEFAULT 12,
    used_days INT NOT NULL DEFAULT 0,
    remaining_days INT GENERATED ALWAYS AS (total_days - used_days) STORED,
    UNIQUE KEY unique_emp_leavetype_year (employee_id, leave_type_id, year),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. LEAVE REQUESTS TABLE
CREATE TABLE leave_requests (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    leave_type_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(36) NULL,
    reviewed_at TIMESTAMP NULL,
    reviewer_comment VARCHAR(255) NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_leave_status (status)
) ENGINE=InnoDB;

-- 9. PAYROLL TABLE
CREATE TABLE payroll (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    year INT NOT NULL,
    basic_salary DECIMAL(10, 2) NOT NULL,
    hra DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    da DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    medical_allowance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    transport_allowance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax_deduction DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    pf_deduction DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    other_deductions DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    gross_salary DECIMAL(10, 2) GENERATED ALWAYS AS (basic_salary + hra + da + medical_allowance + transport_allowance) STORED,
    net_salary DECIMAL(10, 2) GENERATED ALWAYS AS (basic_salary + hra + da + medical_allowance + transport_allowance - tax_deduction - pf_deduction - other_deductions) STORED,
    payment_status ENUM('paid', 'pending', 'processing') DEFAULT 'pending',
    payment_date DATE NULL,
    transaction_ref VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_emp_month (employee_id, month),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_payroll_month (month)
) ENGINE=InnoDB;

-- 10. PERFORMANCE REVIEWS TABLE
CREATE TABLE performance_reviews (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    reviewer_id VARCHAR(36) NOT NULL,
    review_period VARCHAR(50) NOT NULL, -- e.g. "Q3 2026" or "Annual 2026"
    goals TEXT NOT NULL,
    achievements TEXT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT NOT NULL,
    review_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_perf_rating (rating)
) ENGINE=InnoDB;

-- 11. DOCUMENTS TABLE
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    doc_type ENUM('id_proof', 'contract', 'certificate', 'tax', 'other') NOT NULL DEFAULT 'other',
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(30) NOT NULL,
    file_data LONGTEXT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_doc_emp (employee_id)
) ENGINE=InnoDB;

-- 12. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB;

-- ==========================================================
-- SAMPLE SEED DATA
-- ==========================================================

-- Seed Departments
INSERT INTO departments (id, dept_code, name, description, budget, location) VALUES
('dept-1', 'ENG', 'Engineering', 'Software engineering, architecture, and technology development', 250000.00, 'Building A, Floor 3'),
('dept-2', 'HR', 'Human Resources', 'Talent acquisition, employee relations, and organizational culture', 95000.00, 'Building B, Floor 2'),
('dept-3', 'FIN', 'Finance & Accounts', 'Financial planning, accounting, payroll, and compliance', 120000.00, 'Building B, Floor 1'),
('dept-4', 'MKT', 'Marketing & Sales', 'Brand management, growth campaigns, and customer acquisitions', 140000.00, 'Building A, Floor 2'),
('dept-5', 'OPS', 'Operations', 'Business operations, facilities, logistics, and quality assurance', 85000.00, 'Building C, Floor 1');

-- Seed Designations
INSERT INTO designations (id, department_id, title, grade, min_salary, max_salary) VALUES
('desig-1', 'dept-1', 'Senior Full Stack Engineer', 'L4', 75000.00, 140000.00),
('desig-2', 'dept-1', 'Frontend Developer', 'L2', 50000.00, 85000.00),
('desig-3', 'dept-1', 'DevOps Specialist', 'L3', 65000.00, 110000.00),
('desig-4', 'dept-2', 'HR Manager', 'L4', 60000.00, 105000.00),
('desig-5', 'dept-2', 'Talent Acquisition Executive', 'L2', 40000.00, 65000.00),
('desig-6', 'dept-3', 'Payroll Specialist', 'L3', 55000.00, 90000.00),
('desig-7', 'dept-4', 'Marketing Lead', 'L4', 65000.00, 115000.00),
('desig-8', 'dept-5', 'Operations Coordinator', 'L2', 45000.00, 75000.00);

-- Seed Employees
INSERT INTO employees (id, emp_code, first_name, last_name, email, phone, address, date_of_birth, gender, joining_date, department_id, designation_id, employment_status, salary, avatar_url, bank_account, emergency_contact) VALUES
('emp-1', 'EMP-1001', 'Arthur', 'Pendelton', 'admin@company.com', '+1 (555) 234-5678', '742 Evergreen Terrace, Springfield', '1988-04-12', 'Male', '2021-01-15', 'dept-1', 'desig-1', 'active', 95000.00, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'ACC-982347102', 'Martha Pendelton (+1 555 987-1234)'),
('emp-2', 'EMP-1002', 'Elena', 'Rostova', 'hr@company.com', '+1 (555) 345-6789', '120 Market Street, Suite 400, SF', '1992-08-23', 'Female', '2022-03-01', 'dept-2', 'desig-4', 'active', 78000.00, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 'ACC-449102847', 'Dmitri Rostov (+1 555 112-9988)'),
('emp-3', 'EMP-1003', 'Marcus', 'Chen', 'employee@company.com', '+1 (555) 456-7890', '88 Mission Bay Blvd, San Francisco', '1995-11-04', 'Male', '2023-06-10', 'dept-1', 'desig-2', 'active', 68000.00, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'ACC-192837465', 'Linda Chen (+1 555 667-3344)'),
('emp-4', 'EMP-1004', 'Sophia', 'Alvarez', 'sophia.alvarez@company.com', '+1 (555) 567-8901', '350 Castro St, Mountain View', '1993-02-18', 'Female', '2023-09-01', 'dept-3', 'desig-6', 'active', 64000.00, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'ACC-556677889', 'Carlos Alvarez (+1 555 889-0011)'),
('emp-5', 'EMP-1005', 'Tariq', 'Mansoor', 'tariq.mansoor@company.com', '+1 (555) 678-9012', '415 Elm St, San Jose', '1990-07-29', 'Male', '2022-11-15', 'dept-4', 'desig-7', 'active', 72000.00, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'ACC-990011223', 'Amina Mansoor (+1 555 443-2211)');

-- Update department managers
UPDATE departments SET manager_id = 'emp-1' WHERE id = 'dept-1';
UPDATE departments SET manager_id = 'emp-2' WHERE id = 'dept-2';
UPDATE departments SET manager_id = 'emp-4' WHERE id = 'dept-3';
UPDATE departments SET manager_id = 'emp-5' WHERE id = 'dept-4';

-- Seed Users (Passwords hashed or demo credentials)
-- Demo Credentials:
-- Admin: admin@company.com / admin123
-- HR Manager: hr@company.com / hr123
-- Employee: employee@company.com / emp123
INSERT INTO users (id, employee_id, username, email, password_hash, role, status) VALUES
('user-1', 'emp-1', 'admin', 'admin@company.com', 'admin123', 'admin', 'active'),
('user-2', 'emp-2', 'hrmanager', 'hr@company.com', 'hr123', 'hr', 'active'),
('user-3', 'emp-3', 'marcus_chen', 'employee@company.com', 'emp123', 'employee', 'active'),
('user-4', 'emp-4', 'sophia_alvarez', 'sophia.alvarez@company.com', 'pass123', 'employee', 'active'),
('user-5', 'emp-5', 'tariq_mansoor', 'tariq.mansoor@company.com', 'pass123', 'employee', 'active');

-- Seed Leave Types
INSERT INTO leave_types (id, code, name, default_days_per_year, is_paid) VALUES
('lt-1', 'CL', 'Casual Leave', 12, TRUE),
('lt-2', 'SL', 'Sick Leave', 10, TRUE),
('lt-3', 'AL', 'Annual Paid Vacation', 15, TRUE),
('lt-4', 'ML', 'Maternity/Paternity Leave', 90, TRUE),
('lt-5', 'UL', 'Unpaid Leave', 30, FALSE);

-- Seed Leave Balances for 2026
INSERT INTO leave_balances (id, employee_id, leave_type_id, year, total_days, used_days) VALUES
('lb-1', 'emp-1', 'lt-1', 2026, 12, 2),
('lb-2', 'emp-1', 'lt-2', 2026, 10, 1),
('lb-3', 'emp-1', 'lt-3', 2026, 15, 4),
('lb-4', 'emp-2', 'lt-1', 2026, 12, 1),
('lb-5', 'emp-2', 'lt-2', 2026, 10, 0),
('lb-6', 'emp-2', 'lt-3', 2026, 15, 3),
('lb-7', 'emp-3', 'lt-1', 2026, 12, 3),
('lb-8', 'emp-3', 'lt-2', 2026, 10, 2),
('lb-9', 'emp-3', 'lt-3', 2026, 15, 5);

-- Seed Leave Requests
INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, applied_at, reviewed_by, reviewer_comment) VALUES
('lr-1', 'emp-3', 'lt-1', '2026-09-20', '2026-09-21', 2, 'Personal family commitment and travel', 'pending', '2026-09-15 09:30:00', NULL, NULL),
('lr-2', 'emp-4', 'lt-2', '2026-09-10', '2026-09-11', 2, 'Seasonal fever and doctor consultation', 'approved', '2026-09-09 08:00:00', 'user-2', 'Approved. Get well soon!'),
('lr-3', 'emp-5', 'lt-3', '2026-08-15', '2026-08-19', 5, 'Annual summer vacation with family', 'approved', '2026-08-01 11:20:00', 'user-2', 'Approved. Enjoy your time off.');

-- Seed Attendance
INSERT INTO attendance (id, employee_id, date, check_in, check_out, status, total_hours, notes) VALUES
('att-1', 'emp-1', '2026-09-17', '08:55', '17:30', 'present', 8.58, 'Regular shift completed'),
('att-2', 'emp-2', '2026-09-17', '09:02', '17:45', 'present', 8.72, 'On time'),
('att-3', 'emp-3', '2026-09-17', '09:40', '18:10', 'late', 8.50, 'Traffic delay on highway'),
('att-4', 'emp-4', '2026-09-17', '09:00', '17:00', 'present', 8.00, 'Standard working hours'),
('att-5', 'emp-5', '2026-09-17', NULL, NULL, 'absent', 0.00, 'Not reported'),
('att-6', 'emp-1', '2026-09-16', '08:50', '17:30', 'present', 8.67, 'Regular shift'),
('att-7', 'emp-2', '2026-09-16', '09:10', '17:40', 'present', 8.50, 'Regular shift'),
('att-8', 'emp-3', '2026-09-16', '09:05', '17:35', 'present', 8.50, 'Regular shift'),
('att-9', 'emp-4', '2026-09-16', '09:00', '13:00', 'half_day', 4.00, 'Doctor appointment afternoon');

-- Seed Payroll for September 2026
INSERT INTO payroll (id, employee_id, month, year, basic_salary, hra, da, medical_allowance, transport_allowance, tax_deduction, pf_deduction, other_deductions, payment_status, payment_date, transaction_ref) VALUES
('pr-1', 'emp-1', '2026-09', 2026, 50000.00, 20000.00, 12000.00, 5000.00, 8000.00, 8500.00, 6000.00, 0.00, 'paid', '2026-09-01', 'TXN-20260901-001'),
('pr-2', 'emp-2', '2026-09', 2026, 42000.00, 16000.00, 10000.00, 4000.00, 6000.00, 6200.00, 5040.00, 0.00, 'paid', '2026-09-01', 'TXN-20260901-002'),
('pr-3', 'emp-3', '2026-09', 2026, 36000.00, 14000.00, 8000.00, 4000.00, 6000.00, 4500.00, 4320.00, 0.00, 'pending', NULL, NULL),
('pr-4', 'emp-4', '2026-09', 2026, 34000.00, 13000.00, 8000.00, 4000.00, 5000.00, 4200.00, 4080.00, 0.00, 'paid', '2026-09-01', 'TXN-20260901-003'),
('pr-5', 'emp-5', '2026-09', 2026, 38000.00, 15000.00, 9000.00, 4000.00, 6000.00, 5100.00, 4560.00, 0.00, 'processing', NULL, NULL);

-- Seed Performance Reviews
INSERT INTO performance_reviews (id, employee_id, reviewer_id, review_period, goals, achievements, rating, feedback, review_date) VALUES
('prf-1', 'emp-3', 'user-1', 'Q2 2026', 'Deliver the high-performance client portal and achieve 99.9% uptime', 'Spearheaded frontend migration, reduced bundle size by 35%, met all milestone targets', 5, 'Marcus is an exceptional engineer with superb attention to quality and team collaboration.', '2026-06-30'),
('prf-2', 'emp-4', 'user-2', 'Q2 2026', 'Automate monthly payroll dispatch and minimize tax filing discrepancies', 'Reduced payroll processing turnaround by 3 days with zero reconciliation errors', 4, 'Sophia consistently delivers reliable accounting precision and helps junior colleagues.', '2026-06-28'),
('prf-3', 'emp-5', 'user-2', 'Q2 2026', 'Increase brand engagement by 20% across business enterprise channels', 'Organized 3 successful webinars with 450+ attendees and launched Q2 campaign', 4, 'Tariq demonstrated great initiative and delivered strong leads for the sales team.', '2026-07-02');

-- Seed Documents
INSERT INTO documents (id, employee_id, title, doc_type, file_name, file_size) VALUES
('doc-1', 'emp-1', 'National ID / Passport Copy', 'id_proof', 'arthur_passport_verified.pdf', '2.4 MB'),
('doc-2', 'emp-1', 'Employment Offer & Non-Disclosure Agreement', 'contract', 'arthur_employment_contract_signed.pdf', '1.8 MB'),
('doc-3', 'emp-3', 'Degree Certificate - Computer Science B.S.', 'certificate', 'marcus_chen_degree.pdf', '3.1 MB'),
('doc-4', 'emp-2', 'SHRM-CP Senior HR Certification', 'certificate', 'elena_shrm_certification.pdf', '1.2 MB');

-- Seed Audit Logs
INSERT INTO audit_logs (id, user_id, user_name, user_role, action, details) VALUES
('log-1', 'user-1', 'Arthur Pendelton', 'admin', 'SYSTEM_INITIALIZATION', 'Employee Management Database initialized with core schema and departments'),
('log-2', 'user-2', 'Elena Rostova', 'hr', 'LEAVE_APPROVAL', 'Approved sick leave request for Sophia Alvarez (emp-4)'),
('log-3', 'user-1', 'Arthur Pendelton', 'admin', 'PAYROLL_GENERATION', 'Generated September 2026 payroll cycles for 5 employees');
