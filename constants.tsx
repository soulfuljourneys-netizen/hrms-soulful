
import { Employee, EmployeeStatus, UserRole, AttendanceRecord } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@admin.com',
    password: 'password',
    role: 'CEO',
    department: 'Executive',
    status: EmployeeStatus.ACTIVE,
    userRole: UserRole.ADMIN,
    joinDate: '2022-01-01',
    address: '123 Tech Lane, SF',
    phone: '555-0101',
    salary: 150000,
    documents: [],
    vacationUsed: 0, sickUsed: 0, personalUsed: 0,
    vacationAllowed: 25, sickAllowed: 12, personalAllowed: 5
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus@hr.com',
    password: 'password',
    role: 'HR Manager',
    department: 'Human Resources',
    managerId: '1',
    status: EmployeeStatus.ACTIVE,
    userRole: UserRole.HR,
    joinDate: '2022-02-15',
    address: '456 Silicon Valley, CA',
    phone: '555-0102',
    salary: 95000,
    documents: [],
    vacationUsed: 2, sickUsed: 1, personalUsed: 0,
    vacationAllowed: 20, sickAllowed: 10, personalAllowed: 5
  },
  {
    id: '3',
    name: 'Aisha Gupta',
    email: 'aisha@zenhr.com',
    password: 'password',
    role: 'Head of Product',
    department: 'Product',
    managerId: '1',
    status: EmployeeStatus.ACTIVE,
    userRole: UserRole.EMPLOYEE,
    joinDate: '2022-03-10',
    address: '789 Product Rd, NY',
    phone: '555-0103',
    salary: 125000,
    documents: [],
    vacationUsed: 5, sickUsed: 0, personalUsed: 1,
    vacationAllowed: 20, sickAllowed: 10, personalAllowed: 5
  }
];

// Generate mock attendance data for the last 30 days
const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const empIds = ['1', '2', '3'];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date();
    currentDate.setDate(today.getDate() - i);
    
    // Skip weekends mostly
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = currentDate.toISOString().split('T')[0];

    empIds.forEach(id => {
      // Randomly skip some days for some employees (sick/leave/etc)
      if (Math.random() > 0.9) return;

      const clockInHour = 8 + Math.floor(Math.random() * 2); // 8 AM or 9 AM
      const clockInMin = Math.floor(Math.random() * 60);
      const clockIn = new Date(currentDate);
      clockIn.setHours(clockInHour, clockInMin, 0);

      const isCurrentShift = i === 0 && Math.random() > 0.5;
      
      let clockOut: string | undefined = undefined;
      let totalHours = 0;
      const breaks = [{
        start: new Date(currentDate.setHours(13, 0, 0)).toISOString(),
        end: new Date(currentDate.setHours(14, 0, 0)).toISOString()
      }];

      if (!isCurrentShift) {
        const clockOutHour = 17 + Math.floor(Math.random() * 3); // 5 PM to 7 PM
        const clockOutMin = Math.floor(Math.random() * 60);
        const clockOutDate = new Date(currentDate);
        clockOutDate.setHours(clockOutHour, clockOutMin, 0);
        clockOut = clockOutDate.toISOString();
        
        // Calculate total hours minus 1 hour break
        totalHours = (clockOutDate.getTime() - clockIn.getTime()) / (1000 * 60 * 60) - 1;
      }

      records.push({
        id: Math.random().toString(36).substr(2, 9),
        employeeId: id,
        date: dateStr,
        clockIn: clockIn.toISOString(),
        clockOut,
        breaks,
        totalHours: totalHours > 0 ? totalHours : 0
      });
    });
  }
  return records;
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = generateMockAttendance();
