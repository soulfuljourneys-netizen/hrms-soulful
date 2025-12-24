
import React, { useState, useRef } from 'react';
import { Employee, EmployeeStatus, UserRole, Document } from '../types';
import { 
  Search, Plus, Filter, Mail, Phone, MapPin, MoreVertical, X, 
  User, Edit3, Save, Shield, Landmark, Briefcase, FileText, 
  Upload, Trash2, Camera, Download, Calendar, Ghost, Lock
} from 'lucide-react';

interface Props {
  employees: Employee[];
  onAdd: (emp: Employee) => void;
  onUpdate: (emp: Employee) => void;
  user: Employee;
}

type ProfileTab = 'personal' | 'work' | 'documents';

const EmployeeDirectory: React.FC<Props> = ({ employees, onAdd, onUpdate, user }) => {
  const isManager = user.userRole === UserRole.ADMIN || user.userRole === UserRole.HR;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Employee Form State
  const [newEmpData, setNewEmpData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    managerId: '',
    salary: 50000,
    phone: '',
    address: ''
  });

  const [editBuffer, setEditBuffer] = useState<Employee | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditBuffer({ ...emp });
    setIsEditing(false);
    setActiveTab('personal');
  };

  const handleSave = () => {
    if (editBuffer) {
      onUpdate(editBuffer);
      setSelectedEmployee(editBuffer);
      setIsEditing(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmployee: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      ...newEmpData,
      status: EmployeeStatus.ACTIVE,
      userRole: UserRole.EMPLOYEE,
      password: 'password123',
      joinDate: new Date().toISOString().split('T')[0],
      documents: [],
      vacationUsed: 0,
      sickUsed: 0,
      personalUsed: 0,
      vacationAllowed: 20,
      sickAllowed: 10,
      personalAllowed: 5
    };
    onAdd(newEmployee);
    setShowAddModal(false);
    setNewEmpData({ name: '', email: '', role: '', department: '', managerId: '', salary: 50000, phone: '', address: '' });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editBuffer) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditBuffer({ ...editBuffer, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editBuffer) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          uploadDate: new Date().toISOString().split('T')[0],
          data: reader.result as string
        };
        const updatedDocs = [...(editBuffer.documents || []), newDoc];
        const updatedBuffer = { ...editBuffer, documents: updatedDocs };
        setEditBuffer(updatedBuffer);
        onUpdate(updatedBuffer);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteDocument = (docId: string) => {
    if (editBuffer) {
      const updatedDocs = editBuffer.documents.filter(d => d.id !== docId);
      const updatedBuffer = { ...editBuffer, documents: updatedDocs };
      setEditBuffer(updatedBuffer);
      onUpdate(updatedBuffer);
    }
  };

  const canEditField = (fieldName: keyof Employee) => {
    if (user.userRole === UserRole.ADMIN) return true;
    if (user.userRole === UserRole.HR) return true;
    const selfEditable: (keyof Employee)[] = ['address', 'phone', 'emergencyContact', 'bankAccount', 'profilePicture', 'dob'];
    return user.id === editBuffer?.id && selfEditable.includes(fieldName);
  };

  const getProfileImg = (emp: Employee) => {
    return emp.profilePicture || `https://picsum.photos/seed/${emp.id}/200/200`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, role, department..." 
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold text-soul-dark placeholder:text-slate-300 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isManager && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-soul-orange text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-soul-orange/30 active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Welcome New Soul</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map(emp => (
          <div 
            key={emp.id} 
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-soul-orange/30 transition-all cursor-pointer shadow-sm group relative overflow-hidden active:scale-[0.98]"
            onClick={() => handleEditClick(emp)}
          >
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="relative">
                <img src={getProfileImg(emp)} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-xl border-4 border-white group-hover:rotate-3 transition-transform" alt="" />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${emp.status === EmployeeStatus.ACTIVE ? 'bg-soul-orange' : 'bg-slate-300'}`}></div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-1">{emp.userRole}</span>
                <span className="text-[10px] font-black text-soul-orange uppercase tracking-[0.1em]">{emp.department}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-soul-dark mb-0.5 group-hover:text-soul-orange transition-colors">{emp.name}</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">{emp.role}</p>
            
            <div className="space-y-3 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                <Mail size={14} className="text-soul-orange" />
                <span className="truncate">{emp.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                <Phone size={14} className="text-soul-orange" />
                <span>{emp.phone || 'Journeying solo'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NEW SOUL HIRE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-soul-dark/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-3xl font-black text-soul-dark tracking-tighter">New Soul Arrival</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Register a new team member</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold" value={newEmpData.name} onChange={e => setNewEmpData({...newEmpData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                  <input required type="email" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold" value={newEmpData.email} onChange={e => setNewEmpData({...newEmpData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Role</label>
                  <input required className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold" value={newEmpData.role} onChange={e => setNewEmpData({...newEmpData, role: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <select required className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold" value={newEmpData.department} onChange={e => setNewEmpData({...newEmpData, department: e.target.value})}>
                    <option value="">Select Dept...</option>
                    <option value="Executive">Executive</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Product">Product</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Annual Salary</label>
                  <input required type="number" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold" value={newEmpData.salary} onChange={e => setNewEmpData({...newEmpData, salary: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reporting Manager</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold" value={newEmpData.managerId} onChange={e => setNewEmpData({...newEmpData, managerId: e.target.value})}>
                    <option value="">No Manager</option>
                    {employees.filter(e => e.userRole !== UserRole.EMPLOYEE).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-3 p-4 bg-amber-50 rounded-2xl text-amber-600">
                <Lock size={18} />
                <p className="text-[11px] font-bold">New hires are automatically assigned the password: <span className="underline">password123</span></p>
              </div>
              <button type="submit" className="w-full py-5 bg-soul-orange text-white rounded-[1.5rem] font-black shadow-xl shadow-soul-orange/30 hover:opacity-90 active:scale-[0.98] transition-all text-lg">
                Initiate Journey
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedEmployee && editBuffer && (
        <div className="fixed inset-0 bg-soul-dark/60 backdrop-blur-xl z-[80] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.3)] animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <img src={getProfileImg(editBuffer)} className="w-28 h-28 rounded-[2rem] shadow-2xl object-cover border-4 border-white" alt="" />
                  {isEditing && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-soul-dark/40 rounded-[2rem] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera size={32} />
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-soul-dark tracking-tighter">{selectedEmployee.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-4 py-1.5 bg-soul-orange/10 text-soul-orange rounded-xl text-xs font-black uppercase tracking-widest">{editBuffer.role}</span>
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">{editBuffer.department}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-3 px-8 py-3.5 bg-soul-dark text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-xl active:scale-95"
                  >
                    <Edit3 size={20} />
                    Edit Profile
                  </button>
                ) : (
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-3 px-8 py-3.5 bg-soul-orange text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-soul-orange/30 active:scale-95"
                  >
                    <Save size={20} />
                    Save Journey
                  </button>
                )}
                <button onClick={() => setSelectedEmployee(null)} className="p-3.5 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex px-10 border-b border-slate-100 bg-white">
              {[
                { id: 'personal', label: 'Soul Details', icon: User },
                { id: 'work', label: 'Career Path', icon: Briefcase },
                { id: 'documents', label: 'Vault', icon: FileText },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ProfileTab)}
                  className={`flex items-center gap-3 px-8 py-5 text-sm font-black uppercase tracking-widest transition-all border-b-4 ${
                    activeTab === tab.id ? 'border-soul-orange text-soul-orange' : 'border-transparent text-slate-300 hover:text-slate-500'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-50/20">
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Communication</h4>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Connection</label>
                        <input 
                          disabled={!isEditing || !canEditField('email')}
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold disabled:bg-slate-50 disabled:text-slate-400 transition-all"
                          value={editBuffer.email}
                          onChange={e => setEditBuffer({...editBuffer, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Vocal Line (Phone)</label>
                        <input 
                          disabled={!isEditing || !canEditField('phone')}
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold disabled:bg-slate-50 disabled:text-slate-400 transition-all"
                          value={editBuffer.phone}
                          placeholder="+1 (555) 000-0000"
                          onChange={e => setEditBuffer({...editBuffer, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Origins</h4>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Soul Abode (Address)</label>
                        <textarea 
                          disabled={!isEditing || !canEditField('address')}
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-soul-orange/10 font-bold disabled:bg-slate-50 disabled:text-slate-400 h-28 resize-none transition-all"
                          value={editBuffer.address}
                          onChange={e => setEditBuffer({...editBuffer, address: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'work' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Financial Rewards</h4>
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                      <div className="flex justify-between items-center py-4 border-b border-slate-50">
                        <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Annual Care Pack</span>
                        <input 
                          type="number"
                          disabled={!isEditing || !canEditField('salary')}
                          className="w-32 px-3 py-2 text-right font-black text-soul-orange focus:outline-none disabled:bg-transparent"
                          value={editBuffer.salary}
                          onChange={e => setEditBuffer({...editBuffer, salary: Number(e.target.value)})}
                        />
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-slate-50">
                        <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Vault Route (Bank)</span>
                        <input 
                          disabled={!isEditing || !canEditField('bankAccount')}
                          className="w-56 px-3 py-2 text-right text-soul-dark font-bold focus:outline-none disabled:bg-transparent"
                          value={editBuffer.bankAccount || ''}
                          placeholder="Routing pending..."
                          onChange={e => setEditBuffer({...editBuffer, bankAccount: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center bg-soul-dark p-10 rounded-[2rem] text-white">
                    <div>
                      <h4 className="text-2xl font-black">Secure Vault</h4>
                      <p className="text-slate-400 font-medium mt-1">Manage your contracts and identity tokens.</p>
                    </div>
                    <button 
                      onClick={() => docInputRef.current?.click()}
                      className="flex items-center gap-3 px-8 py-4 bg-soul-orange text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-soul-orange/20 active:scale-95"
                    >
                      <Upload size={20} />
                      Deposit Token
                    </button>
                    <input type="file" ref={docInputRef} className="hidden" onChange={handleDocUpload} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {editBuffer.documents.length > 0 ? editBuffer.documents.map((doc) => (
                      <div key={doc.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-soul-orange/30 transition-all relative">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-4 bg-soul-orange/5 text-soul-orange rounded-2xl">
                            <FileText size={28} />
                          </div>
                          <div className="flex gap-2">
                            {doc.data && (
                              <a href={doc.data} download={doc.name} className="p-2.5 text-slate-400 hover:text-soul-orange hover:bg-soul-orange/5 rounded-xl transition-all">
                                <Download size={20} />
                              </a>
                            )}
                            <button 
                              onClick={() => deleteDocument(doc.id)}
                              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        <h5 className="font-black text-soul-dark truncate mb-1">{doc.name}</h5>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          <Calendar size={12} />
                          Deposited {doc.uploadDate}
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
                        <FileText size={64} className="mx-auto text-slate-100 mb-6" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest">The vault is currently empty</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;
