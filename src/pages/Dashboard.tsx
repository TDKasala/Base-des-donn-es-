import { useEffect, useState } from 'react';
import { School } from '../types';
import { getSchools } from '../utils/storage';
import { Building2, Users, PhoneCall, XCircle } from 'lucide-react';

export function Dashboard() {
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    setSchools(getSchools());
  }, []);

  const stats = [
    {
      title: 'Total Écoles',
      value: schools.length,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Clients',
      value: schools.filter((s) => s.status === 'Client').length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Contactés',
      value: schools.filter((s) => s.status === 'Contacté').length,
      icon: PhoneCall,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Refusés',
      value: schools.filter((s) => s.status === 'Refusé').length,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Aperçu de vos prospects et clients.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bgColor} ${stat.color}`}
              >
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
