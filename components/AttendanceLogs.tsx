
import React, { useState, useMemo } from 'react';
import { Employee, AttendanceRecord, UserRole } from '../types';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

interface Props {
  employees: Employee[];
  attendance: AttendanceRecord[];
  user: Employee;
}

const AttendanceLogs: React.FC<Props> = ({ employees, attendance, user }) => {
  const isManager = user.userRole === UserRole.ADMIN || user.userRole === UserRole.HR;
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterEmployeeId, setFilterEmployeeId] = useState(isManager ? '' : user.id);
  const [searchTerm, setSearchTerm] = useState('');

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Filtered attendance data based on selections
  const filteredRecords = useMemo(() => {
    return attendance.filter(record => {
      const recordDate = new Date(record.date);
      const matchesMonth = recordDate.getMonth() === selectedMonth;
      const matchesYear = recordDate.getFullYear() === selectedYear;
      const matchesEmployee = filterEmployeeId ? record.employeeId === filterEmployeeId : true;
      
      const emp = employees.find(e => e.id === record.employeeId);
      const matchesSearch = emp ? emp.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;

      return matchesMonth && matchesYear && matchesEmployee && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance, selectedMonth, selectedYear, filterEmployeeId, searchTerm, employees]);

  // Aggregate stats for the current filter
  const stats = useMemo(() => {
    const totalHours = filteredRecords.reduce((acc, curr) => acc + curr.totalHours, 0);
    const uniqueDays = new Set(filteredRecords.map(r => r.date)).size;
    const avgHours = uniqueDays > 0 ? totalHours / uniqueDays : 0;
    
    return {
      totalHours,
      daysPresent: uniqueDays,
      avgHours
    };
  }, [filteredRecords]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateBreakDuration = (breaks: { start: string; end?: string }[]) => {
    return breaks.reduce((acc, b) => {
      if (b.end) {
        return acc + (new Date(b.end).getTime() - new Date(b.start).getTime());
      }
      return acc;
    }, 0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-6">
        <div>
          <h2 className="text-3xl font-black text-soul-dark tracking-tighter">Attendance Chronicles</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Time logs and presence tracking</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {isManager && (
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-soul-dark">
              <ChevronLeft size={20} />
            </button>
            <div className="text-sm font-black text-soul-dark px-2 min-w-[140px] text-center">
              {months[selectedMonth]} {selectedYear}
            </div>
            <button onClick={handleNextMonth} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-soul-dark">
              <ChevronRight size={20} />
            </button>
          </div>

          {isManager && (
            <select 
              className="px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold text-sm appearance-none"
              value={filterEmployeeId}
              onChange={(e) => setFilterEmployeeId(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          )}

          <button className="p-4 bg-soul-dark text-white rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-95">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-soul-orange/10 text-soul-orange rounded-2xl flex items-center justify-center">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hours Logged</p>
            <h3 className="text-3xl font-black text-soul-dark">{stats.totalHours.toFixed(1)}h</h3>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <CalendarIcon size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days Present</p>
            <h3 className="text-3xl font-black text-soul-dark">{stats.daysPresent} Days</h3>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <User size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Daily Shift</p>
            <h3 className="text-3xl font-black text-soul-dark">{stats.avgHours.toFixed(1)}h</h3>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/30">
          <h3 className="font-black text-xl text-soul-dark">Chronological Records</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Detailed breakdown of time entries</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="p-8">Date</th>
                <th className="p-8">Employee</th>
                <th className="p-8 text-center">Status</th>
                <th className="p-8">Clock In</th>
                <th className="p-8">Clock Out</th>
                <th className="p-8">Breaks</th>
                <th className="p-8 text-right">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.length > 0 ? filteredRecords.map((record) => {
                const emp = employees.find(e => e.id === record.employeeId);
                const breakDuration = calculateBreakDuration(record.breaks);
                const breakMins = Math.floor(breakDuration / (1000 * 60));
                
                return (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-8">
                      <p className="font-black text-soul-dark">{new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <img src={emp?.profilePicture || `https://picsum.photos/seed/${emp?.id}/32/32`} className="w-10 h-10 rounded-xl shadow-sm" alt="" />
                        <div>
                          <p className="font-black text-soul-dark leading-none">{emp?.name}</p>
                          <p className="text-[10px] font-bold text-soul-orange uppercase mt-1">{emp?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        record.clockOut ? 'bg-emerald-50 text-emerald-600' : 'bg-soul-orange/10 text-soul-orange animate-pulse'
                      }`}>
                        {record.clockOut ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {record.clockOut ? 'Completed' : 'On Going'}
                      </span>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <ArrowUpRight size={14} className="text-emerald-500" />
                        {formatTime(record.clockIn)}
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        {record.clockOut ? (
                          <>
                            <ArrowDownLeft size={14} className="text-rose-500" />
                            {formatTime(record.clockOut)}
                          </>
                        ) : '--:--'}
                      </div>
                    </td>
                    <td className="p-8 text-xs font-bold text-slate-400">
                      {breakMins > 0 ? `${breakMins} mins` : 'No breaks'}
                    </td>
                    <td className="p-8 text-right">
                      <p className="text-lg font-black text-soul-dark">{record.totalHours.toFixed(1)}h</p>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="p-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle size={40} className="text-slate-200" />
                    </div>
                    <p className="text-slate-300 font-black uppercase tracking-widest text-sm">No attendance records found for this period</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Internal utility icons
const ArrowUpRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

const ArrowDownLeft = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="17" y1="7" x2="7" y2="17"></line>
    <polyline points="17 17 7 17 7 7"></polyline>
  </svg>
);

export default AttendanceLogs;
