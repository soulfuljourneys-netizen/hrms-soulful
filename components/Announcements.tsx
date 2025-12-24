
import React, { useState } from 'react';
import { Announcement, Employee, UserRole } from '../types';
import { Megaphone, Plus, Trash2, Calendar } from 'lucide-react';

interface Props {
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  user: Employee;
}

const Announcements: React.FC<Props> = ({ announcements, setAnnouncements, user }) => {
  const isManager = user.userRole === UserRole.ADMIN || user.userRole === UserRole.HR;
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    const ann: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      content: formData.content,
      date: new Date().toISOString().split('T')[0],
      author: user.name
    };
    setAnnouncements(prev => [ann, ...prev]);
    setShowForm(false);
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Company Announcements</h2>
          <p className="text-sm text-slate-500">Keep up with the latest updates from ZenHR.</p>
        </div>
        {isManager && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Post Update
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-50 animate-in slide-in-from-top-4">
          <form onSubmit={handlePost} className="space-y-4">
            <input 
              required className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-lg font-bold"
              placeholder="Announcement Title"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <textarea 
              required className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 h-32"
              placeholder="Write your announcement here..."
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold">Publish Announcement</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Megaphone size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-slate-800">{ann.title}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Calendar size={14} />
                    {new Date(ann.date).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-slate-600 mt-4 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Posted by <span className="text-indigo-600">{ann.author}</span></p>
                  {isManager && (
                    <button 
                      onClick={() => setAnnouncements(prev => prev.filter(a => a.id !== ann.id))}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
