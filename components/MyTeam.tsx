
import React from 'react';
import { Employee } from '../types';
import { UserCircle, Shield, Mail, Phone } from 'lucide-react';

interface Props {
  employees: Employee[];
  user: Employee;
}

const MyTeam: React.FC<Props> = ({ employees, user }) => {
  const manager = employees.find(e => e.id === user.managerId);
  const peers = employees.filter(e => e.managerId === user.managerId && e.id !== user.id);
  const directReports = employees.filter(e => e.managerId === user.id);

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Team Circle</h2>
        <p className="text-sm text-slate-500">People you work with every day.</p>
      </div>

      {manager && (
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} className="text-indigo-500" /> My Manager
          </h3>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6 shadow-sm max-w-md">
            <img src={`https://picsum.photos/seed/${manager.id}/64/64`} className="w-16 h-16 rounded-2xl shadow-sm" alt="" />
            <div>
              <h4 className="font-bold text-slate-800 text-lg">{manager.name}</h4>
              <p className="text-indigo-600 font-medium text-sm">{manager.role}</p>
              <div className="flex gap-4 mt-3">
                <a href={`mailto:${manager.email}`} className="text-slate-400 hover:text-indigo-500"><Mail size={16} /></a>
                <a href={`tel:${manager.phone}`} className="text-slate-400 hover:text-indigo-500"><Phone size={16} /></a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Peers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {peers.length > 0 ? peers.map(peer => (
            <div key={peer.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm hover:border-indigo-100 transition-all">
              <img src={`https://picsum.photos/seed/${peer.id}/48/48`} className="w-12 h-12 rounded-xl" alt="" />
              <div>
                <h4 className="font-bold text-slate-800">{peer.name}</h4>
                <p className="text-xs text-slate-500">{peer.role}</p>
              </div>
            </div>
          )) : (
            <p className="text-slate-400 italic text-sm col-span-full">No immediate peers found.</p>
          )}
        </div>
      </section>

      {directReports.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Direct Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {directReports.map(report => (
              <div key={report.id} className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4 shadow-sm">
                <img src={`https://picsum.photos/seed/${report.id}/48/48`} className="w-12 h-12 rounded-xl" alt="" />
                <div>
                  <h4 className="font-bold text-slate-800">{report.name}</h4>
                  <p className="text-xs text-slate-500">{report.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MyTeam;
