
import React, { useState, useEffect, useMemo } from 'react';
import { LeaveRequest, Employee, UserRole, LeavePolicy } from '../types';
import { 
  Calendar, Plus, Clock, CheckCircle, XCircle, Filter, 
  Settings, AlertTriangle, RefreshCw, Info, Shield, 
  Trash2, Briefcase, LayoutGrid, Check, X, ClipboardCheck
} from 'lucide-react';

interface Props {
  leaves: LeaveRequest[];
  setLeaves: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  user: Employee;
  employees: Employee[];
  onUpdateEmployee?: (emp: Employee) => void;
  onUpdateEmployees?: (emps: Employee[]) => void;
  policies: LeavePolicy[];
  setPolicies: React.Dispatch<React.SetStateAction<LeavePolicy[]>>;
}

const LeaveManagement: React.FC<Props> = ({ 
  leaves, setLeaves, user, employees, onUpdateEmployee, onUpdateEmployees, policies, setPolicies 
}) => {
  const isManager = user.userRole === UserRole.ADMIN || user.userRole === UserRole.HR;
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPolicyHub, setShowPolicyHub] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  
  // Policy Form State
  const [editingPolicy, setEditingPolicy] = useState<Partial<LeavePolicy> | null>(null);

  // Request Form State
  const [newLeave, setNewLeave] = useState<Partial<LeaveRequest>>({
    type: 'Vacation',
    startDate: '',
    endDate: '',
    reason: ''
  });
  
  const [calculatedDays, setCalculatedDays] = useState(0);

  // Departments list for policies
  const departments = useMemo(() => Array.from(new Set(employees.map(e => e.department))), [employees]);

  useEffect(() => {
    if (newLeave.startDate && newLeave.endDate) {
      const start = new Date(newLeave.startDate);
      const end = new Date(newLeave.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setCalculatedDays(diffDays > 0 ? diffDays : 0);
    } else {
      setCalculatedDays(0);
    }
  }, [newLeave.startDate, newLeave.endDate]);

  // Finding the matching policy for an employee
  const getPolicyForUser = (emp: Employee, leaveType: string, currentPolicies: LeavePolicy[]) => {
    const filteredPolicies = currentPolicies.filter(p => p.leaveType === leaveType);
    
    // 1. Try to find a policy that matches both role AND department specifically
    const specificMatch = filteredPolicies.find(p => 
      p.applicableRoles.includes(emp.userRole) && 
      p.applicableDepartments.includes(emp.department)
    );
    if (specificMatch) return specificMatch;

    // 2. Try to find a policy that matches role and has NO department restriction (Global Role Policy)
    const roleMatch = filteredPolicies.find(p => 
      p.applicableRoles.includes(emp.userRole) && 
      (!p.applicableDepartments || p.applicableDepartments.length === 0)
    );
    if (roleMatch) return roleMatch;

    // 3. Fallback: Take the first policy matching the role regardless of department
    return filteredPolicies.find(p => p.applicableRoles.includes(emp.userRole));
  };

  const getRemainingBalance = (emp: Employee, type: string) => {
    switch (type) {
      case 'Vacation': return (emp.vacationAllowed || 0) - (emp.vacationUsed || 0);
      case 'Sick': return (emp.sickAllowed || 0) - (emp.sickUsed || 0);
      case 'Personal': return (emp.personalAllowed || 0) - (emp.personalUsed || 0);
      default: return 0;
    }
  };

  const checkProbation = (emp: Employee, policy?: LeavePolicy) => {
    if (!policy || !policy.probationPeriodDays) return true;
    const joinDate = new Date(emp.joinDate);
    const today = new Date();
    const diffTime = today.getTime() - joinDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= policy.probationPeriodDays;
  };

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const policy = getPolicyForUser(user, newLeave.type || 'Vacation', policies);
    const balance = getRemainingBalance(user, newLeave.type || 'Vacation');
    
    if (!checkProbation(user, policy)) {
      alert(`Policy Restriction: You are currently in the probation period. You must complete ${policy?.probationPeriodDays} days of service before requesting ${newLeave.type} leave.`);
      return;
    }

    if (policy && calculatedDays > policy.maxDaysPerRequest) {
      alert(`Policy Restriction: The maximum allowed duration for a single ${newLeave.type} request is ${policy.maxDaysPerRequest} days.`);
      return;
    }

    if (calculatedDays > balance) {
      alert(`Insufficient Balance: You only have ${balance} days remaining for ${newLeave.type} leave.`);
      return;
    }

    const req: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: user.id,
      type: (newLeave.type || 'Vacation') as any,
      startDate: newLeave.startDate || '',
      endDate: newLeave.endDate || '',
      status: 'Pending',
      reason: newLeave.reason || '',
      daysCount: calculatedDays
    };
    setLeaves(prev => [req, ...prev]);
    setShowRequestModal(false);
    setNewLeave({ type: 'Vacation', startDate: '', endDate: '', reason: '' });
  };

  const handlePolicySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    const finalPolicy: LeavePolicy = {
      id: editingPolicy.id || Math.random().toString(36).substr(2, 9),
      name: editingPolicy.name || 'New Policy',
      leaveType: (editingPolicy.leaveType || 'Vacation') as any,
      annualQuota: isNaN(Number(editingPolicy.annualQuota)) ? 0 : Number(editingPolicy.annualQuota),
      maxCarryForward: isNaN(Number(editingPolicy.maxCarryForward)) ? 0 : Number(editingPolicy.maxCarryForward),
      probationPeriodDays: isNaN(Number(editingPolicy.probationPeriodDays)) ? 0 : Number(editingPolicy.probationPeriodDays),
      maxDaysPerRequest: isNaN(Number(editingPolicy.maxDaysPerRequest)) ? 365 : Number(editingPolicy.maxDaysPerRequest),
      applicableRoles: editingPolicy.applicableRoles || [],
      applicableDepartments: editingPolicy.applicableDepartments || []
    };

    setPolicies(prev => {
      const idx = prev.findIndex(p => p.id === finalPolicy.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = finalPolicy;
        return next;
      }
      return [finalPolicy, ...prev];
    });

    setShowPolicyModal(false);
    setEditingPolicy(null);
  };

  const deletePolicy = (id: string) => {
    if (window.confirm("Confirm Deletion: Are you sure you want to delete this leave policy?")) {
      setPolicies(prev => prev.filter(p => p.id !== id));
    }
  };

  const applyPoliciesToAll = () => {
    if (!onUpdateEmployees) return;
    
    if (window.confirm("Bulk Update: This will recalculate the ANNUAL ALLOWED leave quota for ALL employees based on the active policies in the Hub. Current USED days will not be affected. Do you wish to proceed?")) {
      
      const updatedEmployees = employees.map(emp => {
        // Find matching policies for each type
        const vPolicy = getPolicyForUser(emp, 'Vacation', policies);
        const sPolicy = getPolicyForUser(emp, 'Sick', policies);
        const pPolicy = getPolicyForUser(emp, 'Personal', policies);

        return {
          ...emp,
          vacationAllowed: vPolicy ? Number(vPolicy.annualQuota) : Number(emp.vacationAllowed || 0),
          sickAllowed: sPolicy ? Number(sPolicy.annualQuota) : Number(emp.sickAllowed || 0),
          personalAllowed: pPolicy ? Number(pPolicy.annualQuota) : Number(emp.personalAllowed || 0)
        };
      });

      // Execute update
      onUpdateEmployees(updatedEmployees);
      alert("Success: Annual leave quotas have been synchronized for all staff based on active policies.");
    }
  };

  const handleAction = (id: string, status: 'Approved' | 'Rejected') => {
    const leave = leaves.find(l => l.id === id);
    if (!leave) return;

    if (status === 'Approved') {
      const emp = employees.find(e => e.id === leave.employeeId);
      if (emp && onUpdateEmployee) {
        const updated = { ...emp };
        if (leave.type === 'Vacation') updated.vacationUsed = (updated.vacationUsed || 0) + leave.daysCount;
        if (leave.type === 'Sick') updated.sickUsed = (updated.sickUsed || 0) + leave.daysCount;
        if (leave.type === 'Personal') updated.personalUsed = (updated.personalUsed || 0) + leave.daysCount;
        onUpdateEmployee(updated);
      }
    }

    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const filteredLeaves = isManager ? leaves : leaves.filter(l => l.employeeId === user.id);
  const currentBalance = getRemainingBalance(user, newLeave.type || 'Vacation');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-soul-dark tracking-tighter">Leave Management</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Manage time off requests and company policies</p>
        </div>
        <div className="flex gap-4">
          {isManager && (
            <button 
              onClick={() => setShowPolicyHub(!showPolicyHub)}
              className={`p-4 rounded-2xl transition-all flex items-center gap-2 font-black uppercase text-xs tracking-widest ${
                showPolicyHub ? 'bg-soul-dark text-white shadow-xl' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Settings size={20} className={showPolicyHub ? 'animate-spin-slow' : ''} />
              {showPolicyHub ? 'Close Hub' : 'Policy Hub'}
            </button>
          )}
          <button 
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-3 bg-soul-orange text-white px-8 py-4 rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-soul-orange/20 active:scale-95"
          >
            <Plus size={20} />
            Request Leave
          </button>
        </div>
      </div>

      {showPolicyHub && isManager && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-soul-dark p-10 rounded-[3rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20">
                <Shield size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black">Policy Configuration Hub</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Configure automated leave rules based on Zoho HR CRM standards</p>
              </div>
            </div>
            <div className="relative z-10 flex gap-4">
              <button 
                onClick={applyPoliciesToAll}
                className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Sync Quotas
              </button>
              <button 
                onClick={() => { setEditingPolicy({ applicableRoles: [], applicableDepartments: [] }); setShowPolicyModal(true); }}
                className="px-8 py-4 bg-soul-orange rounded-2xl hover:opacity-90 transition-all font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-xl shadow-soul-orange/20"
              >
                <Plus size={20} />
                Create Policy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {policies.map(policy => (
              <div key={policy.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group hover:border-soul-orange transition-all flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${
                    policy.leaveType === 'Vacation' ? 'bg-soul-orange/5 text-soul-orange' :
                    policy.leaveType === 'Sick' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-800'
                  }`}>
                    <LayoutGrid size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingPolicy({...policy}); setShowPolicyModal(true); }}
                      className="p-2 text-slate-400 hover:text-soul-dark transition-all"
                      title="Edit Policy"
                    >
                      <Settings size={18} />
                    </button>
                    <button 
                      onClick={() => deletePolicy(policy.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-all"
                      title="Delete Policy"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <h4 className="text-xl font-black text-soul-dark mb-1">{policy.name}</h4>
                <div className="flex items-center gap-2 text-[10px] font-black text-soul-orange uppercase tracking-widest mb-6">
                  {policy.leaveType} Policy
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50 mt-auto">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Annual Quota</span>
                    <span className="text-soul-dark font-black">{policy.annualQuota} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Probation period</span>
                    <span className="text-soul-dark">{policy.probationPeriodDays} Days</span>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">Applicability</div>
                    <div className="flex flex-wrap gap-1">
                      {policy.applicableRoles.map(r => (
                        <span key={r} className="px-2 py-1 bg-slate-50 text-slate-400 rounded-md text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
                          <Shield size={8} /> {r}
                        </span>
                      ))}
                      {(!policy.applicableDepartments || policy.applicableDepartments.length === 0) ? (
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-tighter">Global (All Depts)</span>
                      ) : policy.applicableDepartments.map(d => (
                        <span key={d} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
                          <Briefcase size={8} /> {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Vacation Leave', used: user.vacationUsed, allowed: user.vacationAllowed, color: 'bg-soul-orange' },
          { label: 'Sick Leave', used: user.sickUsed, allowed: user.sickAllowed, color: 'bg-indigo-600' },
          { label: 'Personal Leave', used: user.personalUsed, allowed: user.personalAllowed, color: 'bg-soul-dark' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500">
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</p>
              <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${item.color} text-white shadow-sm`}>
                {Math.max(0, (item.allowed || 0) - (item.used || 0))} Days Remaining
              </span>
            </div>
            <h3 className="text-5xl font-black text-soul-dark tracking-tighter">
              {item.used || 0} 
              <span className="text-xs text-slate-300 font-bold uppercase tracking-widest ml-3">/ {item.allowed || 0} days allocated</span>
            </h3>
            <div className="mt-8 w-full bg-slate-50 h-3 rounded-full overflow-hidden">
              <div 
                className={`${item.color} h-full transition-all duration-1000 shadow-sm`} 
                style={{ width: `${Math.min(100, ((item.used || 0) / (item.allowed || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* REQUEST HISTORY */}
      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 className="font-black text-2xl text-soul-dark">Request History</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Timeline of personal and team leave requests</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100">
            <Filter size={18} className="text-slate-400" />
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredLeaves.length > 0 ? filteredLeaves.map((l) => {
            const emp = employees.find(e => e.id === l.employeeId);
            return (
              <div key={l.id} className="p-10 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-slate-50/50 transition-colors gap-6 group">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-lg ${
                    l.type === 'Vacation' ? 'bg-soul-orange/10 text-soul-orange' :
                    l.type === 'Sick' ? 'bg-indigo-50 text-indigo-600' : 'bg-soul-dark text-white'
                  }`}>
                    <Calendar size={28} />
                  </div>
                  <div>
                    <p className="font-black text-soul-dark text-xl leading-none mb-2">{emp?.name || 'Unknown'}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-soul-orange">{l.type}</span>
                      <span className="opacity-30">•</span>
                      {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                      <span className="opacity-30">•</span>
                      {l.daysCount} Full Days
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="text-right flex-1 md:flex-none">
                    <p className="text-sm font-bold text-slate-600 mb-2 italic">"{l.reason || 'No reason provided'}"</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl inline-block ${
                      l.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      l.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                      'bg-slate-100 text-slate-400'
                    }`}>{l.status}</span>
                  </div>

                  {isManager && l.status === 'Pending' && (
                    <div className="flex gap-3">
                      <button onClick={() => handleAction(l.id, 'Approved')} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <CheckCircle size={24} />
                      </button>
                      <button onClick={() => handleAction(l.id, 'Rejected')} className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                        <XCircle size={24} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="p-24 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <ClipboardCheck size={48} />
              </div>
              <p className="text-slate-300 font-black uppercase tracking-widest text-sm italic">No leave requests recorded</p>
            </div>
          )}
        </div>
      </div>

      {/* POLICY MODAL */}
      {showPolicyModal && editingPolicy && (
        <div className="fixed inset-0 bg-soul-dark/80 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-soul-dark text-white rounded-2xl">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-soul-dark tracking-tighter">{editingPolicy.id ? 'Edit Policy' : 'Create Leave Policy'}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure automated leave rules</p>
                </div>
              </div>
              <button onClick={() => setShowPolicyModal(false)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handlePolicySave} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Policy Identifier</label>
                  <input 
                    required 
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-soul-orange/10 font-black text-soul-dark"
                    placeholder="e.g. Standard Annual Leave"
                    value={editingPolicy.name || ''}
                    onChange={e => setEditingPolicy({...editingPolicy, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Leave Category</label>
                  <select 
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-soul-orange/10 font-black text-soul-dark"
                    value={editingPolicy.leaveType || 'Vacation'}
                    onChange={e => setEditingPolicy({...editingPolicy, leaveType: e.target.value as any})}
                  >
                    <option value="Vacation">Vacation Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Personal">Personal Leave</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                <h4 className="text-sm font-black text-soul-dark uppercase tracking-widest mb-6 flex items-center gap-2">
                  <LayoutGrid size={18} className="text-soul-orange" />
                  Entitlement Configuration
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Annual Quota (Days)</label>
                    <input type="number" className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold" value={editingPolicy.annualQuota ?? 0} onChange={e => setEditingPolicy({...editingPolicy, annualQuota: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Max Carry Over (Days)</label>
                    <input type="number" className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold" value={editingPolicy.maxCarryForward ?? 0} onChange={e => setEditingPolicy({...editingPolicy, maxCarryForward: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Probation Period (Days)</label>
                    <input type="number" className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold" value={editingPolicy.probationPeriodDays ?? 0} onChange={e => setEditingPolicy({...editingPolicy, probationPeriodDays: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Max Per Request (Days)</label>
                    <input type="number" className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold" value={editingPolicy.maxDaysPerRequest ?? 365} onChange={e => setEditingPolicy({...editingPolicy, maxDaysPerRequest: parseInt(e.target.value) || 365})} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-soul-dark uppercase tracking-widest flex items-center gap-2">
                    <Shield size={18} className="text-soul-orange" />
                    Target Roles
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.values(UserRole).map(role => (
                      <label key={role} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        editingPolicy.applicableRoles?.includes(role) ? 'bg-soul-orange/5 border-soul-orange text-soul-dark' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}>
                        <span className="text-xs font-black uppercase tracking-widest">{role}</span>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={editingPolicy.applicableRoles?.includes(role) || false} 
                          onChange={() => {
                            const roles = [...(editingPolicy.applicableRoles || [])];
                            if (roles.includes(role)) {
                              setEditingPolicy({...editingPolicy, applicableRoles: roles.filter(r => r !== role)});
                            } else {
                              setEditingPolicy({...editingPolicy, applicableRoles: [...roles, role]});
                            }
                          }}
                        />
                        {editingPolicy.applicableRoles?.includes(role) ? <Check size={16} /> : <Plus size={16} />}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-soul-dark uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={18} className="text-soul-orange" />
                    Target Departments
                  </h4>
                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 gap-2">
                    {departments.map(dept => (
                      <label key={dept} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        editingPolicy.applicableDepartments?.includes(dept) ? 'bg-indigo-50 border-indigo-200 text-soul-dark' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}>
                        <span className="text-xs font-black uppercase tracking-widest">{dept}</span>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={editingPolicy.applicableDepartments?.includes(dept) || false} 
                          onChange={() => {
                            const depts = [...(editingPolicy.applicableDepartments || [])];
                            if (depts.includes(dept)) {
                              setEditingPolicy({...editingPolicy, applicableDepartments: depts.filter(d => d !== dept)});
                            } else {
                              setEditingPolicy({...editingPolicy, applicableDepartments: [...depts, dept]});
                            }
                          }}
                        />
                        {editingPolicy.applicableDepartments?.includes(dept) ? <Check size={16} /> : <Plus size={16} />}
                      </label>
                    ))}
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase text-center tracking-widest">Select none for global applicability across all departments</p>
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" />
                <p className="text-xs font-bold text-amber-900 leading-relaxed">
                  Configuration Guard: This policy will be applied to employees matching ALL selected roles and departments. 
                  Policies are evaluated top-to-bottom; ensures consistent leave quotas during Bulk Sync.
                </p>
              </div>

              <button type="submit" className="w-full py-6 bg-soul-dark text-white rounded-[1.5rem] font-black shadow-2xl shadow-soul-dark/20 hover:opacity-90 active:scale-[0.98] transition-all text-xl">
                Save Policy Configuration
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-soul-dark/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] max-w-xl w-full shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-3xl font-black text-soul-dark tracking-tighter">Submit Leave Request</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Fill in the details for your time off</p>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleRequest} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Type of Leave</label>
                <select 
                  className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-soul-orange/10 font-black text-soul-dark"
                  value={newLeave.type || 'Vacation'}
                  onChange={e => setNewLeave({...newLeave, type: e.target.value as any})}
                >
                  <option value="Vacation">Vacation Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal Leave</option>
                </select>
              </div>

              <div className="p-8 bg-soul-dark text-white rounded-[2rem] flex items-center justify-between shadow-xl">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Balance</p>
                  <p className="text-3xl font-black">{currentBalance} <span className="text-xs opacity-50 uppercase">Days</span></p>
                </div>
                {calculatedDays > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Request Duration</p>
                    <p className={`text-3xl font-black ${calculatedDays > currentBalance ? 'text-rose-500' : 'text-soul-orange'}`}>{calculatedDays} <span className="text-xs opacity-50 uppercase">Days</span></p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">From Date</label>
                  <input 
                    required type="date" 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-soul-orange/10 font-bold"
                    value={newLeave.startDate || ''}
                    onChange={e => setNewLeave({...newLeave, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">To Date</label>
                  <input 
                    required type="date" 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-soul-orange/10 font-bold"
                    value={newLeave.endDate || ''}
                    onChange={e => setNewLeave({...newLeave, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Reason for Absence</label>
                <textarea 
                  required className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-soul-orange/10 font-bold h-28 resize-none"
                  placeholder="Explain the reason for your leave request..."
                  value={newLeave.reason || ''}
                  onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                />
              </div>

              {calculatedDays > currentBalance && (
                <div className="flex items-center gap-3 p-5 bg-rose-50 border border-rose-100 rounded-[1.5rem] text-rose-600 text-xs font-black">
                  <AlertTriangle size={20} />
                  Validation Error: Requested duration exceeds your current available balance.
                </div>
              )}

              <button 
                type="submit" 
                disabled={calculatedDays > currentBalance || calculatedDays <= 0}
                className="w-full bg-soul-orange text-white py-6 rounded-[1.5rem] font-black shadow-2xl shadow-soul-orange/30 disabled:opacity-50 transition-all text-xl active:scale-95"
              >
                Submit for Approval
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
