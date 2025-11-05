import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas
export interface Doctor {
  id: string;
  email: string;
  name: string;
  specialty?: string;
  license_number?: string;
  clinic_name?: string;
  phone?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  email: string;
  name: string;
  birth_date?: string;
  gender?: string;
  phone?: string;
  created_at: string;
}

export interface Analysis {
  id: string;
  patient_id: string;
  doctor_id?: string;
  pdf_url?: string;
  pdf_filename?: string;
  extracted_text?: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  uploaded_at: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Report {
  id: string;
  analysis_id: string;
  ai_analysis?: string;
  doctor_notes?: string;
  recommendations?: string;
  risk_level?: 'low' | 'medium' | 'high';
  approved_by_doctor: boolean;
  model_used?: string;
  report_pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  user_type: 'doctor' | 'patient';
  message: string;
  type: string;
  read: boolean;
  related_analysis_id?: string;
  created_at: string;
}
