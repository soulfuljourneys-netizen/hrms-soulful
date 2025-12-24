
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EmployeeDirectory from './components/EmployeeDirectory';
import TimeTracker from './components/TimeTracker';
import AttendanceLogs from './components/AttendanceLogs';
import OrgMindMap from './components/OrgMindMap';
import OnboardingFlow from './components/OnboardingFlow';
import Payroll from './components/Payroll';
import Login from './components/Login';
import LeaveManagement from './components/LeaveManagement';
import Announcements from './components/Announcements';
import MyTeam from './components/MyTeam';
import ShiftRoster from './components/ShiftRoster';
import { ViewType, Employee, AttendanceRecord, UserRole, LeaveRequest, Announcement, Shift, LeavePolicy } from './types';
import { INITIAL_EMPLOYEES, INITIAL_ATTENDANCE } from './constants';
import { Bell, LogOut, CloudUpload, Cloud, AlertTriangle, Monitor } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('zenhr_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLocalMode, setIsLocalMode] = useState(false);
  
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [policies, setPolicies] = useState<LeavePolicy[]>([
    {
      id: 'default-vacation',
      name: 'Standard Vacation',
      leaveType: 'Vacation',
      annualQuota: 20,
      maxCarryForward: 5,
      probationPeriodDays: 90,
      maxDaysPerRequest: 14,
      applicableRoles: [UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE],
      applicableDepartments: []
    }
  ]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: '1', title: 'Welcome to the Team', content: 'We are excited to have our new portal live!', date: '2023-10-20', author: 'HR' }
  ]);

  // Load data from Hostinger server on startup
  useEffect(() => {
    const loadFromServer = async () => {
      // Check if running on localhost
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.info("Running locally. Persistence using LocalStorage.");
        setIsLocalMode(true);
        const localData = localStorage.getItem('zenhr_backup');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed.employees) setEmployees(parsed.employees);
          if (parsed.attendance) setAttendance(parsed.attendance);
          if (parsed.leaves) setLeaves(parsed.leaves);
          if (parsed.shifts) setShifts(parsed.shifts);
          if (parsed.policies) setPolicies(parsed.policies);
          if (parsed.announcements) setAnnouncements(parsed.announcements);
        }
        setHasLoadedFromServer(true);
        return;
      }

      try {
        const response = await fetch('api.php');
        if (response.ok) {
          const data = await response.json();
          if (data && !data.error) {
            if (data.employees && data.employees.length > 0) setEmployees(data.employees);
            if (data.attendance) setAttendance(data.attendance);
            if (data.leaves) setLeaves(data.leaves);
            if (data.shifts) setShifts(data.shifts);
            if (data.policies) setPolicies(data.policies);
            if (data.announcements) setAnnouncements(data.announcements);
          }
        } else {
           setServerError("Hostinger connection failed.");
        }
      } catch (e) {
        console.warn("Backend api.php not reachable.");
        setServerError("Cloud persistence offline.");
      } finally {
        setHasLoadedFromServer(true);
      }
    };
    loadFromServer();
  }, []);

  // Save data to Hostinger server whenever state changes
  useEffect(() => {
    if (!hasLoadedFromServer) return; 

    const syncWithServer = async () => {
      setIsSyncing(true);
      const payload = {
        employees,
        attendance,
        leaves,
        shifts,
        policies,
        announcements
      };

      // If local, just save to localStorage
      if (isLocalMode) {
        localStorage.setItem('zenhr_backup', JSON.stringify(payload));
        setLastSync(new Date());
        setIsSyncing(false);
        return;
      }

      try {
        const res = await fetch('api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setLastSync(new Date());
          setServerError(null);
        } else {
          setServerError("Save to Hostinger failed");
        }
      } catch (e) {
        console.error("Sync failed:", e);
        setServerError("Sync error");
      } finally {
        setIsSyncing(false);
      }
    };

    const timeoutId = setTimeout(syncWithServer, 2000); 
    return () => clearTimeout(timeoutId);
  }, [employees, attendance, leaves, shifts, policies, announcements, hasLoadedFromServer, isLocalMode]);

  // Handle local auth persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('zenhr_auth', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('zenhr_auth');
    }
  }, [currentUser]);

  const addEmployee = (newEmp: Employee) => {
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = (updatedEmp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    if (currentUser && currentUser.id === updatedEmp.id) {
      setCurrentUser(updatedEmp);
    }
  };

  const updateEmployees = (updatedEmps: Employee[]) => {
    setEmployees([...updatedEmps]);
    if (currentUser) {
      const updatedSelf = updatedEmps.find(e => e.id === currentUser.id);
      if (updatedSelf) setCurrentUser({...updatedSelf});
    }
  };

  const updateAttendance = (record: AttendanceRecord) => {
    setAttendance(prev => {
      const exists = prev.findIndex(r => r.id === record.id);
      if (exists > -1) {
        const updated = [...prev];
        updated[exists] = record;
        return updated;
      }
      return [record, ...prev];
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  if (!currentUser) {
    return <Login employees={employees} onLogin={setCurrentUser} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard employees={employees} attendance={attendance} user={currentUser} />;
      case 'employees':
        return <EmployeeDirectory employees={employees} onAdd={addEmployee} onUpdate={updateEmployee} user={currentUser} />;
      case 'tracker':
        return <TimeTracker employees={employees} attendance={attendance} onUpdate={updateAttendance} user={currentUser} />;
      case 'attendance':
        return <AttendanceLogs employees={employees} attendance={attendance} user={currentUser} />;
      case 'mindmap':
        return <OrgMindMap employees={employees} />;
      case 'my-team':
        return <MyTeam employees={employees} user={currentUser} />;
      case 'onboarding':
        return <OnboardingFlow user={currentUser} onComplete={addEmployee} onUpdate={updateEmployee} />;
      case 'payroll':
        return <Payroll employees={employees} />;
      case 'leaves':
        return <LeaveManagement 
          leaves={leaves} 
          setLeaves={setLeaves} 
          user={currentUser} 
          employees={employees} 
          onUpdateEmployee={updateEmployee}
          onUpdateEmployees={updateEmployees}
          policies={policies}
          setPolicies={setPolicies}
        />;
      case 'announcements':
        return <Announcements announcements={announcements} setAnnouncements={setAnnouncements} user={currentUser} />;
      case 'roster':
        return <ShiftRoster employees={employees} shifts={shifts} setShifts={setShifts} />;
      default:
        return <Dashboard employees={employees} attendance={attendance} user={currentUser} />;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Experience Hub';
      case 'employees': return 'Employee Directory';
      case 'tracker': return 'Time Journey';
      case 'attendance': return 'Attendance Records';
      case 'mindmap': return 'Team Connections';
      case 'my-team': return 'My Team Circle';
      case 'onboarding': return 'Welcome Hub';
      case 'payroll': return 'Payroll Management';
      case 'leaves': return 'Leave Management';
      case 'announcements': return 'Community Buzz';
      case 'roster': return 'Monthly Roster Planning';
      default: return 'HR Management System';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentView={currentView} setView={setCurrentView} user={currentUser} />
      
      <main className="pl-64 min-h-screen flex flex-col flex-1">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-2xl font-black text-soul-dark">{getTitle()}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            {/* Server Sync Indicator */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              serverError ? 'bg-rose-50 border-rose-100' : 
              isLocalMode ? 'bg-indigo-50 border-indigo-100' : 
              'bg-slate-50 border-slate-100'
            }`}>
              {isSyncing ? (
                <CloudUpload size={14} className="text-soul-orange animate-bounce" />
              ) : isLocalMode ? (
                <Monitor size={14} className="text-indigo-600" />
              ) : serverError ? (
                <AlertTriangle size={14} className="text-rose-500" />
              ) : (
                <Cloud size={14} className="text-emerald-500" />
              )}
              <span className={`text-[9px] font-black uppercase tracking-tighter ${
                serverError ? 'text-rose-600' : 
                isLocalMode ? 'text-indigo-600' : 
                'text-slate-400'
              }`}>
                {isSyncing ? 'Processing...' : 
                 isLocalMode ? 'Offline Dev Mode' :
                 serverError ? serverError : 
                 lastSync ? `Last saved ${lastSync.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Cloud Connected'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentView('announcements')} className="relative p-2.5 text-slate-400 hover:text-soul-orange hover:bg-soul-orange/5 rounded-2xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-soul-orange rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-100"></div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-sm font-bold text-soul-dark leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-soul-orange font-bold uppercase tracking-tighter mt-1">{currentUser.userRole}</p>
                </div>
                <img src={currentUser.profilePicture || `https://picsum.photos/seed/${currentUser.id}/32/32`} className="w-10 h-10 rounded-xl shadow-sm border border-slate-100" alt="Profile" />
              </div>
              <button 
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="p-10 flex-1">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
