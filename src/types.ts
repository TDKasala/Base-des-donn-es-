export type SchoolStatus = 'En attente' | 'Contacté' | 'Client' | 'Refusé';

export interface School {
  id: string;
  ecole: string;
  lieu: string;
  promoteur: string;
  phone: string;
  status: SchoolStatus;
  description?: string;
  createdAt: number;
  createdBy?: string;
  appointmentDate?: string; // ISO string, e.g. "2026-04-21T09:00"
}
