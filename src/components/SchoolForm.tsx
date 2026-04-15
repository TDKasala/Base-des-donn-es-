import { useState, useEffect } from 'react';
import { School, SchoolStatus } from '../types';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface SchoolFormProps {
  initialData?: School | null;
  onSubmit: (data: Omit<School, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function SchoolForm({ initialData, onSubmit, onClose }: SchoolFormProps) {
  const [formData, setFormData] = useState({
    ecole: initialData?.ecole || '',
    lieu: initialData?.lieu || '',
    promoteur: initialData?.promoteur || '',
    phone: initialData?.phone || '',
    status: initialData?.status || 'En attente' as SchoolStatus,
  });
  const [errors, setErrors] = useState<{ ecole?: string; phone?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { ecole?: string; phone?: string } = {};
    
    if (!formData.ecole.trim()) {
      newErrors.ecole = 'Le nom de l\'école est requis';
    }
    
    const phoneRegex = /^\+?[0-9\s\-()]{8,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide (ex: 099999999 ou +243...)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Modifier l\'école' : 'Ajouter une école'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'école
            </label>
            <input
              required
              type="text"
              value={formData.ecole}
              onChange={(e) => {
                setFormData({ ...formData, ecole: e.target.value });
                if (errors.ecole) setErrors({ ...errors, ecole: undefined });
              }}
              className={cn(
                "w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2",
                errors.ecole 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-200 focus:ring-blue-500 focus:border-transparent"
              )}
              placeholder="Ex: Ecole Les Génies"
            />
            {errors.ecole && <p className="text-red-500 text-xs mt-1">{errors.ecole}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lieu
            </label>
            <input
              required
              type="text"
              value={formData.lieu}
              onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Kinshasa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Promoteur
            </label>
            <input
              required
              type="text"
              value={formData.promoteur}
              onChange={(e) => setFormData({ ...formData, promoteur: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              className={cn(
                "w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2",
                errors.phone 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-200 focus:ring-blue-500 focus:border-transparent"
              )}
              placeholder="Ex: 099999999"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as SchoolStatus })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="En attente">En attente</option>
              <option value="Contacté">Contacté</option>
              <option value="Client">Client</option>
              <option value="Refusé">Refusé</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
            >
              {initialData ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
