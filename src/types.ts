export type SchoolStatus = 'En attente' | 'Contacté' | 'Client' | 'Refusé';

export interface School {
  id: string;
  ecole: string;
  lieu: string;
  promoteur: string;
  phone: string;
  status: SchoolStatus;
  createdAt: number;
}
