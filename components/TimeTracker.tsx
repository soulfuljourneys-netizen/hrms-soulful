
import React, { useState, useEffect } from 'react';
import { Play, Square, Coffee, CheckCircle, User, Clock } from 'lucide-react';
import { Employee, AttendanceRecord, UserRole } from '../types';

interface Props {
  employees: Employee[];
  attendance: AttendanceRecord[];
  onUpdate: (record: AttendanceRecord) => void;
  user: Employee;
}

const TimeTracker: React.FC<Props> = ({ employees, attendance, onUpdate, user }) => {
  const isEmployee = user.userRole === UserRole.EMPLOYEE;
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(isEmployee ? user.id : '');
  const [activeSession, setActiveSession] = useState<AttendanceRecord | null>(null);
  const [timer, setTimer] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);

  useEffect(() => {
    if (!selectedEmployeeId) {
      setActiveSession(null);
      setTimer(0);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const session = attendance.find(a => a.employeeId === selectedEmployeeId && a.date === today && !a.clockOut);
    setActiveSession(session || null);
    
    if (session) {
      const startTime = new Date(session.clockIn).getTime();
      const now = new Date().getTime();
      setTimer(Math.floor((now - startTime) / 1000));
      setIsOnBreak(session.breaks.some(b => !b.end));
    } else {
      setTimer(0);
    }
  }, [selectedEmployeeId, attendance]);

  useEffect(() => {
    let interval: any;
    if (activeSession && !isOnBreak) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, isOnBreak]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClockIn = () => {
    if (!selectedEmployeeId) return;
    const now = new Date();
    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: selectedEmployeeId,
      date: now.toISOString().split('T')[0],
      clockIn: now.toISOString(),
      breaks: [],
      totalHours: 0
    };
    onUpdate(newRecord);
  };

  const handleClockOut = () => {
    if (!activeSession) return;
    const now = new Date();
    const updated = {
      ...activeSession,
      clockOut: now.toISOString(),
      totalHours: timer / 3600
    };
    onUpdate(updated);
    setActiveSession(null);
    setTimer(0);
  };

  const toggleBreak = () => {
    if (!activeSession) return;
    const now = new Date().toISOString();
    const breaks = [...activeSession.breaks];
    
    if (!isOnBreak) {
      breaks.push({ start: now });
      setIsOnBreak(true);
    } else {
      const lastBreak = breaks[breaks.length - 1];
      if (lastBreak) lastBreak.end = now;
      setIsOnBreak(false);
    }
    
    onUpdate({ ...activeSession, breaks });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-10">
        <div className="bg-white p-16 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <Clock className="text-slate-100 w-32 h-32 rotate-12" />
          </div>
          
          <div className="relative z-10 w-full flex flex-col items-center">
            {isEmployee ? (
              <div className="mb-10 flex flex-col items-center">
                <img src={user.profilePicture || `https://picsum.photos/seed/${user.id}/80/80`} className="w-24 h-24 rounded-[2rem] mb-6 shadow-2xl border-4 border-white" alt="" />
                <h3 className="text-2xl font-black text-soul-dark">{user.name}</h3>
                <p className="text-sm text-soul-orange font-bold uppercase tracking-widest mt-1">Journey In Progress</p>
              </div>
            ) : (
              <div className="mb-10 w-full max-w-sm">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Choose Staff Member</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-soul-orange" size={20} />
                  <select 
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-soul-orange/10 appearance-none font-bold text-soul-dark shadow-sm transition-all"
                  >
                    <option value="">Select Soulful Peer...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} — {e.role}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="text-8xl font-black font-mono mb-12 text-soul-dark tracking-tighter tabular-nums">
              {formatTime(timer)}
            </div>
            
            <div className="flex gap-6">
              {!activeSession ? (
                <button
                  disabled={!selectedEmployeeId}
                  onClick={handleClockIn}
                  className="flex items-center gap-4 bg-soul-orange text-white px-16 py-6 rounded-[2rem] hover:opacity-90 transition-all shadow-2xl shadow-soul-orange/30 disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95"
                >
                  <Play fill="currentColor" size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="font-black text-xl">Start Journey</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleBreak}
                    className={`flex items-center gap-3 px-10 py-6 rounded-[2rem] transition-all border-2 active:scale-95 ${
                      isOnBreak 
                      ? 'bg-soul-dark border-soul-dark text-white' 
                      : 'bg-white border-slate-100 text-soul-dark hover:border-soul-orange hover:text-soul-orange'
                    }`}
                  >
                    <Coffee size={24} />
                    <span className="font-black text-lg">{isOnBreak ? 'Resume Journey' : 'Soul Break'}</span>
                  </button>
                  
                  <button
                    onClick={handleClockOut}
                    className="flex items-center gap-3 bg-rose-600 text-white px-10 py-6 rounded-[2rem] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-200 group active:scale-95"
                  >
                    <Square fill="currentColor" size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-black text-lg">End Shift</span>
                  </button>
                </>
              )}
            </div>

            {isOnBreak && (
              <div className="mt-10 text-soul-dark flex items-center gap-3 font-black text-xs uppercase tracking-widest bg-slate-100 px-6 py-3 rounded-full animate-pulse">
                <div className="w-2.5 h-2.5 bg-soul-orange rounded-full"></div>
                Taking a moment for soul care
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-xl text-soul-dark mb-8 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-soul-orange animate-ping"></div>
            Active Journeys
          </h3>
          <div className="space-y-6">
            {employees.map(emp => {
              const activeRec = attendance.find(a => a.employeeId === emp.id && !a.clockOut && a.date === new Date().toISOString().split('T')[0]);
              const isActive = !!activeRec;
              const isOnBreakLocal = activeRec?.breaks.some(b => !b.end);
              
              return (
                <div key={emp.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={emp.profilePicture || `https://picsum.photos/seed/${emp.id}/32/32`} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isActive ? (isOnBreakLocal ? 'bg-amber-500' : 'bg-soul-orange') : 'bg-slate-300'}`}></div>
                    </div>
                    <div>
                      <span className="text-sm font-black text-soul-dark block leading-tight group-hover:text-soul-orange transition-colors">{emp.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{emp.role}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;
