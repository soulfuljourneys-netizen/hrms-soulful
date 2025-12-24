
import React, { useState, useMemo } from 'react';
import { Employee, Shift } from '../types';
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react';

interface Props {
  employees: Employee[];
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
}

const SHIFT_TYPES = {
  'Full Day': { start: '09:00', end: '18:00', color: 'bg-soul-orange text-white' },
  'Half Day': { start: '09:00', end: '13:00', color: 'bg-indigo-100 text-indigo-700' },
  'Leave': { start: 'Rest', end: 'Day', color: 'bg-rose-100 text-rose-700' },
  'Off': { start: '-', end: '-', color: 'bg-slate-100 text-slate-400' }
};

const ShiftRoster: React.FC<Props> = ({ employees, shifts, setShifts }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCell, setSelectedCell] = useState<{ empId: string; date: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const openShiftModal = (empId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedCell({ empId, date: dateStr });
    setIsModalOpen(true);
  };

  const handleSaveShift = (type: keyof typeof SHIFT_TYPES) => {
    if (!selectedCell) return;
    
    const { empId, date } = selectedCell;
    const newShift: Shift = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: empId,
      date,
      type,
      startTime: SHIFT_TYPES[type].start,
      endTime: SHIFT_TYPES[type].end
    };

    setShifts(prev => {
      const filtered = prev.filter(s => !(s.employeeId === empId && s.date === date));
      return [...filtered, newShift];
    });
    
    setIsModalOpen(false);
  };

  const getShiftForCell = (empId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.find(s => s.employeeId === empId && s.date === dateStr);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 gap-6">
        <div>
          <h2 className="text-2xl font-black text-soul-dark">Journey Roaster</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Plan the collective movement of your team</p>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-2xl">
          <button onClick={handlePrevMonth} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-soul-dark">
            <ChevronLeft size={20} />
          </button>
          <div className="text-lg font-black text-soul-dark min-w-[160px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={handleNextMonth} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-soul-dark">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="sticky left-0 z-20 bg-slate-50 p-6 text-left border-r border-slate-100 min-w-[240px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Soulful Peer</span>
                </th>
                {daysInMonth.map((day, idx) => (
                  <th key={idx} className={`p-4 min-w-[80px] text-center border-r border-slate-100 ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-rose-50/30' : ''}`}>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1">
                      {day.toLocaleString('default', { weekday: 'short' })}
                    </p>
                    <p className="text-lg font-black text-soul-dark">{day.getDate()}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => (
                <tr key={emp.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/30 p-6 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-4">
                      <img src={emp.profilePicture || `https://picsum.photos/seed/${emp.id}/32/32`} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                      <div>
                        <p className="font-black text-soul-dark text-sm leading-none mb-1">{emp.name}</p>
                        <p className="text-[10px] font-bold text-soul-orange uppercase tracking-widest">{emp.department}</p>
                      </div>
                    </div>
                  </td>
                  {daysInMonth.map((day, idx) => {
                    const shift = getShiftForCell(emp.id, day);
                    return (
                      <td 
                        key={idx} 
                        onClick={() => openShiftModal(emp.id, day)}
                        className={`p-2 border-r border-slate-100 cursor-pointer hover:bg-soul-orange/5 transition-all text-center h-20 ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-rose-50/10' : ''}`}
                      >
                        {shift ? (
                          <div className={`w-full h-full rounded-xl flex flex-col items-center justify-center p-1 text-[10px] font-black uppercase tracking-tighter shadow-sm animate-in zoom-in duration-200 ${SHIFT_TYPES[shift.type].color}`}>
                            <span>{shift.type}</span>
                            <span className="opacity-70 mt-0.5">{shift.startTime} - {shift.endTime}</span>
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-50 group-hover:border-slate-100 transition-colors flex items-center justify-center text-slate-200 opacity-0 group-hover:opacity-100">
                            <Plus size={16} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedCell && (
        <div className="fixed inset-0 bg-soul-dark/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] max-w-md w-full shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-soul-dark tracking-tighter">Assign Roaster Slot</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                  {new Date(selectedCell.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <img src={employees.find(e => e.id === selectedCell.empId)?.profilePicture || `https://picsum.photos/seed/${selectedCell.empId}/48/48`} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white" alt="" />
                <div>
                  <p className="font-black text-soul-dark text-lg leading-none">{employees.find(e => e.id === selectedCell.empId)?.name}</p>
                  <p className="text-xs font-bold text-soul-orange uppercase tracking-widest mt-1">{employees.find(e => e.id === selectedCell.empId)?.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(SHIFT_TYPES) as Array<keyof typeof SHIFT_TYPES>).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSaveShift(type)}
                    className={`p-6 rounded-[1.5rem] flex flex-col items-center gap-2 transition-all group active:scale-95 border-2 ${
                      SHIFT_TYPES[type].color
                    } hover:shadow-xl hover:-translate-y-1`}
                  >
                    <Clock size={24} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-xs">{type}</span>
                    <span className="text-[10px] font-bold opacity-70">
                      {SHIFT_TYPES[type].start} - {SHIFT_TYPES[type].end}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-6 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Crafting soulful schedules daily</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftRoster;
