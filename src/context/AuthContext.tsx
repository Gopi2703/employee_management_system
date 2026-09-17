import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Employee, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  role: UserRole;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateCurrentEmployee: (emp: Partial<Employee>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial default user is Admin for frictionless immediate preview
const defaultAdminUser: User = {
  id: 'user-1',
  employee_id: 'emp-1',
  username: 'admin',
  email: 'admin@company.com',
  role: 'admin',
  created_at: '2021-01-15',
  status: 'active'
};

const defaultAdminEmployee: Employee = {
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
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ems_current_user');
    return saved ? JSON.parse(saved) : defaultAdminUser;
  });

  const [employee, setEmployee] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('ems_current_employee');
    return saved ? JSON.parse(saved) : defaultAdminEmployee;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ems_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ems_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ems_current_user');
    }
  }, [user]);

  useEffect(() => {
    if (employee) {
      localStorage.setItem('ems_current_employee', JSON.stringify(employee));
    } else {
      localStorage.removeItem('ems_current_employee');
    }
  }, [employee]);

  useEffect(() => {
    localStorage.setItem('ems_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }
      setUser(data.user);
      setEmployee(data.employee);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection error' };
    }
  };

  const logout = () => {
    setUser(null);
    setEmployee(null);
    localStorage.removeItem('ems_current_user');
    localStorage.removeItem('ems_current_employee');
  };

  const switchRole = async (newRole: UserRole) => {
    if (newRole === 'admin') {
      await login('admin@company.com', 'admin123');
    } else if (newRole === 'hr') {
      await login('hr@company.com', 'hr123');
    } else {
      await login('employee@company.com', 'emp123');
    }
  };

  const updateCurrentEmployee = (empUpdates: Partial<Employee>) => {
    if (employee) {
      setEmployee({ ...employee, ...empUpdates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        role: user?.role || 'admin',
        theme,
        toggleTheme,
        login,
        logout,
        switchRole,
        updateCurrentEmployee
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
