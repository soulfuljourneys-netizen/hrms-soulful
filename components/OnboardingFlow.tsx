
import React, { useState } from 'react';
import { generateOnboardingPlan } from '../services/geminiService';
import { Sparkles, Loader2, CheckCircle2, UserPlus, FileText, Send, UserCheck, ShieldCheck, Landmark } from 'lucide-react';
import { Employee, EmployeeStatus, UserRole } from '../types';

interface Props {
  user: Employee;
  onComplete: (emp: Employee) => void;
  onUpdate: (emp: Employee) => void;
}

const OnboardingFlow: React.FC<Props> = ({ user, onComplete, onUpdate }) => {
  const isManager = user.userRole === UserRole.ADMIN || user.userRole === UserRole.HR;
  const isCandidate = user.status === EmployeeStatus.ONBOARDING;

  const [step, setStep] = useState(isManager ? 1 : 1);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    email: '',
    salary: '60000'
  });
  
  // Data for the "Candidate Details" section
  const [candidateData, setCandidateData] = useState({
    taxId: user.taxId || '',
    emergencyContact: user.emergencyContact || '',
    bankAccount: user.bankAccount || '',
    dob: user.dob || '',
    address: user.address || ''
  });

  const [plan, setPlan] = useState<{title: string, description: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateOnboardingPlan(formData.role, formData.department);
    setPlan(result);
    setLoading(false);
    setStep(2);
  };

  const finalizeOnboarding = () => {
    // Fix: Add missing leave tracking properties to satisfy Employee interface
    const newEmp: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      status: EmployeeStatus.ONBOARDING,
      userRole: UserRole.EMPLOYEE,
      joinDate: new Date().toISOString().split('T')[0],
      address: 'Pending Onboarding',
      phone: 'Pending',
      salary: Number(formData.salary),
      documents: [],
      vacationUsed: 0,
      sickUsed: 0,
      personalUsed: 0,
      vacationAllowed: 20,
      sickAllowed: 10,
      personalAllowed: 5
    };
    onComplete(newEmp);
    setStep(3);
  };

  const saveCandidateDetails = () => {
    const updated = { ...user, ...candidateData };
    onUpdate(updated);
    alert('Information saved successfully!');
  };

  if (!isManager && !isCandidate) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
        <UserCheck size={64} className="mx-auto text-emerald-500 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800">Your Onboarding is Complete</h2>
        <p className="text-slate-500 mt-2">All your details are up to date. You can view your profile in the directory.</p>
      </div>
    );
  }

  // View for New Hires to fill their data
  if (isCandidate && !isManager) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="bg-indigo-600 p-8 rounded-3xl text-white flex justify-between items-center shadow-lg shadow-indigo-100">
          <div>
            <h1 className="text-2xl font-bold">Welcome to the Team!</h1>
            <p className="text-indigo-100 opacity-90 mt-1">Please complete the required information for your payroll and records.</p>
          </div>
          <Sparkles className="animate-pulse" />
        </div>

        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><ShieldCheck className="text-indigo-500" /> Compliance Details</h3>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Tax Identification Number</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="PAN / SSN / Tax ID"
                  value={candidateData.taxId}
                  onChange={e => setCandidateData({...candidateData, taxId: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Date of Birth</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  value={candidateData.dob}
                  onChange={e => setCandidateData({...candidateData, dob: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Current Address</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  value={candidateData.address}
                  onChange={e => setCandidateData({...candidateData, address: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Landmark className="text-indigo-500" /> Financial & Emergency</h3>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Bank Account Number</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="For salary dispatch"
                  value={candidateData.bankAccount}
                  onChange={e => setCandidateData({...candidateData, bankAccount: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Emergency Contact Info</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Name and Phone Number"
                  value={candidateData.emergencyContact}
                  onChange={e => setCandidateData({...candidateData, emergencyContact: e.target.value})}
                />
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Note: All your information is stored securely. Once HR verifies these details, your status will change to Active.
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={saveCandidateDetails}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Save Information
          </button>
        </div>
      </div>
    );
  }

  // Manager View for hiring
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-12 relative">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center gap-2 z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
              step === i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 
              step > i ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step > i ? <CheckCircle2 size={20} /> : i}
            </div>
            <span className={`text-xs font-bold uppercase ${step === i ? 'text-indigo-600' : 'text-slate-400'}`}>
              {i === 1 ? 'Details' : i === 2 ? 'AI Plan' : 'Invite'}
            </span>
          </div>
        ))}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 -z-0 mx-10"></div>
        <div 
          className="absolute top-5 left-0 h-0.5 bg-indigo-600 -z-0 mx-10 transition-all duration-500"
          style={{ width: `${(step - 1) * 50}%` }}
        ></div>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                <UserPlus className="text-indigo-600" />
                Initiate New Hire
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Robert Smith"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Work Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="robert@zenhr.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Job Role</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="Sales Executive"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Department</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">Select...</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Product">Product</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={!formData.name || !formData.role || !formData.department || loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              {loading ? 'Consulting AI...' : 'Generate AI Onboarding Plan'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <FileText className="text-indigo-600" />
              Onboarding Checklist for {formData.name}
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {plan.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                  <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex-shrink-0 mt-1 flex items-center justify-center text-xs font-bold text-slate-400">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50">Back</button>
              <button onClick={finalizeOnboarding} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">Confirm & Dispatch Invite</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-10 space-y-6">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Onboarding Ready!</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Invitation has been staged for {formData.name}. They can now login and complete their profile details.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button 
                onClick={() => { alert('Onboarding invite sent to ' + formData.email); window.location.reload(); }} 
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Send Welcome Email
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl"
              >
                Start Another Hire
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
