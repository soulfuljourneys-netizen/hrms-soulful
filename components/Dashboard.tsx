
import React, { useMemo } from 'react';
import { Employee, EmployeeStatus, AttendanceRecord, UserRole } from '../types';
import { Users, Clock, Calendar, Activity, Zap, Sparkles } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

interface Props {
  employees: Employee[];
  attendance: AttendanceRecord[];
  user: Employee;
}

const Dashboard: React.FC<Props> = ({ employees, attendance, user }) => {
  const isEmployee = user.userRole === UserRole.EMPLOYEE;
  
  const today = new Date().toISOString().split('T')[0];
  const currentlyClockedIn = attendance.filter(a => a.date === today && !a.clockOut).length;
  const presentToday = attendance.filter(a => a.date === today).length;
  
  // Calculate dynamic Journey Activity (Last 5 Days)
  const attendanceData = useMemo(() => {
    const last5Days = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = attendance.filter(a => a.date === dateStr).length;
      last5Days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        present: count,
        fullDate: dateStr
      });
    }
    return last5Days;
  }, [attendance]);

  // Calculate Personal Stats
  const myTotalHours = useMemo(() => {
    return attendance
      .filter(a => a.employeeId === user.id)
      .reduce((acc, curr) => acc + curr.totalHours, 0);
  }, [attendance, user.id]);

  const isClockedIn = useMemo(() => {
    return attendance.some(a => a.employeeId === user.id && !a.clockOut && a.date === today);
  }, [attendance, user.id, today]);

  // Dynamic Department Mix
  const deptData = useMemo(() => {
    const map: Record<string, number> = {};
    employees.forEach(emp => {
      map[emp.department] = (map[emp.department] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const COLORS = ['#ff4c1b', '#0f002e', '#4b0082', '#ff8c00', '#2e0854', '#7c3aed'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center bg-soul-dark text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden gap-6">
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tight">Welcome, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-400 mt-2 font-medium max-w-md">Your dashboard overview for today.</p>
        </div>
        <div className="relative z-10">
           <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-sm uppercase tracking-widest transition-all ${isClockedIn ? 'bg-soul-orange text-white shadow-lg shadow-soul-orange/40' : 'bg-white/10 text-slate-400'}`}>
            <Activity size={20} className={isClockedIn ? 'animate-pulse' : ''} />
            {isClockedIn ? 'Currently Working' : 'Shift Ended'}
          </div>
        </div>
        <Sparkles className="absolute right-10 top-10 text-white/5 w-32 h-32 rotate-12 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: isEmployee ? 'Personal Hours' : 'Team Members', value: isEmployee ? `${myTotalHours.toFixed(1)}h` : employees.length, icon: Users, color: 'soul-orange' },
          { label: 'Active Right Now', value: currentlyClockedIn, icon: Zap, color: 'soul-orange' },
          { label: 'Today Presence', value: `${presentToday}/${employees.length}`, icon: Calendar, color: 'soul-dark' },
          { label: 'Leave Balance', value: `${user.vacationAllowed - user.vacationUsed}d`, icon: Clock, color: 'soul-dark' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color === 'soul-orange' ? 'soul-orange' : 'soul-dark'} text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
              <stat.icon size={28} />
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-soul-dark mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-2xl text-soul-dark">Attendance Overview</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Daily check-in activity</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-soul-orange uppercase tracking-widest">
                <div className="w-3 h-3 rounded-full bg-soul-orange"></div>
                Check-ins
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                  labelStyle={{fontWeight: 900, marginBottom: '4px', color: '#0f002e'}}
                />
                <Bar dataKey="present" fill="#ff4c1b" radius={[10, 10, 10, 10]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-black text-2xl text-soul-dark">Department Mix</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 mb-8">Employee distribution</p>
          <div className="h-[260px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {deptData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-soul-dark">{employees.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employees</span>
            </div>
          </div>
          <div className="space-y-4 mt-auto pt-10">
            {deptData.map((d, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-soul-dark transition-colors">{d.name}</span>
                </div>
                <span className="text-xs font-black text-soul-dark">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
