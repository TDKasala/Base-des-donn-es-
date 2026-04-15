import { createClient } from '@supabase/supabase-js';
import type { SchoolStatus } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database row type — matches the `schools` table
export interface SchoolRow {
  id: string;
  ecole: string;
  lieu: string;
  promoteur: string;
  phone: string;
  status: SchoolStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
}
