
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Network, 
  UserPlus, 
  CreditCard,
  CalendarDays,
  Megaphone,
  UserCircle,
  Ghost,
  CalendarRange,
  ClipboardList
} from 'lucide-react';
import { ViewType, Employee, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  user: Employee;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user }) => {
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE] },
    { id: 'announcements', label: 'News Feed', icon: Megaphone, roles: [UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE] },
    { id: 'employees', label: 'Employees', icon: Users, roles: [UserRole.ADMIN, UserRole.HR] },
    { id: 'roster', label: 'Monthly Roster', icon: CalendarRange, roles: [UserRole.ADMIN, UserRole.HR] },
    { id: 'tracker', label: 'Time Tracker', icon: Clock, roles: [UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE] },
    { id: 'attendance', label: 'Attendance Logs', icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE] },
    { id: 'leaves', label: 'Leaves', icon: CalendarDays, roles: [UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE] },
    { id: 'my-team', label: 'My Team', icon: UserCircle, roles: [UserRole.EMPLOYEE] },
    { id: 'mindmap', label: 'Org Chart', icon: Network, roles: [UserRole.ADMIN, UserRole.HR] },
    { id: 'onboarding', label: 'Onboarding', icon: UserPlus, roles: [UserRole.ADMIN, UserRole.HR, UserRole.EMPLOYEE] },
    { id: 'payroll', label: 'Payroll', icon: CreditCard, roles: [UserRole.ADMIN, UserRole.HR] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user.userRole));

  return (
    <div className="w-64 bg-soul-dark h-screen fixed left-0 top-0 flex flex-col z-50 text-white shadow-2xl">
      <div className="p-8">
        <h1 className="text-xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 bg-soul-orange rounded-2xl flex items-center justify-center text-white shadow-lg shadow-soul-orange/20">
            <Ghost size={24} />
          </div>
          <span className="tracking-tight">Soulful Journeys</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              currentView === item.id 
                ? 'sidebar-active' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
          <img src={user.profilePicture || `https://picsum.photos/seed/${user.id}/40/40`} className="w-10 h-10 rounded-xl" alt="User" />
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-white">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate font-bold uppercase tracking-widest">{user.userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
