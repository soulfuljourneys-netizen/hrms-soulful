
import React, { useState } from 'react';
import { Employee } from '../types';
import { CreditCard, DollarSign, ArrowUpRight, CheckCircle2, Ghost, X, Printer, Download, Eye } from 'lucide-react';

interface Props {
  employees: Employee[];
}

const Payroll: React.FC<Props> = ({ employees }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedIds, setProcessedIds] = useState<string[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Employee | null>(null);

  const totalMonthlyPayroll = employees.reduce((acc, curr) => acc + (curr.salary / 12), 0);

  const handleProcessAll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessedIds(employees.map(e => e.id));
    }, 2000);
  };

  const handleProcessSingle = (id: string) => {
    setProcessedIds(prev => [...prev, id]);
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-soul-orange text-white p-10 rounded-[2.5rem] shadow-2xl shadow-soul-orange/20 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-white/20 rounded-2xl">
                <DollarSign size={28} />
              </div>
              <span className="text-[10px] font-black bg-white/30 px-3 py-1.5 rounded-xl uppercase tracking-widest">Next Cycle: Oct 31</span>
            </div>
            <p className="text-white/80 font-bold text-xs uppercase tracking-[0.2em] mb-1">Monthly Journey Budget</p>
            <h3 className="text-4xl font-black">${totalMonthlyPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
          </div>
          <DollarSign className="absolute -right-8 -bottom-8 text-white/5 w-48 h-48 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-soul-dark text-white rounded-2xl shadow-lg">
              <CreditCard size={28} />
            </div>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Soulful Vault Balance</p>
          <h3 className="text-4xl font-black text-soul-dark">$142,500.00</h3>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl">
              <ArrowUpRight size={28} />
            </div>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Taxes (YTD Care)</p>
          <h3 className="text-4xl font-black text-slate-800">$18,420.00</h3>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 className="font-black text-2xl text-soul-dark">Journey Payroll Circle</h3>
            <p className="text-sm text-slate-400 font-medium">Cycle for {currentMonth}</p>
          </div>
          <button 
            onClick={handleProcessAll}
            disabled={isProcessing || processedIds.length === employees.length}
            className={`px-10 py-4 rounded-[1.5rem] font-black transition-all shadow-xl active:scale-95 ${
              processedIds.length === employees.length 
                ? 'bg-emerald-50 text-emerald-600 shadow-none' 
                : 'bg-soul-orange text-white hover:opacity-90 shadow-soul-orange/20'
            }`}
          >
            {isProcessing ? 'Processing Journey Funds...' : processedIds.length === employees.length ? 'Cycle Completed' : 'Process All Payments'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-8">Soulful Peer</th>
                <th className="p-8 text-center">Journey Status</th>
                <th className="p-8">Base Care Pack</th>
                <th className="p-8">Net Dispatch</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map(emp => {
                const isPaid = processedIds.includes(emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <img src={emp.profilePicture || `https://picsum.photos/seed/${emp.id}/48/48`} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                        <div>
                          <p className="font-black text-soul-dark text-lg leading-none mb-1">{emp.name}</p>
                          <p className="text-[10px] font-bold text-soul-orange uppercase tracking-widest">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-center">
                      <span className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full ${
                        isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isPaid && <CheckCircle2 size={14} />}
                        {isPaid ? 'Dispatched' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-8 font-bold text-slate-400 text-sm">
                      ${(emp.salary).toLocaleString()} <span className="text-[10px] uppercase font-black tracking-tighter">/ yr</span>
                    </td>
                    <td className="p-8 font-black text-soul-dark text-lg">
                      ${(emp.salary / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isPaid && (
                          <button 
                            onClick={() => handleProcessSingle(emp.id)}
                            className="text-xs font-black text-soul-orange uppercase tracking-widest hover:underline"
                          >
                            Pay Now
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedReceipt(emp)}
                          className="flex items-center gap-2 p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:border-soul-orange hover:text-soul-orange transition-all shadow-sm"
                          title="View Receipt"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-soul-dark/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full shadow-2xl animate-in zoom-in duration-300 overflow-hidden relative">
            <button onClick={() => setSelectedReceipt(null)} className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
              <X size={24} />
            </button>
            
            <div className="p-12">
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-soul-orange rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Ghost size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-soul-dark">Soulful Journeys</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Payment Receipt</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
                  <p className="text-sm font-mono font-bold text-soul-dark">#SJ-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-12">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Recipient Details</h4>
                  <div className="flex items-center gap-4">
                    <img src={selectedReceipt.profilePicture || `https://picsum.photos/seed/${selectedReceipt.id}/48/48`} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div>
                      <p className="font-black text-soul-dark text-lg">{selectedReceipt.name}</p>
                      <p className="text-xs font-bold text-soul-orange">{selectedReceipt.role}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Cycle Period</h4>
                  <div>
                    <p className="font-black text-soul-dark text-lg">{currentMonth}</p>
                    <p className="text-xs font-bold text-slate-400">Dispatch Date: Oct 20, 2024</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-[2rem] p-8 space-y-4 mb-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Base Care Pack Dispatch</span>
                  <span className="font-black text-soul-dark">${(selectedReceipt.salary / 12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Journey Bonuses</span>
                  <span className="font-black text-emerald-600">+$0.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Community Tax Contribution</span>
                  <span className="font-black text-rose-500">-$0.00</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-lg font-black text-soul-dark uppercase tracking-tighter">Total Net Dispatch</span>
                  <span className="text-3xl font-black text-soul-orange">${(selectedReceipt.salary / 12).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 py-4 bg-soul-dark text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:opacity-90 transition-all">
                  <Printer size={20} />
                  Print Receipt
                </button>
                <button className="flex-1 py-4 bg-soul-orange text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:opacity-90 transition-all">
                  <Download size={20} />
                  Download PDF
                </button>
              </div>
            </div>

            <div className="bg-slate-100/50 p-6 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Thank you for your soulful contribution</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
