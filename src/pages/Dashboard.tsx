import { useEffect, useState } from 'react';
import { School } from '../types';
import { getSchools } from '../utils/storage';
import { Building2, Users, PhoneCall, XCircle, CalendarClock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

function formatAppointment(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function appointmentLabel(iso: string): { label: string; urgent: boolean } {
  const now = new Date();
  const appt = new Date(iso);
  const diffMs = appt.getTime() - now.getTime();
  const diffH = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) return { label: 'En retard', urgent: true };
  if (diffH < 24) return { label: "Aujourd'hui", urgent: true };
  if (diffH < 48) return { label: 'Demain', urgent: false };
  return { label: formatAppointment(iso), urgent: false };
}

export function Dashboard() {
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    getSchools().then((data) => {
      setSchools(data);
      fireReminders(data);
    });
  }, []);

  const fireReminders = (data: School[]) => {
    const now = new Date();
    const urgent = data.filter((s) => {
      if (!s.appointmentDate) return false;
      const appt = new Date(s.appointmentDate);
      const diffH = (appt.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffH < 24; // today or overdue
    });

    urgent.forEach((s) => {
      const appt = new Date(s.appointmentDate!);
      const overdue = appt < now;
      toast(overdue ? `⚠ Rendez-vous manqué` : `🔔 Rendez-vous aujourd'hui`, {
        description: `${s.ecole} — ${formatAppointment(s.appointmentDate!)}`,
        duration: 8000,
      });
    });
  };

  const now = new Date();
  const upcoming = schools
    .filter((s) => s.appointmentDate)
    .sort((a, b) => new Date(a.appointmentDate!).getTime() - new Date(b.appointmentDate!).getTime());

  const stats = [
    { title: 'Total Écoles',  value: schools.length, icon: Building2,  color: 'text-blue-600',  bgColor: 'bg-blue-100' },
    { title: 'Clients',       value: schools.filter((s) => s.status === 'Client').length,   icon: Users,      color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Contactés',     value: schools.filter((s) => s.status === 'Contacté').length, icon: PhoneCall,  color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { title: 'Refusés',       value: schools.filter((s) => s.status === 'Refusé').length,   icon: XCircle,    color: 'text-red-600',   bgColor: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Aperçu de vos prospects et clients.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bgColor} ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming appointments */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Rendez-vous</h2>
            <span className="ml-auto text-sm text-gray-400">{upcoming.length} planifié{upcoming.length > 1 ? 's' : ''}</span>
          </div>
          <ul className="divide-y divide-gray-50">
            {upcoming.map((school) => {
              const appt = new Date(school.appointmentDate!);
              const overdue = appt < now;
              const { label, urgent } = appointmentLabel(school.appointmentDate!);
              return (
                <li key={school.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    overdue ? 'bg-red-100 text-red-600' : urgent ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'
                  )}>
                    {overdue ? <AlertTriangle className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{school.ecole}</p>
                    <p className="text-sm text-gray-500 truncate">{school.description || school.lieu}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn(
                      'inline-block px-2.5 py-1 rounded-full text-xs font-semibold',
                      overdue ? 'bg-red-100 text-red-700' : urgent ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'
                    )}>
                      {label}
                    </span>
                    {!urgent && !overdue && (
                      <p className="text-xs text-gray-400 mt-1">{formatAppointment(school.appointmentDate!)}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {schools.length === 0 && (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 text-center mt-8">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucune donnée</h3>
          <p className="text-gray-500 mt-2">Commencez par ajouter des écoles dans la section Écoles.</p>
        </div>
      )}
    </div>
  );
}
