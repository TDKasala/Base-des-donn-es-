import { School } from '../types';
import { supabase } from './supabase';

export const getSchools = async (): Promise<School[]> => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching schools:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    ecole: row.ecole,
    lieu: row.lieu,
    promoteur: row.promoteur,
    phone: row.phone,
    status: row.status,
    description: row.description ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    createdBy: row.created_by ?? undefined,
  }));
};

export const addSchool = async (
  school: Omit<School, 'id' | 'createdAt'>,
  createdBy: string
): Promise<School | null> => {
  const { data, error } = await supabase
    .from('schools')
    .insert({
      ecole: school.ecole,
      lieu: school.lieu,
      promoteur: school.promoteur,
      phone: school.phone,
      status: school.status,
      description: school.description ?? null,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding school:', error.message);
    return null;
  }

  return {
    id: data.id,
    ecole: data.ecole,
    lieu: data.lieu,
    promoteur: data.promoteur,
    phone: data.phone,
    status: data.status,
    description: data.description ?? undefined,
    createdAt: new Date(data.created_at).getTime(),
    createdBy: data.created_by ?? undefined,
  };
};

export const updateSchool = async (id: string, school: Omit<School, 'id' | 'createdAt'>): Promise<boolean> => {
  const { error } = await supabase
    .from('schools')
    .update({
      ecole: school.ecole,
      lieu: school.lieu,
      promoteur: school.promoteur,
      phone: school.phone,
      status: school.status,
      description: school.description ?? null,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating school:', error.message);
    return false;
  }

  return true;
};

export const deleteSchool = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('schools')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting school:', error.message);
    return false;
  }

  return true;
};
